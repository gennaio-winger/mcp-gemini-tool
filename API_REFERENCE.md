# 📚 API Reference - Free-Tier-Tracker

Vollständige API-Dokumentation für das Free-Tier-Tracker-Modul.

---

## 📦 Module Import

```javascript
import {
  loadTracker,
  saveTracker,
  updateModelLimits,
  showStatus,
  getBestAvailableModel,
  hasRequestsAvailable,
  resetAllLimits
} from './free-tier-tracker.js';
```

---

## 🔧 Funktionen

### `loadTracker()`

Lädt die Tracker-Daten aus der JSON-Datei (`free-tier-tracker.json`).

#### Signatur
```javascript
async function loadTracker(): Promise<TrackerData | null>
```

#### Returns
- **`Promise<TrackerData>`** - Tracker-Objekt mit allen Modellen
- **`Promise<null>`** - Bei Fehler (Datei nicht gefunden, Parse-Error)

#### TrackerData Type
```typescript
interface TrackerData {
  models: {
    [modelId: string]: ModelData
  },
  metadata: {
    created: string,
    lastSync: string | null,
    version: string,
    totalModels: number,
    notes: string
  }
}

interface ModelData {
  name: string,
  provider: string,
  size: string,
  category: string,
  limit: number,
  remaining: number,
  resetTime: string | null,
  lastUpdated: string | null,
  totalRequests: number,
  avgResponseTime: number,
  working: boolean,
  rank: number
}
```

#### Beispiel
```javascript
const tracker = await loadTracker();

if (tracker) {
  console.log(`Gefunden: ${tracker.metadata.totalModels} Modelle`);
  console.log(`Version: ${tracker.metadata.version}`);
} else {
  console.error('Tracker konnte nicht geladen werden');
}
```

#### Errors
- Gibt `null` zurück und loggt Fehler in Console bei:
  - Datei nicht gefunden
  - JSON-Parse-Fehler
  - Lese-Berechtigung fehlt

---

### `saveTracker(data)`

Speichert die Tracker-Daten in die JSON-Datei.

#### Signatur
```javascript
async function saveTracker(data: TrackerData): Promise<boolean>
```

#### Parameters
- **`data`** (TrackerData, required) - Vollständiges Tracker-Objekt

#### Returns
- **`Promise<true>`** - Bei erfolgreicher Speicherung
- **`Promise<false>`** - Bei Fehler

#### Beispiel
```javascript
const tracker = await loadTracker();

// Modifikation
tracker.metadata.lastSync = new Date().toISOString();
tracker.models['mistralai/mistral-7b-instruct:free'].remaining--;

// Speichern
const success = await saveTracker(tracker);

if (success) {
  console.log('✅ Tracker gespeichert');
} else {
  console.error('❌ Speichern fehlgeschlagen');
}
```

#### Errors
- Gibt `false` zurück und loggt Fehler bei:
  - Schreib-Berechtigung fehlt
  - JSON-Stringify-Fehler
  - Disk voll

---

### `updateModelLimits(modelId, rateLimitHeaders, manualCount)`

Aktualisiert die Limit-Informationen eines Modells nach einem API-Call.

#### Signatur
```javascript
async function updateModelLimits(
  modelId: string,
  rateLimitHeaders?: RateLimitHeaders,
  manualCount?: boolean
): Promise<boolean>
```

#### Parameters
- **`modelId`** (string, required) - Volle Modell-ID (z.B. `"mistralai/mistral-7b-instruct:free"`)
- **`rateLimitHeaders`** (Object, optional, default: `{}`) - Rate-Limit-Headers vom API-Response
- **`manualCount`** (boolean, optional, default: `true`) - Manuelle Zählung aktivieren

#### RateLimitHeaders Type
```typescript
interface RateLimitHeaders {
  'x-ratelimit-limit-requests'?: string,
  'x-ratelimit-remaining-requests'?: string,
  'x-ratelimit-reset-requests'?: string
}
```

#### Returns
- **`Promise<true>`** - Bei erfolgreicher Aktualisierung
- **`Promise<false>`** - Bei Fehler (Modell nicht gefunden)

#### Behavior
- **Mit Headers:** Nutzt Werte aus `rateLimitHeaders`
- **Ohne Headers (manualCount=true):**
  - Dekrementiert `remaining` um 1
  - Setzt `resetTime` auf nächste Mitternacht (falls noch nicht gesetzt)
  - Inkrementiert `totalRequests` um 1
- **Warnung:** Zeigt Warnung bei `remaining < 10`

