const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const MockAttempt = require('../models/MockAttempt');
const JobDrive = require('../models/JobDrive');
const { extractTextFromPdf } = require('../utils/pdfExtractor');
const { generateQuestionsBatch, evaluateInterview } = require('../utils/aiService');
const { evaluateAnswer, generateFollowUpQuestion } = require('../utils/mockEval');

// Start a new mock interview.
exports.startMock = async (req, res) => {
  try {

    if (!req.files || !req.files.resumeFile) {
      return res.status(400).json({ message: 'Resume PDF is required.' });
    }

    if (req.files.resumeFile.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'Resume file exceeds 5 MB size limit.' });
    }
    if (!req.body.jobDriveId) {
      return res.status(400).json({ message: 'Job drive id is required.' });
    }

    const resumeBuffer = req.files.resumeFile.data;
    const resumeText = await extractTextFromPdf(resumeBuffer);

    // Fetch job drive description
    const jobDrive = await JobDrive.findById(req.body.jobDriveId).lean();
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found.' });
    }
    const jobDescription = jobDrive.description || '';

    const dummySkills = [];
    const dummyBranch = '';

    let questions = await generateQuestionsBatch(dummySkills, dummyBranch, 5);

    questions = questions.filter(q => q && q.trim().length > 0).slice(0, 5);

    const fallbackQuestions = [
      `Explain the concept of state management in web applications.`,
      `What is the difference between synchronous and asynchronous code execution?`,
      `How does indexing improve database query performance?`,
      `Explain the difference between GET and POST HTTP methods.`,
      `What are the main principles of Object‑Oriented Programming (OOP)?`
    ];
    while (questions.length < 5) {
      const idx = questions.length % fallbackQuestions.length;
      questions.push(fallbackQuestions[idx]);
    }

    const studentId = req.user.id;
    let mockDoc = await MockAttempt.findOne({ studentId });
    if (!mockDoc) {
      mockDoc = new MockAttempt({
        studentId,
        attempts: []
      });
    }

    mockDoc.attempts.push({
      jobDriveId: jobDrive._id,
      resumeText,
      questions: questions.map(q => ({ question: q })),
      overallRating: null
    });

    await mockDoc.save();

    const newAttemptObj = mockDoc.attempts[mockDoc.attempts.length - 1];
    const attemptId = newAttemptObj._id;
    const firstQuestion = questions[0];
    res.json({ attemptId, question: firstQuestion });
  } catch (err) {
    console.error('startMock error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Submit an answer for the current question.
exports.submitAnswer = async (req, res) => {
  try {
    const { attemptId, answer } = req.body;
    if (!attemptId || !answer) {
      return res.status(400).json({ message: 'attemptId and answer are required.' });
    }
    const mockDoc = await MockAttempt.findOne({ "attempts._id": attemptId });
    if (!mockDoc) {
      return res.status(404).json({ message: 'Mock attempt not found.' });
    }
    const latestAttempt = mockDoc.attempts.id(attemptId);
    if (!latestAttempt) {
      return res.status(404).json({ message: 'Mock attempt details not found.' });
    }

    const currentIdx = latestAttempt.questions.findIndex(q => q.answer == null);
    if (currentIdx === -1) {
      return res.status(400).json({ message: 'All questions already answered.' });
    }
    const questionObj = latestAttempt.questions[currentIdx];

    questionObj.answer = answer;

    const ratingResult = await evaluateAnswer(questionObj.question, answer, {
      resumeText: latestAttempt.resumeText,
      jobDriveId: latestAttempt.jobDriveId
    });
    questionObj.aiRating = ratingResult.rating;
  
    
    if (ratingResult.followUp && latestAttempt.questions.length < 7) {
      latestAttempt.questions.push({
        question: ratingResult.followUp,
        answer: null,
        aiRating: null,
        isFollowUp: true
      });
    }

    const nextIdx = latestAttempt.questions.findIndex(q => q.answer == null);
    if (nextIdx !== -1) {
      await mockDoc.save();
      return res.json({ nextQuestion: latestAttempt.questions[nextIdx].question, finished: false });
    }
    const ratings = latestAttempt.questions.map(q => q.aiRating).filter(r => typeof r === 'number');
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;
    
    let evalReport = {
      overallScore: Math.round((avg / 5) * 100),
      strengths: ["Completed all technical interview questions."],
      weaknesses: ["AI evaluation response contained parsing issues. Please review answers manually."],
      studyPlan: [{ topic: "Core Technical Concepts", description: "Review core branch subjects and practice explaining your code logic clearly.", priority: "High" }]
    };


    if (avg < 1.0) {
      evalReport = {
        overallScore: Math.round((avg / 5) * 100),
        strengths: ["Completed the mock practice session flow."],
        weaknesses: ["Did not provide satisfactory answers. Most questions were skipped, left empty, or incorrect."],
        studyPlan: [{ topic: "Interview Fundamentals", description: "Review core topics and practice explaining technical concepts clearly.", priority: "High" }]
      };
    } else {
      try {
        const skills = [];
        const branch = "";
        const report = await evaluateInterview(skills, branch, latestAttempt.questions);
        if (report) {
          const isFallback = Array.isArray(report.weaknesses) && report.weaknesses[0] && report.weaknesses[0].includes("parsing formatting issues");
          evalReport = {
            overallScore: isFallback ? Math.round((avg / 5) * 100) : (typeof report.overallScore === 'number' ? report.overallScore : Math.round((avg / 5) * 100)),
            strengths: Array.isArray(report.strengths) ? report.strengths : evalReport.strengths,
            weaknesses: Array.isArray(report.weaknesses) ? report.weaknesses : evalReport.weaknesses,
            studyPlan: Array.isArray(report.studyPlan) ? report.studyPlan : evalReport.studyPlan
          };
        }
      } catch (e) {
        console.error('evaluateInterview error:', e);
      }
    }

    latestAttempt.evaluationReport = evalReport;
    const overallRating = Math.round(evalReport.overallScore / 10);
    latestAttempt.overallRating = overallRating;
    await mockDoc.save();
    return res.json({
      finished: true,
      overallRating,
      evaluation: {
        ...evalReport,
        perQuestion: latestAttempt.questions
      }
    });
  } catch (err) {
    console.error('submitAnswer error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

//  TPO: Get aggregate stats per student
exports.getStats = async (req, res) => {
  try {
    const aggregates = await MockAttempt.aggregate([
      { $unwind: '$attempts' },
      { $group: {
          _id: '$studentId',
          averageRating: { $avg: '$attempts.overallRating' },
          attemptCount: { $sum: 1 }
        }
      },
      { $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      { $project: {
          studentId: '$_id',
          name: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          averageRating: 1,
          attemptCount: 1
        }
      }
    ]);
    res.json({ data: aggregates });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// TPO: Get detailed attempts for a specific student.
exports.getDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const docs = await MockAttempt.find({ studentId }).populate('attempts.jobDriveId', 'title description');
    if (!docs || docs.length === 0) return res.status(404).json({ message: 'No attempts found for this student.' });
    
    let attempts = [];
    docs.forEach(doc => {
      if (doc.attempts) {
        attempts = attempts.concat(doc.attempts);
      }
    });

    attempts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ attempts });
  } catch (err) {
    console.error('getDetails error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
