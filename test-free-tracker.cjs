#!/usr/bin/env node

/**
 * Test-Skript für OpenRouter Free-Models Tracker
 */

const tracker = require('./openrouter-free-tracker.cjs');

console.log('🧪 Testing OpenRouter Free-Models Tracker\n');

// Simuliere verschiedene Requests
console.log('1️⃣ Tracking erfolgreicher Requests...');
tracker.trackSuccess('x-ai/grok-4.1-fast:free', 150);
tracker.trackSuccess('x-ai/grok-4.1-fast:free', 200);
tracker.trackSuccess('qwen/qwen3-coder:free', 500);
tracker.trackSuccess('qwen/qwen3-coder:free', 450);
tracker.trackSuccess('nvidia/nemotron-nano-12b-v2-vl:free', 300);

console.log('✅ 5 erfolgreiche Requests getrackt\n');

// Simuliere Fehler
console.log('2️⃣ Tracking fehlgeschlagener Requests...');
tracker.trackError('deepseek/deepseek-r1-0528:free', 429, 'Rate limited upstream');
tracker.trackError('moonshotai/kimi-k2:free', 404, 'Privacy policy');
tracker.trackError('mistralai/mistral-small-3.2-24b-instruct:free', 429, 'Rate limited');

console.log('✅ 3 Fehler getrackt\n');

// Zeige Statistiken
console.log('3️⃣ Gesamt-Statistiken:');
console.log('─'.repeat(60));
const overall = tracker.getOverallStats();
console.log(JSON.stringify(overall, null, 2));

console.log('\n4️⃣ Verfügbare Modelle:');
console.log('─'.repeat(60));
const available = tracker.getAvailableModels();
available.forEach(model => {
  console.log(`📊 ${model.id}`);
  console.log(`   Requests: ${model.successfulRequests}/${model.requests}`);
  console.log(`   Erfolgsrate: ${model.successRate.toFixed(1)}%`);
  console.log(`   Status: ${model.availability}`);
  console.log();
});

console.log('5️⃣ Top 3 Modelle:');
console.log('─'.repeat(60));
const best = tracker.getBestModels(3);
best.forEach((model, idx) => {
  console.log(`${idx + 1}. ${model.id} (${model.successRate.toFixed(1)}%)`);
});

console.log('\n6️⃣ Formatierte Übersicht:');
console.log(tracker.getFormattedStats());

console.log('✅ Test abgeschlossen!');
