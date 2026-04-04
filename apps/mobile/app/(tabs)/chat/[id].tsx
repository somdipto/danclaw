/**
 * (tabs)/chat/[id].tsx — Individual Chat Screen
 * 
 * Uses ChatWebSocket from @danclaw/api for real-time messaging.
 * Individual deployment chat via route param.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useDeployment, useMessages } from '@danclaw/api';
import { ChatWebSocket } from '@danclaw/api';
import type { WebSocketMessage } from '@danclaw/shared';
import { formatTime } from '@danclaw/shared';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);

  const { data: deploymentData, isLoading: depLoading } = useDeployment(id);
  const { data: messagesData } = useMessages(id);

  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [input, setInput] = useState('');
  const [connectionState, setConnectionState] = useState<string>('connecting');

  const deployment = deploymentData?.data;

  useEffect(() => {
    if (!id) return;
    const ws = new ChatWebSocket();
    wsRef.current = ws;

    ws.onStateChange((state) => {
      setConnectionState(state);
    });

    ws.onMessage((msg) => {
      setMessages(prev => [...prev, msg]);
    });

    ws.connect(id);

    return () => {
      ws.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (messagesData?.data?.messages) {
      const historical = messagesData.data.messages.map(m => ({
        type: m.type as WebSocketMessage['type'],
        content: m.content,
        timestamp: m.created_at,
      }));
      setMessages(historical);
    }
  }, [messagesData]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, scrollToEnd]);

  const handleSend = () => {
    if (!input.trim() || !wsRef.current) return;
    wsRef.current.send(input.trim());
    setInput('');
  };

  if (depLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!deployment) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Deployment not found</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.errorLink}>Go back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const connectionColor =
    connectionState === 'connected' ? Colors.secondary :
    connectionState === 'connecting' ? Colors.accent :
    Colors.error;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.headerDot, { backgroundColor: connectionColor }]} />
            <View>
              <Text style={styles.headerTitle}>{deployment.service_name}</Text>
              <Text style={styles.headerSub}>
                {deployment.model} · {connectionState}
              </Text>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={{ paddingVertical: Spacing.three }}
          >
            {messages.length === 0 && (
              <View style={styles.welcomeMessage}>
                <Text style={styles.welcomeText}>
                  Start a conversation with your agent
                </Text>
              </View>
            )}
            {messages.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.bubble,
                  msg.type === 'message' ? styles.userBubble : styles.agentBubble,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    msg.type === 'message' && { color: Colors.white },
                  ]}
                >
                  {msg.content}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    msg.type === 'message'
                      ? { color: 'rgba(255,255,255,0.6)' }
                      : { color: Colors.dark500 },
                  ]}
                >
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.inputAction}>
              <Text style={{ fontSize: 20, color: Colors.dark400 }}>📎</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.dark500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              multiline
            />
            <TouchableOpacity style={styles.inputAction}>
              <Text style={{ fontSize: 20, color: Colors.dark400 }}>🎤</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, !input.trim() && { opacity: 0.4 }]}
              disabled={!input.trim()}
              onPress={handleSend}
            >
              <Text style={{ color: Colors.white, fontSize: 16 }}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark950 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 18, color: Colors.dark300 },
  errorLink: { fontSize: 16, color: Colors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark700,
  },
  headerDot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.white },
  headerSub: { fontSize: 12, color: Colors.dark400, marginTop: 2 },
  messages: { flex: 1, paddingHorizontal: Spacing.four },
  welcomeMessage: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  welcomeText: { fontSize: 14, color: Colors.dark500 },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: Colors.dark800,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  bubbleText: { fontSize: 15, lineHeight: 22, color: Colors.dark200 },
  timestamp: { fontSize: 11, marginTop: 6 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dark700,
    backgroundColor: Colors.dark900,
    gap: 8,
  },
  inputAction: { padding: 6 },
  input: {
    flex: 1,
    backgroundColor: Colors.dark800,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.dark700,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
