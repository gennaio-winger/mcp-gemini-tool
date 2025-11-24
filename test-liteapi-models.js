#!/usr/bin/env node
import OpenAI from 'openai';

const LITEAPI_KEY = process.env.LITEAPI_KEY;
if (!LITEAPI_KEY) {
  console.error('❌ LITEAPI_KEY nicht gesetzt!');
  process.exit(1);
}

const liteapi = new OpenAI({
  baseURL: 'https://app.liteapi.ai/api/v1',
  apiKey: LITEAPI_KEY
});

const TEST_MODELS = [
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'openai/gpt-3.5-turbo',
  'anthropic/claude-3-5-sonnet-20241022',
  'anthropic/claude-3-haiku-20240307',
  'google/gemini-2.0-flash-exp',
  'google/gemini-pro'
];

console.log('🧪 LiteAPI Modell-Test\n');
console.log('Testing model format: provider/model-name\n');
console.log('═'.repeat(70));

async function testModel(modelId) {
  try {
    const startTime = Date.now();
    const response = await liteapi.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: 'Say "Hi" in one word' }],
      max_tokens: 10
    });
    const responseTime = Date.now() - startTime;
    
    const answer = response.choices[0]?.message?.content || 'Keine Antwort';
    console.log(`✅ ${modelId}`);
    console.log(`   Antwort: "${answer}"`);
    console.log(`   Zeit: ${responseTime}ms`);
    if (response.usage) {
      console.log(`   Tokens: ${response.usage.total_tokens}`);
    }
    return { working: true, responseTime, model: modelId };
  } catch (error) {
    console.log(`❌ ${modelId}`);
    console.log(`   Fehler: ${error.message}`);
    return { working: false, error: error.message, model: modelId };
  }
}

async function main() {
  const results = [];
  
  for (const modelId of TEST_MODELS) {
    const result = await testModel(modelId);
    results.push(result);
    console.log('─'.repeat(70));
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('📊 Zusammenfassung\n');
  
  const working = results.filter(r => r.working);
  const failed = results.filter(r => !r.working);
  
  console.log(`✅ Funktionierende Modelle: ${working.length}`);
  working.forEach(r => {
    console.log(`   - ${r.model} (${r.responseTime}ms)`);
  });
  
  console.log(`\n❌ Nicht verfügbare Modelle: ${failed.length}`);
  failed.forEach(r => {
    console.log(`   - ${r.model}: ${r.error}`);
  });
  
  console.log('═'.repeat(70));
}

main();
