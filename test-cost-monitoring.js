#!/usr/bin/env node

/**
 * Test: Kosten-Monitoring für alle drei APIs
 * Prüft welche Kosten-Informationen die APIs zurückgeben
 */

import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API-Keys
const GROQ_API_KEY = 'gsk_[YOUR_KEY]';
const OPENROUTER_API_KEY = 'sk-or-v1-[YOUR_KEY]';
const GEMINI_API_KEY = 'AIzaSyCo0PzG0EifNjaVHX-YeiVyORQo0AmBYKY';

// Test-Prompt (klein halten für geringe Kosten)
const TEST_PROMPT = 'Was ist 2+2?';

console.log('💰 Kosten-Monitoring Test\n');
console.log('═'.repeat(70));
console.log('Test-Frage:', TEST_PROMPT);
console.log('═'.repeat(70));

// ============================================================================
// 1. GROQ TEST
// ============================================================================
async function testGroq() {
  console.log('\n📊 1. GROQ (Llama 3.3 70B)\n');
  console.log('─'.repeat(70));

  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: TEST_PROMPT }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log('✅ Response erhalten\n');
    console.log('📈 Usage-Informationen:');
    console.log(JSON.stringify(completion.usage, null, 2));

    console.log('\n💰 Kosten-Berechnung:');
    console.log('   → Groq ist KOSTENLOS');
    console.log('   → Limit: 14,400 Requests/Tag');
    console.log('   → Aktueller Stand: Siehe Request-Counter');

    return {
      service: 'Groq',
      hasUsageInfo: !!completion.usage,
      hasCostInfo: false,
      usage: completion.usage,
      monitoring: 'Request-Counter (bereits implementiert)',
    };

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    return null;
  }
}

// ============================================================================
// 2. GEMINI TEST
// ============================================================================
async function testGemini() {
  console.log('\n\n📊 2. GEMINI (2.0 Flash)\n');
  console.log('─'.repeat(70));

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: TEST_PROMPT }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    });

    const response = result.response;

    console.log('✅ Response erhalten\n');
    console.log('📈 Usage-Informationen:');

    // Prüfe verschiedene mögliche Felder
    if (response.usageMetadata) {
      console.log(JSON.stringify(response.usageMetadata, null, 2));
    } else if (response.usage) {
      console.log(JSON.stringify(response.usage, null, 2));
    } else {
      console.log('   ⚠️  Keine Usage-Informationen gefunden');
      console.log('   Verfügbare Felder:', Object.keys(response));
    }

    console.log('\n💰 Kosten-Berechnung:');
    console.log('   → Gemini 2.0 Flash: KOSTENLOS (Free Tier)');
    console.log('   → Limit: ~15 Requests/Tag (stark limitiert)');
    console.log('   → Preise (falls kostenpflichtig): $0.00001-0.00005/Token');

    return {
      service: 'Gemini',
      hasUsageInfo: !!(response.usageMetadata || response.usage),
      hasCostInfo: false,
      usage: response.usageMetadata || response.usage || null,
      monitoring: 'Nur Limit-Tracking möglich, keine Kosten-API',
    };

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    return null;
  }
}

// ============================================================================
// 3. OPENROUTER TEST
// ============================================================================
async function testOpenRouter() {
  console.log('\n\n📊 3. OPENROUTER (GPT-3.5 Turbo - günstigstes Modell)\n');
  console.log('─'.repeat(70));

  try {
    const openrouter = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://claude-code-mcp',
        'X-Title': 'Claude Code MCP Server',
      },
    });

    const completion = await openrouter.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: TEST_PROMPT }],
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log('✅ Response erhalten\n');
    console.log('📈 Usage-Informationen:');
    console.log(JSON.stringify(completion.usage, null, 2));

    // OpenRouter-spezifische Kosten-Informationen
    if (completion.usage) {
      const promptTokens = completion.usage.prompt_tokens || 0;
      const completionTokens = completion.usage.completion_tokens || 0;
      const totalTokens = completion.usage.total_tokens || 0;

      // Geschätzte Kosten für GPT-3.5 Turbo
      const inputCost = (promptTokens / 1000) * 0.001; // $0.001 per 1k tokens
      const outputCost = (completionTokens / 1000) * 0.002; // $0.002 per 1k tokens
      const totalCost = inputCost + outputCost;

      console.log('\n💰 Geschätzte Kosten (GPT-3.5 Turbo):');
      console.log(`   Input:  ${promptTokens} Tokens × $0.001/1k = $${inputCost.toFixed(6)}`);
      console.log(`   Output: ${completionTokens} Tokens × $0.002/1k = $${outputCost.toFixed(6)}`);
      console.log(`   ───────────────────────────────────────────────────`);
      console.log(`   TOTAL:  ${totalTokens} Tokens = $${totalCost.toFixed(6)}`);
      console.log(`\n   💡 Credits: $5 Free verfügbar`);
    }

    return {
      service: 'OpenRouter',
      hasUsageInfo: !!completion.usage,
      hasCostInfo: true, // Wir können Kosten berechnen!
      usage: completion.usage,
      monitoring: 'Token-basiert + Credits-Dashboard (openrouter.ai/credits)',
    };

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    return null;
  }
}

// ============================================================================
// ZUSAMMENFASSUNG
// ============================================================================
async function main() {
  const results = [];

  // Teste alle drei Services
  results.push(await testGroq());
  results.push(await testGemini());
  results.push(await testOpenRouter());

  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('📊 ZUSAMMENFASSUNG: Kosten-Monitoring-Möglichkeiten');
  console.log('═'.repeat(70));
  console.log('\n');

  const table = [
    ['Service', 'Usage Info', 'Cost Info', 'Monitoring'],
    ['─'.repeat(12), '─'.repeat(12), '─'.repeat(12), '─'.repeat(30)],
  ];

  results.forEach(r => {
    if (r) {
      table.push([
        r.service,
        r.hasUsageInfo ? '✅ Ja' : '❌ Nein',
        r.hasCostInfo ? '✅ Ja' : '❌ Nein',
        r.monitoring,
      ]);
    }
  });

  // Tabelle ausgeben
  table.forEach(row => {
    console.log(row.map((cell, i) => {
      const widths = [12, 12, 12, 30];
      return cell.padEnd(widths[i]);
    }).join(' | '));
  });

  console.log('\n');
  console.log('💡 EMPFEHLUNGEN:\n');
  console.log('   1. GROQ: Request-Counter nutzen (bereits implementiert)');
  console.log('   2. GEMINI: Manuelles Limit-Tracking (~15/Tag)');
  console.log('   3. OPENROUTER: Token-basierte Kosten-Berechnung möglich');
  console.log('\n   → Für OpenRouter: Credits-Dashboard unter openrouter.ai/credits');
  console.log('   → Für Groq: groq_stats Tool nutzen');
  console.log('\n');
}

main();
