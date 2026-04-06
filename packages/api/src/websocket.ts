/**
 * @danclaw/api — WebSocket Chat Manager
 *
 * Real-time chat using InsForge Realtime WebSocket.
 * Auth: Bearer token via danclawClient.getToken()
 */

import type { WebSocketMessage } from '@danclaw/shared';
import { getToken } from './client';

export type ChatConnectionState = 'disconnected' | 'connecting' | 'connected';

export type ChatEventHandler = (message: WebSocketMessage) => void;
export type StateChangeHandler = (state: ChatConnectionState) => void;

// Default InsForge realtime URL — override via EXPO_PUBLIC_INSFORGE_URL (mobile) or NEXT_PUBLIC_INSFORGE_URL (web)
const INSFORGE_REALTIME = (typeof process !== 'undefined' && (
  process.env.EXPO_PUBLIC_INSFORGE_URL ||
  process.env.NEXT_PUBLIC_INSFORGE_URL
))
  ? ((process.env.EXPO_PUBLIC_INSFORGE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL) ?? '').replace(/^http/, 'wss')
  : 'wss://insforge.dev/realtime';

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private deploymentId: string | null = null;
  private connectionState: ChatConnectionState = 'disconnected';
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Set<ChatEventHandler> = new Set();
  private stateHandlers: Set<StateChangeHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async connect(deploymentId: string): Promise<void> {
    this.deploymentId = deploymentId;
    this.setState('connecting');

    const token = await getToken();
    const params = new URLSearchParams({ deployment_id: deploymentId });
    if (token) params.set('token', token);
    const wsUrl = `${INSFORGE_REALTIME}/realtime?${params.toString()}`;

    try {
      const ws = this.ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        this.setState('connected');
        this.flushMessageQueue();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message' || data.type === 'response') {
            const msg: WebSocketMessage = {
              type: data.type,
              content: data.content,
              timestamp: data.timestamp || new Date().toISOString(),
            };
            this.messageHandlers.forEach(handler => handler(msg));
          }
        } catch (e) {
          console.error('[ChatWebSocket] Parse error:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('[ChatWebSocket] Error:', err);
      };

      ws.onclose = () => {
        this.setState('disconnected');
        // Auto-reconnect after 5 seconds
        if (this.deploymentId) {
          this.reconnectTimer = setTimeout(() => {
            if (this.deploymentId) {
              this.connect(this.deploymentId);
            }
          }, 5000);
        }
      };
    } catch (err) {
      console.error('[ChatWebSocket] Connection failed:', err);
      this.setState('disconnected');
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.deploymentId = null;
    this.setState('disconnected');
  }

  send(content: string): void {
    const message: WebSocketMessage = {
      type: 'message',
      content,
      timestamp: new Date().toISOString(),
    };

    if (this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  onMessage(handler: ChatEventHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStateChange(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  getState(): ChatConnectionState {
    return this.connectionState;
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const msg = this.messageQueue.shift();
      if (msg) this.ws.send(JSON.stringify(msg));
    }
  }

  private setState(newState: ChatConnectionState): void {
    if (this.connectionState === newState) return;
    this.connectionState = newState;
    this.stateHandlers.forEach(handler => handler(newState));
  }
}
