const pdfParse = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");

/* ===========================
   CONFIG: GENERIC STOP WORDS
=========================== */
const STOP_WORDS = new Set([
  "the", "is", "are", "was", "were", "be", "been", "being", "a", "an", "and", "or", "but", "if", "then", "else", "of", "to", "in", "on", "for", "with", "as", "by", "at", "this", "that", "these", "those", "it", "its", "from", "we", "you", "they", "their", "can", "could", "should", "would", "may", "might", "will", "shall", "do", "does", "did", "done"
]);

const NOISE_PATTERNS = [
  /^page\s+\d+/gi,
  /^chapter\s+\d+/gi,
  /^section\s+\d+/gi,
  /^\d+\.\s+/g,
];

/* ===========================
   TEXT NORMALIZATION
=========================== */
function normalizeText(text) {
  if (!text) return "";

  let cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  NOISE_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "");
  });

  const tokens = cleaned.split(" ").filter(
    (word) => word.length > 2 && !STOP_WORDS.has(word)
  );

  return { raw: text, cleaned: tokens.join(" "), tokens };
}

/* ===========================
   EXTRACT TEXT FROM PDF/TXT
=========================== */
async function extractTextFromPDF(source) {
  try {
    let buffer;
    if (source.startsWith("http")) {
      const response = await axios.get(source, { responseType: "arraybuffer" });
      buffer = response.data;
    } else {
      buffer = fs.readFileSync(source);
    }
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (err) {
    console.warn("PDF parse failed, trying TXT fallback...");
    try {
      return fs.readFileSync(source, "utf8");
    } catch (e) {
      console.error("Text extraction failed:", e.message);
      return "";
    }
  }
}

/* ===========================
   TF-IDF + COSINE SIMILARITY
=========================== */
function calculateTFIDFSimilarity(textA, textB) {
  const normA = normalizeText(textA);
  const normB = normalizeText(textB);

  if (!normA.cleaned || !normB.cleaned) return 0;

  const wordsA = normA.tokens;
  const wordsB = normB.tokens;

  // Simple Term Frequency (TF)
  const freqA = {};
  const freqB = {};
  wordsA.forEach((w) => (freqA[w] = (freqA[w] || 0) + 1));
  wordsB.forEach((w) => (freqB[w] = (freqB[w] || 0) + 1));

  const uniqueWords = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  const N = 2; // Total documents

  let dot = 0;
  let magA = 0;
  let magB = 0;

  uniqueWords.forEach((word) => {
    // Document Frequency (DF)
    let df = 0;
    if (freqA[word]) df++;
    if (freqB[word]) df++;

    // Inverse Document Frequency (IDF)
    const idf = Math.log(N / df) + 1; // standard smooth idf

    const tfidfA = (freqA[word] || 0) * idf;
    const tfidfB = (freqB[word] || 0) * idf;

    dot += tfidfA * tfidfB;
    magA += tfidfA * tfidfA;
    magB += tfidfB * tfidfB;
  });

  if (magA === 0 || magB === 0) return 0;
  const similarity = dot / (Math.sqrt(magA) * Math.sqrt(magB));
  return Math.round(similarity * 100);
}

/* ===========================
   N-GRAM EXACT MATCH HIGHLIGHTING
=========================== */
function extractNGrams(text, n) {
  // Use raw split to maintain phrase structure but lowercase to normalize match
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim().split(" ");
  const ngrams = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(" "));
  }
  return ngrams;
}

function getMatchedPhrases(textA, textB, n = 5, limit = 5) {
  const ngramsA = extractNGrams(textA, n);
  const ngramsB = new Set(extractNGrams(textB, n));

  const matches = new Set();
  
  ngramsA.forEach(phrase => {
    if (ngramsB.has(phrase)) {
      matches.add(phrase);
    }
  });

  return [...matches].slice(0, limit);
}

module.exports = {
  extractTextFromPDF,
  calculateTFIDFSimilarity,
  getMatchedPhrases
};
