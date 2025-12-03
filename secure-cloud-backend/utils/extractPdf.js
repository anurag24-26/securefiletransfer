// CORRECT IMPORT - Copy this entire file
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// Polyfill for Render Node.js 22
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() { 
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; 
    }
    translate(tx, ty) { this.e += tx; this.f += ty; return this; }
    scale(sx) { this.a *= sx; this.d *= sx; return this; }
  };
}

// Worker for Render CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.js`;

async function extractPdf(buffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map(item => (item.str || '').trim())
        .filter(str => str.length > 0)
        .join(" ")
        .replace(/\s+/g, ' ')
        .trim();
      
      if (pageText.length > 3) {
        text += pageText + "\n\n";
      }
    }

    const finalText = text.trim();
    console.log("📄 PDF Text extraction complete:");
    console.log("- Total pages:", pdf.numPages);
    console.log("- Final text length:", finalText.length);
    console.log("- First 200 chars:", finalText.slice(0, 200));
    
    return finalText;
  } catch (err) {
    console.error("❌ PDF extract error:", err.message);
    throw new Error("Failed to extract PDF text.");
  }
}

module.exports = extractPdf;
