const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

async function extractPdf(buffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map((item) => item.str).join(" ");
      fullText += strings + "\n";
    }

    return fullText.trim();
  } catch (err) {
    console.error("PDF extract error:", err);
    throw new Error("Failed to extract PDF text.");
  }
}

module.exports = extractPdf;
