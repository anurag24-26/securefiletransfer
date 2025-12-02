const pdf = require("pdf-parse");
const fs = require("fs");

module.exports = async function extractPdf(buffer) {
  const data = await pdf(buffer);
  return data.text;
};
