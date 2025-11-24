# OpenRouter Free-Models Tracking - Integration

**Erstellt:** 2025-11-24
**Version:** 1.0.0
**Ziel:** Free-Models Tracking in MCP-Server integrieren

---

## 🎯 Problem & Lösung

### Problem
- OpenRouter hat 20+ kostenlose Modelle
- **Keine Rate-Limit-Headers** in API-Responses
- Limits sind **upstream** beim Provider (xAI, DeepSeek, etc.)
- Limits sind **dynamisch** und nicht vorhersagbar
- Einige Modelle sind zeitweise rate-limited (429)
- Einige Modelle haben Privacy-Restrictions (404)

### Test-Ergebnisse
```
✅ Grok 4.1 Fast          → Funktioniert (keine Headers)
❌ DeepSeek R1 0528       → 429 (upstream rate-limited)
✅ Qwen3 Coder            → Funktioniert (keine Headers)
❌ Kimi K2                → 404 (privacy policy)
❌ Mistral Small 3.2 24B  → 429 (upstream rate-limited)
```

### Lösung
**Lokales Tracking-System** implementieren:
1. ✅ **Request-Counter** - Wie viele Requests haben WIR gemacht?
2. ✅ **Verfügbarkeits-Tracking** - Welche Modelle funktionieren aktuell?
3. ✅ **Fehler-Tracking** - Welche Modelle sind rate-limited?
4. ✅ **Erfolgsraten** - Welche Modelle sind am zuverlässigsten?
5. ✅ **Intelligente Auswahl** - Beste verfügbare Modelle priorisieren

---

## 📊 Tracker-System

### Komponenten

#### 1. `openrouter-free-tracker.cjs` ✅ Erstellt
**Funktionen:**
- `trackSuccess(modelId, tokens)` - Tracked erfolgreiche Requests
- `trackError(modelId, errorCode, message)` - Tracked Fehler
- `getAvailableModels()` - Gibt verfügbare Modelle zurück
- `getBestModels(count)` - Top N Modelle nach Erfolgsrate
- `getModelStats(modelId)` - Stats für ein Modell
- `getOverallStats()` - Gesamt-Statistiken
- `getFormattedStats()` - Formatierte Ausgabe

**Automatisches Reset:** Täglich um Mitternacht

**Persistierung:** `openrouter-free-tracker.json`

#### 2. Tracking-Datenstruktur
```json
{
  "models": {
    "x-ai/grok-4.1-fast:free": {
      "requests": 10,
      "successfulRequests": 10,
      "failedRequests": 0,
      "totalTokens": 1500,
      "lastUsed": 1732451234567,
      "lastError": null,
      "errorCount": 0,
      "availability": "available"
    },
    "deepseek/deepseek-r1-0528:free": {
      "requests": 3,
      "successfulRequests": 0,
      "failedRequests": 3,
      "totalTokens": 0,
      "lastUsed": null,
      "lastError": {
        "code": 429,
        "message": "Rate limited upstream",
        "timestamp": 1732451234567
      },
      "errorCount": 3,
      "availability": "rate_limited"
    }
  },
  "lastReset": 1732406400000,
  "totalRequests": 13
}
```

---

## 🔧 Integration in index-openrouter.js

### Schritt 1: Tracker importieren

**Vor (Zeile ~17):**
```javascript
import OpenAI from 'openai';
```

**Nach:**
```javascript
import OpenAI from 'openai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const freeTracker = require('./openrouter-free-tracker.cjs');
```

---

### Schritt 2: Freie Modelle Liste

**Nach POPULAR_MODELS (Zeile ~71), NEU einfügen:**
```javascript
// Kostenlose Modelle (dynamisch getrackt)
const FREE_MODELS = [
  'x-ai/grok-4.1-fast:free',
  'qwen/qwen3-coder:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'openai/gpt-oss-20b:free',
  'z-ai/glm-4.5-air:free',
  'google/gemma-3n-e2b-it:free',
  'google/gemma-3n-e4b-it:free',
  'qwen/qwen3-4b:free',
  'qwen/qwen3-30b-a3b:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
  'meituan/longcat-flash-chat:free',
  'alibaba/tongyi-deepresearch-30b-a3b:free',
  'tngtech/deepseek-r1t2-chimera:free',
  'deepseek/deepseek-r1-0528-qwen3-8b:free',
  'deepseek/deepseek-r1-0528:free',
  'kwaipilot/kat-coder-pro:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'moonshotai/kimi-k2:free'
];
```

---

### Schritt 3: Neues Tool `openrouter_free_stats`

