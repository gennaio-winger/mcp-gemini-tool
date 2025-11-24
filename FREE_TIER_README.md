# 🆓 OpenRouter Free-Tier Tracker

Automatisches Limit-Tracking für kostenlose OpenRouter-Modelle mit Integration in Claude Code via MCP-Server.

---

## 📊 Überblick

Dieses System trackt die Nutzung von **7 kostenlosen OpenRouter-Modellen** und warnt automatisch bei niedrigen Limits. Da OpenRouter keine Rate-Limit-Headers für Free-Modelle zurückgibt, erfolgt die Zählung **manuell**.

### ✨ Features

- ✅ **7 Top Free-Modelle** (xAI, Meta, Google, Alibaba, NVIDIA, Mistral)
- ✅ **Automatisches Limit-Tracking** (50 Requests/Tag)
- ✅ **Warnung bei niedrigem Limit** (<10 Requests)
- ✅ **Status-Übersicht** mit visuellen Progress-Bars
- ✅ **Best-Model-Selection** (wählt schnellstes verfügbares Modell)
- ✅ **Reset-Timer** (automatisch um Mitternacht)
- ✅ **MCP-Server-Integration** für Claude Code

---

## 🎯 Die 7 Free-Modelle

| # | Modell | Provider | Speed | Spezialisierung | Shortcut |
|---|--------|----------|-------|-----------------|----------|
| 1 | **Mistral 7B Instruct** | Mistral AI | **365ms** ⚡⚡⚡ | General | `mistral-7b-free` |
| 2 | **Nemotron Nano 12B VL** | NVIDIA | 628ms ⚡⚡ | **Vision** 👁️ | `nemotron-free` |
| 3 | **Qwen3 Coder 480B** | Alibaba | 901ms ⚡ | **Coding** 💻 | `qwen-coder-free` |
| 4 | **Gemini 2.0 Flash Exp** | Google | 961ms | Google AI | `gemini-free` |
| 5 | **Grok 4.1 Fast** | xAI | 1226ms | **2M context** 📚 | `grok-free` |
| 6 | **Llama 3.3 70B Instruct** | Meta | 1665ms | Large Model | `llama-70b-free` |
| 7 | **Llama 3.2 3B Instruct** | Meta | 2089ms | Small/Fast | `llama-3b-free` |

### 🏆 Empfehlungen

- **Schnellste Antworten**: Mistral 7B (365ms)
- **Vision-Tasks**: Nemotron Nano VL (Bilder, Screenshots)
- **Code-Generierung**: Qwen3 Coder (480B Parameter!)
- **Lange Texte**: Grok 4.1 Fast (2M Token Context!)
- **Allgemein**: Gemini 2.0 Flash oder Llama 3.3 70B

---

## 🚀 Installation & Setup

### 1. Voraussetzungen

```bash
# Node.js 18+ erforderlich
node --version

# OpenRouter API-Key benötigt
# Kostenlos bei https://openrouter.ai/keys
```

### 2. Dateien

Das System besteht aus:

- **`free-tier-tracker.json`** - Tracker-Datenbank (automatisch erstellt)
- **`free-tier-tracker.js`** - Tracker-Modul (CLI & API)
- **`index-openrouter.js`** - MCP-Server mit Free-Tier-Integration
- **`test-*.js`** - Test-Skripte

### 3. API-Key setzen

```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
```

---

## 📖 Nutzung

### CLI-Befehle

```bash
# Status aller Modelle anzeigen
node free-tier-tracker.js status

# Bestes verfügbares Modell anzeigen
node free-tier-tracker.js best

# Alle Limits zurücksetzen (Testing)
node free-tier-tracker.js reset
```

### Beispiel-Output: Status

```
📊 Free-Tier Status Report

════════════════════════════════════════════════════════════════════════

Mistral 7B Instruct (Mistral AI)
   Modell-ID: mistralai/mistral-7b-instruct:free
   Limit: [████████████████████] 50/50 (100.0%)
   Total Requests: 0

Qwen3 Coder (Alibaba)
   Modell-ID: qwen/qwen3-coder:free
   Limit: [██████████░░░░░░░░░░] 25/50 (50.0%)
   Total Requests: 25
   ⚠️  ACHTUNG: Nur noch 9 Requests verfügbar!

...

════════════════════════════════════════════════════════════════════════
Letztes Sync: 24.11.2025, 15:30:12
Tracker-Version: 3.0.0
```

### Programmatische Nutzung

```javascript
import {
  updateModelLimits,
  showStatus,
  getBestAvailableModel,
  hasRequestsAvailable
} from './free-tier-tracker.js';

// Nach jedem API-Call den Tracker aktualisieren
await updateModelLimits('mistralai/mistral-7b-instruct:free');

// Status anzeigen
await showStatus();

// Bestes Modell wählen
const best = await getBestAvailableModel();
console.log(`Nutze: ${best.name}`); // "Mistral 7B Instruct"

// Prüfen ob Requests verfügbar
const available = await hasRequestsAvailable('grok-free');
```

