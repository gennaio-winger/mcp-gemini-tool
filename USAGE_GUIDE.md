# 📖 Usage Guide - OpenRouter Free-Tier Tracker

Praktische Anleitung mit Beispielen und Workflows für die Nutzung des Free-Tier Trackers.

---

## 🎯 Quick Start

### 1. Ersten Request senden

```javascript
import { updateModelLimits } from './free-tier-tracker.js';

// Nach erfolgreichem API-Call Tracker aktualisieren
const modelId = 'mistralai/mistral-7b-instruct:free';
await updateModelLimits(modelId);

console.log('✅ Request tracked!');
```

### 2. Status prüfen

```bash
node free-tier-tracker.js status
```

### 3. Bestes Modell wählen

```bash
node free-tier-tracker.js best
```

---

## 💡 Praktische Beispiele

### Beispiel 1: Einfache Frage

**Task:** Stelle eine einfache Frage an das schnellste Modell.

```javascript
import { getBestAvailableModel, updateModelLimits } from './free-tier-tracker.js';

async function askSimpleQuestion(question) {
  // Schnellstes verfügbares Modell wählen
  const best = await getBestAvailableModel();

  console.log(`Nutze: ${best.name} (${best.remaining}/${best.limit} verfügbar)`);

  // API-Call zu OpenRouter
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: best.id,
      messages: [{ role: 'user', content: question }],
      max_tokens: 100
    })
  });

  const data = await response.json();

  // Tracker aktualisieren
  await updateModelLimits(best.id);

  return data.choices[0].message.content;
}

// Nutzen
const answer = await askSimpleQuestion("Was ist 2+2?");
console.log(answer);
```

---

### Beispiel 2: Code-Generierung

**Task:** Generiere Code mit dem spezialisierten Coding-Modell.

```javascript
import { hasRequestsAvailable, updateModelLimits } from './free-tier-tracker.js';

async function generateCode(prompt) {
  const coderModel = 'qwen/qwen3-coder:free';

  // Prüfe ob Requests verfügbar
  const available = await hasRequestsAvailable(coderModel);

  if (!available) {
    console.warn('⚠️  Qwen Coder hat keine Requests mehr!');
    // Fallback zu anderem Modell
    const best = await getBestAvailableModel();
    console.log(`Nutze stattdessen: ${best.name}`);
    coderModel = best.id;
  }

  // API-Call
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: coderModel,
      messages: [
        {
          role: 'system',
          content: 'Du bist ein Code-Experte. Schreibe sauberen, effizienten Code.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3  // Niedrig für präzisen Code
    })
  });

  const data = await response.json();

  // Tracker aktualisieren
  await updateModelLimits(coderModel);

  return data.choices[0].message.content;
}

// Nutzen
const code = await generateCode("Schreibe eine Python-Funktion für Fibonacci");
console.log(code);
```

---

### Beispiel 3: Batch-Processing mit Load-Balancing

**Task:** Verarbeite 100 Fragen und verteile sie auf verfügbare Modelle.

```javascript
import {
  getBestAvailableModel,
  updateModelLimits,
  loadTracker
} from './free-tier-tracker.js';

async function processBatch(questions) {
  const results = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    // Wähle bestes verfügbares Modell
    const model = await getBestAvailableModel();

    if (model.remaining === 0) {
      console.error('❌ Keine Modelle mehr verfügbar! Bitte warten bis Reset.');
      break;
    }

    console.log(`[${i + 1}/${questions.length}] Nutze: ${model.name} (${model.remaining} left)`);

    try {
      // API-Call
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model.id,
          messages: [{ role: 'user', content: question }],
          max_tokens: 200
        })
      });

      const data = await response.json();

      // Tracker aktualisieren
      await updateModelLimits(model.id);

      results.push({
        question,
        answer: data.choices[0].message.content,
        model: model.name
      });

      // Pause zwischen Requests (20 RPM Limit)
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3s Pause

    } catch (error) {
      console.error(`Fehler bei Frage ${i + 1}:`, error.message);
      results.push({ question, error: error.message });
    }
  }

  return results;
}

// Nutzen
const questions = [
  "Was ist KI?",
  "Erkläre Quantum Computing",
  "Wie funktioniert Blockchain?",
  // ... 97 weitere Fragen
];

const results = await processBatch(questions);
console.log(`✅ ${results.length} Fragen verarbeitet`);
```

---

### Beispiel 4: Vision-Task (Bild analysieren)

**Task:** Analysiere ein Bild mit dem Vision-spezialisierten Modell.