**In ListToolsRequestSchema Handler (nach `openrouter_stats`), NEU einfügen:**
```javascript
{
  name: 'openrouter_free_stats',
  description: 'Zeigt Statistiken und Verfügbarkeit der kostenlosen OpenRouter-Modelle',
  inputSchema: {
    type: 'object',
    properties: {
      model: {
        type: 'string',
        description: 'Optional: Zeige Stats für spezifisches Modell'
      }
    }
  },
},
```

**Tool-Handler hinzufügen (im CallToolRequestSchema Handler):**
```javascript
case 'openrouter_free_stats':
  try {
    if (request.params.arguments?.model) {
      // Spezifisches Modell
      const modelId = request.params.arguments.model;
      const stats = freeTracker.getModelStats(modelId);

      if (!stats) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Keine Daten für Modell: ${modelId}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `📊 Stats für ${modelId}:\n\n` +
                  `Requests: ${stats.successfulRequests}/${stats.requests}\n` +
                  `Erfolgsrate: ${stats.successRate}\n` +
                  `Status: ${stats.availability}\n` +
                  `Tokens: ${stats.totalTokens} (Ø ${stats.avgTokens})\n` +
                  `Letzter Fehler: ${stats.lastError ? stats.lastError.message : 'Keine'}`,
          },
        ],
      };
    } else {
      // Übersicht aller Modelle
      const formatted = freeTracker.getFormattedStats();

      return {
        content: [
          {
            type: 'text',
            text: formatted,
          },
        ],
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Fehler beim Abrufen der Stats: ${error.message}`,
        },
      ],
    };
  }
