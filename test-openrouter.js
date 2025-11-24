#!/usr/bin/env node

/**
 * Test des OpenRouter MCP-Servers
 */

import OpenAI from 'openai';

const apiKey = 'sk-or-v1-[YOUR_KEY]';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://claude-code-mcp',
    'X-Title': 'Claude Code MCP Server',
  },
});

console.log('🧪 OpenRouter Test\n');
console.log('━'.repeat(70));

async function testModels() {
  const tests = [
    {
      name: 'GPT-4 Turbo',
      model: 'openai/gpt-4-turbo',
      prompt: 'Was ist 7 + 8?',
    },
    {
      name: 'Claude 3.5 Sonnet',
      model: 'anthropic/claude-3.5-sonnet',
      prompt: 'Nenne 3 Programmiersprachen.',
    },
  ];

  for (const test of tests) {
    console.log(`\n📤 Test: ${test.name}`);
    console.log(`   Modell: ${test.model}`);
    console.log(`   Frage: "${test.prompt}"`);

    try {
      const startTime = Date.now();

      const completion = await openrouter.chat.completions.create({
        model: test.model,
        messages: [{ role: 'user', content: test.prompt }],
        temperature: 0.7,
        max_tokens: 200,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const answer = completion.choices[0]?.message?.content || 'Keine Antwort';

      console.log(`\n✅ Antwort (${duration}s):`);
      console.log(`   ${answer.substring(0, 100)}...`);

      if (completion.usage) {
        console.log(`💰 Tokens: ${completion.usage.total_tokens}`);
      }

    } catch (error) {
      console.error(`❌ Fehler: ${error.message}`);
    }

    console.log('─'.repeat(70));

    // Pause zwischen Tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✨ Test abgeschlossen!\n');
}

testModels();
