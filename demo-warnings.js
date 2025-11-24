#!/usr/bin/env node

/**
 * Demo: Warnsystem bei verschiedenen Auslastungen
 */

import { getCounter } from './request-counter.js';

const counter = getCounter();

console.log('⚠️  WARNSYSTEM-DEMO\n');
console.log('━'.repeat(70));

// Simuliere verschiedene Auslastungsstufen
const scenarios = [
  { count: 1000, label: '🟢 Niedrig (7%)' },
  { count: 11520, label: '🟡 Warnung (80%)' },
  { count: 12960, label: '🟠 Achtung (90%)' },
  { count: 13680, label: '🔴 Kritisch (95%)' },
  { count: 14400, label: '🚫 Limit (100%)' },
];

scenarios.forEach((scenario) => {
  // Temporär Counter setzen (nur für Demo)
  counter.data.count = scenario.count;

  console.log(`\n${scenario.label}`);
  console.log('─'.repeat(70));

  const check = counter.canMakeRequest();
  const stats = counter.formatStats();

  console.log(stats);

  if (!check.allowed) {
    console.log('\n🚫 STATUS: REQUEST BLOCKIERT');
    console.log(`   ${check.message}`);
  } else if (check.message) {
    console.log(`\n⚠️  WARNUNG: ${check.message}`);
  } else {
    console.log('\n✅ STATUS: Alles gut, Request erlaubt');
  }
});

// Counter zurücksetzen
counter.data.count = 8;
counter.saveCounter();

console.log('\n\n━'.repeat(70));
console.log('✨ Demo abgeschlossen - Counter zurückgesetzt auf 8 Requests\n');
