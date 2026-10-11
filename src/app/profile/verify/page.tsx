"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, CheckCircle2, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

type Message = {
  id: string;
  role: "ai" | "user";
  content: string;
};

const QUESTIONS = [
  "Can you describe your workflow when generating and refining AI images using tools like Midjourney or Stable Diffusion?",
  "How do you ensure consistency in character or style across multiple AI generations for a brand campaign?",
  "What strategies do you use to overcome AI hallucinations or artifacts in your final deliverables?",
];

export default function AIVerificationPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm GenWorks AI. I'll be conducting a quick 3-question interview to verify your technical skills. Are you ready?",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{score: number, badge: string, feedback: string} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMessage }]);

    // Initial "Yes" response
    if (currentQuestionIndex === -1) {
      setCurrentQuestionIndex(0);
      simulateAITyping(QUESTIONS[0]);
      return;
    }

    // Save answer
    const newAnswers = [...answers, userMessage];
    setAnswers(newAnswers);

    // Ask next question or evaluate
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      simulateAITyping(QUESTIONS[currentQuestionIndex + 1]);
    } else {
      // Evaluation phase
      setIsEvaluating(true);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "Thank you! I am now analyzing your responses to calculate your GenWorks Trust Score..." }]);
      
      try {
        const res = await fetch("/api/ai/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers, skills: ["AI Image Generation", "Midjourney", "Prompt Engineering"] }),
        });
        const data = await res.json();
        setEvaluationResult(data);

        // Synchronize verified badge and score with user profile
        let userEmail = "";
        if (typeof window !== "undefined") {
          try {
            const prev = localStorage.getItem("genworks_creator_user");
            const parsed = prev ? JSON.parse(prev) : {};
            userEmail = parsed.email || "";
            localStorage.setItem(
              "genworks_creator_user",
              JSON.stringify({
                ...parsed,
                isVerified: true,
                verificationScore: data.score || 88,
              })
            );
          } catch (e) {
            console.error("Storage error:", e);
          }
        }

        await fetch("/api/creator/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            isVerified: true,
            verificationScore: data.score || 88,
          }),
        });
      } catch (error) {
        console.error(error);
        setEvaluationResult({ score: 75, badge: "Verified", feedback: "Good foundational knowledge, though some advanced concepts could be clearer." });
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const simulateAITyping = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: text }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FEF9E1] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[800px] border border-gray-100">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 bg-[#1A1A1A] p-8 text-white flex flex-col justify-between">
          <div>
            <Logo className="text-white mb-8" />
            <h2 className="text-2xl font-bold mb-4 tracking-tight">AI Interview</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We use our proprietary Gemini-powered engine to evaluate your practical knowledge. 
              This ensures our clients only work with top-tier talent.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentQuestionIndex >= 0 ? 'bg-green-500' : 'bg-gray-700'}`}>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className={currentQuestionIndex >= 0 ? 'text-white' : 'text-gray-500'}>System Initialization</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentQuestionIndex >= QUESTIONS.length ? 'bg-green-500' : 'bg-gray-700'}`}>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className={currentQuestionIndex >= QUESTIONS.length ? 'text-white' : 'text-gray-500'}>Technical Q&A</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${evaluationResult ? 'bg-green-500' : 'bg-gray-700'}`}>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className={evaluationResult ? 'text-white' : 'text-gray-500'}>Trust Score Calculation</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 border border-white/5">
            <div className="flex items-center space-x-2 text-[#D3A373] font-bold text-sm uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Pro Tip</span>
            </div>
            <p className="text-xs text-gray-300">Answer naturally. We evaluate context, problem-solving, and workflow logic, not just buzzwords.</p>
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          {evaluationResult ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-[#FEF9E1] rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span className="text-4xl font-bold text-[#1A1A1A]">{evaluationResult.score}</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Interview Complete</h3>
              <div className="bg-[#CDD5AE]/20 text-[#4A5D23] px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest mb-6 border border-[#CDD5AE]">
                Badge Unlocked: {evaluationResult.badge}
              </div>
              <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
                &quot;{evaluationResult.feedback}&quot;
              </p>
              <Button 
                onClick={() => { router.push("/dashboard/creator"); }}
                className="h-12 px-8 bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Go to Creator Studio <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === "user" ? "bg-[#D3A373]" : "bg-[#1A1A1A]"
                      }`}>
                        {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`p-4 rounded-2xl ${
                        msg.role === "user" 
                          ? "bg-[#F8F9FA] border border-gray-100 text-[#1A1A1A] rounded-tr-none" 
                          : "bg-[#1A1A1A] text-white rounded-tl-none shadow-md"
                      }`}>
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="p-4 rounded-2xl bg-[#1A1A1A] text-white rounded-tl-none shadow-md flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {isEvaluating && (
                  <div className="flex justify-center my-8">
                    <div className="flex items-center space-x-2 text-[#D3A373] bg-[#FEF9E1] px-4 py-2 rounded-full border border-[#D3A373]/30">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-semibold">Gemini AI is calculating your score...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center gap-3 bg-[#F8F9FA] border border-gray-200 rounded-full p-1.5 pr-2 focus-within:ring-2 focus-within:ring-[#1A1A1A]/10 transition-all"
                >
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your answer here..."
                    className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-4 h-11 text-[15px]"
                    disabled={isTyping || isEvaluating}
                  />
                  <Button 
                    type="submit" 
                    disabled={!inputValue.trim() || isTyping || isEvaluating}
                    className="h-10 w-10 rounded-full bg-[#D3A373] hover:bg-[#b58b60] text-white shadow-md transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
