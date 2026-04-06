'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeployments, useMessages, useDeployment, ChatWebSocket } from '@danclaw/api';
import type { Message, DeploymentStatus } from '@danclaw/shared';

const statusMeta: Record<DeploymentStatus, { label: string; color: string; dot: string }> = {
  running: { label: 'Running', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  stopped: { label: 'Stopped', color: 'text-zinc-500', dot: 'bg-zinc-600' },
  provisioning: { label: 'Provisioning', color: 'text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  starting: { label: 'Starting', color: 'text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  stopping: { label: 'Stopping', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  restarting: { label: 'Restarting', color: 'text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  destroying: { label: 'Destroying', color: 'text-red-400', dot: 'bg-red-500 animate-pulse' },
  error: { label: 'Error', color: 'text-red-400', dot: 'bg-red-500' },
};

function StatusBadge({ status }: { status: DeploymentStatus }) {
  const meta = statusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-zinc-900/40 border-zinc-800/50 ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export default function ChatPage() {
  const { data: deploymentsData } = useDeployments();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWsRef = useRef<ChatWebSocket | null>(null);

  const runningDeployments = deploymentsData?.data?.deployments.filter(d => d.status === 'running' || d.status === 'starting') || [];
  const [selectedId, setSelectedId] = useState(runningDeployments[0]?.id || '');

  // Load historical messages when deployment is selected
  const { data: messagesData, isLoading: messagesLoading, isError: messagesError } = useMessages(selectedId, {
    enabled: !!selectedId,
    refetchInterval: false,
  });

  // Monitor deployment status
  const { data: deploymentData } = useDeployment(selectedId, {
    enabled: !!selectedId,
    refetchInterval: 10000,
  });

  // Populate messages from API
  useEffect(() => {
    if (messagesData?.data?.messages) {
      setMessages(messagesData.data.messages);
    }
  }, [messagesData]);

  // ChatWebSocket for real-time chat
  useEffect(() => {
    if (!selectedId) return;

    const chatWs = new ChatWebSocket();
    chatWsRef.current = chatWs;

    chatWs.onStateChange((state) => {
      setIsConnected(state === 'connected');
    });

    chatWs.onMessage((msg) => {
      const agentMsg: Message = {
        id: `ws_${Date.now()}`,
        deployment_id: selectedId,
        role: 'agent',
        content: msg.content || '',
        type: 'message',
        created_at: msg.timestamp || new Date().toISOString(),
      };
      setMessages(prev => [...prev, agentMsg]);
    });

    chatWs.connect(selectedId);

    return () => {
      chatWs.disconnect();
      chatWsRef.current = null;
    };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedId && runningDeployments.length > 0) {
      setSelectedId(runningDeployments[0].id);
    }
  }, [runningDeployments, selectedId]);

  const handleSend = () => {
    if (!input.trim() || !selectedId) return;
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      deployment_id: selectedId,
      role: 'user',
      content: input,
      type: 'message',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    chatWsRef.current?.send(input);
    setInput('');
  };

  const selectedDeployment = runningDeployments.find(d => d.id === selectedId);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800/60">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium text-white">Chat</h1>
            {selectedDeployment && <StatusBadge status={selectedDeployment.status as DeploymentStatus} />}
            {isConnected && <span className="text-[10px] text-emerald-500 font-medium">● live</span>}
          </div>
          {selectedDeployment && (
            <p className="text-xs text-zinc-600 mt-0.5">
              {selectedDeployment.model} · {selectedDeployment.channel}
            </p>
          )}
        </div>

        {runningDeployments.length > 1 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
          >
            {runningDeployments.map((d) => (
              <option key={d.id} value={d.id}>{d.service_name}</option>
            ))}
          </select>
        )}
      </div>

      {runningDeployments.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
          <span className="text-5xl mb-4">🤖</span>
          <p className="text-zinc-500 text-sm">No running agents to chat with</p>
          <p className="text-xs text-zinc-700 mt-1">Deploy an agent first to start a conversation</p>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin">
            {messagesLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <span className="text-4xl mb-3 animate-pulse">💬</span>
                <p className="text-zinc-500 text-sm">Loading messages...</p>
              </div>
            ) : messagesError ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <span className="text-4xl mb-3">⚠️</span>
                <p className="text-red-400 text-sm">Failed to load messages</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <span className="text-4xl mb-3">💬</span>
                <p className="text-zinc-500 text-sm">Send a message to start chatting</p>
                <p className="text-xs text-zinc-700 mt-1">with {selectedDeployment?.service_name}</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: msg.role === 'user' ? 8 : -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 border backdrop-blur-sm ${
                        msg.role === 'user'
                          ? 'bg-white text-zinc-950 border-white/10'
                          : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-300'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      <div
                        className={`text-[10px] mt-2 ${
                          msg.role === 'user' ? 'text-zinc-500' : 'text-zinc-600'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <motion.div
            className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl p-2.5 flex items-end gap-2"
            whileFocus={{ borderColor: 'rgba(255,255,255,0.15)' }}
          >
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
              className="flex-1 bg-transparent text-white text-sm placeholder-zinc-700 resize-none focus:outline-none px-3 py-2.5 max-h-32"
            />

            <motion.button
              whileHover={!input.trim() ? undefined : { scale: 1.05 }}
              whileTap={!input.trim() ? undefined : { scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className={`rounded-xl p-2.5 text-sm font-medium transition-all ${
                input.trim()
                  ? 'bg-white text-zinc-950'
                  : 'bg-zinc-800/50 text-zinc-700 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 20L12 4" />
                <path d="M5 8L12 4L19 8" />
              </svg>
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  );
}
