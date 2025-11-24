#!/usr/bin/env node
import OpenAI from 'openai';

const LITEAPI_KEY = process.env.LITEAPI_KEY;
const liteapi = new OpenAI({
  baseURL: 'https://app.liteapi.ai/api/v1',
  apiKey: LITEAPI_KEY
});

const EXTENDED_MODELS = [
  // OpenAI weitere Modelle
  'openai/gpt-4-turbo',
  'openai/gpt-4',
  'openai/o1',
  'openai/o1-mini',
  'openai/o1-preview',
  // Anthropic alternative Namen
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-3-haiku',
  'anthropic/claude-sonnet-3.5',
  // Google alternative Namen
  'google/gemini-flash',
  'google/gemini-1.5-flash',
  'google/gemini-1.5-pro'
];

async function testModel(modelId) {
  try {
    const response = await liteapi.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5
    });
    console.log(`✅ ${modelId}: ${response.choices[0]?.message?.content}`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelId}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 LiteAPI Extended Model Test\n');
  const working = [];
  
  for (const modelId of EXTENDED_MODELS) {
    if (await testModel(modelId)) {
      working.push(modelId);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n✅ Funktionierende Modelle: ${working.length}`);
  working.forEach(m => console.log(`   - ${m}`));
}

main();
