#!/usr/bin/env node

/**
 * Final Test: Kosten-Monitoring für OpenRouter
 * Testet die neuen Kosten-Tracking-Features
 */

import OpenAI from 'openai';

const OPENROUTER_API_KEY = 'sk-or-v1-[YOUR_KEY]';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://claude-code-mcp',
    'X-Title': 'Claude Code MCP Server',
  },
});

// Modell-Preise (pro 1000 Tokens)
const MODEL_PRICES = {
  'openai/gpt-3.5-turbo': { input: 0.001, output: 0.002 },
  'anthropic/claude-3-haiku': { input: 0.00025, output: 0.00125 },
};

function calculateCost(modelName, promptTokens, completionTokens) {
  const prices = MODEL_PRICES[modelName];
  if (!prices) return null;

  const inputCost = (promptTokens / 1000) * prices.input;
  const outputCost = (completionTokens / 1000) * prices.output;
  const totalCost = inputCost + outputCost;

  return { inputCost, outputCost, totalCost };
}

console.log('💰 OpenRouter Kosten-Monitoring Test\n');
console.log('═'.repeat(70));

async function testOpenRouter() {
  const tests = [
    {
      name: 'GPT-3.5 Turbo (günstig)',
      model: 'openai/gpt-3.5-turbo',
      prompt: 'Was ist 2+2?',
    },
    {
      name: 'Claude 3 Haiku (günstig)',
      model: 'anthropic/claude-3-haiku',
      prompt: 'Nenne 3 Programmiersprachen.',
    },
  ];

  let totalCost = 0;
  let totalTokens = 0;

  for (const test of tests) {
    console.log(`\n📊 Test: ${test.name}`);
    console.log(`   Modell: ${test.model}`);
    console.log(`   Frage: "${test.prompt}"`);

    try {
      const completion = await openrouter.chat.completions.create({
        model: test.model,
        messages: [{ role: 'user', content: test.prompt }],
        temperature: 0.7,
        max_tokens: 100,
      });

      const answer = completion.choices[0]?.message?.content || 'Keine Antwort';
      const usage = completion.usage;

      console.log(`\n✅ Antwort: ${answer.substring(0, 80)}...`);

      if (usage) {
        const promptTokens = usage.prompt_tokens || 0;
        const completionTokens = usage.completion_tokens || 0;
        const tokens = promptTokens + completionTokens;

        const cost = calculateCost(test.model, promptTokens, completionTokens);

        if (cost) {
          console.log(`\n💰 Kosten-Breakdown:`);
          console.log(`   Input:  ${promptTokens} Tokens × $${MODEL_PRICES[test.model].input}/1k = $${cost.inputCost.toFixed(6)}`);
          console.log(`   Output: ${completionTokens} Tokens × $${MODEL_PRICES[test.model].output}/1k = $${cost.outputCost.toFixed(6)}`);
          console.log(`   ─────────────────────────────────────────────────`);
          console.log(`   TOTAL:  ${tokens} Tokens = $${cost.totalCost.toFixed(6)}`);

          totalCost += cost.totalCost;
          totalTokens += tokens;
        }
      }

    } catch (error) {
      console.error(`❌ Fehler: ${error.message}`);
    }

    console.log('─'.repeat(70));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📈 **Session-Total:**`);
  console.log(`   Requests: ${tests.length}`);
  console.log(`   Tokens: ${totalTokens}`);
  console.log(`   Geschätzte Kosten: $${totalCost.toFixed(6)}`);
  console.log(`\n💡 Verbleibende Credits: $${(5.00 - totalCost).toFixed(6)} (von $5.00 Free Credits)\n`);
}

testOpenRouter();
