#!/usr/bin/env node

/**
 * Erweiterter Groq Test mit verschiedenen Frage-Typen
 */

import Groq from 'groq-sdk';

const apiKey = 'gsk_[YOUR_KEY]';
const groq = new Groq({ apiKey });

const testCases = [
  {
    name: 'Einfache Frage',
    prompt: 'Was ist die Hauptstadt von Frankreich?',
    temperature: 0.1,
  },
  {
    name: 'Technische Erklärung',
    prompt: 'Erkläre in einfachen Worten, wie ein Docker Container funktioniert.',
    temperature: 0.5,
  },
  {
    name: 'Code-Generierung',
    prompt: 'Schreibe eine JavaScript-Funktion, die prüft, ob eine Zahl eine Primzahl ist.',
    temperature: 0.3,
  },
  {
    name: 'Kreative Aufgabe',
    prompt: 'Erfinde einen kreativen Namen für ein Fantasy-MMORPG über Götter und Tränen.',
    temperature: 0.9,
  },
  {
    name: 'Vergleich & Analyse',
    prompt: 'Was sind die Vor- und Nachteile von PHP vs. Node.js für Backend-Entwicklung?',
    temperature: 0.6,
  },
  {
    name: 'Mehrsprachigkeit',
    prompt: 'Übersetze ins Französische: "Hallo, wie geht es dir heute?"',
    temperature: 0.2,
  },
];

async function runTest(testCase, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 Test ${index + 1}/${testCases.length}: ${testCase.name}`);
  console.log(`${'='.repeat(70)}\n`);
  console.log(`❓ Frage:\n${testCase.prompt}\n`);

  try {
    const startTime = Date.now();

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: testCase.prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: testCase.temperature,
      max_tokens: 1024,
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const response = completion.choices[0]?.message?.content || 'Keine Antwort';

    console.log(`✅ Antwort (${duration}s):\n`);
    console.log('─'.repeat(70));
    console.log(response);
    console.log('─'.repeat(70));
    console.log(`\n📊 Stats: ${completion.usage?.total_tokens || 'N/A'} Tokens | Temperatur: ${testCase.temperature}`);

    return {
      success: true,
      duration: parseFloat(duration),
      tokens: completion.usage?.total_tokens || 0,
    };

  } catch (error) {
    console.error(`❌ Fehler: ${error.message}`);
    return {
      success: false,
      duration: 0,
      tokens: 0,
    };
  }
}

async function runAllTests() {
  console.log('\n🧪 GROQ EXTENDED TEST SUITE');
  console.log('━'.repeat(70));
  console.log('Modell: Llama 3.3 70B Versatile');
  console.log('Tests: 6 verschiedene Frage-Typen\n');

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const result = await runTest(testCases[i], i);
    results.push(result);

    // Kurze Pause zwischen Tests (Rate-Limit-freundlich)
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Zusammenfassung
  console.log(`\n\n${'='.repeat(70)}`);
  console.log('📊 ZUSAMMENFASSUNG');
  console.log(`${'='.repeat(70)}\n`);

  const successCount = results.filter(r => r.success).length;
  const avgDuration = (results.reduce((sum, r) => sum + r.duration, 0) / results.length).toFixed(2);
  const totalTokens = results.reduce((sum, r) => sum + r.tokens, 0);

  console.log(`✅ Erfolgreiche Tests: ${successCount}/${testCases.length}`);
  console.log(`⚡ Durchschnittliche Antwortzeit: ${avgDuration}s`);
  console.log(`📊 Gesamte Tokens verwendet: ${totalTokens}`);
  console.log(`💰 Kosten: 0€ (kostenlos!)`);
  console.log(`\n🎉 Groq funktioniert ${successCount === testCases.length ? 'perfekt' : 'gut'}!`);
}

runAllTests();
