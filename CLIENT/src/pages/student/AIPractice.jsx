import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  VolumeX
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AIPractice = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('intro'); // intro, interviewing, complete
  const [loading, setLoading] = useState(false);
  
  const [skills, setSkills] = useState([]);
  const [branch, setBranch] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [evaluation, setEvaluation] = useState(null);

  const currentQuestion = questions[questionIndex] || '';

  const [isMuted, setIsMuted] = useState(false);

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
    if (phase === 'interviewing' && currentQuestion) {
      speakText(currentQuestion);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentQuestion, phase]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      let options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/ogg' };
        if (!MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: '' };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' });
        await uploadAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Recording started. Speak your answer clearly.");
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error("Could not access microphone. Please check your browser permissions.");
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

  // Upload Audio for Groq Whisper Transcription
  const uploadAudio = async (audioBlob) => {
    setIsTranscribing(true);
    const formData = new FormData();

    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await api.post('/ai/transcribe', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.text) {
        setAnswer(prev => prev + (prev ? ' ' : '') + response.data.text);
        toast.success("Voice transcribed successfully!");
      } else {
        toast.error("Whisper did not return any transcript text.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to transcribe audio.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Start the AI Mock Session
  const handleStartSession = async () => {
    setLoading(true);
    try {
      const response = await api.post('/ai/start', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQuestions(response.data.questions);
      setQuestionIndex(0);
      setChatHistory([]);
      setAnswer('');
      setSkills(response.data.skills);
      setBranch(response.data.branch);
      setPhase('interviewing');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to start AI practice session.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer & Fetch Next Question/Report
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    if (answer.trim().length < 15) {
      toast.error("Please write or speak a more detailed response (min 15 characters).");
      return;
    }

    if (isRecording) {
      stopRecording();
    }

    const currentQ = questions[questionIndex];
    const newHistory = [...chatHistory, { question: currentQ, answer: answer }];
    setChatHistory(newHistory);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setAnswer('');
      toast.success("Answer saved locally. Loading next question...");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/ai/submit', {
        chatHistory: newHistory
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setEvaluation(response.data.evaluation);
      setChatHistory(response.data.chatHistory);
      setPhase('complete');
      toast.success("Interview completed! Generating scorecard...");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit answers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="p-2 bg-[#112240] hover:bg-[#1e345e] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bot className="text-[#00ED64]" size={24} />
              AI Technical Practice
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Sharpen your response quality with direct, model-guided technical feedback</p>
          </div>
        </div>
        {phase === 'interviewing' && (
          <div className="flex items-center gap-3">
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
              className={`p-2 rounded-lg border transition-all ${
                isMuted 
                  ? 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20' 
                  : 'bg-[#112240] text-gray-400 border-gray-800 hover:text-white'
              }`}
              title={isMuted ? "Unmute Question narration" : "Mute Question narration"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className="bg-[#112240] border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#00ED64]">
              Question {questionIndex + 1} / 3
            </div>
          </div>
        )}
      </div>

      {/* Phase 1: Intro Setup */}
      {phase === 'intro' && (
        <div className="bg-[#112240] rounded-2xl border border-gray-800 p-8 space-y-6">
          <div className="flex flex-col items-center justify-center py-6 text-center max-w-md mx-auto space-y-4">
            <div className="bg-[#00ED64]/10 p-5 rounded-full border border-[#00ED64]/20 text-[#00ED64]">
              <Code2 size={40} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white">Start personalized technical mock</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              CampusBridge AI generates questions tailored to your branch core subjects and listed profile skills.
            </p>
            {(branch || (skills && skills.length > 0)) && (
              <div className="space-y-3 pt-2 w-full max-w-sm">
                {branch && (
                  <div className="text-xs font-semibold text-[#00ED64] bg-[#00ED64]/5 border border-[#00ED64]/10 py-2 px-3 rounded-xl">
                    Focus Area: {branch} Core
                  </div>
                )}
                {skills && skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {skills.map((skill, index) => (
                      <span key={index} className="bg-[#0A192F] text-gray-300 border border-gray-800 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 pt-6 max-w-xl mx-auto space-y-6">
            <div className="bg-[#0A192F] p-4 rounded-xl border border-gray-800 flex flex-col space-y-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Mock Guidelines</span>
              <ul className="text-xs text-gray-400 space-y-2">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00ED64] mt-0.5">•</span>
                  You will be asked 3 challenging, open-ended technical questions.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00ED64] mt-0.5">•</span>
                  Speak your answers using high-accuracy AI speech-to-text.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00ED64] mt-0.5">•</span>
                  Upon completion, the AI generates a scorecard including strengths, weaknesses, and a personalized topic study plan.
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartSession}
              disabled={loading}
              className="w-full bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[#00ED64]/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Interview...</span>
                </>
              ) : (
                <>
                  <span>Begin Mock Interview</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Phase 2: Active Interview */}
      {phase === 'interviewing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Interview Panel */}
          <div className="lg:col-span-2 bg-[#112240] rounded-2xl border border-gray-800 p-6 space-y-6 shadow-xl relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-[#00ED64] font-semibold bg-[#00ED64]/10 w-fit px-2.5 py-1 rounded-full border border-[#00ED64]/20">
                  <Bot size={14} />
                  <span>AI Interviewer</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => speakText(currentQuestion)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-[#0A192F] px-2 py-1 rounded border border-gray-800 transition-colors"
                >
                  <Volume2 size={13} />
                  <span>Repeat Question</span>
                </button>
              </div>
              
              <div className="bg-[#0A192F] p-5 rounded-xl border border-gray-800 text-white font-medium text-base leading-relaxed shadow-inner">
                {currentQuestion}
              </div>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-4 relative">
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Technical Response</label>
                  
                  {/* Speech Recording Microphone Action */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      isRecording
                        ? 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse'
                        : 'bg-[#0A192F] text-gray-300 border-gray-800 hover:border-gray-700 hover:text-white'
                    }`}
                  >
                    {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
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
                    <div className="absolute inset-0 bg-[#0A192F]/85 flex flex-col items-center justify-center rounded-xl border border-gray-800 z-20">
                      <div className="w-8 h-8 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-xs text-[#00ED64] font-semibold animate-pulse">Groq is transcribing your speech...</span>
                    </div>
                  )}

                  <textarea
                    required
                    rows={6}
                    disabled={loading || isTranscribing}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer, or click 'Record Answer' to speak it..."
                    className="w-full p-4 border border-gray-850 rounded-xl bg-[#0A192F] text-white focus:outline-none focus:ring-2 focus:ring-[#00ED64] focus:border-transparent transition-all disabled:opacity-50 text-sm font-mono placeholder:font-sans"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Minimum 15 characters required</span>
                  <span>{answer.trim().length} chars entered</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isTranscribing || !answer.trim()}
                className="w-full bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Response...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Response</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Panelist Guide */}
          <div className="space-y-6">
            <div className="bg-[#112240] p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <HelpCircle size={16} className="text-[#00ED64]" />
                Answering Tips
              </h3>
              <ul className="text-xs text-gray-400 space-y-3">
                <li className="leading-relaxed">
                  <strong className="text-gray-300">Speaking mode:</strong> Click "Record Answer", speak your explanation clearly, and click stop. The AI transcribes it with high accuracy.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-gray-300">Accurate code syntax:</strong> State technical terms precisely (like "array map function" or "database index").
                </li>
                <li className="leading-relaxed">
                  <strong className="text-gray-300">Structured logic:</strong> List your approaches step-by-step or mention the time complexity if solving coding problems.
                </li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* Phase 3: Evaluation Scorecard */}
      {phase === 'complete' && evaluation && (
        <div className="space-y-6">
          
          {/* Hero Performance Card */}
          <div className="bg-[#112240] p-8 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="space-y-3 relative z-10 flex-1">
              <div className="inline-flex bg-[#00ED64]/10 text-[#00ED64] p-3 rounded-xl border border-[#00ED64]/20">
                <Award size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">Performance Scorecard</h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
                Mock interview completed successfully. The AI recruiter has analyzed your answers against core criteria. Here is your evaluation.
              </p>
            </div>
            
            {/* Visual Circular Gauge */}
            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-[#0A192F] rounded-2xl border border-gray-800/80 w-44 h-44 shadow-inner relative">
              <span className="text-4xl font-extrabold text-[#00ED64]">{evaluation.overallScore}%</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Overall Score</span>
            </div>
          </div>

          {/* Strengths & Weaknesses Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths Card */}
            <div className="bg-[#112240] p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-gray-800/60 pb-3">
                <CheckCircle size={16} className="text-[#00ED64]" />
                Key Strengths
              </h3>
              <ul className="space-y-3 text-xs text-gray-400">
                {evaluation.strengths && evaluation.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-[#00ED64] mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses Card */}
            <div className="bg-[#112240] p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-gray-800/60 pb-3">
                <AlertCircle size={16} className="text-yellow-450" />
                Areas to Improve
              </h3>
              <ul className="space-y-3 text-xs text-gray-400">
                {evaluation.weaknesses && evaluation.weaknesses.map((weak, i) => (
                  <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-yellow-450 mt-0.5">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Customized Study Plan */}
          <div className="bg-[#112240] p-6 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-gray-800/60 pb-3">
              <BookOpen size={16} className="text-[#00ED64]" />
              Personalized Study & Study Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluation.studyPlan && evaluation.studyPlan.map((item, i) => (
                <div key={i} className="bg-[#0A192F] p-4 rounded-xl border border-gray-800 flex items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">{item.topic}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        item.priority === 'High' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : item.priority === 'Medium'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {item.priority} Priority
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-800/40">
              <button
                onClick={handleStartSession}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#00ED64]/10"
              >
                <RefreshCw size={14} />
                <span>Start New Mock Interview</span>
              </button>
              
              <button
                onClick={() => navigate('/student/dashboard')}
                className="px-6 py-3 bg-[#0A192F] hover:bg-[#1a3360] text-gray-300 border border-gray-800 hover:border-gray-700 rounded-xl text-xs font-bold transition-colors"
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
