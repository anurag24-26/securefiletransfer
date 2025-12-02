const PDFParser = require("pdf2json");

async function extractPdf(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      console.error("❌ PDF extract error:", err);
      reject(new Error("Failed to extract PDF text."));
    });

    pdfParser.on("pdfParser_dataReady", (data) => {
      try {
        let text = "";

        data.Pages.forEach((page, pageIndex) => {
          if (page.Texts && page.Texts.length > 0) {
            page.Texts.forEach((t) => {
              try {
                // Robust text decoding
                const decoded = t.R.map((r) => {
                  try {
                    // Handle URI encoded text
                    let decodedText = decodeURIComponent(r.T);
                    
                    // Fix common pdf2json encoding issues
                    decodedText = decodedText
                      .replace(/\\([0-9]{3})/g, (match, code) => 
                        String.fromCharCode(parseInt(code, 8))
                      )
                      // Remove control characters and garbage
                      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
                      // Normalize multiple spaces
                      .replace(/\s+/g, ' ')
                      .trim();
                    
                    return decodedText;
                  } catch (decodeErr) {
                    console.warn("Failed to decode text block:", r.T);
                    return "";
                  }
                }).join(" ").trim();

                if (decoded.length > 3) {
                  text += decoded + " ";
                }
              } catch (blockErr) {
                // Skip problematic text blocks
              }
            });
          }
          text += "\n";
        });

        const finalText = text.trim();
        console.log("📄 PDF Text extraction complete:");
        console.log("- Total pages:", data.Pages.length);
        console.log("- Final text length:", finalText.length);
        console.log("- First 200 chars:", finalText.slice(0, 200));
        
        resolve(finalText);
      } catch (e) {
        console.error("❌ PDF parsing failed:", e);
        reject(new Error("PDF parsing failed."));
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

module.exports = extractPdf;
