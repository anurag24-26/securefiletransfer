const pdf = require("pdf-parse");

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer
 * @returns {Promise<string>} extracted text
 */
async function extractPdf(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

module.exports = extractPdf;
