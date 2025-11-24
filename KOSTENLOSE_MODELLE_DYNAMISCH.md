# Dynamische Kostenlose Modelle - Implementierungs-Konzept

**Erstellt:** 2025-11-24
**Für:** MCP-Server Workflow v2.2.0
**Ziel:** Kostenlose Modelle dynamisch erkennen und priorisieren

---

## 🎯 Problem

OpenRouter und andere Anbieter haben **dynamisch wechselnde** kostenlose Modelle:
- Heute: Grok 4.1 Fast kostenlos
- Morgen: Vielleicht DeepSeek R1 kostenlos
- Nächste Woche: Andere Modelle

**Aktuell:** Hartcodierte Modell-Auswahl (Groq → Gemini → OpenRouter)
**Gewünscht:** Dynamische Erkennung und Nutzung kostenloser Modelle

---

## 🔍 Analyse: OpenRouter kostenlose Modelle

### API-Endpunkt
```bash
curl https://openrouter.ai/api/v1/models
```

### Identifikation kostenloser Modelle

**Methode 1: `:free` Suffix**
```
x-ai/grok-4.1-fast:free
kwaipilot/kat-coder-pro:free
nvidia/nemotron-nano-12b-v2-vl:free
```

**Methode 2: Pricing = 0**
```json
{
  "id": "x-ai/grok-4.1-fast",
  "pricing": {
    "prompt": "0",
    "completion": "0",
    "request": "0"
  }
}
```

### Aktuell verfügbare kostenlose Modelle (2025-11-24)

| Modell | Capabilities | Context | Besonderheit |
|--------|-------------|---------|--------------|
| **Grok 4.1 Fast** | Text+Image→Text | 2M | ⭐ Riesiger Context! |
| **DeepSeek R1 0528** | Reasoning | 128k | ⭐ Reasoning-Model |
| **Qwen3 Coder 480B** | Coding | 32k | ⭐ Coding-Spezialist |
| **Mistral Small 3.2 24B** | Text | 32k | Solides Allround-Modell |
| **Kimi K2** | Text | 262k | Großer Context |
| **Nemotron Nano 12B VL** | Video+Image | 128k | ⭐ Multimodal |

**Total:** 20+ kostenlose Modelle verfügbar!

---

## 💡 Implementierungs-Strategie

### Phase 1: OpenRouter Free-Models Tool

**Neues MCP-Tool:** `list_free_models`

```javascript
// In index-openrouter.js

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... bestehende Tools
    {
      name: 'list_free_models',
      description: 'List all currently free models on OpenRouter with their capabilities',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['all', 'coding', 'reasoning', 'multimodal'],
            description: 'Filter by model category'
          }
        }
      }
    }
  ]
}));

// Implementation
async function listFreeModels(category = 'all') {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  const data = await response.json();

  // Filter kostenlose Modelle
  const freeModels = data.data.filter(model =>
    model.pricing.prompt === "0" &&
    model.pricing.completion === "0"
  );

  // Kategorisierung
  const categorized = freeModels.map(model => ({
    id: model.id,
    name: model.name,
    context: model.context_length,
    capabilities: model.architecture.modality,
    category: detectCategory(model)
  }));

  // Optional: Nach Kategorie filtern
  if (category !== 'all') {
    return categorized.filter(m => m.category === category);
  }

  return categorized;
}

function detectCategory(model) {
  const name = model.name.toLowerCase();
  const desc = model.description.toLowerCase();

  if (name.includes('coder') || name.includes('codex')) return 'coding';
  if (desc.includes('reasoning') || name.includes('deepseek-r')) return 'reasoning';
  if (model.architecture.input_modalities.length > 1) return 'multimodal';
  return 'general';
}
```

---

### Phase 2: Automatisches Caching

**Problem:** API-Calls bei jeder Anfrage = langsam

**Lösung:** 24h Cache