#### Beispiel 1: Basis-Nutzung (ohne Headers)
```javascript
// Nach erfolgreichem API-Call
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  // ... Request-Config
});

if (response.ok) {
  // Tracker aktualisieren (manuelle Zählung)
  await updateModelLimits('mistralai/mistral-7b-instruct:free');
}
```

#### Beispiel 2: Mit Rate-Limit-Headers (falls verfügbar)
```javascript
const response = await fetch(...);

const headers = {
  'x-ratelimit-limit-requests': response.headers.get('x-ratelimit-limit-requests'),
  'x-ratelimit-remaining-requests': response.headers.get('x-ratelimit-remaining-requests'),
  'x-ratelimit-reset-requests': response.headers.get('x-ratelimit-reset-requests')
};

await updateModelLimits('mistralai/mistral-7b-instruct:free', headers);
```

#### Beispiel 3: Nur Tracking ohne Dekrement
```javascript
// manualCount=false → keine Änderung an remaining
await updateModelLimits('mistralai/mistral-7b-instruct:free', {}, false);
```

#### Warnings
Zeigt Warnung in Console wenn:
- `remaining < 10` (konfigurierbar via `LOW_LIMIT_WARNING`)
- Inkl. verbleibende Zeit bis Reset

```
⚠️  WARNUNG: Mistral 7B Instruct hat nur noch 8 Requests übrig!
   Reset in ca. 6 Stunden
```

---

### `showStatus()`

Gibt einen formatierten Status-Report aller Modelle in die Console aus.

#### Signatur
```javascript
async function showStatus(): Promise<void>
```

#### Returns
- **`Promise<void>`** - Keine Rückgabe, nur Console-Output

#### Output-Format
```
📊 Free-Tier Status Report

════════════════════════════════════════════════════════════════════════════════

Mistral 7B Instruct (Mistral AI)
   Modell-ID: mistralai/mistral-7b-instruct:free
   Limit: [████████████████████] 50/50 (100.0%)
   Total Requests: 0

Qwen3 Coder (Alibaba)
   Modell-ID: qwen/qwen3-coder:free
   Limit: [██████████░░░░░░░░░░] 25/50 (50.0%)
   Total Requests: 25
   Letztes Update: 24.11.2025, 15:30:12
   ⚠️  ACHTUNG: Nur noch 9 Requests verfügbar!

════════════════════════════════════════════════════════════════════════════════

Letztes Sync: 24.11.2025, 15:30:12
Tracker-Version: 3.0.0
```

#### Features
- ✅ **Progress-Bars** (20 Zeichen breit)
- ✅ **Prozent-Anzeige**
- ✅ **Reset-Zeiten** (wenn gesetzt)
- ✅ **Warnungen** bei niedrigem Limit
- ✅ **Locale-formatierte Daten** (de-DE)

#### Beispiel
```javascript
// Status ausgeben
await showStatus();

// In Script einbinden
async function dailyReport() {
  console.log('📊 Täglicher Status-Report:\n');
  await showStatus();
}
```

---

### `getBestAvailableModel()`

Gibt das Modell mit den meisten verbleibenden Requests zurück.

#### Signatur
```javascript
async function getBestAvailableModel(): Promise<BestModel | null>
```

#### BestModel Type
```typescript
interface BestModel extends ModelData {
  id: string  // Modell-ID
}
```

#### Returns
- **`Promise<BestModel>`** - Modell mit höchster `remaining`-Zahl
- **`Promise<null>`** - Bei Fehler oder keine Modelle verfügbar

#### Beispiel 1: Einfache Nutzung
```javascript
const best = await getBestAvailableModel();

if (best) {
  console.log(`🏆 Bestes Modell: ${best.name}`);
  console.log(`   Remaining: ${best.remaining}/${best.limit}`);
  console.log(`   Modell-ID: ${best.id}`);
} else {
  console.log('❌ Keine Modelle verfügbar!');
}
```

#### Beispiel 2: Auto-Selection
```javascript
async function askWithBestModel(question) {
  const model = await getBestAvailableModel();

  if (!model || model.remaining === 0) {
    throw new Error('Keine Modelle mit verfügbaren Requests!');
  }

  // API-Call mit bestem Modell
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model.id,
      messages: [{ role: 'user', content: question }]
    })
  });

  const data = await response.json();

  // Tracker aktualisieren
  await updateModelLimits(model.id);

  return data.choices[0].message.content;
}
```

#### Beispiel 3: Mit Fallback
```javascript
const best = await getBestAvailableModel();

if (best && best.remaining > 10) {
  // Genug Requests verfügbar
  return best.id;
} else {
  // Fallback zu bezahltem Modell
  return 'openai/gpt-3.5-turbo';
}
```

