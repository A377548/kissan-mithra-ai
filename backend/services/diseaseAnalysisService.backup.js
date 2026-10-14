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
  "The available agricultural evidence is insufficient for a reliable identification. Take clear photographs of the whole plant and affected areas. Record when symptoms began and whether they are spreading. Consult a local agricultural expert for crop-specific advice.";

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
 * This verifies that every source cited by Gemini was actually
 * supplied to the model. It does not independently prove that a
 * source scientifically supports a diagnosis.
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

  return citations
    .filter(
      (citation) =>
        citation &&
        typeof citation.sourceUrl === "string" &&
        availableSources.has(citation.sourceUrl)
    )
    .map((citation) => {
      const source = availableSources.get(citation.sourceUrl);

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
  reason = "Relevant agricultural evidence was insufficient for a reliable preliminary assessment.",
  imageQuality = "unknown",
  affectedPart = "unknown",
}) {
  return {
    disease: UNKNOWN,
    confidence: null,
    scoreType: "not_calculated",
    observedSymptoms,
    agriculturalEvidenceFound: sources.length > 0,
    sources,
    evidenceSupported: false,
    evidenceValidation: {
      supported: false,
      reason,
      matchedEvidence: [],
    },
    reason,
    action: UNKNOWN_ACTION,
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
    throw new Error("Provide a crop image or describe the symptoms.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  /*
   * Step 1: Retrieve agricultural references.
   *
   * Retrieval failure must not be interpreted as proof that
   * the crop has no disease.
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

  const sources = (agriculturalEvidence.results || []).map(
    (item) => ({
      title: item.title,
      organization: item.organization,
      crop: item.crop,
      region: item.region || null,
      publicationDate: item.publicationDate || null,
      sourceUrl: item.sourceUrl || null,
      topic: item.topic,
      content: item.content,
    })
  );

  /*
   * Step 2: Ask Gemini to report observable symptoms.
   *
   * The model must distinguish farmer-reported symptoms from
   * features actually visible in the image.
   */
  const observationPrompt = `
You are the crop observation component of Kisaan Mithra AI.

Crop reported by farmer: ${crop || "Unknown"}
Farmer-reported symptoms: ${farmerSymptoms || "None provided"}

Inspect the supplied image if one is available.

Return valid JSON with this structure:
{
  "observedSymptoms": ["specific observation"],
  "affectedPart": "leaf, leaf sheath, stem, panicle, grain, root, fruit, or unknown",
  "imageQuality": "good, limited, poor, or not_provided",
  "reason": "Brief description of the available observations"
}

Rules:
- Do not diagnose a disease in this step.
- Never claim a farmer-reported symptom was visually confirmed unless it is visible in the image.
- If no image is provided, use the farmer's description only.
- Do not invent observations.
- Do not provide pesticide or chemical recommendations.
`;

  const observationContents = [{ text: observationPrompt }];

  if (imageBase64 && mimeType) {
    observationContents.push({
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    });
  }

  const observationResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: observationContents,
    config: {
      responseMimeType: "application/json",
      temperature: 0,
    },
  });

  if (!observationResponse.text) {
    throw new Error("The AI returned an empty observation.");
  }

  let observation;

  try {
    observation = JSON.parse(observationResponse.text);
  } catch {
    throw new Error("The AI returned invalid observation JSON.");
  }

  const observedSymptoms = Array.isArray(
    observation.observedSymptoms
  )
    ? observation.observedSymptoms
        .filter(
          (item) =>
            typeof item === "string" && item.trim().length > 0
        )
        .map((item) => item.trim())
    : [];

  const imageQuality = normalizeText(observation.imageQuality);
  const affectedPart = String(
    observation.affectedPart || "unknown"
  );

  /*
   * Step 3: If there is no useful evidence, do not ask the model
   * to invent a disease assessment.
   */
  const poorImage =
    Boolean(imageBase64) && imageQuality === "poor";

  if (observedSymptoms.length === 0 || poorImage) {
    const result = buildUnknownResult({
      observedSymptoms,
      sources,
      reason:
        "The available image or symptom observations are insufficient for a reliable preliminary assessment.",
      imageQuality,
      affectedPart,
    });

    return await translateResult(result, language);
  }

  /*
   * Step 4: Ask Gemini to assess possible causes using retrieved
   * agricultural sources.
   *
   * An empty source list means the model must not claim that
   * its assessment is supported by retrieved agricultural evidence.
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

Assess the reported crop problem using the observations and
agricultural reference documents below.

CROP:
${crop || "Unknown"}

FARMER-REPORTED SYMPTOMS:
${farmerSymptoms || "None provided"}

OBSERVATIONS:
${JSON.stringify(observedSymptoms)}

AGRICULTURAL REFERENCES:
${JSON.stringify(evidenceForPrompt)}

Return only valid JSON with this exact structure:
{
  "assessment": "A possible cause or Unknown / insufficient evidence",
  "assessmentStatus": "preliminary or insufficient_evidence",
  "supportingCitations": [
    {
      "sourceUrl": "exact source URL copied from a supplied reference",
      "explanation": "What the supplied source says that is relevant"
    }
  ],
  "alternativeExplanations": [
    "Possible alternative explanation"
  ],
  "reason": "Explain the assessment and uncertainty",
  "action": "Conservative practical next steps",
  "evidenceSufficient": false
}

MANDATORY RULES:
- Do not invent sources, source URLs, research findings, or quotations.
- Cite only supplied references and copy their sourceUrl exactly.
- Use only references relevant to the reported crop and symptoms.
- Consider the source region; do not imply that regional guidance
  automatically applies throughout India.
- A source mentioning the crop alone is not sufficient evidence
  for a disease.
- If no relevant reference supports a preliminary assessment,
  return assessment "Unknown / insufficient evidence",
  assessmentStatus "insufficient_evidence",
  evidenceSufficient false, and no supporting citations.
- Do not claim that a disease is confirmed.
- Symptoms can overlap across diseases and non-disease conditions.
- If evidence is conflicting or insufficient, acknowledge uncertainty.
- Do not recommend specific pesticides, dosages, or chemical treatments.
- Provide conservative next steps and suggest a local agricultural
  expert when necessary.
- Return evidenceSufficient true only when the supplied sources
  meaningfully support the preliminary assessment.
`;

  const assessmentResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: [{ text: assessmentPrompt }],
    config: {
      responseMimeType: "application/json",
      temperature: 0,
    },
  });

  if (!assessmentResponse.text) {
    throw new Error("The AI returned an empty assessment.");
  }

  let assessment;

  try {
    assessment = JSON.parse(assessmentResponse.text);
  } catch {
    throw new Error("The AI returned invalid assessment JSON.");
  }

  /*
   * Step 5: Validate that the cited sources came from retrieval.
   */
  const validatedCitations = validateCitations(
    assessment.supportingCitations,
    sources
  );

  const assessmentName =
    typeof assessment.assessment === "string"
      ? assessment.assessment.trim()
      : UNKNOWN;

  const status = normalizeText(assessment.assessmentStatus);

  const isUnknown =
    !assessmentName ||
    normalizeText(assessmentName) === normalizeText(UNKNOWN) ||
    status === "insufficient evidence" ||
    status === "insufficient_evidence";

  /*
   * We require at least one valid citation and the model's
   * evidenceSufficient flag before accepting a preliminary result.
   *
   * This is a provenance safeguard, not scientific verification.
   */
  const evidenceSupported =
    !isUnknown &&
    assessment.evidenceSufficient === true &&
    validatedCitations.length > 0;

  const acceptedAssessment = evidenceSupported
    ? assessmentName
    : UNKNOWN;

  const result = {
    disease: acceptedAssessment,

    // No calibrated probability model exists, so do not fabricate
    // a numerical confidence score.
    confidence: null,
    scoreType: "not_calculated",

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

    evidenceSupported,

    evidenceValidation: {
      supported: evidenceSupported,
      reason: evidenceSupported
        ? "The preliminary assessment cites at least one retrieved source. Citation provenance was checked; this does not independently confirm the diagnosis."
        : "The available evidence did not meet the requirements for returning a source-supported preliminary assessment.",
      matchedEvidence: evidenceSupported
        ? validatedCitations
        : [],
    },

    reason: evidenceSupported
      ? String(
          assessment.reason ||
            "This is a preliminary assessment, not a confirmed diagnosis."
        )
      : String(
          assessment.reason ||
            "Relevant agricultural evidence is insufficient for a reliable preliminary assessment."
        ),

    action: evidenceSupported
      ? String(assessment.action || UNKNOWN_ACTION)
      : UNKNOWN_ACTION,

    imageQuality: observation.imageQuality || "unknown",
    affectedPart,
  };

  return await translateResult(result, language);
}

async function translateResult(result, language) {
  if (!language || language === "en") {
    return result;
  }

  result.disease = await translateText(result.disease, language);
  result.reason = await translateText(result.reason, language);
  result.action = await translateText(result.action, language);

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

  if (result.evidenceValidation.matchedEvidence.length > 0) {
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
