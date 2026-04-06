/**
 * Telegram Bot Bridge for danlab.dev
 * Receives webhook updates from Telegram Bot API
 * Forwards to Zo /zo/ask API
 * Sends response back to user
 * 
 * Run with: bun telegram-webhook.ts
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_PORT = parseInt(process.env.PORT || '3000');

// Store conversation context
const sessions: Map<number, string[]> = new Map();

// Set webhook on Telegram
async function setWebhook(url: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, allowed_updates: ['message'] })
  });
  const data = await res.json();
  console.log('Webhook result:', JSON.stringify(data, null, 2));
  return data.ok;
}

// Send message to Telegram
async function sendReply(chatId: number, text: string) {
  const chunks = text.match(/[\s\S]{1,4096}/g) || [text];
  for (const chunk of chunks) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        parse_mode: 'Markdown'
      })
    });
  }
}

// Call Zo API
async function callZo(text: string, conversationId?: string) {
  const body: any = {
    input: `You are DanLab's AI assistant. Respond concisely and helpfully. User says: ${text}`,
    model_name: 'vercel:minimax/minimax-m2.7'
  };
  
  if (conversationId) body.conversation_id = conversationId;
  
  const res = await fetch('https://api.zo.computer/zo/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${process.env.ZO_CLIENT_IDENTITY_TOKEN}`
    },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  return data.output;
}

// Bun HTTP server
const server = Bun.serve({
  port: WEBHOOK_PORT,
  fetch: async (req: Request) => {
    if (req.method === 'GET' && req.url.includes('/webhook')) {
      return new Response('Telegram webhook is active', { status: 200 });
    }
    
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    
    try {
      const body = await req.json() as any;
      const msg = body.message;
      if (!msg || !msg.text) return new Response('OK');
      
      const chatId = msg.chat.id;
      const text = msg.text;
      const userId = msg.from?.id;
      
      console.log(`Message from user ${userId}: ${text.substring(0, 100)}`);
      
      // Send typing indicator
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, action: 'typing' })
      });
      
      // Call Zo API
      const sessionHistory = sessions.get(chatId) || [];
      const response = await callZo(text);
      
      if (response) {
        await sendReply(chatId, response);
        console.log(`Response sent to user ${userId}`);
      } else {
        await sendReply(chatId, 'Sorry, I could not process that request.');
      }
      
    } catch (err: any) {
      console.error('Webhook error:', err.message);
    }
    
    return new Response('OK', { status: 200 });
  }
});

console.log(`Telegram bridge running on port ${WEBHOOK_PORT}`);
console.log(`Bot: @${BOT_TOKEN.split(':')[0]}`);

// Set webhook (uncomment after getting public URL)
// const webhookUrl = 'https://your-domain.com/webhook/telegram';
// setWebhook(webhookUrl).then(ok => {
//   console.log(ok ? 'Webhook set!' : 'Failed to set webhook');
// });
