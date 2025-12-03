// secure-cloud-backend/utils/geminiClient.js
const fetch = require("node-fetch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com";
const MODEL = "gemini-2.5-flash";  // valid for v1beta

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set in environment variables.");
}

// Directly send PDF bytes plus prompt in a single request
async function verifyPdfWithGeminiDirect(buffer) {
  const prompt = `
You are a strict document verification engine.

Task:
- Read this PDF and decide if it proves the user is an authorized organization owner or administrator.
- Look for: official letterheads, seals, signatures, authority titles, registration certificates, or any proof of control/ownership.

Return ONLY valid JSON in this shape:
{
  "approved": boolean,
  "score": number,      // 0-10 confidence
  "reason": string      // short explanation
}
If uncertain, set approved=false and explain why.
`.trim();

  // Encode PDF bytes as base64 for inline_data
  const base64Pdf = buffer.toString("base64");

  const res = await fetch(
    `${BASE_URL}/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: base64Pdf,
                },
              },
            ],
          },
        ],
        // v1beta expects this name exactly: generationConfig is okay per docs
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Gemini verify failed: ${res.status} ${JSON.stringify(data)}`
    );
  }

  const raw =
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    data.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data ??
    "{}";

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error("Gemini did not return valid JSON: " + raw);
  }

  return {
    approved: !!parsed.approved,
    score: typeof parsed.score === "number" ? parsed.score : null,
    reason: parsed.reason || "No reason provided.",
    raw,
  };
}

module.exports = {
  verifyPdfWithGeminiDirect,
};
