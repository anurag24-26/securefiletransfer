const PDFParser = require("pdf2json");

async function extractPdf(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      console.error("PDF extract error:", err);
      reject(new Error("Failed to extract PDF text."));
    });

    pdfParser.on("pdfParser_dataReady", (data) => {
      try {
        let text = "";

        data.Pages.forEach((page) => {
          page.Texts.forEach((t) => {
            const line = t.R.map((r) => decodeURIComponent(r.T)).join(" ");
            text += line + " ";
          });
          text += "\n";
        });

        resolve(text.trim());
      } catch (e) {
        reject(new Error("PDF parsing failed."));
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

module.exports = extractPdf;
