const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const languageNames = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  kn: "Kannada",
  ta: "Tamil",
  mr: "Marathi",
};

async function translateText(text, languageCode) {
  if (!text) {
    return "";
  }

  if (languageCode === "en") {
    return text;
  }

  const language = languageNames[languageCode];

  if (!language) {
    throw new Error("Unsupported language");
  }

  const prompt = `
You are the multilingual language assistant for Kisaan Mithra AI,
a farming decision-support application for smallholder farmers in India.

Translate the following farmer-facing message into ${language}.

Rules:
- Preserve the exact meaning.
- Use simple, natural language that a farmer can easily understand.
- Do not add new agricultural advice.
- Do not remove important information.
- Do not explain the translation.
- Return ONLY the translated text.

Message:
${text}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
  });

  return response.text.trim();
}

module.exports = {
  translateText,
};
