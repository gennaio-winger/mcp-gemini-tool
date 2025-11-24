#!/usr/bin/env node

/**
 * DBGuard.php Qualitätsanalyse via OpenRouter
 *
 * Führt eine umfassende Code-Review durch mit Fokus auf:
 * - Code-Qualität und Best Practices
 * - Sicherheit und Validierung
 * - Performance-Optimierungen
 * - Wartbarkeit und Erweiterbarkeit
 */

import fs from 'fs';
import path from 'path';

// OpenRouter API
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-v1-[YOUR_KEY]';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// DBGuard.php Pfad
const DBGUARD_PATH = '/Users/sascha/Documents/lacrymae/CODE/_epicserver/httpdocs/core/DBGuard.php';

// Modell auswählen (Claude Sonnet 3.5 für beste Code-Analyse)
const MODEL = 'anthropic/claude-3.5-sonnet';

async function analyzeDBGuard() {
    console.log('📖 Lese DBGuard.php...');

    // DBGuard.php einlesen
    const dbGuardCode = fs.readFileSync(DBGUARD_PATH, 'utf8');

    console.log(`✅ Gelesen: ${dbGuardCode.length} Zeichen\n`);
    console.log('🤖 Sende an OpenRouter (Claude Sonnet 3.5)...\n');

    // Prompt für umfassende Qualitätsanalyse
    const prompt = `Du bist ein erfahrener PHP-Entwickler und Security-Experte. Analysiere die folgende DBGuard.php Klasse und erstelle eine umfassende Qualitätseinschätzung.

**WICHTIG:** Antworte auf Deutsch und im Markdown-Format!

# DBGuard.php - Code

\`\`\`php
${dbGuardCode}
\`\`\`

# Analyse-Aufgaben

Erstelle eine strukturierte Analyse mit folgenden Bereichen:

## 1. 📊 Gesamt-Bewertung
- Gesamtnote (1-10, wobei 10 = perfekt)
- Kurze Zusammenfassung (3-5 Sätze)

## 2. ✅ Stärken
- Was ist besonders gut gelöst?
- Welche Best Practices werden befolgt?
- Positive Aspekte der Architektur

## 3. ⚠️ Schwachstellen
- Sicherheits-Lücken oder -Risiken
- Performance-Probleme
- Code-Smell oder Anti-Patterns
- Fehlende Features

## 4. 🔧 Konkrete Verbesserungsvorschläge
Für jede Schwachstelle:
- Zeilen-Nummer angeben
- Problem beschreiben
- Lösungsvorschlag mit Code-Beispiel
- Priorität (Hoch/Mittel/Niedrig)

## 5. 🚀 Erweiterungsideen
- Welche Features würden die Klasse sinnvoll ergänzen?
- Zukunftssichere Architektur-Verbesserungen

## 6. 📋 Checkliste für Production-Readiness
- [ ] Sicherheit: ...
- [ ] Performance: ...
- [ ] Wartbarkeit: ...
- [ ] Dokumentation: ...
- [ ] Testing: ...

Bitte sei konkret, konstruktiv und praxisnah!`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://lacrymae.de',
                'X-Title': 'Lacrymae DBGuard Analysis'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 8000,
                temperature: 0.3 // Niedrige Temperatur für präzise Analyse
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        const analysis = data.choices[0].message.content;

        console.log('✅ Analyse abgeschlossen!\n');
        console.log('=' .repeat(80));
        console.log(analysis);
        console.log('=' .repeat(80));

        // Ergebnis speichern
        const outputPath = '/Users/sascha/Documents/lacrymae/PAPERS/_DOKU-CODING-IDEEN/KI_DBGuard_Qualitaetsanalyse.md';

        const fullDocument = `# KI-Qualitätsanalyse: DBGuard.php

**Datum:** ${new Date().toISOString().split('T')[0]}
**Analysiert von:** ${MODEL} (via OpenRouter)
**Datei:** \`CODE/_epicserver/httpdocs/core/DBGuard.php\`
**Version:** v1.1

---

${analysis}

---

## Meta-Informationen

**Analyse-Methode:** KI-gestützte Code-Review via OpenRouter API
**Modell:** ${MODEL}
**Token verwendet:** ${data.usage.total_tokens}
**Kosten:** ~$${((data.usage.total_tokens / 1000) * 0.003).toFixed(4)} USD

**Hinweis:** Diese Analyse wurde automatisch erstellt. Bitte prüfe die Vorschläge manuell auf Relevanz und Machbarkeit.
`;

        fs.writeFileSync(outputPath, fullDocument, 'utf8');

        console.log(`\n💾 Analyse gespeichert: ${outputPath}`);
        console.log(`\n📊 Token verwendet: ${data.usage.total_tokens}`);
        console.log(`💰 Kosten: ~$${((data.usage.total_tokens / 1000) * 0.003).toFixed(4)} USD`);

    } catch (error) {
        console.error('❌ Fehler:', error.message);
        process.exit(1);
    }
}

// Script ausführen
analyzeDBGuard();
