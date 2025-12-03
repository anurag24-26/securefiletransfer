const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const fs = require('fs'); // Only for temp files if needed

// Set worker for Render (CDN-hosted)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.js`;

async function extractPdf(buffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: Buffer.from(buffer) }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map(item => item.str)
        .join(" ")
        .replace(/\s+/g, ' ')
        .trim();
      
      if (pageText.length > 3) {
        text += pageText + " ";
      }
      text += "\n";
    }

    const finalText = text.trim();
    console.log("📄 PDF Text extraction complete:");
    console.log("- Total pages:", pdf.numPages);
    console.log("- Final text length:", finalText.length);
    console.log("- First 200 chars:", finalText.slice(0, 200));
    
    return finalText;
  } catch (err) {
    console.error("❌ PDF extract error:", err);
    throw new Error("Failed to extract PDF text.");
  }
}

module.exports = extractPdf;
