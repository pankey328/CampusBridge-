const axios = require("axios");
const pdfParse = require("pdf-parse");

// Call Groq API for Chat Completions
const callGroq = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not defined in server environment configurations. Please add it to your .env file.",
    );
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const payload = {
    model: "qwen/qwen3.8-27b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (
      response.data &&
      response.data.choices &&
      response.data.choices[0] &&
      response.data.choices[0].message
    ) {
      return response.data.choices[0].message.content;
    } else {
      console.error(
        "Groq Unexpected Response Body:",
        JSON.stringify(response.data),
      );
      throw new Error("Invalid response format received from Groq API.");
    }
  } catch (error) {
    console.error(
      "Groq API Request Failed:",
      error.response?.data || error.message,
    );
    if (error.response?.status === 429) {
      const apiMessage = error.response?.data?.error?.message;
      if (apiMessage) {
        throw new Error(`Groq API rate limit exceeded: ${apiMessage}`);
      }
      throw new Error(
        "Groq API rate limit exceeded. Please wait a few seconds and try again.",
      );
    }
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to communicate with Groq AI service.",
    );
  }
};

// Generate interview questions
const generateQuestionsBatch = async (skills, branch, count = 3) => {
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

  let cleanText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  const lastOpenIndex = cleanText.lastIndexOf("[");
  const lastCloseIndex = cleanText.lastIndexOf("]");

  if (
    lastOpenIndex !== -1 &&
    lastCloseIndex !== -1 &&
    lastCloseIndex > lastOpenIndex
  ) {
    const jsonSubstring = cleanText.slice(lastOpenIndex, lastCloseIndex + 1);
    try {
      const questions = JSON.parse(jsonSubstring);
      if (Array.isArray(questions) && questions.length > 0) {
        return questions.slice(0, count);
      }
    } catch (err) {
      console.error(
        "Failed to parse extracted Groq questions JSON array. Substring was:",
        jsonSubstring,
      );
    }
  } else {
    console.error(
      "No JSON array bracket found in Groq response. Raw output was:",
      responseText,
    );
  }

  const questionPool = [
    `Explain the concept of state management in ${skills.includes("React") ? "React" : "web applications"}.`,
    "What is the difference between synchronous and asynchronous code execution?",
    "How does indexing improve database query performance?",
    "Explain the difference between GET and POST HTTP methods.",
    "What are the main principles of Object-Oriented Programming (OOP)?",
    "Describe the difference between process and thread in operating systems.",
    "What is a RESTful API and what are its core constraints?",
    "How do you handle error exceptions in your code?",
    "What is the difference between SQL and NoSQL databases?",
    "Explain the concept of recursion with a simple example.",
  ];

  const shuffled = questionPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Evaluate interview transcript
const evaluateInterview = async (skills, branch, chatHistory) => {
  const historyText = chatHistory
    .map(
      (h, i) =>
        `Question ${i + 1}: ${h.question}\nCandidate Answer: ${h.answer}`,
    )
    .join("\n\n");

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

  try {
    const reportText = await callGroq(prompt);
    const cleanText = reportText
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();

    const jsonObjectMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]);
      } catch (err) {
        console.error(
          "Failed to parse matched Groq evaluation JSON object. Matched text was:",
          jsonObjectMatch[0],
        );
      }
    } else {
      console.error(
        "No JSON object bracket found in Groq evaluation response. Raw output was:",
        reportText,
      );
    }
  } catch (groqErr) {
    console.error(
      "evaluateInterview callGroq error:",
      groqErr.message || groqErr,
    );
  }

  return {
    overallScore: 70,
    strengths: ["Completed all technical interview questions."],
    weaknesses: [
      "AI evaluation response contained parsing formatting issues. Please review answers manually.",
    ],
    studyPlan: [
      {
        topic: "Core Technical Concepts",
        description:
          "Review core branch subjects and practice explaining your code logic clearly.",
        priority: "High",
      },
    ],
  };
};

const transcribeAudio = async (fileBuffer, mimeType) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not defined in server environment configurations. Please add it to your .env file.",
    );
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
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data && response.data.text) {
      return response.data.text.trim();
    } else {
      throw new Error(
        "Failed to receive transcript text from Groq Whisper API.",
      );
    }
  } catch (error) {
    console.error(
      "Groq Whisper API Request Failed:",
      error.response?.data || error.message,
    );
    if (error.response?.status === 429) {
      const apiMessage = error.response?.data?.error?.message;
      if (apiMessage) {
        throw new Error(`Groq API rate limit exceeded: ${apiMessage}`);
      }
      throw new Error(
        "Groq API rate limit exceeded. Please wait a few seconds and try again.",
      );
    }
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Failed to transcribe audio.",
    );
  }
};

const evaluateComplaint = async ({
  complaintType,
  subject,
  description,
  studentName = "Student",
}) => {
  const prompt = `
You are the AI Campus Support Officer for CampusBridge, a college placement and campus recruitment portal.
A student named "${studentName}" has submitted the following complaint/inquiry.

Complaint Category: ${complaintType}
Subject: ${subject}
Details: ${description}

Analyze the complaint and return ONLY a valid JSON object matching this schema:
{
  "urgency": "Critical" | "High" | "Medium" | "Low",
  "sentiment": "Frustrated" | "Urgent" | "Neutral" | "Disappointed" | "Positive",
  "aiReply": "A polite, professional, and clear 3-5 sentence resolution answering the student directly. Offer concrete immediate guidance or next steps based on campus recruitment workflows.",
  "executiveSummary": "A concise 1-sentence summary of the core issue for the SuperAdmin/TPO dashboard.",
  "suggestedAction": "Recommended action for the placement cell or admin (e.g. 'Check interview link', 'Verify student backlog record', 'Extend registration deadline')."
}

Urgency Rules:
- "Interview Scheduling" (missed interviews, upcoming schedule conflict) -> "Critical" or "High"
- "Placement Drive & Eligibility" (drive closing soon, eligibility calculation dispute) -> "High"
- "Technical & Platform Issue" -> "Medium"
- "Document & Profile Verification" -> "Medium"
- "General / Policy Query" -> "Low"

Do NOT include any markdown code fences (like \`\`\`json), no introductory text, and no outro. Return ONLY the raw JSON object string.
`;

  try {
    const rawOutput = await callGroq(prompt);
    let cleaned = rawOutput.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleaned);

    const validUrgency = ["Critical", "High", "Medium", "Low"].includes(
      parsed.urgency,
    )
      ? parsed.urgency
      : complaintType === "Interview Scheduling" ||
          complaintType === "Placement Drive & Eligibility"
        ? "High"
        : "Medium";

    return {
      urgency: validUrgency,
      sentiment: parsed.sentiment || "Neutral",
      aiReply:
        parsed.aiReply ||
        "Your complaint has been acknowledged by CampusBridge AI Support. The placement office will review your inquiry shortly.",
      executiveSummary: parsed.executiveSummary || subject,
      suggestedAction:
        parsed.suggestedAction || "Review student complaint details.",
    };
  } catch (error) {
    console.error("AI Complaint Evaluation Error:", error.message);
    throw new Error(`AI Complaint Evaluation failed: ${error.message}`);
  }
};

module.exports = {
  callGroq,
  generateQuestionsBatch,
  evaluateInterview,
  transcribeAudio,
  evaluateComplaint,
};
