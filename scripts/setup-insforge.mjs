#!/usr/bin/env node
/**
 * InsForge Setup Script for DanClaw
 * 
 * This script validates your local InsForge connection.
 * Set these environment variables:
 *   NEXT_PUBLIC_INSFORGE_URL
 *   NEXT_PUBLIC_INSFORGE_ANON_KEY
 *
 * Usage: node setup-insforge.mjs
 */

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

async function main() {
  if (!INSFORGE_URL || !ANON_KEY) {
    console.log('⚠️  Missing environment variables:');
    console.log('   NEXT_PUBLIC_INSFORGE_URL');
    console.log('   NEXT_PUBLIC_INSFORGE_ANON_KEY');
    console.log('');
    console.log('Copy .env.local.example to .env.local and fill in your values.');
    console.log('Run again: node setup-insforge.mjs\n');
    process.exit(1);
  }

  console.log('🔍 Checking InsForge backend...\n');

  const res = await fetch(`${INSFORGE_URL}/rest/v1/users?limit=1`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'count=exact',
    },
  });

  console.log(`→ GET /rest/v1/users → HTTP ${res.status}`);

  if (res.ok) {
    const data = await res.json();
    console.log(`✅ Success: ${data.length} user(s) found`);
    console.log('\n✅ InsForge backend is connected!\n');
  } else {
    const text = await res.text();
    console.log(`\n❌ Error: ${text.slice(0, 200)}\n`);
    process.exit(1);
  }
}

main();
