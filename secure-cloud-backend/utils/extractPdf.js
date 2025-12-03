// FIX 1: Default export (most common)
const pdfParse = require('pdf-parse').default;

async function extractPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    let finalText = data.text
      .replace(/\s+/g, ' ')
      .trim();

    console.log("📄 PDF Text extraction complete:");
    console.log("- Total pages:", data.numpages);
    console.log("- Final text length:", finalText.length);
    console.log("- First 200 chars:", finalText.slice(0, 200));
    
    return finalText;
  } catch (err) {
    console.error("❌ PDF extract error:", err.message);
    throw new Error("Failed to extract PDF text.");
  }
}

module.exports = extractPdf;
