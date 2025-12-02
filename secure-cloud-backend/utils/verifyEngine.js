/**
 * Check if PDF text contains any authority keywords
 * @param {string} text
 * @returns {boolean}
 */
function verifyEngine(text) {
  if (!text) return false;

  const keywords = [
    "ceo",
    "founder",
    "director",
    "president",
    "owner",
    "head of",
    "chairman",
    "managing director",
  ];

  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

module.exports = verifyEngine;
