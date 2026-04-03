import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, Sparkles } from 'lucide-react';

const AITutorChat = ({ aiResult }) => {
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I am your AI Mentor. You can ask me anything about your academic doubts, study methods, or career roadmap!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/v1/roadmap/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: newMsgs,
          context: { 
            focus: aiResult?.targetGoal || 'General Learning',
            weakness: aiResult?.weakSubjects?.[0]?.subject || 'N/A'
          }
        })
      });
      
      const DEV_MODE = true;
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error(`[API ERROR /roadmap/chat] Status: ${res.status}`, errData);
        setMessages([
          ...newMsgs, 
          { role: 'model', content: DEV_MODE ? `[DEV_MODE]: Expected error intercepted. API generated a ${res.status} response: ${errData.error?.message || errData.error || 'Unknown'}` : 'Sorry, I am having trouble connecting to my service. Please try again later.' }
        ]);
        return;
      }

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMsgs, { role: 'model', content: data.reply }]);
      }
    } catch (err) {
      console.error('[Network/Parsing Error]', err);
      setMessages([...newMsgs, { role: 'model', content: 'Network issue: Could not fetch response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111116] border border-[#ffffff0A] rounded-2xl flex flex-col h-[calc(100vh-140px)] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#1C1C24] p-6 border-b border-[#ffffff0A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">AI Interactive Mentor</h2>
            <p className="text-xs text-green-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/> Online & Context Aware
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">
          <Sparkles size={14} /> Knows your profile and weaknesses
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar bg-[#0A0A0F]/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mr-3 mt-1">
                <Bot size={16} />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                : 'bg-[#1C1C24] border border-[#ffffff0A] text-gray-200 rounded-tl-sm'
            }`}>
              {msg.content.split('\n').map((line, i) => (
                <p key={i} className="mb-2 last:mb-0 min-h-[1em]">{line}</p>
              ))}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0 ml-3 mt-1 text-white text-xs font-bold">
                Me
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mr-3 mt-1">
              <Bot size={16} />
            </div>
            <div className="bg-[#1C1C24] border border-[#ffffff0A] rounded-2xl rounded-tl-sm p-4 w-20 flex items-center justify-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}/>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}/>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}/>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-5 bg-[#1C1C24] border-t border-[#ffffff0A] flex gap-3 shrink-0">
        <input 
          type="text" 
          placeholder="Ask a question, request an explanation, or plan your syllabus..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-[#111116] border border-[#ffffff10] rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl flex items-center justify-center text-white transition-colors shrink-0 shadow-lg shadow-indigo-600/20 active:scale-95 duration-200">
          <Send size={20} className="translate-x-[-1px] translate-y-[1px]" />
        </button>
      </form>
    </div>
  );
};

export default AITutorChat;
