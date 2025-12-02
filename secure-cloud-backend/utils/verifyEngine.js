module.exports = function verify(text) {
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
};
