#!/usr/bin/env node

/**
 * Test-Skript: OpenRouter Free-Models Rate-Limits
 *
 * Testet verschiedene kostenlose Modelle und zeigt ihre Rate-Limit-Headers
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY nicht gesetzt!');
  process.exit(1);
}

const freeModels = [
  'x-ai/grok-4.1-fast:free',
  'deepseek/deepseek-r1-0528:free',
  'qwen/qwen3-coder:free',
  'moonshotai/kimi-k2:free',
  'mistralai/mistral-small-3.2-24b-instruct:free'
];

async function testModel(model) {
  console.log(`\n📊 Testing: ${model}`);
  console.log('─'.repeat(60));

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/sascha-mcp-test',
        'X-Title': 'MCP Rate-Limit Test'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      })
    });

    // Rate-Limit-Headers
    const headers = {
      'x-ratelimit-limit-requests': response.headers.get('x-ratelimit-limit-requests'),
      'x-ratelimit-remaining-requests': response.headers.get('x-ratelimit-remaining-requests'),
      'x-ratelimit-reset-requests': response.headers.get('x-ratelimit-reset-requests'),
      'x-ratelimit-limit-tokens': response.headers.get('x-ratelimit-limit-tokens'),
      'x-ratelimit-remaining-tokens': response.headers.get('x-ratelimit-remaining-tokens'),
      'retry-after': response.headers.get('retry-after')
    };

    console.log('📋 Rate-Limit-Headers:');
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        console.log(`   ${key}: ${value}`);
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Status: ${response.status}`);
      console.log(`💬 Response: ${data.choices[0].message.content}`);

      // OpenRouter-spezifische Metadaten
      if (data.usage) {
        console.log(`🔢 Usage:`, data.usage);
      }
    } else {
      const error = await response.text();
      console.log(`❌ Error ${response.status}:`, error.substring(0, 200));
    }

  } catch (error) {
    console.error(`❌ Fehler:`, error.message);
  }
}

async function main() {
  console.log('🔍 OpenRouter Free-Models Rate-Limit Test');
  console.log('═'.repeat(60));
  console.log(`API-Key: ${OPENROUTER_API_KEY.substring(0, 20)}...`);
  console.log(`Models: ${freeModels.length}`);

  for (const model of freeModels) {
    await testModel(model);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s Pause
  }

  console.log('\n✅ Test abgeschlossen!');
}

main();
