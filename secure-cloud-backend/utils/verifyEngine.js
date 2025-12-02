/**
 * Check if PDF text contains any authority keywords
 * @param {string} text
 * @returns {boolean}
 */
function verifyEngine(text) {
  if (!text || text.length < 50) {
    console.log("❌ Verification failed: Text too short or empty");
    return false;
  }

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

  // Normalize text: lowercase + normalize spaces
  const lower = text.toLowerCase().replace(/\s+/g, ' ').trim();
  
  const result = keywords.some(k => lower.includes(k));
  
  console.log("🔍 Verification check:");
  console.log("- Text length:", text.length);
  console.log("- Keywords found:", result);
  console.log("- Sample text:", text.slice(0, 100));
  
  return result;
}

module.exports = verifyEngine;