---

## 🔧 MCP-Server-Integration

### MCP-Server starten

```bash
# OpenRouter MCP-Server mit Free-Tier-Support starten
node index-openrouter.js
```

### Verfügbare Tools in Claude Code

#### 1. `ask_openrouter_free`

Frage ein kostenloses Modell mit automatischem Limit-Tracking.

**Parameter:**
- `prompt` (required): Die Frage/Aufgabe
- `model` (optional): Modell-Shortcut oder "auto" (default)
- `temperature` (optional): 0.0-2.0 (default: 0.7)

**Beispiele:**

```javascript
// Auto-Select (schnellstes verfügbares Modell)
ask_openrouter_free({
  prompt: "Erkläre Rekursion in Python"
})

// Spezifisches Modell für Coding
ask_openrouter_free({
  prompt: "Schreibe eine Funktion für Fibonacci",
  model: "qwen-coder-free"
})

// Vision-Task
ask_openrouter_free({
  prompt: "Beschreibe was auf diesem Bild zu sehen ist",
  model: "nemotron-free"
})
```

#### 2. `free_tier_status`

Zeigt den aktuellen Status aller Free-Modelle.

```javascript
free_tier_status()
// → Zeigt Progress-Bars, verbleibende Requests, Reset-Zeiten
```

#### 3. `openrouter_stats`

Zeigt allgemeine OpenRouter-Statistik (Credits, Kosten, etc.)

---

## ⚙️ Konfiguration

### Limits anpassen

Die Limits sind in `free-tier-tracker.json` konfiguriert:

```json
{
  "models": {
    "mistralai/mistral-7b-instruct:free": {
      "limit": 50,          // ← Anpassen auf 1000 mit 10+ Credits
      "remaining": 50,
      ...
    }
  }
}
```

**OpenRouter Limits:**
- **50 Requests/Tag** (Standard, kostenlos)
- **1000 Requests/Tag** (mit 10+ Credits gekauft)
- **20 Requests/Minute** (bei allen Free-Modellen)

### Warnungs-Schwellwert

In `free-tier-tracker.js` (Zeile 15):

```javascript
const LOW_LIMIT_WARNING = 10; // Warnung bei < 10 Requests
```

---

## 🧪 Testing

### Alle Modelle testen

```bash
# Teste Top 10 Free-Modelle
node test-best-free-models.js

# Teste neue Modelle von OpenRouter-Liste
node test-new-free-models.js

# Test mit Tracker-Update
node test-free-tracker.js
```

### Test-Output

```
🧪 Teste: Mistral 7B Instruct (7B)
──────────────────────────────────────────
✅ FUNKTIONIERT!
   Antwort: "Hi!"
   Response-Zeit: 365ms
   Tokens: 30

✅ Funktionierende Modelle: 7/8
❌ Nicht funktionierende: 1/8
```

---

## 📊 Tracker-Datenstruktur

### `free-tier-tracker.json`

```json
{
  "models": {
    "mistralai/mistral-7b-instruct:free": {
      "name": "Mistral 7B Instruct",
      "provider": "Mistral AI",
      "size": "7B",
      "category": "General",
      "limit": 50,
      "remaining": 50,
      "resetTime": "2025-11-25T00:00:00.000Z",
      "lastUpdated": "2025-11-24T15:30:12.456Z",
      "totalRequests": 0,
      "avgResponseTime": 365,
      "working": true,
      "rank": 1
    }
  },
  "metadata": {
    "created": "2025-11-24T15:00:00Z",
    "lastSync": "2025-11-24T15:30:12Z",
    "version": "3.0.0",
    "totalModels": 7
  }
}
```

### Felder

- **`limit`**: Max. Requests/Tag (50 oder 1000)
- **`remaining`**: Verbleibende Requests
- **`resetTime`**: Wann Reset erfolgt (Mitternacht)
- **`totalRequests`**: Gesamt-Requests seit Start
- **`avgResponseTime`**: Durchschnittliche Antwortzeit (ms)
- **`rank`**: Ranking nach Speed (1 = schnellstes)

---

## 🎯 Best Practices

### 1. Modell-Auswahl

```javascript
// ✅ RICHTIG: Auto-Select für beste Performance
ask_openrouter_free({ prompt: "...", model: "auto" })

// ✅ RICHTIG: Spezifisches Modell für Task
ask_openrouter_free({
  prompt: "Code für...",
  model: "qwen-coder-free"  // Coding-spezialisiert
})

// ❌ FALSCH: Langsames Modell für einfache Tasks
ask_openrouter_free({
  prompt: "Was ist 2+2?",
  model: "llama-70b-free"  // Overkill!
})
```

### 2. Limit-Management

