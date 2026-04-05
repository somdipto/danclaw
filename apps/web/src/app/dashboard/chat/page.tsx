'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useDeployments, useMessages, ChatWebSocket } from '@danclaw/api';
import type { Message } from '@danclaw/shared';

export default function ChatPage() {
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);

  const { data: deploymentsData, isLoading: depLoading } = useDeployments();
  const deployments = deploymentsData?.data?.deployments ?? [];
  const runningDeployments = deployments.filter((d) => d.status === 'running');

  const { data: messagesData, isLoading: msgLoading } = useMessages(selectedDeploymentId || '', {
    enabled: !!selectedDeploymentId,
  });

  const selectedDeployment = deployments.find((d) => d.id === selectedDeploymentId) || runningDeployments[0];
  const activeDepId = selectedDeployment?.id;

  useEffect(() => {
    if (activeDepId && !selectedDeploymentId) {
      setSelectedDeploymentId(activeDepId);
    }
  }, [activeDepId, selectedDeploymentId]);

  useEffect(() => {
    if (messagesData?.data?.messages) {
      setMessages(messagesData.data.messages);
    }
  }, [messagesData]);

  const handleWsMessage = useCallback((msg: { type: string; content: string; timestamp: string }) => {
    if (msg.type === 'response' || msg.type === 'message') {
      setMessages((prev) => [
        ...prev,
        {
          id: `ws_${Date.now()}`,
          deployment_id: selectedDeploymentId || '',
          role: msg.type === 'response' ? 'agent' : 'user',
          content: msg.content,
          type: msg.type === 'response' ? 'response' : 'message',
          created_at: msg.timestamp,
        },
      ]);
      setIsTyping(false);
    } else if (msg.type === 'status') {
      setIsTyping(true);
    }
  }, [selectedDeploymentId]);

  const handleWsStateChange = useCallback((state: string) => {
    setWsConnected(state === 'connected');
  }, []);

  useEffect(() => {
    if (!selectedDeploymentId) return;

    if (wsRef.current) {
      wsRef.current.disconnect();
    }

    const ws = new ChatWebSocket();
    wsRef.current = ws;
    ws.onMessage(handleWsMessage);
    ws.onStateChange(handleWsStateChange);
    ws.connect(selectedDeploymentId);

    return () => {
      ws.disconnect();
    };
  }, [selectedDeploymentId, handleWsMessage, handleWsStateChange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedDeploymentId) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      deployment_id: selectedDeploymentId,
      role: 'user',
      content: input,
      type: 'message',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (wsRef.current) {
      wsRef.current.send(input);
    } else {
      setIsTyping(false);
    }
  };

  if (depLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (runningDeployments.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center">
        <p className="text-4xl mb-4">💬</p>
        <p className="text-white font-medium mb-2">No running agents</p>
        <p className="text-dark-400 text-sm mb-6">Deploy an agent to start chatting</p>
        <a
          href="/dashboard/deploy"
          className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all"
        >
          🚀 Deploy Agent
        </a>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">Chat</h1>
          {selectedDeployment && (
            <Badge status={selectedDeployment.status} size="sm" />
          )}
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-secondary-500' : 'bg-dark-600'}`} title={wsConnected ? 'Connected' : 'Disconnected'} />
        </div>

        {/* Deployment Selector */}
        <select
          value={selectedDeploymentId || activeDepId || ''}
          onChange={(e) => setSelectedDeploymentId(e.target.value)}
          className="bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
        >
          {runningDeployments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.service_name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {msgLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}

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
          disabled={!input.trim() || !selectedDeploymentId}
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
