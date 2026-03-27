'use client';

import { useState, useRef, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { mockDeployments, mockMessages } from '@/lib/mockData';
import type { Message } from '@/types';

export default function ChatPage() {
  const [selectedDeployment, setSelectedDeployment] = useState(mockDeployments[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      deployment_id: selectedDeployment.id,
      role: 'user',
      content: input,
      type: 'message',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        deployment_id: selectedDeployment.id,
        role: 'agent',
        content: getSimulatedResponse(input),
        type: 'response',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">Chat</h1>
          <Badge status={selectedDeployment.status} size="sm" />
        </div>

        {/* Deployment Selector */}
        <select
          value={selectedDeployment.id}
          onChange={(e) => {
            const dep = mockDeployments.find((d) => d.id === e.target.value);
            if (dep) setSelectedDeployment(dep);
          }}
          className="bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
        >
          {mockDeployments
            .filter((d) => d.status === 'running')
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.service_name}
              </option>
            ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-5 py-3.5 ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-dark-800/70 text-dark-200 border border-dark-700/50 rounded-bl-md'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
              <div
                className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-primary-200' : 'text-dark-500'
                }`}
              >
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-dark-800/70 border border-dark-700/50 rounded-2xl rounded-bl-md px-5 py-3.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-3 flex items-end gap-3">
        {/* File attach */}
        <button className="p-2 text-dark-400 hover:text-primary-400 transition-colors shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-transparent text-white text-sm placeholder-dark-500 resize-none focus:outline-none max-h-32"
        />

        {/* Voice */}
        <button className="p-2 text-dark-400 hover:text-primary-400 transition-colors shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Simple response simulator
function getSimulatedResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('email') || lower.includes('inbox')) {
    return "I've scanned your inbox. You have 3 important emails:\n\n1. **Team standup** — Rescheduled to 4 PM\n2. **Client proposal** — Needs review by tomorrow\n3. **Deploy notification** — Agent gamma deployed successfully\n\nWant me to draft a reply to any of these?";
  }
  if (lower.includes('code') || lower.includes('pr') || lower.includes('review')) {
    return "I found 2 open pull requests:\n\n**PR #142** — Add user authentication module\n- 12 files changed, +340 -28\n- All tests passing ✅\n- Recommendation: Approve with minor suggestions\n\n**PR #143** — Fix memory leak in WebSocket handler\n- 3 files changed, +15 -8\n- Critical fix, recommend immediate merge\n\nShall I post review comments?";
  }
  if (lower.includes('schedule') || lower.includes('meeting') || lower.includes('calendar')) {
    return "Here's your schedule for today:\n\n🕐 **1:00 PM** — Team standup (30 min)\n🕑 **2:30 PM** — Client review call (45 min)\n🕓 **4:00 PM** — Sprint planning (1 hr)\n\nYou have a 1-hour gap between 3:15-4:00 PM. Want me to schedule something?";
  }
  return `I've processed your request: "${input}"\n\nHere's what I found:\n\n• Task has been noted and added to your workflow\n• I'll monitor for any updates and notify you\n• If you need me to take action, just say the word!\n\nAnything else I can help with?`;
}