```javascript
import { updateModelLimits, hasRequestsAvailable } from './free-tier-tracker.js';
import fs from 'fs';

async function analyzeImage(imagePath, question) {
  const visionModel = 'nvidia/nemotron-nano-12b-v2-vl:free';

  // Prüfe Verfügbarkeit
  const available = await hasRequestsAvailable(visionModel);

  if (!available) {
    throw new Error('Nemotron VL hat keine Requests mehr!');
  }

  // Bild als Base64 laden
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = 'image/jpeg'; // oder image/png

  // API-Call mit Bild
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: visionModel,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: question
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })
  });

  const data = await response.json();

  // Tracker aktualisieren
  await updateModelLimits(visionModel);

  return data.choices[0].message.content;
}

// Nutzen
const analysis = await analyzeImage(
  './screenshot.png',
  'Was ist auf diesem Bild zu sehen?'
);
console.log(analysis);
```

---

### Beispiel 5: Lange Texte mit Grok (2M Context)

**Task:** Analysiere ein sehr langes Dokument mit dem 2M-Context-Modell.

```javascript
import { updateModelLimits } from './free-tier-tracker.js';
import fs from 'fs';

async function analyzeLongDocument(filePath, question) {
  const grokModel = 'x-ai/grok-4.1-fast:free';

  // Lange Datei laden
  const document = fs.readFileSync(filePath, 'utf-8');

  console.log(`Dokument-Länge: ${document.length} Zeichen`);
  console.log(`Geschätzte Tokens: ~${Math.floor(document.length / 4)}`);

  // API-Call mit langem Context
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: grokModel,
      messages: [
        {
          role: 'user',
          content: `Dokument:\n\n${document}\n\nFrage: ${question}`
        }
      ],
      max_tokens: 2000
    })
  });

  const data = await response.json();

  // Tracker aktualisieren
  await updateModelLimits(grokModel);

  // Token-Usage anzeigen
  if (data.usage) {
    console.log(`📊 Tokens: ${data.usage.prompt_tokens} input + ${data.usage.completion_tokens} output`);
  }

  return data.choices[0].message.content;
}

// Nutzen
const summary = await analyzeLongDocument(
  './long_document.txt',
  'Fasse die Hauptpunkte zusammen'
);
console.log(summary);
```

---

## 🎯 Workflows

### Workflow 1: Tägliche Monitoring-Routine

```bash
#!/bin/bash
# daily-check.sh - Morgens Status prüfen

echo "📊 Free-Tier Status (Morgen-Check)"
echo "=================================="
node free-tier-tracker.js status

echo ""
echo "🏆 Bestes verfügbares Modell:"
node free-tier-tracker.js best
```

### Workflow 2: Smart Model Selection

```javascript
import { loadTracker, getBestAvailableModel } from './free-tier-tracker.js';

async function selectModelForTask(taskType) {
  const tracker = await loadTracker();

  // Task-spezifische Modell-Auswahl
  const preferences = {
    'coding': ['qwen/qwen3-coder:free', 'mistralai/mistral-7b-instruct:free'],
    'vision': ['nvidia/nemotron-nano-12b-v2-vl:free'],
    'long-context': ['x-ai/grok-4.1-fast:free', 'google/gemini-2.0-flash-exp:free'],
    'fast': ['mistralai/mistral-7b-instruct:free', 'nvidia/nemotron-nano-12b-v2-vl:free'],
    'general': ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemini-2.0-flash-exp:free']
  };

  // Bevorzugte Modelle für Task-Type
  const preferred = preferences[taskType] || [];

  // Prüfe bevorzugte Modelle
  for (const modelId of preferred) {
    const model = tracker.models[modelId];
    if (model && model.remaining > 0) {
      console.log(`✅ Nutze bevorzugtes Modell: ${model.name}`);
      return { id: modelId, ...model };
    }
  }

  // Fallback: Bestes verfügbares
  console.log('⚠️  Bevorzugte Modelle nicht verfügbar, wähle bestes');
  return await getBestAvailableModel();
}

// Nutzen
const model = await selectModelForTask('coding');
console.log(`Ausgewähltes Modell: ${model.name}`);
```

### Workflow 3: Error-Handling mit Retry

