#!/usr/bin/env node

/**
 * Test: Neue Free-Modelle von OpenRouter-Liste
 *
 * Testet die 5 neuen Modelle, die wir noch nicht hatten
 */

const OPENROUTER_API_KEY = 'sk-or-v1-[YOUR_KEY]';

// Neue Modelle von der OpenRouter-Liste
const newModels = [
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B', size: '3B', category: 'Small' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B', size: '72B', category: 'Large' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B', size: '405B', category: 'XL' },
  { id: 'mistralai/mistral-nemo:free', name: 'Mistral Nemo', size: '12B', category: 'General' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', size: '7B', category: 'General' },
];

const results = {
  working: [],
  failed: [],
  total: newModels.length
};

async function testModel(model) {
  console.log(`\n🧪 Teste: ${model.name} (${model.size})`);
  console.log(`   ID: ${model.id}`);
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

    if (response.ok) {
      const data = await response.json();
      const answer = data.choices[0]?.message?.content || 'Keine Antwort';

      console.log(`✅ FUNKTIONIERT!`);
      console.log(`   Antwort: "${answer}"`);
      console.log(`   Response-Zeit: ${responseTime}ms`);

      if (data.usage) {
        console.log(`   Tokens: ${data.usage.total_tokens || 'N/A'}`);
      }

      results.working.push({
        ...model,
        responseTime,
        usage: data.usage
      });

    } else {
      const errorText = await response.text();
      const errorPreview = errorText.substring(0, 120);

      console.log(`❌ FEHLER ${response.status}`);
      console.log(`   ${errorPreview}...`);

      results.failed.push({
        ...model,
        error: response.status,
        errorMessage: errorPreview
      });
    }

  } catch (error) {
    console.log(`❌ EXCEPTION: ${error.message}`);
    results.failed.push({
      ...model,
      error: 'Exception',
      errorMessage: error.message
    });
  }
}

async function main() {
  console.log('🔍 Test: Neue Free-Modelle (von OpenRouter-Liste)\n');
  console.log('═'.repeat(70));
  console.log(`Testing ${newModels.length} neue Modelle...\n`);

  for (const model of newModels) {
    await testModel(model);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s Pause
  }

  // Zusammenfassung
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('📊 ZUSAMMENFASSUNG');
  console.log('═'.repeat(70));
  console.log(`\n✅ Funktionierende: ${results.working.length}/${results.total}`);
  console.log(`❌ Nicht funktionierende: ${results.failed.length}/${results.total}\n`);

  if (results.working.length > 0) {
    console.log('✅ NEUE FUNKTIONIERENDE MODELLE:\n');
    results.working.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} (${m.size}) - ${m.responseTime}ms`);
    });
    console.log('');
  }

  if (results.failed.length > 0) {
    console.log('❌ FEHLERHAFTE MODELLE:\n');
    results.failed.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} - Error ${m.error}`);
    });
    console.log('');
  }

  // Gesamt-Übersicht
  const totalWorking = 5 + results.working.length; // 5 alte + neue
  console.log('═'.repeat(70));
  console.log(`💡 GESAMT: ${totalWorking} funktionierende Free-Modelle!`);
  console.log('═'.repeat(70));
}

main();
