const { callGroq } = require('./aiService');

//  Evaluate a student's answer to a question.
async function evaluateAnswer(question, answer, context = {}) {
  const { resumeText = '', jobDriveId = '' } = context;
  const prompt = `You are an expert AI technical interviewer. 
Evaluate the candidate's response to the following interview question.

Question: "${question}"
Candidate's Answer: "${answer}"
Resume Excerpt: "${resumeText?.slice(0, 500)}"

Instructions:
1. Grade the candidate's answer stringently on a scale of 0 to 5 (integer):
   - 0: No answer, completely off-topic, or "I don't know".
   - 1: Extremely weak answer with major technical errors.
   - 2: Partially correct but shallow or contains minor misconceptions.
   - 3: Good standard answer that covers the basics but lacks depth or advanced details.
   - 4: Strong answer showing clear understanding and good technical explanation.
   - 5: Outstanding, flawless, industry-level response covering edge cases and core details.
   Provide a realistic, dynamic score (do not always give the same default score).

2. Determine if a follow-up question is necessary to cross-examine their understanding based on their response. If they gave a weak, vague, or incomplete answer, generate a natural follow-up question. If their answer is complete or they have hit the limit, set "followUp" to null.

Respond ONLY with a raw JSON object (no markdown, no preamble) in the following format:
{
  "rating": <0-5>,
  "followUp": "Optional follow-up question or null"
}`;
  const response = await callGroq(prompt);
  const cleanResponse = response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const jsonMatch = cleanResponse.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        rating: typeof parsed.rating === 'number' ? Math.round(parsed.rating) : 0,
        followUp: parsed.followUp && typeof parsed.followUp === 'string' && parsed.followUp.trim().length > 0 ? parsed.followUp.trim() : null,
      };
    } catch (e) {
      console.error('Failed to parse evaluateAnswer JSON:', e, response);
    }
  }
  return { rating: 0, followUp: null };
}

// Placeholder for generating a follow‑up question independently
async function generateFollowUpQuestion(_question, _answer, _context = {}) {
  return null;
}

module.exports = { evaluateAnswer, generateFollowUpQuestion };
