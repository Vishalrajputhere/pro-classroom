const fs = require('fs');
const natural = require('natural');
const TfIdf = natural.TfIdf;

/// 1. Function to extract text from a file path (now simplified for TXT)
const extractTextFromPDF = async (filePath) => {
    // --- PURE JAVASCRIPT FIX: No external libraries, just read the file ---
    try {
        // Check file extension to know how to read it
        if (filePath.endsWith('.txt')) {
            // Read TXT files directly with the Node fs module
            return fs.readFileSync(filePath, 'utf-8');
        }
        // If it's still a PDF, we'll try to read the buffer (but assume it will crash/fail)
        console.warn('Attempting to process non-TXT file with backup method...');
        
        // Final fallback using the problematic library (for completeness)
        const pdf = await import('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf.default(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("Error extracting text from file (using TXT fallback):", error.message);
        return "";
    }
};

// 2. Function to calculate Cosine Similarity (This logic is already correct)
const calculateCosineSimilarity = (textA, textB) => {
    if (!textA || !textB) return 0;
    
    const tfidf = new TfIdf();
    
    tfidf.addDocument(textA);
    tfidf.addDocument(textB);
    
    const termsA = {};
    const termsB = {};
    
    tfidf.listTerms(0).forEach(item => { termsA[item.term] = item.tfidf; });
    tfidf.listTerms(1).forEach(item => { termsB[item.term] = item.tfidf; });

    const allTerms = new Set([...Object.keys(termsA), ...Object.keys(termsB)]);

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const term of allTerms) {
        const scoreA = termsA[term] || 0;
        const scoreB = termsB[term] || 0;

        dotProduct += scoreA * scoreB;
        magnitudeA += scoreA * scoreA;
        magnitudeB += scoreB * scoreB;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA * magnitudeB === 0) return 0;

    const similarity = dotProduct / (magnitudeA * magnitudeB);
    
    return Math.round(similarity * 100);
};

module.exports = {
    extractTextFromPDF,
    calculateCosineSimilarity
};