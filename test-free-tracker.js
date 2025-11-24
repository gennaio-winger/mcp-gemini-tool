#!/usr/bin/env node

/**
 * Test-Skript: Free-Tier-Tracker
 *
 * Macht echte API-Calls zu OpenRouter Free-Modellen
 * und aktualisiert den Tracker mit den Rate-Limit-Daten
 */

import { updateModelLimits, showStatus, getBestAvailableModel } from './free-tier-tracker.js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-v1-[YOUR_KEY]';

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

/**
 * Macht einen Test-Request und extrahiert Rate-Limit-Headers
 */
async function testModelAndUpdateTracker(modelId) {
  console.log(`\n🔄 Teste: ${modelId}`);
  console.log('─'.repeat(70));

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://claude-code-mcp',
        'X-Title': 'Free-Tier Tracker Test'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      })
    });

    // Rate-Limit-Headers extrahieren
    const rateLimitHeaders = {
      'x-ratelimit-limit-requests': response.headers.get('x-ratelimit-limit-requests'),
      'x-ratelimit-remaining-requests': response.headers.get('x-ratelimit-remaining-requests'),
      'x-ratelimit-reset-requests': response.headers.get('x-ratelimit-reset-requests'),
    };

    console.log('📋 Rate-Limit-Headers:');
    console.log(`   Limit: ${rateLimitHeaders['x-ratelimit-limit-requests']}`);
    console.log(`   Remaining: ${rateLimitHeaders['x-ratelimit-remaining-requests']}`);
    console.log(`   Reset: ${rateLimitHeaders['x-ratelimit-reset-requests'] ? new Date(parseInt(rateLimitHeaders['x-ratelimit-reset-requests']) * 1000).toLocaleString('de-DE') : 'N/A'}`);

    // Tracker aktualisieren
    const success = await updateModelLimits(modelId, rateLimitHeaders);

    if (success) {
      console.log('✅ Tracker aktualisiert!');
    }

    if (response.ok) {
      const data = await response.json();
      console.log(`💬 Response: ${data.choices[0]?.message?.content || 'Keine Antwort'}`);
    } else {
      const error = await response.text();
      console.log(`❌ Error ${response.status}: ${error.substring(0, 100)}`);
    }

  } catch (error) {
    console.error(`❌ Fehler: ${error.message}`);
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  console.log('🧪 Free-Tier-Tracker Test\n');
  console.log('═'.repeat(70));
  console.log('Dieses Skript macht echte API-Calls und tracked die Limits!\n');

  // Zeige Status VOR dem Test
  console.log('📊 Status VOR dem Test:');
  await showStatus();

  console.log('\n\n🔄 Starte Tests...\n');
  console.log('═'.repeat(70));

  // Teste jedes Modell
  for (const modelId of freeModels) {
    await testModelAndUpdateTracker(modelId);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s Pause
  }

  // Zeige Status NACH dem Test
  console.log('\n\n📊 Status NACH dem Test:');
  await showStatus();

  // Zeige bestes Modell
  console.log('\n🏆 Bestes verfügbares Modell:');
  const best = await getBestAvailableModel();
  if (best) {
    console.log(`   ${best.name} - ${best.remaining}/${best.limit} Requests verfügbar`);
  }

  console.log('\n✅ Test abgeschlossen!\n');
}

main();
