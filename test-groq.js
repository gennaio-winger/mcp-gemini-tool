#!/usr/bin/env node

/**
 * Schnelltest für Groq API
 */

import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || 'gsk_[YOUR_KEY]';
const groq = new Groq({ apiKey });

async function testGroq() {
  console.log('🧪 Teste Groq API (Llama 3.3 70B)...\n');

  try {
    const prompt = 'Erkläre in 2-3 Sätzen: Was sind die Hauptunterschiede zwischen MySQL und PostgreSQL?';

    console.log(`📤 Frage an Groq:\n"${prompt}"\n`);
    console.log('⏳ Warte auf Antwort...\n');

    const startTime = Date.now();

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const response = completion.choices[0]?.message?.content || 'Keine Antwort';

    console.log('✅ Groq Antwort:\n');
    console.log('─'.repeat(60));
    console.log(response);
    console.log('─'.repeat(60));
    console.log(`\n⚡ Antwortzeit: ${duration} Sekunden`);
    console.log(`📊 Tokens verwendet: ${completion.usage?.total_tokens || 'N/A'}`);
    console.log('\n✨ Test erfolgreich! Groq funktioniert perfekt!');

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    if (error.status === 429) {
      console.error('\n💡 Rate-Limit erreicht. Warte kurz und versuche erneut.');
    } else if (error.status === 401) {
      console.error('\n💡 API-Key ungültig. Prüfe GROQ_API_KEY.');
    }
    process.exit(1);
  }
}

testGroq();