---

### `hasRequestsAvailable(modelId)`

Prüft ob ein bestimmtes Modell noch Requests übrig hat.

#### Signatur
```javascript
async function hasRequestsAvailable(modelId: string): Promise<boolean>
```

#### Parameters
- **`modelId`** (string, required) - Volle Modell-ID

#### Returns
- **`Promise<true>`** - Wenn `remaining > 0`
- **`Promise<false>`** - Wenn `remaining === 0` oder Modell nicht gefunden

#### Beispiel 1: Einfache Prüfung
```javascript
const available = await hasRequestsAvailable('mistralai/mistral-7b-instruct:free');

if (available) {
  console.log('✅ Requests verfügbar');
} else {
  console.log('❌ Limit erreicht');
}
```

#### Beispiel 2: Mit Fallback-Logik
```javascript
async function selectModel(preferredId, fallbackId) {
  if (await hasRequestsAvailable(preferredId)) {
    console.log(`Nutze bevorzugtes Modell: ${preferredId}`);
    return preferredId;
  }

  if (await hasRequestsAvailable(fallbackId)) {
    console.log(`Fallback zu: ${fallbackId}`);
    return fallbackId;
  }

  throw new Error('Keine Modelle verfügbar!');
}

const modelId = await selectModel(
  'qwen/qwen3-coder:free',           // Bevorzugt
  'mistralai/mistral-7b-instruct:free' // Fallback
);
```

#### Beispiel 3: Batch-Processing Guard
```javascript
async function processBatch(items) {
  const modelId = 'mistralai/mistral-7b-instruct:free';

  for (const item of items) {
    // Prüfe vor jedem Request
    if (!(await hasRequestsAvailable(modelId))) {
      console.warn('⚠️  Limit erreicht! Stoppe Batch-Processing.');
      break;
    }

    await processItem(item, modelId);
  }
}
```

---

### `resetAllLimits()`

Setzt alle Modell-Limits auf ihr Maximum zurück. **Nur für Testing!**

#### Signatur
```javascript
async function resetAllLimits(): Promise<boolean>
```

#### Returns
- **`Promise<true>`** - Bei erfolgreicher Zurücksetzung
- **`Promise<false>`** - Bei Fehler

#### Behavior
- Setzt `remaining = limit` für alle Modelle
- Setzt `resetTime = null`
- Setzt `totalRequests = 0`
- Setzt `lastUpdated = null`
- Aktualisiert `metadata.lastSync`

#### Beispiel
```javascript
// Reset durchführen
const success = await resetAllLimits();

if (success) {
  console.log('✅ Alle Limits zurückgesetzt!');

  // Status prüfen
  await showStatus();
}
```

#### ⚠️ Warnung
Diese Funktion sollte **nur für Testing** verwendet werden! In Produktion erfolgt der Reset automatisch um Mitternacht.

```javascript
// ❌ NICHT in Produktion nutzen!
if (model.remaining === 0) {
  await resetAllLimits(); // Umgeht Limits!
}

// ✅ RICHTIG: Warte auf natürlichen Reset oder nutze anderes Modell
if (model.remaining === 0) {
  const best = await getBestAvailableModel();
  // Nutze anderes Modell
}
```

---

## 🎨 Helper-Funktionen (intern)

### `createProgressBar(current, max, length)`

Erstellt eine visuelle Progress-Bar.

#### Signatur
```javascript
function createProgressBar(current: number, max: number, length: number = 20): string
```

#### Returns
- **`string`** - Progress-Bar (z.B. `"[████████░░░░░░░░░░░░]"`)

#### Beispiel
```javascript
console.log(createProgressBar(50, 100));  // [██████████░░░░░░░░░░]
console.log(createProgressBar(25, 50));   // [██████████░░░░░░░░░░]
console.log(createProgressBar(0, 50));    // [░░░░░░░░░░░░░░░░░░░░]
```

---

## 📁 Datenstruktur

