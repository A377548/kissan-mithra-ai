const fs = require("fs");
const path = require("path");

const metadataPath = path.join(
  __dirname,
  "..",
  "knowledge-base",
  "metadata.json"
);

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadDocuments() {
  if (!fs.existsSync(metadataPath)) {
    throw new Error("Agricultural knowledge metadata was not found.");
  }

const raw = fs.readFileSync(metadataPath, "utf8").replace(/^\uFEFF/, "");
  const data = JSON.parse(raw);

  if (!data || !Array.isArray(data.documents)) {
    throw new Error(
      "Knowledge metadata must contain a documents array."
    );
  }

  return data.documents;
}

function searchAgriculturalKnowledge({
  crop,
  query,
  topic,
  limit = 5,
}) {
  if (!crop || !String(crop).trim()) {
    throw new Error("Crop is required for knowledge retrieval.");
  }

  const documents = loadDocuments();
  const normalizedCrop = normalizeText(crop);
  const normalizedQuery = normalizeText(query);
  const normalizedTopic = normalizeText(topic);

  const queryTerms = normalizedQuery
    .split(/\s+/)
    .filter((term) => term.length >= 3);

  const results = documents
    .filter((document) => {
      if (!document || !document.crop || !document.content) {
        return false;
      }

      return normalizeText(document.crop) === normalizedCrop;
    })
    .map((document) => {
      const searchableText = normalizeText(
        [
          document.title,
          document.topic,
          document.content,
        ].join(" ")
      );

      const matchingTerms = queryTerms.filter((term) =>
        searchableText.includes(term)
      );

      const topicMatches =
        !normalizedTopic ||
        normalizeText(document.topic).includes(normalizedTopic);

      const score =
        matchingTerms.length +
        (topicMatches && normalizedTopic ? 2 : 0);

      return {
        document,
        score,
        matchingTerms,
        topicMatches,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(Number(limit) || 5, 10)));

  return {
    crop,
    query: query || "",
    evidenceFound: results.length > 0,
    results: results.map(
      ({ document, score, matchingTerms }) => ({
        title: document.title,
        organization: document.organization,
        topic: document.topic,
        crop: document.crop,
        region: document.region || null,
        publicationDate: document.publicationDate || null,
        sourceUrl: document.sourceUrl || null,
        content: document.content,
        retrievalScore: score,
        matchingTerms,
      })
    ),
  };
}

module.exports = {
  searchAgriculturalKnowledge,
};