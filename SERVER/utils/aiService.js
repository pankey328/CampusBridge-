const axios = require("axios");

// Call Groq API for Chat Completions
const callGroq = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in server environment configurations. Please add it to your .env file.");
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const payload = {
    model: "qwen/qwen3.6-27b",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (
      response.data &&
      response.data.choices &&
      response.data.choices[0] &&
      response.data.choices[0].message
    ) {
      return response.data.choices[0].message.content;
    } else {
      console.error("Groq Unexpected Response Body:", JSON.stringify(response.data));
      throw new Error("Invalid response format received from Groq API.");
    }
  } catch (error) {
    console.error("Groq API Request Failed:", error.response?.data || error.message);
    if (error.response?.status === 429) {
      const apiMessage = error.response?.data?.error?.message;
      if (apiMessage) {
        throw new Error(`Groq API rate limit exceeded: ${apiMessage}`);
      }
      throw new Error("Groq API rate limit exceeded. Please wait a few seconds and try again.");
    }
    throw new Error(error.response?.data?.error?.message || error.message || "Failed to communicate with Groq AI service.");
  }
};


// Generate interview questions
exports.generateQuestionsBatch = async (skills, branch, count = 3) => {
  const prompt = `
You are an expert technical interviewer hiring for entry-level engineering roles.
The candidate has the following profile details:
- Academic Branch: ${branch || "General Engineering/Computer Science"}
- Technical Skills: ${skills && skills.length > 0 ? skills.join(", ") : "Web Development, Data Structures, Algorithms"}
- Session Seed: ${Date.now()}-${Math.floor(Math.random() * 1000000)}

Your task is to generate exactly ${count} distinct, beginner-friendly technical interview questions.

CRITICAL INSTRUCTION: You must respond WITH ONLY THE RAW JSON ARRAY. Do NOT output any thinking steps, reasoning process, explanations, markdown formatting, or preamble. 

Format:
[
  "First technical question?",
  "Second technical question?",
  "Third technical question?"
]
  `;

  const responseText = await callGroq(prompt);
  
  let cleanText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const lastOpenIndex = cleanText.lastIndexOf('[');
  const lastCloseIndex = cleanText.lastIndexOf(']');

  if (lastOpenIndex !== -1 && lastCloseIndex !== -1 && lastCloseIndex > lastOpenIndex) {
    const jsonSubstring = cleanText.slice(lastOpenIndex, lastCloseIndex + 1);
    try {
      const questions = JSON.parse(jsonSubstring);
      if (Array.isArray(questions) && questions.length > 0) {
        return questions.slice(0, count);
      }
    } catch (err) {
      console.error("Failed to parse extracted Groq questions JSON array. Substring was:", jsonSubstring);
    }
  } else {
    console.error("No JSON array bracket found in Groq response. Raw output was:", responseText);
  }

  const questionPool = [
    `Explain the concept of state management in ${skills.includes('React') ? 'React' : 'web applications'}.`,
    "What is the difference between synchronous and asynchronous code execution?",
    "How does indexing improve database query performance?",
    "Explain the difference between GET and POST HTTP methods.",
    "What are the main principles of Object-Oriented Programming (OOP)?",
    "Describe the difference between process and thread in operating systems.",
    "What is a RESTful API and what are its core constraints?",
    "How do you handle error exceptions in your code?",
    "What is the difference between SQL and NoSQL databases?",
    "Explain the concept of recursion with a simple example."
  ];

  const shuffled = questionPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Evaluate interview transcript
exports.evaluateInterview = async (skills, branch, chatHistory) => {
  const historyText = chatHistory.map((h, i) => `Question ${i + 1}: ${h.question}\nCandidate Answer: ${h.answer}`).join("\n\n");

  const prompt = `
You are an expert technical recruiter. You have just finished conducting a technical mock interview with a candidate.
Candidate Profile:
- Branch: ${branch}
- Listed Skills: ${skills ? skills.join(", ") : "N/A"}

Here is the complete transcript of the interview:
${historyText}

Perform an evaluation of the candidate's answers based on entry-level/fresher standards. Grade them fairly but realistically for a college placement candidate.
You must output a single JSON object. Do not include markdown codeblocks (like \`\`\`json) or any conversational text. The response must be raw, valid JSON matching this exact structure:

{
  "overallScore": 75,
  "strengths": [
    "Core CSS concepts and flexbox layout properties",
    "Understands asynchronous Javascript flow"
  ],
  "weaknesses": [
    "Weak explanation of React virtual DOM rendering",
    "Missing edge cases in database index optimizations"
  ],
  "studyPlan": [
    {
      "topic": "React Virtual DOM",
      "description": "Study reconciliation algorithm, Diffing algorithm, and key prop importance.",
      "priority": "High"
    },
    {
      "topic": "Database Indexing",
      "description": "Learn about B-Trees, Composite Indexes, and query planner analysis.",
      "priority": "Medium"
    }
  ]
}

Ensure "overallScore" is a number between 0 and 100.
Double check that the JSON is fully valid and parseable.
  `;

  const reportText = await callGroq(prompt);
  
  const jsonObjectMatch = reportText.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    try {
      return JSON.parse(jsonObjectMatch[0]);
    } catch (err) {
      console.error("Failed to parse matched Groq evaluation JSON object. Matched text was:", jsonObjectMatch[0]);
    }
  } else {
    console.error("No JSON object bracket found in Groq evaluation response. Raw output was:", reportText);
  }

  return {
    overallScore: 70,
    strengths: ["Completed all technical interview questions."],
    weaknesses: ["AI evaluation response contained parsing formatting issues. Please review answers manually."],
    studyPlan: [{ topic: "Core Technical Concepts", description: "Review core branch subjects and practice explaining your code logic clearly.", priority: "High" }]
  };
};


// Transcribes audio buffer using Groq Whisper API.
exports.transcribeAudio = async (fileBuffer, mimeType) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in server environment configurations. Please add it to your .env file.");
  }

  const url = "https://api.groq.com/openai/v1/audio/transcriptions";

  const formData = new FormData();
  const fileBlob = new Blob([fileBuffer], { type: mimeType || "audio/webm" });
  formData.append("file", fileBlob, "speech.webm");
  formData.append("model", "whisper-large-v3");

  try {
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "multipart/form-data"
      }
    });

    if (response.data && response.data.text) {
      return response.data.text.trim();
    } else {
      throw new Error("Failed to receive transcript text from Groq Whisper API.");
    }
  } catch (error) {
    console.error("Groq Whisper API Request Failed:", error.response?.data || error.message);
    if (error.response?.status === 429) {
      const apiMessage = error.response?.data?.error?.message;
      if (apiMessage) {
        throw new Error(`Groq API rate limit exceeded: ${apiMessage}`);
      }
      throw new Error("Groq API rate limit exceeded. Please wait a few seconds and try again.");
    }
    throw new Error(error.response?.data?.error?.message || error.message || "Failed to transcribe audio.");
  }
};
