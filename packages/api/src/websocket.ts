/**
 * @danclaw/api — WebSocket Chat Manager
 *
 * Real-time chat using InsForge Realtime WebSocket.
 * 
 * Connection URL: wss://tq33kiup.ap-southeast.insforge.app/realtime
 * Auth: Bearer <ik_ac...> token
 */

import type { WebSocketMessage } from '@danclaw/shared';
import { INSFORGE_BASE, INSFORGE_KEY } from './client';

export type ChatConnectionState = 'disconnected' | 'connecting' | 'connected';

export type ChatEventHandler = (message: WebSocketMessage) => void;
export type StateChangeHandler = (state: ChatConnectionState) => void;

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private deploymentId: string | null = null;
  private connectionState: ChatConnectionState = 'disconnected';
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Set<ChatEventHandler> = new Set();
  private stateHandlers: Set<StateChangeHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(deploymentId: string): void {
    this.deploymentId = deploymentId;
    this.setState('connecting');

    const wsUrl = `${INSFORGE_BASE.replace('https', 'wss')}/realtime?deployment_id=${deploymentId}&token=${INSFORGE_KEY}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setState('connected');
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
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

      this.ws.onerror = (err) => {
        console.error('[ChatWebSocket] Error:', err);
      };

      this.ws.onclose = () => {
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
      // Also persist via REST API
      if (this.deploymentId) {
        fetch(`${INSFORGE_BASE}/api/database/records/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${INSFORGE_KEY}`,
          },
          body: JSON.stringify({
            deployment_id: this.deploymentId,
            role: 'user',
            type: 'message',
            content,
          }),
        }).catch(err => console.error('[ChatWebSocket] Message persist error:', err));
      }
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