```javascript
// free-models-cache.js

const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'free-models-cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Stunden

class FreeModelsCache {
  constructor() {
    this.cache = this.loadCache();
  }

  loadCache() {
    if (!fs.existsSync(CACHE_FILE)) {
      return { models: [], lastUpdate: 0 };
    }

    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch {
      return { models: [], lastUpdate: 0 };
    }
  }

  saveCache(models) {
    const cache = {
      models,
      lastUpdate: Date.now()
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    this.cache = cache;
  }

  isStale() {
    return Date.now() - this.cache.lastUpdate > CACHE_DURATION;
  }

  async getFreeModels(forceRefresh = false) {
    if (!forceRefresh && !this.isStale()) {
      return this.cache.models;
    }

    // API-Call
    const response = await fetch('https://openrouter.ai/api/v1/models');
    const data = await response.json();

    const freeModels = data.data.filter(model =>
      model.pricing.prompt === "0" &&
      model.pricing.completion === "0"
    );

    this.saveCache(freeModels);
    return freeModels;
  }

  getBestFreeModel(category = 'general') {
    const models = this.cache.models;

    // Priorisierung nach Kategorie
    const categoryModels = models.filter(m =>
      detectCategory(m) === category
    );

    if (categoryModels.length === 0) {
      // Fallback: Bestes allgemeines Modell
      return models[0];
    }

    // Sortiere nach Context-Länge (größer = besser)
    return categoryModels.sort((a, b) =>
      b.context_length - a.context_length
    )[0];
  }
}

module.exports = new FreeModelsCache();
```

---

### Phase 3: Workflow-Integration (v2.2.0)

**Update MCP_WORKFLOW.md:**

```markdown
## 🔄 Workflow: Stufenweise Nutzung (v2.2.0)

┌───────────────────────────────────────────────────┐
│ Claude Code (Sonnet 4.5) braucht                  │
│ ALTERNATIVE Perspektive oder Token-Ersparnis      │
└──────────────────┬────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  STUFE 1: GROQ      │
         │  (Llama 3.3 70B)    │
         │  - Kostenlos        │
         │  - 14,400/Tag       │
         └──────┬──────────────┘
                │
                └─ ❌ Limit erreicht?
                    │
                    ▼
         ┌─────────────────────────────────┐
         │  STUFE 2: OPENROUTER FREE (NEU!)│
         │  (Dynamisch erkannte Modelle)   │
         │  - Grok 4.1 Fast (2M context)   │
         │  - DeepSeek R1 (Reasoning)      │
         │  - Qwen3 Coder (Coding)         │
         │  - 20+ Modelle verfügbar        │
         │  - Täglich aktualisiert         │
         └──────┬────────────────────────── ┘
                │
                └─ ✅ Kostenlos verfügbar?
                    │
                    ├─ JA: Nutze bestes Free-Modell
                    │       └─→ FERTIG ($0.00)
                    │
                    └─ NEIN: Weiter zu Stufe 3
                        │
                        ▼
         ┌─────────────────────┐
         │  STUFE 3: GEMINI    │
         │  (2.0 Flash)        │
         │  - 15/Tag           │
         └──────┬──────────────┘
                │
                └─ ❌ Limit erreicht?
                    │
                    ▼
         ┌─────────────────────────────────┐
         │  STUFE 4: OPENROUTER PAID       │
         │  (Nur wenn NICHTS anderes geht) │
         │  - GPT-4 Turbo (OpenAI)         │
         │  - Llama 3.1 405B (Meta)        │
         └─────────────────────────────────┘
```

---

### Phase 4: Intelligente Modell-Auswahl

**Automatische Kategorie-Erkennung:**

```javascript
async function selectBestFreeModel(task) {
  const cache = require('./free-models-cache');
  const freeModels = await cache.getFreeModels();

  // Aufgaben-Kategorie erkennen
  let category = 'general';

  if (task.includes('code') || task.includes('function') || task.includes('bug')) {
    category = 'coding';
  } else if (task.includes('reasoning') || task.includes('logic') || task.includes('proof')) {
    category = 'reasoning';
  } else if (task.includes('image') || task.includes('video')) {
    category = 'multimodal';
  }

  // Bestes kostenloses Modell für Kategorie
  const bestModel = cache.getBestFreeModel(category);

  return {
    model: bestModel.id,
    reason: `Best free ${category} model: ${bestModel.name}`,
    context: bestModel.context_length,
    cost: 0
  };
}
```

