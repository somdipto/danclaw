/**
 * @danclaw/api — WebSocket Chat Manager
 *
 * Manages real-time connections for agent chat using @insforge/sdk Realtime.
 * Features:
 * - Built-in reconnection logic provided by the SDK
 * - Broadcast channels for instant messaging mapped to deployments
 * - Type-safe message events
 *
 * InsForge Realtime API:
 *   - connect()           → establish WebSocket connection
 *   - subscribe(channel) → subscribe to a named channel
 *   - publish(channel, event, payload) → broadcast to channel
 *   - on(event, callback) → listen for events
 *   - unsubscribe(channel) → leave channel
 *   - disconnect()       → close WebSocket connection
 */

import type { WebSocketMessage } from '@danclaw/shared';
import { insforge } from './client';

export type ChatConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export type ChatEventHandler = (message: WebSocketMessage) => void;
export type StateChangeHandler = (state: ChatConnectionState) => void;

export class ChatWebSocket {
  private deploymentId: string | null = null;
  private channelName: string | null = null;
  private connectionState: ChatConnectionState = 'disconnected';
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Set<ChatEventHandler> = new Set();
  private stateHandlers: Set<StateChangeHandler> = new Set();
  private messageListener: ((payload: unknown) => void) | null = null;

  // ─── Public API ───

  connect(deploymentId: string): void {
    this.deploymentId = deploymentId;
    this.channelName = `chat:${deploymentId}`;
    this.setState('connecting');

    // Connect to the realtime WebSocket server
    insforge.realtime
      .connect()
      .then(() => {
        // Subscribe to the deployment's chat channel
        return insforge.realtime.subscribe(this.channelName!);
      })
      .then((response) => {
        if (!response.ok) {
          console.error('[ChatWebSocket] Subscribe failed:', response.error);
          this.setState('disconnected');
          return;
        }

        // Listen for broadcast messages on this channel
        this.messageListener = (payload: unknown) => {
          const msg = (payload as Record<string, unknown>)['message'] as WebSocketMessage | undefined;
          if (msg) {
            this.messageHandlers.forEach(handler => handler(msg));
          }
        };
        insforge.realtime.on(this.channelName!, this.messageListener);

        this.setState('connected');
        this.flushMessageQueue();
      })
      .catch((err) => {
        console.error('[ChatWebSocket] Connection error:', err);
        this.setState('disconnected');
      });
  }

  disconnect(): void {
    if (this.channelName && this.messageListener) {
      insforge.realtime.off(this.channelName, this.messageListener);
    }
    if (this.channelName) {
      insforge.realtime.unsubscribe(this.channelName);
      this.channelName = null;
    }
    insforge.realtime.disconnect();
    this.setState('disconnected');
  }

  send(content: string): void {
    const message: WebSocketMessage = {
      type: 'message',
      content,
      timestamp: new Date().toISOString(),
    };

    if (this.connectionState === 'connected' && this.channelName) {
      // 1. Broadcast via Realtime for instant local delivery
      insforge.realtime
        .publish(this.channelName, 'message', { message })
        .catch((err) => console.error('[ChatWebSocket] Publish error:', err));

      // 2. Persist to Postgres database via the SDK
      if (this.deploymentId) {
        // Postgrest returns PromiseLike — wrap in Promise.resolve to get a real Promise with .catch()
        Promise.resolve(
          insforge.database
            .from('messages')
            .insert([{
              deployment_id: this.deploymentId,
              role: 'user',
              type: 'message',
              content,
            }])
        ).catch((err: unknown) => console.error('[ChatWebSocket] DB insert error:', err));
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
    return this.connectionState;
  }

  setAuthToken(): void {
    // InsForge SDK handles auth internally; this is a no-op for backward compatibility
  }

  // ─── Internal ───

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg && this.channelName && this.connectionState === 'connected') {
        insforge.realtime
          .publish(this.channelName, 'message', { message: msg })
          .catch((err) => console.error('[ChatWebSocket] Queue publish error:', err));

        if (this.deploymentId) {
          Promise.resolve(
            insforge.database
              .from('messages')
              .insert([{
                deployment_id: this.deploymentId,
                role: 'user',
                type: msg.type,
                content: msg.content,
              }])
          ).catch((err: unknown) => console.error('[ChatWebSocket] Queue DB insert error:', err));
        }
      }
    }
  }

  private setState(newState: ChatConnectionState): void {
    if (this.connectionState === newState) return;
    this.connectionState = newState;
    this.stateHandlers.forEach(handler => handler(newState));
  }
}
