#!/usr/bin/env node

/**
 * Einfacher Test-Client für den Gemini MCP-Server
 * Testet die Gemini API direkt ohne MCP-Protokoll
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCo0PzG0EifNjaVHX-YeiVyORQo0AmBYKY';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

async function testGemini() {
  console.log('🧪 Teste Gemini API...\n');

  try {
    const prompt = 'Erkläre in 2-3 Sätzen: Was sind die Hauptunterschiede zwischen MySQL und PostgreSQL?';

    console.log(`📤 Frage an Gemini:\n"${prompt}"\n`);
    console.log('⏳ Warte auf Antwort...\n');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('✅ Gemini Antwort:\n');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));
    console.log('\n✨ Test erfolgreich! Die Gemini-Integration funktioniert!');

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    process.exit(1);
  }
}

testGemini();
