import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { mockMessages, type ChatMessage } from '@/constants/mockData';

function getSimulatedResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('email') || lower.includes('inbox')) {
    return "I've scanned your inbox:\n\n1. Team standup — Rescheduled to 4 PM\n2. Client proposal — Needs review\n3. Deploy — Agent gamma deployed ✅\n\nWant me to draft a reply?";
  }
  if (lower.includes('schedule') || lower.includes('meeting')) {
    return "Your schedule for today:\n\n🕐 1:00 PM — Team standup (30 min)\n🕑 2:30 PM — Client review (45 min)\n🕓 4:00 PM — Sprint planning (1 hr)\n\nYou have a 1-hour gap at 3:15 PM.";
  }
  return `I've processed your request: "${input}"\n\n• Task noted and added to workflow\n• I'll monitor for updates\n• Say the word if you need action!\n\nAnything else?`;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    const inputText = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: `m_${Date.now() + 1}`,
        role: 'agent',
        content: getSimulatedResponse(inputText),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

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
            <View style={styles.headerDot} />
            <View>
              <Text style={styles.headerTitle}>Support Bot Alpha</Text>
              <Text style={styles.headerSub}>Claude 3.5 Sonnet · Running</Text>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={{ paddingVertical: Spacing.three }}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.userBubble : styles.agentBubble,
                ]}
              >
                <Text style={[styles.bubbleText, msg.role === 'user' && { color: Colors.white }]}>
                  {msg.content}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    msg.role === 'user' ? { color: 'rgba(255,255,255,0.6)' } : { color: Colors.dark500 },
                  ]}
                >
                  {msg.timestamp}
                </Text>
              </View>
            ))}

            {isTyping && (
              <View style={[styles.bubble, styles.agentBubble]}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, { opacity: 0.4 }]} />
                  <View style={[styles.dot, { opacity: 0.7 }]} />
                  <View style={styles.dot} />
                </View>
              </View>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark700,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: Colors.white },
  headerSub: { fontSize: 12, color: Colors.dark400, marginTop: 2 },
  messages: { flex: 1, paddingHorizontal: Spacing.four },
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
  typingDots: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
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
