// secure-cloud-backend/utils/geminiClient.js
const fetch = require("node-fetch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // set in Render dashboard
const BASE_URL = "https://generativelanguage.googleapis.com";
const MODEL = "gemini-flash-latest";
// or gemini-1.5-flash-latest

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set in environment variables.");
}

// 1) Upload raw PDF bytes to Gemini Files API → returns file_uri
async function uploadPdfToGemini(buffer, filename = "document.pdf") {
  const numBytes = buffer.length;

  // Start resumable upload
  const initRes = await fetch(
    `${BASE_URL}/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(numBytes),
        "X-Goog-Upload-Header-Content-Type": "application/pdf",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: {
          display_name: filename,
        },
      }),
    }
  );

  if (!initRes.ok) {
    const text = await initRes.text();
    throw new Error(`Gemini upload init failed: ${initRes.status} ${text}`);
  }

  const uploadUrl = initRes.headers.get("x-goog-upload-url");
  if (!uploadUrl) {
    throw new Error("Gemini upload URL missing in response headers.");
  }

  // Upload actual bytes
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(numBytes),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
      "Content-Type": "application/pdf",
    },
    body: buffer,
  });

  const fileInfo = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok) {
    throw new Error(
      `Gemini file upload failed: ${uploadRes.status} ${JSON.stringify(
        fileInfo
      )}`
    );
  }

  const fileUri = fileInfo.file?.uri;
  if (!fileUri) {
    throw new Error("Gemini response missing file.uri");
  }

  console.log("📎 Gemini file uploaded:", fileUri);
  return fileUri;
}

// 2) Ask Gemini to verify the uploaded PDF using file_uri
async function verifyPdfWithGemini(fileUri) {
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
                file_data: {
                  mime_type: "application/pdf",
                  file_uri: fileUri,
                },
              },
            ],
          },
        ],
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
    score:
      typeof parsed.score === "number"
        ? parsed.score
        : null,
    reason: parsed.reason || "No reason provided.",
    raw,
  };
}

module.exports = {
  uploadPdfToGemini,
  verifyPdfWithGemini,
};
