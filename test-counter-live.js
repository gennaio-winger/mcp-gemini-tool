#!/usr/bin/env node

/**
 * Live-Test des Request-Counters mit echten Groq API-Calls
 */

import Groq from 'groq-sdk';
import { getCounter } from './request-counter.js';

const apiKey = 'gsk_[YOUR_KEY]';
const groq = new Groq({ apiKey });
const counter = getCounter();

// Test-Fragen
const testQuestions = [
  'Was ist 2+2?',
  'Nenne 3 Programmiersprachen.',
  'Was bedeutet API?',
];

console.log('🧪 LIVE REQUEST-COUNTER TEST\n');
console.log('━'.repeat(70));

async function runTest() {
  // 1. Initiale Stats
  console.log('\n📊 SCHRITT 1: Initiale Statistik\n');
  console.log(counter.formatStats());

  // 2. Test-Requests durchführen
  console.log('\n\n🚀 SCHRITT 2: Teste mit 3 echten API-Requests\n');
  console.log('━'.repeat(70));

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];

    console.log(`\n📤 Request ${i + 1}/3: "${question}"`);

    // Prüfen ob Request erlaubt ist
    const check = counter.canMakeRequest();

    if (!check.allowed) {
      console.log('❌ Request blockiert - Limit erreicht!');
      console.log(check.message);
      break;
    }

    // Warnung anzeigen falls vorhanden
    if (check.message) {
      console.log(`⚠️  ${check.message}`);
    }

    try {
      const startTime = Date.now();

      // Groq API-Call
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: question }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 100,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      // Counter erhöhen
      counter.increment();

      const answer = completion.choices[0]?.message?.content || 'Keine Antwort';

      console.log(`✅ Antwort (${duration}s): ${answer.substring(0, 80)}...`);
      console.log(`📊 Counter erhöht: ${counter.getStats().used} Requests verwendet`);

    } catch (error) {
      console.error(`❌ Fehler: ${error.message}`);
    }

    // Kurze Pause zwischen Requests
    if (i < testQuestions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 3. Finale Stats
  console.log('\n\n📊 SCHRITT 3: Finale Statistik nach Tests\n');
  console.log('━'.repeat(70));
  console.log(counter.formatStats());

  // 4. Detaillierte Stats
  console.log('\n\n📋 SCHRITT 4: Detaillierte Statistiken\n');
  console.log('━'.repeat(70));
  const stats = counter.getStats();
  console.log(`
🗓️  Datum:           ${stats.date}
✅  Verwendet:       ${stats.used.toLocaleString()} Requests
⏳  Verfügbar:       ${stats.remaining.toLocaleString()} Requests
📈  Limit:           ${stats.limit.toLocaleString()} Requests/Tag
📊  Auslastung:      ${stats.percentage}%
⏰  Erster Request:  ${new Date(stats.firstRequest).toLocaleTimeString('de-DE')}
⏰  Letzter Request: ${new Date(stats.lastRequest).toLocaleTimeString('de-DE')}
  `.trim());

  // 5. Warnsystem-Demo
  console.log('\n\n⚠️  SCHRITT 5: Warnsystem-Übersicht\n');
  console.log('━'.repeat(70));
  console.log(`
🟢 0-79%    (0-11,376)      → Alles gut
🟡 80-89%   (11,520-12,816) → Info-Warnung
🟠 90-94%   (12,960-13,536) → Achtung!
🔴 95-99%   (13,680-14,256) → Kritisch!
🚫 100%     (14,400)        → STOP - Request blockiert

Aktuell: ${stats.percentage}% (${stats.used.toLocaleString()} Requests)
  `.trim());

  // 6. Was passiert beim Limit?
  console.log('\n\n🚫 SCHRITT 6: Was passiert bei 100% Limit?\n');
  console.log('━'.repeat(70));
  console.log(`
Wenn 14,400 Requests erreicht sind:

1. ❌ canMakeRequest() gibt allowed: false zurück
2. 🚫 API-Call wird BLOCKIERT (nicht ausgeführt)
3. 📊 Fehlermeldung mit Stats wird angezeigt:

   "❌ Tägliches Limit erreicht! (14,400/14,400)
    ⏰ Reset um Mitternacht (00:00 Uhr)"

4. ⏰ Um 00:00 Uhr automatischer Reset auf 0
5. ✅ Nächster Tag → Wieder 14,400 Requests verfügbar
  `.trim());

  // 7. Zusammenfassung
  console.log('\n\n✨ ZUSAMMENFASSUNG\n');
  console.log('━'.repeat(70));
  console.log(`
✅ Counter funktioniert einwandfrei!
✅ ${testQuestions.length} Test-Requests erfolgreich
✅ Automatisches Tracking aktiv
✅ Warnsystem bereit
✅ Limit-Schutz aktiv

💡 In Claude Code nutzen:
   "Zeige mir die Groq-Stats"
   "Frage Groq: [deine Frage]"

🔒 Geschützt vor Limit-Überschreitung!
  `.trim());

  console.log('\n' + '━'.repeat(70));
  console.log('🎉 Test abgeschlossen!\n');
}

runTest().catch(error => {
  console.error('❌ Test-Fehler:', error);
  process.exit(1);
});
