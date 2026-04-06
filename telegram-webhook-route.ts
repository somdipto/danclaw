/**
 * Telegram Bot Webhook Route for danlab.dev
 * Deploy this as an API route on zo.space: /api/tg-webhook
 * 
 * Required Zo Secret: TELEGRAM_BOT_TOKEN
 * 
 * Flow:
 * 1. Telegram sends webhook update to this endpoint
 * 2. Route processes message
 * 3. Forwards to Zo /zo/ask API
 * 4. Sends response back via Telegram Bot API
 */

import type { Context } from "hono";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TG_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const ZO_ASK = 'https://api.zo.computer/zo/ask';

// Simple in-memory session store
const sessions: Map<number, string[]> = new Map();

/**
 * Send message to Telegram
 */
async function tgSend(chatId: number, text: string) {
  if (!BOT_TOKEN) return;
  
  // Split long messages into chunks
  const chunks = text.match(/[\s\S]{1,4096}/g) || [text];
  
  for (const chunk of chunks) {
    try {
      await fetch(`${TG_BASE}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
          parse_mode: 'Markdown'
        })
      });
    } catch (e) {
      console.error('Failed to send TG message:', e);
    }
  }
}

/**
 * Send typing indicator
 */
async function tgTyping(chatId: number) {
  if (!BOT_TOKEN) return;
  fetch(`${TG_BASE}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' })
  }).catch(() => {});
}

/**
 * Call Zo /zo/ask API
 */
async function zoAsk(text: string, conversationId?: string) {
  const body: any = {
    input: `You are Dan, Co-Founder and Lead Architect at danlab.dev. You are an AI researcher and developer building toward AGI from India. Be direct, helpful, and technically precise. Use the 👾 emoji occasionally. The user says: ${text}`,
    model_name: 'vercel:minimax/minimax-m2.7'
  };
  
  if (conversationId) body.conversation_id = conversationId;
  
  const token = process.env.ZO_API_KEY;
  if (!token) {
    console.error('Missing ZO_API_KEY');
    return null;
  }
  
  try {
    const res = await fetch(ZO_ASK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    return data.output;
  } catch (e) {
    console.error('Zo API call failed:', e);
    return null;
  }
}

export default async (c: Context) => {
  // Return 200 on GET requests (Telegram verification)
  if (c.req.method === 'GET') {
    return c.text('Telegram webhook is active');
  }
  
  // Parse webhook update
  try {
    const body = await c.req.json() as any;
    const msg = body.message || body.edited_message;
    if (!msg || !msg.text) return c.text('OK');
    
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from?.id;
    const firstName = msg.from?.first_name;
    
    console.log(`[TG] ${chatId}/${userId}: ${text.substring(0, 80)}`);
    
    // Send typing indicator
    await tgTyping(chatId);
    
    // Handle commands
    if (text === '/start') {
      await tgSend(chatId, 
`Hey ${firstName || 'there'}! 👾

I'm Dan, Co-Founder of danlab.dev. I'm here to help you with AI research, development, and building AGI from India.

Send me any message and I'll respond.`);
      return c.text('OK');
    }
    
    if (text === '/help') {
      await tgSend(chatId,
`Available commands:
/start — Start a conversation
/help — Show this help
/info — Learn about danlab.dev

Just send me any message to chat!`);
      return c.text('OK');
    }
    
    if (text === '/info') {
      await tgSend(chatId,
`danlab.dev is an AI research and product lab dedicated to advancing AGI and self-improving model architectures.

We build from India with focus on:
• Self-improving and recursive models
• Meta-learning and optimization loops
• Emergent reasoning and planning
• Training dynamics and scaling laws
• Large-scale experimentation infrastructure`);
      return c.text('OK');
    }
    
    // Check for session history
    const sessionHistory = sessions.get(chatId) || [];
    sessionHistory.push(text);
    if (sessionHistory.length > 5) sessionHistory.shift(); // Keep last 5 messages
    sessions.set(chatId, sessionHistory);
    
    // Call Zo API
    const response = await zoAsk(text);
    
    if (response) {
      await tgSend(chatId, response);
    } else {
      await tgSend(chatId, '⚠️ Sorry, I could not process that request. Please try again later.');
    }
    
  } catch (err: any) {
    console.error('[TG Webhook] Error:', err.message);
    return c.text('OK');
  }
  
  return c.text('OK');
};