```javascript
async function robustRequest(modelId, prompt, maxRetries = 3) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Prüfe Verfügbarkeit
      const available = await hasRequestsAvailable(modelId);

      if (!available) {
        // Wechsle zu anderem Modell
        const best = await getBestAvailableModel();
        if (!best || best.remaining === 0) {
          throw new Error('Keine Modelle verfügbar!');
        }
        modelId = best.id;
        console.log(`Wechsle zu: ${best.name}`);
      }

      // API-Call
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();

        // Retry bei 429 (Rate-Limit)
        if (response.status === 429) {
          retries++;
          console.warn(`⚠️  Rate-Limit (429). Retry ${retries}/${maxRetries} in 5s...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        throw new Error(`API-Error ${response.status}: ${error.error?.message}`);
      }

      const data = await response.json();

      // Tracker aktualisieren
      await updateModelLimits(modelId);

      return {
        success: true,
        answer: data.choices[0].message.content,
        model: modelId,
        retries
      };

    } catch (error) {
      retries++;

      if (retries >= maxRetries) {
        return {
          success: false,
          error: error.message,
          retries
        };
      }

      console.error(`Fehler (${retries}/${maxRetries}):`, error.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Nutzen
const result = await robustRequest('mistralai/mistral-7b-instruct:free', 'Hallo!');
if (result.success) {
  console.log(`✅ Antwort: ${result.answer}`);
} else {
  console.error(`❌ Fehler nach ${result.retries} Versuchen: ${result.error}`);
}
```

---

## 🛡️ Best Practices

### 1. Immer Limits prüfen

```javascript
// ✅ RICHTIG
const available = await hasRequestsAvailable(modelId);
if (!available) {
  const best = await getBestAvailableModel();
  modelId = best.id;
}

// ❌ FALSCH (blind senden ohne Prüfung)
await fetch(...)
```

### 2. Rate-Limit beachten (20 RPM)

```javascript
// ✅ RICHTIG (3s Pause zwischen Requests)
for (const question of questions) {
  await askQuestion(question);
  await new Promise(resolve => setTimeout(resolve, 3000));
}

// ❌ FALSCH (zu schnell = 429 Error)
await Promise.all(questions.map(q => askQuestion(q)));
```

### 3. Tracker nach JEDEM Request aktualisieren

```javascript
// ✅ RICHTIG
const response = await fetch(...);
await updateModelLimits(modelId);

// ❌ FALSCH (vergessen zu tracken)
const response = await fetch(...);
// Tracker wird nicht aktualisiert!
```

### 4. Error-Handling implementieren

```javascript
// ✅ RICHTIG
try {
  await askQuestion(...);
} catch (error) {
  if (error.status === 429) {
    // Warte oder nutze anderes Modell
  }
}

// ❌ FALSCH (kein Error-Handling)
await askQuestion(...);
```

---

## 📈 Performance-Tipps

### 1. Schnellstes Modell für einfache Tasks

```javascript
// Für "Was ist 2+2?" → Mistral 7B (365ms)
const fast = 'mistralai/mistral-7b-instruct:free';
```

### 2. Max-Tokens begrenzen

```javascript
// ✅ Spart Tokens und Zeit
max_tokens: 100  // Für kurze Antworten

// ❌ Verschwenderisch
max_tokens: 4096  // Für "Was ist 2+2?"
```

### 3. Temperature anpassen

```javascript
// Code-Generierung (präzise)
temperature: 0.1

// Kreatives Schreiben
temperature: 0.9

// Standard
temperature: 0.7
```

---

## 🔧 Debugging

### Debug-Modus aktivieren

```javascript
// In free-tier-tracker.js
console.error(`🐛 Debug: Aktualisiere ${modelId}`);
console.error(`   Remaining: ${model.remaining} → ${model.remaining - 1}`);
```

### Tracker-Datei inspizieren

```bash
# Zeige alle Modelle
jq '.models | keys' free-tier-tracker.json

# Zeige Modell-Details
jq '.models["mistralai/mistral-7b-instruct:free"]' free-tier-tracker.json

# Zeige nur remaining
jq '.models | to_entries | map({key: .key, remaining: .value.remaining})' free-tier-tracker.json
```

### Logs analysieren

```bash
# MCP-Server-Logs anschauen
tail -f ~/.config/claude-code/logs/openrouter-tool.log
```

---

## 📚 Weitere Ressourcen

- [FREE_TIER_README.md](./FREE_TIER_README.md) - Haupt-Dokumentation
- [OpenRouter Docs](https://openrouter.ai/docs) - API-Dokumentation
- [OpenRouter Models](https://openrouter.ai/models?max_price=0) - Free-Modelle-Liste

---

**Version:** 1.0.0
**Datum:** 2025-11-24
**Autor:** Claude Code
