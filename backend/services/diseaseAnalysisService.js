const { GoogleGenAI } = require("@google/genai");
const { translateText } = require("./translationService");
const {
searchAgriculturalKnowledge,
} = require("./agriculturalKnowledgeService");

const ai = new GoogleGenAI({
apiKey: process.env.GEMINI_API_KEY,
});

const UNKNOWN = "Unknown / insufficient evidence";

const UNKNOWN_ACTION =
"The available information is insufficient to identify the cause reliably. Take clear photographs of the whole plant and affected areas. Record when symptoms began, the crop growth stage, recent weather and watering conditions, and whether symptoms are spreading. Consult a local agricultural expert for crop-specific advice.";

function normalizeText(value) {
return String(value || "")
.toLowerCase()
.normalize("NFKD")
.replace(/[^\p{L}\p{N}\s-]/gu, " ")
.replace(/\s+/g, " ")
.trim();
}

function getSourceId(source) {
return String(source.sourceUrl || "").trim();
}

/*

* Validate source provenance.
*
* This checks whether a citation refers to a source that was
* actually retrieved. It does not independently verify that
* the source scientifically supports the assessment.
  */
  function validateCitations(citations, sources) {
  if (!Array.isArray(citations)) {
  return [];
  }

const availableSources = new Map(
sources
.filter((source) => getSourceId(source))
.map((source) => [getSourceId(source), source])
);

const seenUrls = new Set();

return citations
.filter((citation) => {
if (
!citation ||
typeof citation.sourceUrl !== "string"
) {
return false;
}

  const url = citation.sourceUrl.trim();

  if (!availableSources.has(url) || seenUrls.has(url)) {
    return false;
  }

  seenUrls.add(url);
  return true;
})
.map((citation) => {
  const source = availableSources.get(
    citation.sourceUrl.trim()
  );

  return {
    title: source.title,
    organization: source.organization,
    crop: source.crop,
    region: source.region,
    sourceUrl: source.sourceUrl,
    explanation:
      typeof citation.explanation === "string"
        ? citation.explanation
        : "",
  };
});

}

function buildUnknownResult({
observedSymptoms = [],
sources = [],
reason =
"The available information is insufficient for a reliable preliminary assessment.",
imageQuality = "unknown",
affectedPart = "unknown",
alternativeExplanations = [],
}) {
return {
disease: UNKNOWN,
confidence: null,
scoreType: "not_calculated",
assessmentStatus: "insufficient_evidence",
observedSymptoms,
agriculturalEvidenceFound: sources.length > 0,
sources: sources.map((source) => ({
title: source.title,
organization: source.organization,
crop: source.crop,
region: source.region,
publicationDate: source.publicationDate,
sourceUrl: source.sourceUrl,
topic: source.topic,
})),
evidenceSupported: false,
evidenceValidation: {
supported: false,
reason,
matchedEvidence: [],
},
reason,
action: UNKNOWN_ACTION,
alternativeExplanations,
imageQuality,
affectedPart,
};
}

