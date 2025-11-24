#!/usr/bin/env node
import OpenAI from 'openai';

const LITEAPI_KEY = process.env.LITEAPI_KEY;

console.log('🧪 LiteAPI /models Endpoint Test\n');
console.log('═'.repeat(70));

// Test 1: OpenAI SDK
console.log('\n📋 Test 1: OpenAI SDK (standard)\n');
try {
  const liteapi = new OpenAI({
    baseURL: 'https://app.liteapi.ai/api/v1',
    apiKey: LITEAPI_KEY
  });
  
  const models = await liteapi.models.list();
  console.log('✅ Erfolg!');
  console.log(`   Gefundene Modelle: ${models.data.length}`);
  models.data.slice(0, 10).forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.id}`);
  });
} catch (error) {
  console.log(`❌ Fehler: ${error.status} ${error.message.substring(0, 100)}`);
}

// Test 2: Direkter fetch
console.log('\n📋 Test 2: Direkter fetch mit Authorization Bearer\n');
try {
  const response = await fetch('https://app.liteapi.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${LITEAPI_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 200)}`);
  } else {
    const data = await response.json();
    console.log('✅ Erfolg!');
    console.log(`   Modelle: ${data.data?.length || 'unbekannt'}`);
  }
} catch (error) {
  console.log(`❌ Fehler: ${error.message}`);
}

// Test 3: Mit X-API-Key Header
console.log('\n📋 Test 3: Direkter fetch mit X-API-Key\n');
try {
  const response = await fetch('https://app.liteapi.ai/api/v1/models', {
    headers: {
      'X-API-Key': LITEAPI_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
  } else {
    const data = await response.json();
    console.log('✅ Erfolg!');
    console.log(`   Modelle: ${data.data?.length || 'unbekannt'}`);
  }
} catch (error) {
  console.log(`❌ Fehler: ${error.message}`);
}

console.log('\n' + '═'.repeat(70));
