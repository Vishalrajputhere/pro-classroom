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
   KEYWORD + PHRASE MATCHING
=========================== */

// Extract important keywords
function getMatchedKeywords(textA, textB, limit = 10) {
  const wordsA = textA.split(" ");
  const wordsB = new Set(textB.split(" "));

  const freq = {};

  for (const word of wordsA) {
    if (wordsB.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, limit);
}

// Extract matching phrases (n-grams)
function getMatchedPhrases(textA, textB, n = 4, limit = 5) {
  const tokensA = textA.split(" ");
  const textBString = textB;

  const phrases = new Set();

  for (let i = 0; i <= tokensA.length - n; i++) {
    const phrase = tokensA.slice(i, i + n).join(" ");

    // phrase must mostly exist in other text
    let matchCount = 0;
    phrase.split(" ").forEach((w) => {
      if (textBString.includes(w)) matchCount++;
    });

    if (matchCount >= n - 1) {
      phrases.add(phrase);
    }
  }

  return [...phrases].slice(0, limit);
}

/* ===========================
   HUMAN READABLE EXPLANATION
=========================== */
function buildHumanReadableExplanation(newText, oldText, similarityScore) {
  const matchedKeywords = getMatchedKeywords(newText, oldText);
  const matchedPhrases = getMatchedPhrases(newText, oldText);

  let explanationText = "";

  if (similarityScore < 20) {
    explanationText =
      "Minor overlap detected. Similarity appears to be caused by common academic terminology.";
  } else if (similarityScore < 50) {
    explanationText =
      "Moderate similarity detected. Several phrases and keywords overlap with another submission.";
  } else {
    explanationText =
      "High similarity detected. Multiple phrases and sentence structures closely match another submission.";
  }

  return {
    similarityScore,
    explanationText,
    commonWordCount: matchedKeywords.length,
    matchedKeywords, // ✅ NEW
    matchedPhrases, // ✅ NEW
    note: "Matched phrases are extracted using phrase-level comparison (not exact copy-paste).",
  };
}

module.exports = {
  extractTextFromPDF,
  calculateCosineSimilarity,
  buildHumanReadableExplanation,
};
