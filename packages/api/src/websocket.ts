/**
 * @danclaw/api — WebSocket Chat Manager
 *
 * Manages real-time connections for agent chat using @insforge/sdk Realtime.
 * Features:
 * - Built-in reconnection logic provided by the SDK
 * - Broadcast channels for instant messaging mapping to deployments
 * - Type-safe message events
 */

import type { WebSocketMessage } from '@danclaw/shared';
import { insforge } from './client';

export type ChatConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export type ChatEventHandler = (message: WebSocketMessage) => void;
export type StateChangeHandler = (state: ChatConnectionState) => void;

export class ChatWebSocket {
  private deploymentId: string | null = null;
  private channel: any = null; // InsForge RealtimeChannel
  private state: ChatConnectionState = 'disconnected';
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Set<ChatEventHandler> = new Set();
  private stateHandlers: Set<StateChangeHandler> = new Set();

  // ─── Public API ───

  connect(deploymentId: string): void {
    this.deploymentId = deploymentId;
    this.setState('connecting');

    // Create a broadcast channel specific to this deployment
    this.channel = insforge.channel(`chat:${deploymentId}`);

    // Listen for broadcast messages
    this.channel.on('broadcast', { event: 'message' }, ({ payload }: any) => {
      this.messageHandlers.forEach(handler => handler(payload as WebSocketMessage));
    });

    this.channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        this.setState('connected');
        this.flushMessageQueue();
      } else if (status === 'TIMED_OUT') {
        this.setState('reconnecting');
      } else if (status === 'CLOSED') {
        this.setState('disconnected');
      } else if (status === 'CHANNEL_ERROR') {
        this.setState('disconnected');
      }
    });
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.setState('disconnected');
  }

  send(content: string): void {
    const message: WebSocketMessage = {
      type: 'message',
      content,
      timestamp: new Date().toISOString(),
    };

    if (this.state === 'connected' && this.channel) {
      // 1. Send via Realtime Broadcast for instant local delivery
      this.channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message,
      });

      // 2. Persist to Postgres database via the SDK
      if (this.deploymentId) {
        insforge.database.from('messages').insert([{
          deployment_id: this.deploymentId,
          role: 'user',
          type: 'message',
          content
        }]).then();
      }
    } else {
      this.messageQueue.push(message);
    }
  }

  onMessage(handler: ChatEventHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onStateChange(handler: StateChangeHandler): () => void {
    this.stateHandlers.add(handler);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  getState(): ChatConnectionState {
    return this.state;
  }

  setAuthToken(): void {
    // InsForge SDK handles auth internally; this is a no-op for backward compatibility
  }

  // ─── Internal ───

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg && this.channel && this.state === 'connected') {
        this.channel.send({
          type: 'broadcast',
          event: 'message',
          payload: msg,
        });

        if (this.deploymentId) {
          insforge.database.from('messages').insert([{
            deployment_id: this.deploymentId,
            role: 'user',
            type: msg.type,
            content: msg.content
          }]).then();
        }
      }
    }
  }

  private setState(newState: ChatConnectionState): void {
    if (this.state === newState) return;
    this.state = newState;
    this.stateHandlers.forEach(handler => handler(newState));
  }
}