```

---

### Schritt 4: Neues Tool `ask_free_model`

**Neues Tool für kostenlose Modelle mit automatischem Fallback:**

**In ListToolsRequestSchema Handler, NEU einfügen:**
```javascript
{
  name: 'ask_free_model',
  description: 'Stellt eine Frage an kostenlose OpenRouter-Modelle mit automatischem Fallback',
  inputSchema: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 'Die Frage',
      },
      category: {
        type: 'string',
        enum: ['general', 'coding', 'reasoning'],
        description: 'Aufgaben-Kategorie für optimale Modell-Auswahl',
      },
    },
    required: ['question'],
  },
},
```

**Tool-Handler:**
```javascript
case 'ask_free_model':
  try {
    const question = request.params.arguments.question;
    const category = request.params.arguments.category || 'general';

    // Beste verfügbare Modelle holen
    let availableModels = freeTracker.getBestModels(5);

    // Fallback: Wenn keine tracked, nehme default Free-Models
    if (availableModels.length === 0) {
      availableModels = FREE_MODELS.slice(0, 3).map(id => ({ id }));
    }

    // Kategorie-spezifische Priorisierung
    if (category === 'coding') {
      const codingModels = availableModels.filter(m =>
        m.id.includes('coder') || m.id.includes('kat-coder')
      );
      if (codingModels.length > 0) {
        availableModels = codingModels.concat(availableModels);
      }
    } else if (category === 'reasoning') {
      const reasoningModels = availableModels.filter(m =>
        m.id.includes('deepseek-r1') || m.id.includes('reasoning')
      );
      if (reasoningModels.length > 0) {
        availableModels = reasoningModels.concat(availableModels);
      }
    }

    // Versuche Modelle der Reihe nach
    let lastError = null;
    for (const model of availableModels.slice(0, 3)) {
      const modelId = model.id;

      try {
        const completion = await openrouter.chat.completions.create({
          model: modelId,
          messages: [{ role: 'user', content: question }],
          max_tokens: 1000,
        });

        const response = completion.choices[0].message.content;
        const usage = completion.usage;

        // Erfolg tracken
        freeTracker.trackSuccess(modelId, usage.total_tokens);

        return {
          content: [
            {
              type: 'text',
              text: `🤖 ${modelId}:\n\n${response}\n\n` +
                    `💰 Kosten: $0.00 (kostenlos)\n` +
                    `🔢 Tokens: ${usage.total_tokens}`,
            },
          ],
        };

      } catch (error) {
        // Fehler tracken
        const errorCode = error.status || 500;
        freeTracker.trackError(modelId, errorCode, error.message);

        lastError = error;

        // Bei 429 oder 404 → Nächstes Modell versuchen
        if (errorCode === 429 || errorCode === 404) {
          console.error(`❌ ${modelId} failed (${errorCode}), trying next...`);
          continue;
        }

        // Bei anderen Fehlern → Abbrechen
        throw error;
      }
    }

    // Alle Modelle fehlgeschlagen
    throw new Error(`Alle Free-Models fehlgeschlagen. Letzter Fehler: ${lastError?.message}`);

  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Fehler: ${error.message}`,
        },
      ],
    };
  }
```

---

### Schritt 5: Tracking in bestehenden Tools

**In `ask_openrouter` Tool:**

**Nach erfolgreicher Completion (Zeile ~200):**
```javascript
const response = completion.choices[0].message.content;
const usage = completion.usage;

// NEU: Tracking für Free-Models
if (selectedModel.endsWith(':free')) {
  freeTracker.trackSuccess(selectedModel, usage.total_tokens);
}

// Kosten berechnen...
```

**Im catch-Block (nach Zeile ~230):**
```javascript
} catch (error) {
  // NEU: Tracking für Free-Models
  if (selectedModel.endsWith(':free')) {
    freeTracker.trackError(selectedModel, error.status || 500, error.message);
  }

  return {
    content: [
      {
        type: 'text',
        text: `❌ Fehler bei OpenRouter API-Call: ${error.message}`,
      },
    ],
  };
}
```

---

## 🧪 Tests

### Test 1: Tracker-Funktionalität
```bash
node test-free-tracker.cjs
```

**Erwartet:**
- ✅ 5 erfolgreiche Requests getrackt
- ✅ 3 Fehler getrackt
- ✅ Statistiken anzeigen
- ✅ Verfügbare Modelle sortiert
- ✅ Formatierte Übersicht

### Test 2: MCP-Integration
```bash
# MCP-Server neu starten
claude mcp remove openrouter-tool
claude mcp add --transport stdio openrouter-tool \
  --env OPENROUTER_API_KEY="..." \
  -- node /Users/sascha/mcp-servers/gemini-tool/index-openrouter.js

# In Claude Code testen:
# Tool: openrouter_free_stats
```

**Erwartet:**
- ✅ Formatierte Stats-Tabelle
- ✅ Verfügbare Modelle aufgelistet
- ✅ Erfolgsraten angezeigt

### Test 3: Intelligentes Fallback
```bash
# In Claude Code:
# Tool: ask_free_model
# question: "Was ist async/await?"
# category: "general"
```

**Erwartet:**
- ✅ Versucht beste verfügbare Modelle
- ✅ Bei 429 → Nächstes Modell
- ✅ Erfolg mit verfügbarem Modell
- ✅ Tracking aktualisiert

---

## 📊 Verwendung in Claude Code

### Beispiel 1: Stats abfragen
```
User: "Zeige mir die OpenRouter Free-Models Stats"

Claude Code ruft Tool auf:
{
  "tool": "openrouter_free_stats"
}

Response:
╔════════════════════════════════════════════════════════════╗
║  OpenRouter Free-Models Tracker                            ║
╠════════════════════════════════════════════════════════════╣
║  Total Modelle:        6                                  ║
║  Verfügbar:            3                                  ║
║  Requests heute:       15                                 ║
║  Erfolgsrate:          80.0%                              ║
║  Nächster Reset:       25.11.2025, 00:00:00               ║
╠════════════════════════════════════════════════════════════╣
║  Verfügbare Modelle (sortiert nach Erfolgsrate)            ║
╠════════════════════════════════════════════════════════════╣
║  1. grok-4.1-fast:free             100.0% (   10/10) ║
║  2. qwen3-coder:free                90.0% (    9/10) ║
║  3. nemotron-nano-12b-v2-vl:free   100.0% (    5/5) ║
╚════════════════════════════════════════════════════════════╝
```

### Beispiel 2: Coding-Frage mit Free-Model
```
User: "Erkläre mir wie Array.map() funktioniert"

Claude Code entscheidet: Triviale Frage → Free-Model nutzen

Tool-Call:
{
  "tool": "ask_free_model",
  "question": "Erkläre Array.map() in JavaScript",
  "category": "coding"
}

Response:
🤖 qwen/qwen3-coder:free:

Array.map() ist eine Methode...

💰 Kosten: $0.00 (kostenlos)
🔢 Tokens: 450
```

### Beispiel 3: Nach Groq-Limit
```
1. User fragt 100 Code-Reviews
2. Groq: 14,400 Requests → Limit erreicht
3. Claude Code: "Groq-Limit erreicht, nutze OpenRouter Free..."
4. Tool-Call: ask_free_model (automatisch bestes verfügbares Modell)
5. Grok 4.1 Fast antwortet
6. Kosten: $0.00 ✅
```

---

## 💡 Workflow-Integration (v2.2.0)

### Neue Hierarchie

**Alt (v2.1.0):**
```
1. GROQ (14,400/Tag)
2. GEMINI (15/Tag)
3. OPENROUTER PAID → 💸
```

**Neu (v2.2.0):**
```
1. GROQ (14,400/Tag)                      → Immer zuerst
2. OPENROUTER FREE (dynamisch getrackt)   → Bei Groq-Limit ⭐
   - Automatische Verfügbarkeits-Prüfung
   - Intelligente Modell-Auswahl
   - Fehler-basiertes Fallback
3. GEMINI (15/Tag)                        → Wenn OR-Free erschöpft
4. OPENROUTER PAID                        → Absoluter Notfall
```

### Entscheidungs-Logik

```javascript
function selectService(task, tokenEstimate) {
  // Prüfe Groq-Counter
  if (groqCounter.canMakeRequest()) {
    return 'groq';
  }

  // Groq-Limit erreicht → OpenRouter Free
  const freeModels = freeTracker.getAvailableModels();
  if (freeModels.length > 0) {
    return 'openrouter-free'; // ⭐ NEU
  }

  // OR-Free erschöpft → Gemini
  if (geminiCounter.canMakeRequest()) {
    return 'gemini';
  }

  // Alles erschöpft → Bezahlen
  return 'openrouter-paid';
}
```

---

## 📈 Erwartete Verbesserungen

### Kosten-Einsparung
```
Szenario: 100 Requests/Tag nach Groq-Limit

ALT (v2.1.0):
  Groq:      14,400 (kostenlos)
  Gemini:    15 (kostenlos)
  OR Paid:   85 @ $0.01/Request = $0.85/Tag = $25.50/Monat

NEU (v2.2.0):
  Groq:      14,400 (kostenlos)
  OR Free:   85 (kostenlos, intelligentes Fallback) ⭐
  Gemini:    0 (nicht nötig)
  OR Paid:   0 (nicht nötig)

ERSPARNIS: $25.50/Monat = 100% ✅
```

### Verfügbarkeit
```
ALT: Groq-Limit → Gemini (15) → Bezahlen
NEU: Groq-Limit → 20+ Free-Models → Gemini → Bezahlen

Mehr Optionen = Höhere Verfügbarkeit!
```

### Intelligenz
```
ALT: Hardcodierte Modell-Auswahl
NEU: Dynamische Auswahl basierend auf:
     - Erfolgsraten
     - Aktuelle Verfügbarkeit
     - Aufgaben-Kategorie
     - Fehler-Historie
```

---

## ✅ Checkliste: Integration

### Implementierung
- [x] Tracker erstellt (`openrouter-free-tracker.cjs`) ✅
- [x] Tests geschrieben (`test-free-tracker.cjs`) ✅
- [x] Tests erfolgreich ✅
- [ ] Tracker in `index-openrouter.js` importieren
- [ ] Tool `openrouter_free_stats` hinzufügen
- [ ] Tool `ask_free_model` hinzufügen
- [ ] Tracking in `ask_openrouter` einbauen
- [ ] MCP-Server neu starten
- [ ] End-to-End-Tests

### Dokumentation
- [x] Integration-Doku erstellt ✅
- [ ] README.md aktualisieren
- [ ] CHANGELOG.md erweitern
- [ ] MCP_WORKFLOW.md auf v2.2.0 updaten

### Testing
- [ ] Tool `openrouter_free_stats` testen
- [ ] Tool `ask_free_model` testen
- [ ] Fallback-Logik testen (manuell 429 provozieren)
- [ ] Tracking-Persistierung testen (Server-Restart)

---

## 🚀 Nächste Schritte

1. **Code-Integration** (~2h)
   - Import hinzufügen
   - Tools implementieren
   - Tracking einbauen

2. **Testing** (~1h)
   - Funktionale Tests
   - Integration Tests
   - Fallback-Tests

3. **Dokumentation** (~30min)
   - README aktualisieren
   - CHANGELOG schreiben
   - Workflow-Doku anpassen

**Total:** ~3.5 Stunden bis produktionsreif

---

## 📝 Bekannte Limitierungen

1. **Upstream-Limits unbekannt**
   - Wir kennen die Provider-Limits nicht
   - Können nur lokale Nutzung tracken
   - **Lösung:** Fehler-basiertes Fallback

2. **Privacy-Policy-Einschränkungen**
   - Manche Modelle erfordern spezielle Settings
   - **Lösung:** 404-Modelle ausschließen

3. **Dynamische Verfügbarkeit**
   - Free-Models können jederzeit wegfallen
   - **Lösung:** Automatisches Availability-Tracking

4. **Keine Predictive Analytics**
   - Können nicht vorhersagen wann Limit erreicht
   - **Lösung:** Proaktives Fallback bei 429

---

**Status:** 📋 Dokumentiert, bereit für Integration
**Version:** 1.0.0
**Geschätzter Aufwand:** 3.5 Stunden
**Erwartete Ersparnis:** $25+/Monat
