import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  ArrowLeft,
  Send,
  Award,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Code2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const AIPractice = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("intro"); // intro, interviewing, complete
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [overallRating, setOverallRating] = useState(null);

  const [attemptId, setAttemptId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJobDriveId, setSelectedJobDriveId] = useState("");
  const [jobDrives, setJobDrives] = useState([]);
  const [mockAttempts, setMockAttempts] = useState([]);

  const [isMuted, setIsMuted] = useState(false);

  const fetchMockAttempts = async () => {
    try {
      const res = await api.get("/mock/my-attempts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMockAttempts(res.data.attempts || []);
    } catch (err) {
      console.error("Failed to load mock attempts", err);
    }
  };

  const currentQuestion = questions[questionIndex] || "";

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const speakText = (text) => {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (phase === "interviewing" && currentQuestion) {
      speakText(currentQuestion);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentQuestion, phase]);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const fetchJobDrives = async () => {
      try {
        const res = await api.get("/jobdrives/active", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setJobDrives(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load job drives.");
      }
    };

    fetchJobDrives();
    fetchMockAttempts();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let options = { mimeType: "audio/webm" };
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/ogg" };
        if (!MediaRecorder.isTypeSupported("audio/ogg")) {
          options = { mimeType: "" };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: options.mimeType || "audio/webm",
        });
        await uploadAudio(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started. Speak your answer clearly.");
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error(
        "Could not access microphone. Please check your browser permissions.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Upload Audio for Transcription
  const uploadAudio = async (audioBlob) => {
    setIsTranscribing(true);
    const formData = new FormData();

    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await api.post("/ai/transcribe", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.text) {
        setAnswer((prev) => prev + (prev ? " " : "") + response.data.text);
        toast.success("Voice transcribed successfully!");
      } else {
        toast.error("Whisper did not return any transcript text.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to transcribe audio.",
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedFile) {
      toast.error("Please upload a PDF resume (max 5 MB).");
      return;
    }
    if (!selectedJobDriveId) {
      toast.error("Please select a job drive.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resumeFile", selectedFile);
      formData.append("jobDriveId", selectedJobDriveId);
      const response = await api.post("/mock/start", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAttemptId(response.data.attemptId);
      setQuestions([response.data.question]);
      setQuestionIndex(0);
      setChatHistory([]);
      setAnswer("");
      setPhase("interviewing");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to start mock interview.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    if (answer.trim().length < 15) {
      toast.error(
        "Please write or speak a more detailed response (min 15 characters).",
      );
      return;
    }

    if (isRecording) {
      stopRecording();
    }

    const currentQ = questions[questionIndex];
    const newHistory = [...chatHistory, { question: currentQ, answer }];
    setChatHistory(newHistory);

    setLoading(true);
    try {
      const response = await api.post(
        "/mock/answer",
        {
          attemptId,
          answer,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (response.data.finished) {
        setEvaluation(response.data.evaluation);
        setOverallRating(response.data.overallRating);
        toast.success(
          `Interview finished! Your rating: ${response.data.overallRating}/10`,
        );
        setPhase("complete");
        fetchMockAttempts();
      } else {
        setQuestions((prev) => [...prev, response.data.nextQuestion]);
        setQuestionIndex((prev) => prev + 1);
        setAnswer("");
        toast.success("Answer saved. Loading next question...");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="p-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-full text-[#121212] dark:text-white transition-all shadow-sm shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#121212] dark:text-white flex items-center gap-2.5 tracking-tight">
              <Bot className="text-[#034D35] dark:text-[#B6F596]" size={28} />
              AI Technical Practice
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              Sharpen your response quality with direct, model-guided technical
              feedback
            </p>
          </div>
        </div>

        {phase === "interviewing" && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => {
                const muteState = !isMuted;
                setIsMuted(muteState);
                if (muteState) {
                  window.speechSynthesis.cancel();
                } else {
                  speakText(currentQuestion);
                }
              }}
              className={`p-2.5 rounded-full border transition-all shadow-sm ${
                isMuted
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40"
                  : "bg-white dark:bg-slate-800 text-[#121212] dark:text-white border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
              title={
                isMuted
                  ? "Unmute Question narration"
                  : "Mute Question narration"
              }
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-full text-xs font-bold text-[#034D35] dark:text-[#B6F596] shadow-sm uppercase tracking-wider">
              Question {questionIndex + 1} / {questions.length}
            </div>
          </div>
        )}
      </div>

      {/* Phase 1: Intro Setup */}
      {phase === "intro" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Card: Start Practice Session */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-8 md:p-10 space-y-6 shadow-sm transition-colors duration-300">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5">
              <div className="bg-[#F9F7F1] dark:bg-slate-900 p-6 rounded-[24px] border border-gray-200 dark:border-slate-700 text-[#034D35] dark:text-[#B6F596] shadow-sm">
                <Code2 size={48} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#121212] dark:text-white">
                Start personalized technical mock
              </h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                Upload your resume (PDF ≤ 5 MB) and select a job drive. The AI
                will generate questions tailored to your profile.
              </p>

              {/* Resume Upload */}
              <div className="w-full space-y-2 text-left mt-2">
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                  Resume (PDF)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.size > 5 * 1024 * 1024) {
                      toast.error("File exceeds 5 MB limit.");
                      e.target.value = "";
                      return;
                    }
                    setSelectedFile(file);
                  }}
                  className="w-full p-3.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#121212] file:text-white dark:file:bg-[#B6F596] dark:file:text-[#034D35] file:cursor-pointer"
                />
              </div>

              {/* Job Drive Select */}
              <div className="w-full space-y-2 text-left">
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                  Job Drive
                </label>
                <select
                  value={selectedJobDriveId}
                  onChange={(e) => setSelectedJobDriveId(e.target.value)}
                  className="w-full p-3.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all"
                >
                  <option value="">-- Select a Job Drive --</option>
                  {jobDrives.map((jd) => (
                    <option key={jd._id} value={jd._id}>
                      {jd.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartSession}
                disabled={loading}
                className="w-full mt-4 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-4 px-6 rounded-full transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Starting Mock...</span>
                  </>
                ) : (
                  <>
                    <span>Begin Mock Interview</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Card: Practice Attempts History */}
          {(() => {
            const ratedAttempts = mockAttempts.filter(
              (a) =>
                typeof a.overallRating === "number" && a.overallRating !== null,
            );
            const averageScore =
              ratedAttempts.length > 0
                ? (
                    ratedAttempts.reduce(
                      (acc, curr) => acc + curr.overallRating,
                      0,
                    ) / ratedAttempts.length
                  ).toFixed(1)
                : "—";

            return (
              <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-8 md:p-10 space-y-6 shadow-sm transition-colors duration-300">
                <h3 className="text-xl font-extrabold text-[#121212] dark:text-white flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4 flex-wrap gap-4">
                  <span>Practice History</span>
                  <span className="text-xs text-[#034D35] dark:text-[#B6F596] font-bold bg-[#B6F596]/30 dark:bg-[#034D35]/50 px-4 py-1.5 rounded-full uppercase tracking-wider">
                    Avg Score: {averageScore}/10
                  </span>
                </h3>

                {mockAttempts && mockAttempts.length > 0 ? (
                  <div className="space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                    {mockAttempts.map((attempt, index) => (
                      <div
                        key={index}
                        className="bg-[#F9F7F1] dark:bg-slate-900 p-5 rounded-[24px] border border-gray-100 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600 transition-colors shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-sm font-extrabold text-[#121212] dark:text-white">
                              Attempt #{mockAttempts.length - index}
                            </span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mt-0.5">
                              {new Date(attempt.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <span className="bg-white dark:bg-slate-800 text-[#121212] dark:text-white border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            {attempt.overallRating !== null &&
                            attempt.overallRating !== undefined
                              ? `${attempt.overallRating}/10`
                              : "—"}
                          </span>
                        </div>
                        {attempt.jobDriveId && (
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700/50">
                            <span className="font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-2">
                              Drive:
                            </span>
                            {attempt.jobDriveId.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#F9F7F1] dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-700/50">
                    <HelpCircle
                      className="text-gray-400 dark:text-gray-500 mx-auto mb-3"
                      size={32}
                    />
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      No practice attempts recorded yet
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Phase 2: Active Interview */}
      {phase === "interviewing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Interview Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-6 md:p-8 space-y-8 shadow-sm relative transition-colors duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-[#034D35] dark:text-[#B6F596] font-bold uppercase tracking-wider bg-[#B6F596]/30 dark:bg-[#034D35]/50 w-fit px-3 py-1.5 rounded-full">
                  <Bot size={16} />
                  <span>AI Interviewer</span>
                </div>

                <button
                  type="button"
                  onClick={() => speakText(currentQuestion)}
                  className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#121212] dark:hover:text-white flex items-center gap-1.5 bg-[#F9F7F1] dark:bg-slate-900 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 transition-colors shadow-sm"
                >
                  <Volume2 size={14} />
                  <span>Repeat Question</span>
                </button>
              </div>

              <div className="bg-[#F9F7F1] dark:bg-slate-900 p-6 sm:p-8 rounded-[24px] border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white font-medium text-lg leading-relaxed shadow-sm">
                {currentQuestion}
              </div>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-5 relative">
              <div className="space-y-3 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                    Your Technical Response
                  </label>

                  {/* Speech Recording Microphone Action */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-sm self-start sm:self-auto ${
                      isRecording
                        ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400 animate-pulse"
                        : "bg-white dark:bg-slate-800 text-[#121212] dark:text-white border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                    <span>
                      {isRecording
                        ? `Stop Recording (${formatTime(recordingTime)})`
                        : "Record Answer"}
                    </span>
                  </button>
                </div>

                <div className="relative">
                  {/* Transcription Loader Overlay */}
                  {isTranscribing && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[24px] border border-gray-200 dark:border-slate-700 z-20">
                      <div className="w-10 h-10 border-t-4 border-[#034D35] dark:border-[#B6F596] rounded-full animate-spin mb-3"></div>
                      <span className="text-sm text-[#034D35] dark:text-[#B6F596] font-bold animate-pulse">
                        Transcribing your speech...
                      </span>
                    </div>
                  )}

                  <textarea
                    required
                    rows={6}
                    disabled={loading || isTranscribing}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer, or click 'Record Answer' to speak it..."
                    className="w-full p-5 border border-gray-200 dark:border-slate-700 rounded-[24px] bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] focus:border-[#034D35] dark:focus:border-[#B6F596] transition-all disabled:opacity-50 text-sm font-mono placeholder:font-sans shadow-sm resize-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-2">
                  <span>Minimum 15 characters required</span>
                  <span>{answer.trim().length} chars entered</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isTranscribing || !answer.trim()}
                className="w-full bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-4 px-6 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Response...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Response</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Panelist Guide */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 space-y-5 shadow-sm transition-colors duration-300">
              <h3 className="font-extrabold text-[#121212] dark:text-white text-lg flex items-center gap-2">
                <HelpCircle
                  size={20}
                  className="text-[#034D35] dark:text-[#B6F596]"
                />
                Answering Tips
              </h3>
              <ul className="text-sm font-medium text-gray-600 dark:text-gray-400 space-y-4">
                <li className="leading-relaxed bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <strong className="text-[#121212] dark:text-white block mb-1">
                    Speaking mode:
                  </strong>{" "}
                  Click "Record Answer", speak clearly, and click stop. The AI
                  transcribes it with high accuracy.
                </li>
                <li className="leading-relaxed bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <strong className="text-[#121212] dark:text-white block mb-1">
                    Accurate syntax:
                  </strong>{" "}
                  State technical terms precisely (like "array map function" or
                  "database index").
                </li>
                <li className="leading-relaxed bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <strong className="text-[#121212] dark:text-white block mb-1">
                    Structured logic:
                  </strong>{" "}
                  List your approaches step-by-step or mention the time
                  complexity if solving coding problems.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Evaluation Scorecard */}
      {phase === "complete" && evaluation && (
        <div className="space-y-8">
          {/* Hero Performance Card */}
          <div className="bg-[#034D35] p-8 md:p-12 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

            <div className="space-y-4 relative z-10 flex-1">
              <div className="inline-flex bg-white/20 text-[#B6F596] p-4 rounded-[20px]">
                <Award size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Overall Rating:{" "}
                {overallRating !== null && overallRating !== undefined
                  ? `${overallRating}/10`
                  : "N/A"}
              </h2>
              <p className="text-lg font-bold text-[#B6F596]">
                Your interview performance summary
              </p>
              <p className="text-sm font-medium text-white/80 leading-relaxed max-w-xl pt-2">
                Mock interview completed successfully. The AI recruiter has
                analyzed your answers against core criteria. Review your
                detailed evaluation below.
              </p>
            </div>

            {/* Visual Circular Gauge */}
            <div className="shrink-0 flex flex-col items-center justify-center p-8 bg-white/10 rounded-[32px] border border-white/20 w-48 h-48 shadow-inner relative backdrop-blur-md">
              <span className="text-5xl font-extrabold text-white">
                {evaluation.overallScore}%
              </span>
              <span className="text-xs text-[#B6F596] uppercase tracking-wider font-bold mt-2">
                Overall Score
              </span>
            </div>
          </div>

          {/* Per‑question review list */}
          <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[32px] border border-gray-200 dark:border-slate-700 space-y-8 shadow-sm transition-colors duration-300">
            <h3 className="font-extrabold text-[#121212] dark:text-white text-xl flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-4">
              <Award size={24} className="text-[#034D35] dark:text-[#B6F596]" />
              Question-by-Question Review
            </h3>

            <div className="space-y-6">
              {evaluation &&
                evaluation.perQuestion &&
                evaluation.perQuestion.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-6 md:p-8 rounded-[24px] border bg-[#F9F7F1] dark:bg-slate-900 space-y-4 relative overflow-hidden transition-all ${
                      q.isFollowUp
                        ? "border-indigo-200 dark:border-indigo-800/50 shadow-sm"
                        : "border-gray-200 dark:border-slate-700/50 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 dark:border-slate-700/50 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-extrabold text-[#121212] dark:text-white uppercase tracking-wider">
                          Question {idx + 1}
                        </span>
                        {q.isFollowUp && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                            Follow-up
                          </span>
                        )}
                      </div>
                      <span className="bg-white dark:bg-slate-800 text-[#121212] dark:text-white border border-gray-200 dark:border-slate-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        Score:{" "}
                        {q.aiRating !== undefined && q.aiRating !== null
                          ? `${q.aiRating}/5`
                          : "—"}
                      </span>
                    </div>

                    <div className="text-base font-bold text-[#121212] dark:text-white leading-relaxed">
                      {q.question}
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Your Answer
                      </span>
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-[20px] border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed shadow-sm">
                        {q.answer || (
                          <span className="italic text-gray-400">
                            No answer provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Strengths & Weaknesses Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths Card */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 space-y-6 shadow-sm transition-colors duration-300">
              <h3 className="font-extrabold text-[#121212] dark:text-white text-lg flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-4">
                <CheckCircle
                  size={20}
                  className="text-[#034D35] dark:text-[#B6F596]"
                />
                Key Strengths
              </h3>
              <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                {evaluation.strengths &&
                  evaluation.strengths.map((str, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 leading-relaxed bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50"
                    >
                      <span className="text-[#034D35] dark:text-[#B6F596] mt-0.5 font-bold">
                        •
                      </span>
                      <span>{str}</span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Weaknesses Card */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 space-y-6 shadow-sm transition-colors duration-300">
              <h3 className="font-extrabold text-[#121212] dark:text-white text-lg flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-4">
                <AlertCircle size={20} className="text-amber-500" />
                Areas to Improve
              </h3>
              <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                {evaluation.weaknesses &&
                  evaluation.weaknesses.map((weak, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 leading-relaxed bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50"
                    >
                      <span className="text-amber-500 mt-0.5 font-bold">•</span>
                      <span>{weak}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Customized Study Plan */}
          <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[32px] border border-gray-200 dark:border-slate-700 space-y-8 shadow-sm transition-colors duration-300">
            <h3 className="font-extrabold text-[#121212] dark:text-white text-xl flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-4">
              <BookOpen
                size={24}
                className="text-[#034D35] dark:text-[#B6F596]"
              />
              Personalized Study Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {evaluation.studyPlan &&
                evaluation.studyPlan.map((item, i) => (
                  <div
                    key={i}
                    className="bg-[#F9F7F1] dark:bg-slate-900 p-6 rounded-[24px] border border-gray-200 dark:border-slate-700/50 flex items-start shadow-sm"
                  >
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-extrabold text-[#121212] dark:text-white text-sm">
                          {item.topic}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.priority === "High"
                              ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50"
                              : item.priority === "Medium"
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                                : "bg-[#B6F596]/30 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] border border-[#034D35]/10 dark:border-[#B6F596]/20"
                          }`}
                        >
                          {item.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 dark:border-slate-700">
              <button
                onClick={handleStartSession}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] rounded-full text-sm font-bold transition-all shadow-md"
              >
                <RefreshCw size={16} />
                <span>Start New Mock Interview</span>
              </button>

              <button
                onClick={() => navigate("/student/dashboard")}
                className="px-8 py-3.5 bg-[#F9F7F1] dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700 text-[#121212] dark:text-white border border-gray-200 dark:border-slate-600 rounded-full text-sm font-bold transition-colors shadow-sm"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPractice;
