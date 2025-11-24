#!/usr/bin/env node

/**
 * Test: LiteAPI - AI Aggregator
 * Base-URL: https://app.liteapi.ai/api/v1
 */

import OpenAI from 'openai';

const LITEAPI_KEY = process.env.LITEAPI_KEY;

if (!LITEAPI_KEY) {
  console.error('❌ LITEAPI_KEY nicht gesetzt!');
  process.exit(1);
}

// LiteAPI Client (OpenAI-kompatibel)
const liteapi = new OpenAI({
  baseURL: 'https://app.liteapi.ai/api/v1',
  apiKey: LITEAPI_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://claude-code-mcp',
    'X-Title': 'LiteAPI Test'
  }
});

console.log('🧪 LiteAPI Test\n');
console.log('═'.repeat(70));
console.log('Base-URL: https://app.liteapi.ai/api/v1');
console.log('Guthaben: $20');
console.log('═'.repeat(70));

// Test: Modelle abrufen und Chat-Completion
async function testLiteAPI() {
  // 1. Modelle auflisten
  console.log('\n📋 Schritt 1: Modelle abrufen\n');

  try {
    const models = await liteapi.models.list();

    if (models.data && models.data.length > 0) {
      console.log(`✅ Gefunden: ${models.data.length} Modelle\n`);

      const topModels = models.data.slice(0, 10);
      topModels.forEach((model, i) => {
        console.log(`   ${i + 1}. ${model.id}`);
      });

      if (models.data.length > 10) {
        console.log(`\n   ... und ${models.data.length - 10} weitere`);
      }

      // 2. Chat-Completion Test mit erstem Modell
      console.log('\n\n💬 Schritt 2: Chat-Completion Test\n');
      console.log('─'.repeat(70));

      const testModel = topModels[0].id;
      console.log(`Teste mit: ${testModel}\n`);

      const startTime = Date.now();

      const completion = await liteapi.chat.completions.create({
        model: testModel,
        messages: [{ role: 'user', content: 'Say "Hi" in one word' }],
        max_tokens: 10
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const answer = completion.choices[0]?.message?.content || 'Keine Antwort';

      console.log(`✅ Erfolg!`);
      console.log(`   Antwort: "${answer}"`);
      console.log(`   Response-Zeit: ${responseTime}ms`);

      if (completion.usage) {
        console.log(`   Tokens: ${completion.usage.total_tokens}`);
      }

      return { success: true, models: models.data, testModel };

    } else {
      console.log('⚠️  Keine Modelle gefunden');
      return { success: false };
    }

  } catch (error) {
    console.error(`❌ Fehler: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Details:`, error.response.data);
    }
    return { success: false, error: error.message };
  }
}

// Main
async function main() {
  const result = await testLiteAPI();

  console.log('\n' + '═'.repeat(70));

  if (result.success) {
    console.log('✅ LiteAPI erfolgreich getestet!');
    console.log(`   ${result.models.length} Modelle verfügbar`);
    console.log(`   Guthaben: $20 verfügbar`);
    console.log(`   Rabatt: 40-50% auf Modelle`);
  } else {
    console.log('❌ Test fehlgeschlagen');
    if (result.error) {
      console.log(`   Fehler: ${result.error}`);
    }
  }

  console.log('═'.repeat(70));
}

main();