---

## 📊 Entscheidungs-Matrix (v2.2.0)

| Aufgabe | Groq | OpenRouter Free | Gemini | OpenRouter Paid |
|---------|------|-----------------|--------|-----------------|
| **Triviale Frage** | ✅ **1. Wahl** | ✅ Fallback | ⚠️ Sparen | ❌ Skip |
| **Coding-Task** | ✅ **1. Wahl** | ✅ Qwen3 Coder (kostenlos!) | ❌ Skip | ⚠️ Nur wenn nötig |
| **Reasoning** | ✅ **1. Wahl** | ✅ DeepSeek R1 (kostenlos!) | ❌ Skip | ⚠️ Nur wenn nötig |
| **Bulk-Operation** | ✅ **1. Wahl** | ✅ Grok 4.1 Fast (2M context!) | ❌ Skip | ❌ Skip |
| **Groq-Limit erreicht** | ❌ Limit | ✅ **DIREKT HIERHER** | ⚠️ Wenn OR-Free leer | ⚠️ Letzter Ausweg |

**Neue Hierarchie:**
```
1. GROQ (14,400/Tag)           → Immer zuerst
2. OPENROUTER FREE (Dynamisch) → Wenn Groq-Limit erreicht ⭐ NEU
3. GEMINI (15/Tag)             → Nur wenn OR-Free leer
4. OPENROUTER PAID             → Absoluter Notfall
```

---

## 🚀 Implementierungs-Roadmap

### Phase 1 (2h): Tool `list_free_models`
- ✅ API-Integration in `index-openrouter.js`
- ✅ Kategorisierung (coding, reasoning, multimodal)
- ✅ Tests schreiben

### Phase 2 (1h): Caching-System
- ✅ `free-models-cache.js` erstellen
- ✅ 24h Cache-Logik
- ✅ Automatisches Refresh

### Phase 3 (2h): Workflow-Update
- ✅ MCP_WORKFLOW.md v2.2.0
- ✅ Neue Hierarchie dokumentieren
- ✅ CLAUDE.md anpassen

### Phase 4 (3h): Intelligente Auswahl
- ✅ Task-Kategorie-Erkennung
- ✅ Automatische Modell-Auswahl
- ✅ Fallback-Logik

**Total:** ~8 Stunden

---

## 💰 Kosten-Einsparung

### Beispiel-Szenario: 100 Requests/Tag

**Alt (ohne dynamische Free-Models):**
```
Groq:             14,400 Requests = $0.00
Groq-Limit:       Reached
Gemini:           15 Requests     = $0.00
Gemini-Limit:     Reached
OpenRouter Paid:  85 Requests     = $0.85 (bei Llama 3.1 70B)
────────────────────────────────────────
TOTAL:            $0.85/Tag = $25.50/Monat
```

**Neu (mit dynamischen Free-Models):**
```
Groq:             14,400 Requests = $0.00
Groq-Limit:       Reached
OR Free (Grok):   85 Requests     = $0.00 ⭐
Gemini:           0 Requests      = $0.00 (nicht genutzt)
OR Paid:          0 Requests      = $0.00 (nicht genutzt)
────────────────────────────────────────
TOTAL:            $0.00/Tag = $0.00/Monat ⭐
```

**Ersparnis:** $25.50/Monat → $0/Monat = **100% Ersparnis!**

---

## 📋 API-Beispiele

### 1. Alle kostenlosen Modelle auflisten

**Request:**
```javascript
// Via MCP-Tool
{
  "tool": "list_free_models",
  "arguments": {
    "category": "all"
  }
}
```

**Response:**
```json
{
  "models": [
    {
      "id": "x-ai/grok-4.1-fast:free",
      "name": "xAI: Grok 4.1 Fast (free)",
      "context": 2000000,
      "category": "general",
      "capabilities": "text+image->text"
    },
    {
      "id": "kwaipilot/kat-coder-pro:free",
      "name": "Kwaipilot: KAT-Coder-Pro V1 (free)",
      "context": 256000,
      "category": "coding",
      "capabilities": "text->text"
    }
  ],
  "total": 20,
  "last_update": "2025-11-24T10:30:00Z"
}
```

