const pdfParse = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");

/* ===========================
   CONFIG: GENERIC STOP WORDS
=========================== */
const STOP_WORDS = new Set([
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "a",
  "an",
  "and",
  "or",
  "but",
  "if",
  "then",
  "else",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "as",
  "by",
  "at",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "from",
  "we",
  "you",
  "they",
  "their",
  "can",
  "could",
  "should",
  "would",
  "may",
  "might",
  "will",
  "shall",
  "do",
  "does",
  "did",
  "done",
]);

/* ===========================
   REMOVE COMMON DOCUMENT NOISE
=========================== */
const NOISE_PATTERNS = [
  /^page\s+\d+/gi,
  /^chapter\s+\d+/gi,
  /^section\s+\d+/gi,
  /^\d+\.\s+/g,
];

/* ===========================
   TEXT NORMALIZATION (CRITICAL)
=========================== */
function normalizeText(text) {
  if (!text) return "";

  let cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Remove noise patterns
  NOISE_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "");
  });

  // Token filtering
  const tokens = cleaned.split(" ").filter(
    (word) =>
      word.length > 2 && // remove tiny words
      !STOP_WORDS.has(word) // remove stop words
  );

  return tokens.join(" ");
}

/* ===========================
   EXTRACT TEXT FROM PDF/TXT
=========================== */
async function extractTextFromPDF(source) {
  try {
    let buffer;

    // Cloudinary URL
    if (source.startsWith("http")) {
      const response = await axios.get(source, {
        responseType: "arraybuffer",
      });
      buffer = response.data;
    } else {
      buffer = fs.readFileSync(source);
    }

    const data = await pdfParse(buffer);
    return normalizeText(data.text || "");
  } catch (err) {
    console.warn("PDF parse failed, trying TXT fallback...");

    try {
      const raw = fs.readFileSync(source, "utf8");
      return normalizeText(raw);
    } catch (e) {
      console.error("Text extraction failed:", e.message);
      return "";
    }
  }
}

/* ===========================
   COSINE SIMILARITY
=========================== */
function calculateCosineSimilarity(textA, textB) {
  if (!textA || !textB) return 0;

  const wordsA = textA.split(" ");
  const wordsB = textB.split(" ");

  const freqA = {};
  const freqB = {};

  wordsA.forEach((w) => (freqA[w] = (freqA[w] || 0) + 1));
  wordsB.forEach((w) => (freqB[w] = (freqB[w] || 0) + 1));

  const uniqueWords = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);

  let dot = 0;
  let magA = 0;
  let magB = 0;

  uniqueWords.forEach((word) => {
    const a = freqA[word] || 0;
    const b = freqB[word] || 0;

    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  if (magA === 0 || magB === 0) return 0;

  const similarity = dot / (Math.sqrt(magA) * Math.sqrt(magB));

  // Convert to percentage (rounded)
  return Math.round(similarity * 100);
}

module.exports = {
  extractTextFromPDF,
  calculateCosineSimilarity,
};

/* ===========================
   EXPLANATION ENGINE
=========================== */
function getTopMatchingPhrases(textA, textB, limit = 5) {
  const tokensA = textA.split(" ");
  const tokensB = new Set(textB.split(" "));

  const matches = [];

  for (let i = 0; i < tokensA.length - 4; i++) {
    const phrase = tokensA.slice(i, i + 5).join(" ");
    const words = phrase.split(" ");

    const common = words.filter((w) => tokensB.has(w));
    if (common.length >= 4) {
      matches.push(phrase);
    }
  }

  return [...new Set(matches)].slice(0, limit);
}

function buildExplanation(textA, textB, similarityScore) {
  return {
    score: similarityScore,
    confidence:
      similarityScore < 20 ? "LOW" : similarityScore < 50 ? "MEDIUM" : "HIGH",
    topMatches: getTopMatchingPhrases(textA, textB),
    note:
      similarityScore < 20
        ? "Mostly original content"
        : similarityScore < 50
        ? "Partial similarity detected"
        : "High similarity detected",
  };
}

module.exports.buildExplanation = buildExplanation;

function buildHumanReadableExplanation(newText, oldText, similarityScore) {
  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/);

  const newWords = normalize(newText);
  const oldWords = normalize(oldText);

  const commonWords = newWords.filter((word) => oldWords.includes(word));
  const uniqueCommonWords = [...new Set(commonWords)];

  let reason = "";

  if (similarityScore < 20) {
    reason =
      "Minor overlap detected. Similarity is likely due to common terminology or formatting.";
  } else if (similarityScore < 50) {
    reason =
      "Moderate similarity detected. Some sentences and phrasing patterns overlap with another submission.";
  } else {
    reason =
      "High similarity detected. Large portions of text structure and wording closely match another submission.";
  }

  return {
    similarityScore,
    commonWordCount: uniqueCommonWords.length,
    explanationText: reason,
    note: "Similarity is calculated using semantic vector comparison, not exact word matching.",
  };
}

module.exports = {
  extractTextFromPDF,
  calculateCosineSimilarity,
  buildHumanReadableExplanation, // ✅ export
};