async function analyzeDisease({
imageBase64,
mimeType,
crop,
symptoms,
language = "en",
}) {
const farmerSymptoms = String(symptoms || "").trim();

if (!imageBase64 && !farmerSymptoms) {
throw new Error(
"Provide a crop image or describe the symptoms."
);
}

if (!process.env.GEMINI_API_KEY) {
throw new Error(
"GEMINI_API_KEY is not configured."
);
}

/*

* STEP 1: Retrieve agricultural references.
*
* The knowledge base is supplementary, not exhaustive.
* A retrieval failure must not prevent Gemini from assessing
* a problem using the available observations and symptoms.
  */
  let agriculturalEvidence = {
  evidenceFound: false,
  results: [],
  };

try {
agriculturalEvidence = searchAgriculturalKnowledge({
crop,
query: farmerSymptoms,
topic: "disease identification",
limit: 5,
});
} catch (error) {
console.error(
"Agricultural knowledge retrieval failed:",
error.message
);
}

const sources = (
agriculturalEvidence.results || []
).map((item) => ({
title: item.title,
organization: item.organization,
crop: item.crop,
region: item.region || null,
publicationDate: item.publicationDate || null,
sourceUrl: item.sourceUrl || null,
topic: item.topic,
content: item.content,
}));

/*

* STEP 2: Observe the image or process the farmer's description.
*
* This step describes symptoms. It does not diagnose a disease.
  */
  const observationPrompt = `
  You are the crop observation component of Kisaan Mithra AI.

Crop reported by farmer: ${crop || "Unknown"}

Farmer-reported symptoms:
${farmerSymptoms || "None provided"}

Inspect the supplied image if one is available.

Return valid JSON with this structure:
{
"observedSymptoms": ["specific observation"],
"affectedPart": "leaf, leaf sheath, stem, panicle, grain, root, fruit, or unknown",
"imageQuality": "good, limited, poor, or not_provided",
"reason": "Brief description of available observations"
}

Rules:

* Do not diagnose a disease in this step.
* Never claim a farmer-reported symptom was visually confirmed unless it is visible in the image.
* If no image is provided, use the farmer's description only.
* Do not invent observations.
* Do not provide pesticide or chemical recommendations.
* If no image is available but symptoms are described, return a concise summary of the farmer-reported symptoms in observedSymptoms.
* If an image is supplied, assess whether it is sufficiently clear to interpret.
* Use imageQuality "poor" only when the supplied image genuinely prevents meaningful visual assessment.
* Return JSON only.
  `;

  const observationContents = [
  { text: observationPrompt },
  ];

  if (imageBase64 && mimeType) {
  observationContents.push({
  inlineData: {
  mimeType,
  data: imageBase64,
  },
  });
  }

  const observationResponse =
  await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",
  contents: observationContents,
  config: {
  responseMimeType: "application/json",
  temperature: 0,
  },
  });

  if (!observationResponse.text) {
  throw new Error(
  "The AI returned an empty observation."
  );
  }

  let observation;

  try {
  observation = JSON.parse(
  observationResponse.text
  );
  } catch {
  throw new Error(
  "The AI returned invalid observation JSON."
  );
  }

  const observedSymptoms = Array.isArray(
  observation.observedSymptoms
  )
  ? observation.observedSymptoms
  .filter(
  (item) =>
  typeof item === "string" &&
  item.trim().length > 0
  )
  .map((item) => item.trim())
  : [];

  const imageQuality = normalizeText(
  observation.imageQuality
  ) || "unknown";

  const affectedPart = String(
  observation.affectedPart || "unknown"
  );

  /*

  * STEP 3: Check whether sufficient input exists.
  *
  * A missing observation list does not automatically cause
  * an unknown result if the farmer supplied useful symptoms.
  *
  * Poor images are not automatically rejected when the farmer
  * has also provided a useful written symptom description.
    */
    const poorImage =
    Boolean(imageBase64) &&
    imageQuality === "poor";

  const hasUsefulInput =
  observedSymptoms.length > 0 ||
  farmerSymptoms.length > 0;

  if (!hasUsefulInput) {
  const result = buildUnknownResult({
  observedSymptoms,
  sources,
  reason:
  "No usable symptoms or observations were available to assess the crop problem.",
  imageQuality,
  affectedPart,
  });

  return await translateResult(result, language);
  }

  /*

  * STEP 4: Assess possible causes.
  *
  * Gemini may use learned agricultural knowledge when the
  * retrieved references do not contain a relevant document.
  *
  * Retrieved references provide supplementary evidence;
  * they are not a mandatory condition for a preliminary result.
    */
    const evidenceForPrompt = sources.map((source) => ({
    title: source.title,
    organization: source.organization,
    crop: source.crop,
    region: source.region,
    publicationDate: source.publicationDate,
    sourceUrl: source.sourceUrl,
    content: source.content,
    }));

  const assessmentPrompt = `
  You are Kisaan Mithra AI, an agricultural information assistant
  serving farmers across India.

Assess the farmer's crop problem using:

1. Your learned agricultural knowledge.
2. The available image observations.
3. The farmer-reported symptoms.
4. Retrieved agricultural references when relevant.

CROP:
${crop || "Unknown"}

FARMER-REPORTED SYMPTOMS:
${farmerSymptoms || "None provided"}

OBSERVATIONS:
${JSON.stringify(observedSymptoms)}

AFFECTED PLANT PART:
${affectedPart}

IMAGE QUALITY:
${imageQuality}

AGRICULTURAL REFERENCES:
${JSON.stringify(evidenceForPrompt)}

Return only valid JSON with this structure:
{
"assessment": "A possible disease, pest, nutrient deficiency, environmental stress, other cause, or Unknown / insufficient evidence",
"assessmentStatus": "preliminary or insufficient_evidence",
"supportingCitations": [
{
"sourceUrl": "Exact source URL copied from a supplied reference",
"explanation": "How the supplied reference relates to the assessment"
}
],
"alternativeExplanations": [
"A plausible alternative explanation"
],
"reason": "Explain the likely cause and uncertainty",
"action": "Practical, conservative next steps",
"evidenceSufficient": false
}

MANDATORY RULES:

1. The agricultural reference collection is supplementary and is
   not a complete database of all crop diseases, pests, nutrient
   deficiencies, or environmental problems.

2. Independently assess the problem using your learned knowledge,
   the available observations, and the farmer-reported symptoms.

3. Do not return Unknown merely because the reference collection
   contains no matching document.

4. When the available information supports a plausible explanation,
   provide a PRELIMINARY assessment even when no retrieved reference
   supports it.

5. When using learned knowledge without relevant retrieved references,
   clearly disclose this limitation in the reason.

6. Use assessmentStatus "preliminary" for a plausible assessment.
   Use "insufficient_evidence" only when the available information
   genuinely cannot distinguish plausible causes sufficiently to
   offer a useful preliminary assessment.

7. Consider crop diseases, pest damage, nutrient deficiencies,
   water stress, environmental conditions, and other plausible
   explanations when appropriate. Do not force every problem into
   a disease category.

8. Do not claim that a disease is confirmed from an image or
   symptom description alone.

9. Never invent sources, source URLs, research findings, quotations,
   or citations.

10. Cite only supplied references. Copy sourceUrl exactly.
    Cite a reference only when its contents are relevant to the
    assessment.

11. Set evidenceSufficient to true only when supplied references
    meaningfully support the preliminary assessment. Otherwise,
    set it to false. A preliminary assessment may still be returned
    when evidenceSufficient is false.

12. If multiple causes are plausible, list reasonable alternatives
    and explain the uncertainty.

13. Do not recommend specific pesticides, chemical dosages,
    mixtures, or application rates without reliable, applicable
    support. Prefer integrated pest management and conservative
    next steps.

14. When relevant, recommend consulting a local agricultural
    officer, agricultural university, or qualified expert.

15. If the image is poor but the farmer has described symptoms,
    use the written symptoms cautiously. Do not pretend the image
    provides visual confirmation.

16. Return JSON only, with all required fields.
    `;

