#!/usr/bin/env node

/**
 * Test: Beste Free-Modelle auf OpenRouter
 *
 * Testet die Top 10 interessantesten kostenlosen Modelle
 * und prüft welche funktionieren.
 */

const OPENROUTER_API_KEY = 'sk-or-v1-[YOUR_KEY]';

// Top 10 interessanteste Free-Modelle
const topModels = [
  { id: 'x-ai/grok-4.1-fast:free', name: 'Grok 4.1 Fast', size: '2M context', category: 'General' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B', size: '405B', category: 'Large' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', size: '70B', category: 'General' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', size: '~70B', category: 'Reasoning' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder', size: '480B', category: 'Coding' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', size: 'Unknown', category: 'Google' },
  { id: 'mistralai/mistral-small-3.2-24b-instruct:free', name: 'Mistral Small 3.2', size: '24B', category: 'General' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder', size: '32B', category: 'Coding' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'Nemotron Nano VL', size: '12B', category: 'Vision' },
  { id: 'deepseek/deepseek-r1-distill-llama-70b:free', name: 'DeepSeek R1 Distill', size: '70B', category: 'Reasoning' },
];

const results = {
  working: [],
  failed: [],
  total: topModels.length
};

async function testModel(model) {
  console.log(`\n🧪 Teste: ${model.name} (${model.size})`);
  console.log(`   ID: ${model.id}`);
  console.log(`   Kategorie: ${model.category}`);
  console.log('─'.repeat(70));

  try {
    const startTime = Date.now();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://claude-code-mcp',
        'X-Title': 'Free-Model Test'
      },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'user', content: 'Say "Hi" in one word' }],
        max_tokens: 10
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Rate-Limit-Headers prüfen
    const rateLimitHeaders = {
      limit: response.headers.get('x-ratelimit-limit-requests'),
      remaining: response.headers.get('x-ratelimit-remaining-requests'),
      reset: response.headers.get('x-ratelimit-reset-requests'),
    };

    if (response.ok) {
      const data = await response.json();
      const answer = data.choices[0]?.message?.content || 'Keine Antwort';

      console.log(`✅ FUNKTIONIERT!`);
      console.log(`   Antwort: "${answer}"`);
      console.log(`   Response-Zeit: ${responseTime}ms`);

      if (data.usage) {
        console.log(`   Tokens: ${data.usage.total_tokens || 'N/A'}`);
      }

      // Rate-Limits (falls vorhanden)
      if (rateLimitHeaders.limit || rateLimitHeaders.remaining) {
        console.log(`   Rate-Limit: ${rateLimitHeaders.remaining || '?'}/${rateLimitHeaders.limit || '?'}`);
      } else {
        console.log(`   Rate-Limit: Keine Headers`);
      }

      results.working.push({
        ...model,
        responseTime,
        hasRateLimitHeaders: !!(rateLimitHeaders.limit || rateLimitHeaders.remaining),
        usage: data.usage
      });

    } else {
      const errorText = await response.text();
      const errorPreview = errorText.substring(0, 150);

      console.log(`❌ FEHLER ${response.status}`);
      console.log(`   ${errorPreview}...`);

      results.failed.push({
        ...model,
        error: response.status,
        errorMessage: errorPreview
      });
    }

  } catch (error) {
    console.log(`❌ EXCEPTION`);
    console.log(`   ${error.message}`);

    results.failed.push({
      ...model,
      error: 'Exception',
      errorMessage: error.message
    });
  }
}

async function main() {
  console.log('🔍 Test: Top 10 Free-Modelle auf OpenRouter\n');
  console.log('═'.repeat(70));
  console.log(`Testing ${topModels.length} Modelle...\n`);

  // Teste alle Modelle
  for (const model of topModels) {
    await testModel(model);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s Pause
  }

  // Zusammenfassung
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('📊 ZUSAMMENFASSUNG');
  console.log('═'.repeat(70));
  console.log(`\n✅ Funktionierende Modelle: ${results.working.length}/${results.total}`);
  console.log(`❌ Nicht funktionierende: ${results.failed.length}/${results.total}\n`);

  if (results.working.length > 0) {
    console.log('✅ FUNKTIONIERENDE MODELLE:\n');
    results.working.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} (${m.size}) - ${m.category}`);
      console.log(`   ID: ${m.id}`);
      console.log(`   Response-Zeit: ${m.responseTime}ms`);
      console.log(`   Rate-Limit-Headers: ${m.hasRateLimitHeaders ? 'Ja ✅' : 'Nein ❌'}`);
      console.log('');
    });
  }

  if (results.failed.length > 0) {
    console.log('❌ FEHLERHAFTE MODELLE:\n');
    results.failed.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} - Error ${m.error}`);
      console.log(`   ${m.errorMessage}`);
      console.log('');
    });
  }

  // Empfehlung
  console.log('═'.repeat(70));
  console.log('💡 EMPFEHLUNG:\n');
  if (results.working.length >= 5) {
    console.log(`✅ ${results.working.length} funktionierende Modelle gefunden!`);
    console.log(`   → Diese in den Tracker und MCP-Server integrieren\n`);
  } else {
    console.log(`⚠️  Nur ${results.working.length} Modelle funktionieren.`);
    console.log(`   → Alternativ manuelle Request-Zählung nutzen\n`);
  }
}

main();