### Tracker-Datei: `free-tier-tracker.json`

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
      "resetTime": null,
      "lastUpdated": null,
      "totalRequests": 0,
      "avgResponseTime": 365,
      "working": true,
      "rank": 1
    }
  },
  "metadata": {
    "created": "2025-11-24T15:00:00Z",
    "lastSync": null,
    "version": "3.0.0",
    "totalModels": 7,
    "notes": "Limit: 50/Tag (Standard) oder 1000/Tag mit 10+ Credits..."
  }
}
```

### Feld-Beschreibungen

| Feld | Type | Beschreibung |
|------|------|--------------|
| `name` | string | Anzeigename des Modells |
| `provider` | string | Anbieter (z.B. "Mistral AI", "Meta") |
| `size` | string | Modellgröße (z.B. "7B", "70B", "2M context") |
| `category` | string | Kategorie (General, Coding, Vision, etc.) |
| `limit` | number | Max. Requests/Tag (50 oder 1000) |
| `remaining` | number | Verbleibende Requests |
| `resetTime` | string\|null | ISO-8601 Timestamp für Reset |
| `lastUpdated` | string\|null | ISO-8601 Timestamp letztes Update |
| `totalRequests` | number | Gesamt-Requests seit Start |
| `avgResponseTime` | number | Durchschnittliche Response-Zeit (ms) |
| `working` | boolean | Ob Modell funktioniert |
| `rank` | number | Ranking nach Speed (1 = schnellstes) |

---

## 🔒 Konstanten

### `LOW_LIMIT_WARNING`

Schwellwert für Warnungen bei niedrigem Limit.

```javascript
const LOW_LIMIT_WARNING = 10;
```

Änderbar in `free-tier-tracker.js` Zeile 15.

### `TRACKER_FILE`

Pfad zur Tracker-JSON-Datei.

```javascript
const TRACKER_FILE = path.join(__dirname, 'free-tier-tracker.json');
```

---

## 🛠️ CLI-Nutzung

Das Modul kann auch als CLI-Tool verwendet werden:

```bash
# Status anzeigen
node free-tier-tracker.js status

# Bestes Modell
node free-tier-tracker.js best

# Reset
node free-tier-tracker.js reset

# Hilfe
node free-tier-tracker.js
```

### CLI-Implementierung

```javascript
// In free-tier-tracker.js (Zeile ~220)
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'best':
      const best = await getBestAvailableModel();
      // ...
      break;
    case 'reset':
      await resetAllLimits();
      break;
    default:
      console.log('Usage: node free-tier-tracker.js [status|best|reset]');
  }
}
```

---

## 🚨 Error-Handling

### Fehlerarten

1. **Datei nicht gefunden**
   ```javascript
   const tracker = await loadTracker();
   if (!tracker) {
     console.error('Tracker-Datei nicht gefunden!');
   }
   ```

2. **Modell nicht gefunden**
   ```javascript
   const success = await updateModelLimits('invalid-model-id');
   // → false, Fehler geloggt in Console
   ```

3. **JSON-Parse-Fehler**
   ```javascript
   // Tritt auf bei korrupter Tracker-Datei
   const tracker = await loadTracker(); // → null
   ```

### Best Practices

```javascript
// ✅ IMMER Rückgabewerte prüfen
const tracker = await loadTracker();
if (!tracker) {
  // Fallback oder Fehler-Handling
  return;
}

// ✅ Try-Catch für kritische Operationen
try {
  await updateModelLimits(modelId);
} catch (error) {
  console.error('Fehler beim Tracker-Update:', error);
}
```

---

## 📚 TypeScript-Definitionen

```typescript
// free-tier-tracker.d.ts
declare module './free-tier-tracker' {
  export interface ModelData {
    name: string;
    provider: string;
    size: string;
    category: string;
    limit: number;
    remaining: number;
    resetTime: string | null;
    lastUpdated: string | null;
    totalRequests: number;
    avgResponseTime: number;
    working: boolean;
    rank: number;
  }

  export interface TrackerData {
    models: {
      [modelId: string]: ModelData;
    };
    metadata: {
      created: string;
      lastSync: string | null;
      version: string;
      totalModels: number;
      notes: string;
    };
  }

  export interface RateLimitHeaders {
    'x-ratelimit-limit-requests'?: string;
    'x-ratelimit-remaining-requests'?: string;
    'x-ratelimit-reset-requests'?: string;
  }

  export interface BestModel extends ModelData {
    id: string;
  }

  export function loadTracker(): Promise<TrackerData | null>;
  export function saveTracker(data: TrackerData): Promise<boolean>;
  export function updateModelLimits(
    modelId: string,
    rateLimitHeaders?: RateLimitHeaders,
    manualCount?: boolean
  ): Promise<boolean>;
  export function showStatus(): Promise<void>;
  export function getBestAvailableModel(): Promise<BestModel | null>;
  export function hasRequestsAvailable(modelId: string): Promise<boolean>;
  export function resetAllLimits(): Promise<boolean>;
}
```

---

## 🔗 Siehe auch

- [FREE_TIER_README.md](./FREE_TIER_README.md) - Hauptdokumentation
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Praktische Beispiele

---

**Version:** 1.0.0
**Datum:** 2025-11-24
**Autor:** Claude Code