```javascript
// Vor wichtigen Tasks prüfen
const available = await hasRequestsAvailable('qwen-coder-free');
if (!available) {
  const best = await getBestAvailableModel();
  console.log(`Wechsle zu: ${best.name}`);
}
```

### 3. Error-Handling

```javascript
try {
  await updateModelLimits('mistral-7b-free');
} catch (error) {
  if (error.status === 429) {
    console.warn('Rate-Limit erreicht! Warte oder nutze anderes Modell.');
    const best = await getBestAvailableModel();
    // Fallback zu anderem Modell
  }
}
```

---

## 🔍 Troubleshooting

### Problem: "Modell nicht gefunden"

**Ursache:** Modell-ID falsch oder nicht im Tracker.

**Lösung:**
```bash
# Status prüfen
node free-tier-tracker.js status

# Modell-IDs anzeigen
jq '.models | keys' free-tier-tracker.json
```

### Problem: "Alle Modelle bei 0 Requests"

**Ursache:** Tages-Limit erreicht (50 Requests).

**Lösung:**
- Warte bis Mitternacht (Reset)
- ODER kaufe 10+ Credits für 1000/Tag
- ODER nutze lokalen Reset für Testing: `node free-tier-tracker.js reset`

### Problem: Error 429 bei API-Calls

**Ursache:** Provider-seitiges Rate-Limit (nicht unser Tracker).

**Lösung:**
- Warte 1-2 Minuten
- Nutze anderes Modell
- Manche Modelle sind temporär überlastet

---

## 📚 API-Referenz

### Funktionen

#### `loadTracker()`
Lädt Tracker-Daten aus JSON-Datei.

**Returns:** `Promise<Object>` - Tracker-Objekt

---

#### `saveTracker(data)`
Speichert Tracker-Daten in JSON-Datei.

**Parameters:**
- `data` (Object): Tracker-Objekt

**Returns:** `Promise<boolean>` - Erfolg

---

#### `updateModelLimits(modelId, rateLimitHeaders, manualCount)`
Aktualisiert Limit-Informationen eines Modells.

**Parameters:**
- `modelId` (string): Modell-ID (z.B. `"mistralai/mistral-7b-instruct:free"`)
- `rateLimitHeaders` (Object, optional): Rate-Limit-Headers (falls vorhanden)
- `manualCount` (boolean, default: true): Manuelle Zählung aktivieren

**Returns:** `Promise<boolean>` - Erfolg

**Beispiel:**
```javascript
await updateModelLimits('mistral-7b-free', {}, true);
```

---

#### `showStatus()`
Gibt Status-Report aller Modelle in Console aus.

**Returns:** `Promise<void>`

---

#### `getBestAvailableModel()`
Gibt das Modell mit den meisten verbleibenden Requests zurück.

**Returns:** `Promise<Object>` - Model-Objekt mit ID und Daten

**Beispiel:**
```javascript
const best = await getBestAvailableModel();
// { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B", remaining: 50, ... }
```

---

#### `hasRequestsAvailable(modelId)`
Prüft ob Modell noch Requests übrig hat.

**Parameters:**
- `modelId` (string): Modell-ID

**Returns:** `Promise<boolean>` - `true` wenn Requests verfügbar

---

#### `resetAllLimits()`
Setzt alle Limits auf Maximum zurück (nur für Testing!).

**Returns:** `Promise<boolean>` - Erfolg

---

## 📝 Changelog

### Version 3.0.0 (2025-11-24)
- ✅ 7 Free-Modelle integriert (war vorher 5)
- ✅ Neue Modelle: Mistral 7B, Llama 3.2 3B
- ✅ Sortierung nach Speed (rank-Feld)
- ✅ Verbesserte Dokumentation

### Version 2.0.0 (2025-11-24)
- ✅ 5 Free-Modelle getestet und integriert
- ✅ Manuelle Request-Zählung (keine Headers)
- ✅ Best-Model-Selection
- ✅ CLI-Interface

### Version 1.0.0 (2025-11-24)
- ✅ Initiales Tracker-System
- ✅ Basis-Datenstruktur

---

## 🔗 Links

- **OpenRouter**: https://openrouter.ai
- **OpenRouter Models**: https://openrouter.ai/models?max_price=0
- **OpenRouter API Keys**: https://openrouter.ai/keys
- **OpenRouter Credits**: https://openrouter.ai/credits
- **OpenRouter Docs**: https://openrouter.ai/docs

---

## 📄 Lizenz

Dieses Projekt ist Teil des LACRYMAE-Projekts und für den internen Gebrauch bestimmt.

---

## 🙏 Credits

- **OpenRouter** - Multi-Model API Gateway
- **xAI, Meta, Google, Alibaba, NVIDIA, Mistral** - Free-Model Provider
- **Claude Code** - AI-Coding-Assistent
- **MCP SDK** - Model Context Protocol

---

**Version:** 3.0.0
**Datum:** 2025-11-24
**Autor:** Claude Code (Anthropic)
