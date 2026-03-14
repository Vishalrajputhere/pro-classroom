const axios = require("axios");

/**
 * Generate a strict, highly accurate human-readable explanation report using OpenAI.
 * The output models exactly what the recruiter requested.
 */
async function generateAIExplanation(similarityScore, matchedPhrases, studentUsername, matchedStudentUsername, assignmentTitle) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn("No OpenAI API key found, falling back to basic explanation.");
            return generateBasicExplanation(similarityScore, matchedPhrases, studentUsername, matchedStudentUsername);
        }

        const prompt = `
You are an AI Plagiarism Analyst for 'Pro Classroom'.
Analyze the following submission overlap and generate a concise, human-readable report for the teacher. 

Assignment: "${assignmentTitle}"
Student Submission: ${studentUsername}
Highest Match With: ${matchedStudentUsername}
Overall Similarity Score: ${similarityScore}%

Matched Phrases Detected:
${matchedPhrases.map(p => `- "${p}"`).join('\n')}

Instructions:
1. Briefly state what happened (who matched with who).
2. Explain *why* the similarity occurred based on the provided phrases (e.g., identical sentence structure, copy-pasting of core concepts).
3. Do NOT provide HTML/Markdown. Provide plain text, maximum 3-4 sentences.
        `;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo", // or gpt-4 depending on the key tier
                messages: [{ role: "system", content: "You are an analytical teaching assistant." }, { role: "user", content: prompt }],
                max_tokens: 150,
                temperature: 0.2
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("OpenAI API Error:", error?.response?.data || error.message);
        return generateBasicExplanation(similarityScore, matchedPhrases, studentUsername, matchedStudentUsername);
    }
}

function generateBasicExplanation(similarityScore, matchedPhrases, studentA, studentB) {
    if (similarityScore < 20) {
        return `${studentA} and ${studentB} have minor overlaps. Similarity appears to be caused by common academic terminology.`;
    } else if (similarityScore < 50) {
        return `Moderate similarity detected between ${studentA} and ${studentB}. Several phrases overlap, indicating potential collaboration or shared sources.`;
    } else {
        return `High similarity detected! ${studentA} and ${studentB} share multiple identical phrases related to the core concepts. The structure is highly similar indicating potential copying.`;
    }
}

module.exports = {
    generateAIExplanation
};
