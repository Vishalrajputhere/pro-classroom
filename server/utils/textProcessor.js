const axios = require("axios");
const pdfParse = require("pdf-parse");

/**
 * Extract text from TXT or PDF (Cloudinary URL)
 */
async function extractTextFromPDF(fileUrl) {
  try {
    // Download file as buffer
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data);

    // Try PDF parse
    try {
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (pdfErr) {
      // Fallback: treat as text
      return buffer.toString("utf-8");
    }
  } catch (err) {
    console.error("Text extraction failed:", err.message);
    return "";
  }
}

/**
 * Simple cosine similarity
 */
function calculateCosineSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const tokenize = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  const freq = (tokens) => {
    const map = {};
    tokens.forEach((t) => (map[t] = (map[t] || 0) + 1));
    return map;
  };

  const f1 = freq(tokens1);
  const f2 = freq(tokens2);

  const allWords = new Set([...Object.keys(f1), ...Object.keys(f2)]);

  let dot = 0,
    mag1 = 0,
    mag2 = 0;

  allWords.forEach((w) => {
    const v1 = f1[w] || 0;
    const v2 = f2[w] || 0;
    dot += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  });

  if (!mag1 || !mag2) return 0;

  return Math.round((dot / (Math.sqrt(mag1) * Math.sqrt(mag2))) * 100);
}

module.exports = {
  extractTextFromPDF,
  calculateCosineSimilarity,
};
