
import React, { useState, useEffect, useRef } from 'react';
import { COLORS, ChatMessage } from '../types';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { sendMessageToVCoach } from '../services/geminiService';

const VCoachChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: '¡Hola! Soy tu VCoach de Doctor Antivejez. ¿En qué puedo ayudarte hoy para optimizar tu longevidad y salud celular?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToVCoach(userMessage.text);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
       console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-3xl shadow-sm flex gap-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white text-textDark rounded-tl-none border border-gray-100'
              }`}
            >
               {msg.role === 'model' && (
                   <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                       <Bot size={18} className="text-primary" />
                   </div>
               )}
               <div className="flex flex-col">
                   <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                   <span className={`text-[9px] mt-1 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                       {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </span>
               </div>
               {msg.role === 'user' && (
                   <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                       <User size={18} color="white" />
                   </div>
               )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-gray-100">
                <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Now standard block inside flex-col to avoid overlay issues */}
      <div className="p-4 bg-white border-t border-gray-100 pb-32">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[2rem] border border-gray-200 shadow-inner">
          <div className="pl-3 text-primary">
            <Sparkles size={18} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Pregunta a tu VCoach..."
            className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm font-medium text-textDark px-2 py-2"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-all ${
              input.trim() ? 'bg-primary text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VCoachChat;
