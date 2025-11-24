#!/usr/bin/env node
import OpenAI from 'openai';

const LITEAPI_KEY = process.env.LITEAPI_KEY;
const liteapi = new OpenAI({
  baseURL: 'https://app.liteapi.ai/api/v1',
  apiKey: LITEAPI_KEY
});

async function testModel(modelId, useCompletionTokens = false) {
  try {
    const params = {
      model: modelId,
      messages: [{ role: 'user', content: 'Say Hi' }]
    };
    
    if (useCompletionTokens) {
      params.max_completion_tokens = 5;
    } else {
      params.max_tokens = 5;
    }
    
    const startTime = Date.now();
    const response = await liteapi.chat.completions.create(params);
    const responseTime = Date.now() - startTime;
    
    const answer = response.choices[0]?.message?.content || '';
    console.log(`✅ ${modelId}`);
    console.log(`   Antwort: "${answer.substring(0, 30)}${answer.length > 30 ? '...' : ''}"`);
    console.log(`   Zeit: ${responseTime}ms`);
    return { working: true, model: modelId, responseTime };
  } catch (error) {
    console.log(`❌ ${modelId}: ${error.message.substring(0, 50)}`);
    return { working: false, model: modelId };
  }
}

async function main() {
  console.log('🧪 LiteAPI Final Model Test\n');
  console.log('═'.repeat(70));
  
  const results = [];
  
  // Bereits bestätigte Modelle
  console.log('\n📋 Bestätigte Modelle:\n');
  results.push(await testModel('openai/gpt-4o'));
  results.push(await testModel('openai/gpt-4o-mini'));
  results.push(await testModel('anthropic/claude-3.5-sonnet'));
  results.push(await testModel('anthropic/claude-3-haiku'));
  
  // o1 Modelle mit korrektem Parameter
  console.log('\n📋 o1-Serie (max_completion_tokens):\n');
  results.push(await testModel('openai/o1', true));
  results.push(await testModel('openai/o1-mini', true));
  
  // Weitere Tests
  console.log('\n📋 Weitere Tests:\n');
  const additionalModels = [
    'google/gemini-2.0',
    'google/gemini',
    'anthropic/claude-opus',
    'anthropic/claude-3-opus'
  ];
  
  for (const model of additionalModels) {
    results.push(await testModel(model));
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('📊 Finale Zusammenfassung\n');
  
  const working = results.filter(r => r.working);
  working.sort((a, b) => a.responseTime - b.responseTime);
  
  console.log(`✅ Verfügbare Modelle: ${working.length}\n`);
  working.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.model} (${r.responseTime}ms)`);
  });
  
  console.log('\n' + '═'.repeat(70));
}

main();