const assessmentResponse =
await ai.models.generateContent({
model: "gemini-3.5-flash-lite",
contents: [{ text: assessmentPrompt }],
config: {
responseMimeType: "application/json",
temperature: 0,
},
});

if (!assessmentResponse.text) {
throw new Error(
"The AI returned an empty assessment."
);
}

let assessment;

try {
assessment = JSON.parse(
assessmentResponse.text
);
} catch {
throw new Error(
"The AI returned invalid assessment JSON."
);
}

/*

* STEP 5: Validate source provenance and assessment status.
*
* Citation provenance is checked independently of whether
* the preliminary assessment is accepted.
  */
  const validatedCitations = validateCitations(
  assessment.supportingCitations,
  sources
  );

const assessmentName =
typeof assessment.assessment === "string"
? assessment.assessment.trim()
: UNKNOWN;

const status = normalizeText(
assessment.assessmentStatus
);

const isUnknown =
!assessmentName ||
normalizeText(assessmentName) ===
normalizeText(UNKNOWN) ||
status === "insufficient evidence" ||
status === "insufficient_evidence";

/*

* IMPORTANT:
*
* A preliminary assessment does not require citations.
* It requires a meaningful assessment and a preliminary status.
*
* This does not mean the assessment is scientifically verified.
  */
  const assessmentAccepted =
  !isUnknown &&
  status === "preliminary";

