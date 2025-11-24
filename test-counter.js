#!/usr/bin/env node

/**
 * Test des Request-Counters
 */

import { getCounter } from './request-counter.js';

const counter = getCounter();

console.log('🧪 Request-Counter Test\n');
console.log('━'.repeat(70));

// Test 1: Aktueller Status
console.log('\n📊 Test 1: Aktueller Status');
console.log(counter.formatStats());

// Test 2: Request-Check
console.log('\n\n✅ Test 2: Kann Request gemacht werden?');
const check = counter.canMakeRequest();
console.log(`Erlaubt: ${check.allowed ? '✅ Ja' : '❌ Nein'}`);
if (check.message) {
  console.log(`Nachricht: ${check.message}`);
}

// Test 3: Simulierte Requests
console.log('\n\n📈 Test 3: Simuliere 5 Requests');
for (let i = 0; i < 5; i++) {
  counter.increment();
  console.log(`  Request ${i + 1} gespeichert`);
}

// Test 4: Aktualisierter Status
console.log('\n\n📊 Test 4: Aktualisierter Status nach 5 Requests');
console.log(counter.formatStats());

// Test 5: Statistiken
console.log('\n\n📋 Test 5: Detaillierte Statistiken');
const stats = counter.getStats();
console.log(JSON.stringify(stats, null, 2));

console.log('\n\n✨ Test abgeschlossen!');
console.log('━'.repeat(70));
