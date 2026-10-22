"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, MessageSquare, Settings, Paperclip, Send, Globe, ChevronDown, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function BesaMinimalApp() {
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [isWebSearch, setIsWebSearch] = useState(false);
  const [model, setModel] = useState("BESA Core");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const simulateStreamingResponse = (fullResponse: string) => {
    setIsGenerating(true);
    setMessages((prev) => [...prev, { sender: "besa", text: "" }]);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullResponse.length) {
        const nextChunk = fullResponse.slice(0, currentIndex + 4);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "besa", text: nextChunk };
          return updated;
        });
        currentIndex += 4;
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: "besa", text: fullResponse };
          return updated;
        });
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 20);
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setIsGenerating(true);

    try {
      // Python FastAPI backend call
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userText,
          model: model,
          web_search: isWebSearch,
        }),
      });

      const data = await res.json();

      if (data.response) {
        simulateStreamingResponse(data.response);
      } else {
        simulateStreamingResponse("Error: Backend se response nahi mila.");
      }
    } catch (err) {
      simulateStreamingResponse(
        "❌ **Connection Error**: Python backend se connect nahi ho saka. Make sure Uvicorn `http://127.0.0.1:8000` par run kar raha hai!"
      );
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0F17] text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-400">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0F141C] border-r border-slate-800/60 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-lg shadow-[0_0_12px_rgba(245,158,11,0.15)]">
              🐝
            </div>
            <span className="font-semibold text-slate-100 tracking-wide text-base">BESA</span>
          </div>

          <button
            onClick={() => setMessages([])}
            disabled={isGenerating}
            className="w-full bg-slate-800/60 hover:bg-slate-800 disabled:opacity-50 text-slate-200 text-sm font-medium py-2 px-3 rounded-xl border border-slate-700/50 flex items-center gap-2 transition-all"
          >
            <Plus size={16} className="text-amber-500" /> New Chat
          </button>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2">Recent</p>
            <div className="space-y-1">
              <button className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 truncate flex items-center gap-2">
                <MessageSquare size={13} className="text-amber-500/80 shrink-0" /> Welcome to BESA
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <User size={12} className="text-amber-500" />
            </div>
            <span>Rabeesa</span>
          </div>
          <Settings size={15} className="text-slate-500 hover:text-amber-500 cursor-pointer transition-colors" />
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 flex flex-col justify-between bg-[#0B0F17] relative overflow-hidden">
        
        <header className="h-14 border-b border-slate-800/50 px-6 flex items-center justify-between bg-[#0B0F17]/80 backdrop-blur-sm">
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-300 hover:text-amber-500 focus:outline-none appearance-none pr-5 cursor-pointer"
            >
              <option value="BESA Core" className="bg-[#0F141C] text-slate-200">🐝 BESA Core</option>
              <option value="BESA Fast" className="bg-[#0F141C] text-slate-200">⚡ BESA Fast</option>
              <option value="BESA Reasoning" className="bg-[#0F141C] text-slate-200">🧠 BESA Reasoning</option>
            </select>
            <ChevronDown size={12} className="absolute right-0 top-1 text-slate-500 pointer-events-none" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 max-w-3xl w-full mx-auto space-y-8">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl text-amber-500 mb-2">
                🐝
              </div>
              <h1 className="text-xl font-medium text-slate-200">What can I help with today?</h1>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "besa" && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-xs shrink-0 font-bold">
                    🐝
                  </div>
                )}
                <div
                  className={`max-w-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-slate-800 text-slate-100 px-4 py-2.5 rounded-2xl rounded-tr-none"
                      : "text-slate-200 pt-1 w-full"
                  }`}
                >
                  {msg.sender === "user" ? (
                    msg.text
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={atomDark as any}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: "1em 0",
                                borderRadius: "0.75rem",
                                padding: "1rem",
                                backgroundColor: "#0F141C",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 text-xs font-mono" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 max-w-3xl w-full mx-auto">
          <div className="bg-[#121824] border border-slate-800 focus-within:border-slate-700 rounded-2xl p-2.5 shadow-xl transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask BESA..."
              disabled={isGenerating}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none focus:outline-none text-sm min-h-[40px] max-h-[120px] px-2 pt-1 disabled:opacity-50"
            />
            <div className="flex items-center justify-between pt-2 px-1">
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
                  <Paperclip size={16} />
                </button>
                <button
                  onClick={() => setIsWebSearch(!isWebSearch)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    isWebSearch
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      : "text-slate-500 border-transparent hover:bg-slate-800/50"
                  }`}
                >
                  <Globe size={13} /> Web
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="p-2 rounded-xl bg-amber-500 disabled:opacity-30 disabled:bg-slate-800 text-slate-950 font-bold transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}