const evidenceSupported =
assessmentAccepted &&
assessment.evidenceSufficient === true &&
validatedCitations.length > 0;

const acceptedAssessment = assessmentAccepted
? assessmentName
: UNKNOWN;

const assessmentReason = String(
assessment.reason ||
"This is a preliminary AI assessment, not a confirmed diagnosis."
);

const evidenceReason = evidenceSupported
? "The preliminary assessment cites retrieved agricultural references. Citation provenance was checked, but this does not independently verify the diagnosis."
: assessmentAccepted
? "This is a preliminary AI assessment based on the available symptoms and observations. The retrieved references do not sufficiently support this assessment."
: "The available information is insufficient to distinguish the likely cause reliably.";

const alternativeExplanations = Array.isArray(
assessment.alternativeExplanations
)
? assessment.alternativeExplanations
.filter(
(item) =>
typeof item === "string" &&
item.trim().length > 0
)
.map((item) => item.trim())
: [];

const result = {
disease: acceptedAssessment,

// No calibrated probability model exists.
// Never fabricate a confidence percentage.
confidence: null,
scoreType: "not_calculated",

assessmentStatus: assessmentAccepted
  ? "preliminary"
  : "insufficient_evidence",

observedSymptoms,

agriculturalEvidenceFound:
  sources.length > 0,

sources: sources.map((source) => ({
  title: source.title,
  organization: source.organization,
  crop: source.crop,
  region: source.region,
  publicationDate: source.publicationDate,
  sourceUrl: source.sourceUrl,
  topic: source.topic,
})),

evidenceSupported,

evidenceValidation: {
  supported: evidenceSupported,
  reason: evidenceReason,
  matchedEvidence: evidenceSupported
    ? validatedCitations
    : [],
},

reason: assessmentAccepted
  ? assessmentReason
  : String(
      assessment.reason ||
        "The available information is insufficient for a reliable preliminary assessment."
    ),

action: assessmentAccepted
  ? String(
      assessment.action || UNKNOWN_ACTION
    )
  : UNKNOWN_ACTION,

alternativeExplanations,

imageQuality,
affectedPart,

};

return await translateResult(result, language);
}

/*

* STEP 6: Translate the result into the selected language.
*
* The source URLs, source metadata, assessment status, and
* boolean evidence flags are preserved.
  */
  async function translateResult(result, language) {
  if (!language || language === "en") {
  return result;
  }

result.disease = await translateText(
result.disease,
language
);

result.reason = await translateText(
result.reason,
language
);

result.action = await translateText(
result.action,
language
);

result.observedSymptoms = await Promise.all(
result.observedSymptoms.map((symptom) =>
translateText(symptom, language)
)
);

result.affectedPart = await translateText(
result.affectedPart,
language
);

result.imageQuality = await translateText(
result.imageQuality,
language
);

result.alternativeExplanations =
await Promise.all(
result.alternativeExplanations.map(
(explanation) =>
translateText(explanation, language)
)
);

if (
result.evidenceValidation.matchedEvidence
.length > 0
) {
result.evidenceValidation.matchedEvidence =
await Promise.all(
result.evidenceValidation.matchedEvidence.map(
async (item) => ({
...item,
explanation: await translateText(
item.explanation,
language
),
})
)
);
}

return result;
}

module.exports = {
analyzeDisease,
};