---

### 2. Bestes kostenloses Coding-Modell

**Request:**
```javascript
{
  "tool": "list_free_models",
  "arguments": {
    "category": "coding"
  }
}
```

**Response:**
```json
{
  "models": [
    {
      "id": "qwen/qwen3-coder:free",
      "name": "Qwen: Qwen3 Coder 480B A35B (free)",
      "context": 32768,
      "category": "coding",
      "recommendation": "Best for coding tasks"
    },
    {
      "id": "kwaipilot/kat-coder-pro:free",
      "name": "Kwaipilot: KAT-Coder-Pro V1 (free)",
      "context": 256000,
      "category": "coding"
    }
  ]
}
```

---

## ⚠️ Limitierungen & Fallstricke

### 1. Rate-Limits bei Free-Models

**Problem:** Auch kostenlose Modelle haben Limits!

**Lösung:**
```javascript
// Tracking pro Free-Model
const freeModelUsage = {
  'x-ai/grok-4.1-fast:free': { count: 42, limit: 100 },
  'qwen/qwen3-coder:free': { count: 5, limit: 50 }
};

// Bei Request-Fehler → Nächstes Free-Model
async function callWithFallback(models, prompt) {
  for (const model of models) {
    try {
      return await callOpenRouter(model.id, prompt);
    } catch (error) {
      if (error.status === 429) {
        console.log(`${model.id} rate limit reached, trying next...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error('All free models rate limited!');
}
```

---

### 2. Modell-Qualität variiert

**Problem:** Nicht alle Free-Models sind gleich gut!

**Lösung:** Qualitäts-Scoring
```javascript
const modelQuality = {
  'x-ai/grok-4.1-fast:free': 9.0,      // Sehr gut
  'deepseek/deepseek-r1-0528:free': 8.5, // Gut
  'qwen/qwen3-coder:free': 8.0,        // Gut für Coding
  'google/gemma-3n-e2b-it:free': 6.0   // Okay
};

function selectBestFreeModel(category) {
  return freeModels
    .filter(m => m.category === category)
    .sort((a, b) => modelQuality[b.id] - modelQuality[a.id])[0];
}
```

---

### 3. Gemini API

**Problem:** Gemini hat keine öffentliche Models-API

**Lösung:** Hardcoded Free-Tier-Models
```javascript
const geminiModels = [
  {
    name: 'gemini-2.0-flash',
    free: true,
    limit: 15,
    pricing: { prompt: 0, completion: 0 }
  },
  {
    name: 'gemini-1.5-pro',
    free: false,
    pricing: { prompt: 0.00125, completion: 0.005 }
  }
];
```

---

## 🎯 Workflow-Beispiel (v2.2.0)

### Szenario: Code-Review nach Groq-Limit

```
1. User: "Reviewe diese 50 Dateien"
2. Claude: Token-Estimate = 30,000 Tokens
3. Claude: Groq zuerst versuchen
4. Groq: ❌ 429 Too Many Requests (Limit erreicht)
5. Claude: ✅ OpenRouter Free-Models prüfen
6. Cache: 20 Free-Models verfügbar
7. Kategorie: "coding" erkannt
8. Best Match: qwen/qwen3-coder:free (480B A35B)
9. Call OpenRouter mit Qwen3 Coder
10. Response: ✅ Erfolgreich, $0.00 Kosten
11. User: Sieht Kosten-Info:
    "Service: OpenRouter Free (Qwen3 Coder)
     Kosten: $0.00
     Requests heute: Groq (14,400), OR Free (1)"
```

---

## 📚 Referenzen

- [OpenRouter Models API](https://openrouter.ai/api/v1/models)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Gemini Pricing](https://ai.google.dev/pricing)

---

**Status:** 📋 Konzept fertig, Implementation ausstehend
**Nächster Schritt:** Phase 1 implementieren (Tool `list_free_models`)
**Geschätzte Zeit:** 8 Stunden
**Erwartete Ersparnis:** $25+/Monat
