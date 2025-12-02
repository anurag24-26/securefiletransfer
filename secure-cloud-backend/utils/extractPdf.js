const pdf = require("pdf-parse");

async function extractPdf(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text || "";
  } catch (err) {
    console.error("PDF extract error:", err);
    throw new Error("Failed to extract PDF text.");
  }
}

module.exports = extractPdf;
