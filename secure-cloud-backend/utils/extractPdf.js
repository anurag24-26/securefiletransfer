const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { createCanvas, loadImage } = require('canvas');

// Fix for Render/Node.js - Polyfill DOMMatrix
global.DOMMatrix = class DOMMatrix {
  constructor(init) { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; }
  multiply(self) { /* simplified */ return new DOMMatrix(); }
  translate(tx, ty) { this.e += tx; this.f += ty; return this; }
  scale(sx, sy) { this.a *= sx; this.d *= sy; return this; }
};

// Set worker for Render
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.js`;

async function extractPdf(buffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: Buffer.from(buffer) });
    const pdf = await loadingTask.promise;
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
    console.error("❌ PDF extract error:", err);
    throw new Error("Failed to extract PDF text.");
  }
}

module.exports = extractPdf;
