/**
 * +html.tsx — Root HTML entry for Expo Web
 * 
 * Custom splash screen HTML for web using the DanClaw dark theme.
 */
import { ScrollView, Text, View } from 'react-native';

export default function RootHtml() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0C0C14' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🦞</Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#ffffff' }}>DanClaw</Text>
        <Text style={{ fontSize: 14, color: '#8888a0', marginTop: 8 }}>Loading...</Text>
      </View>
    </View>
  );
}
