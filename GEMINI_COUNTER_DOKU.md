# Gemini Request-Counter - Dokumentation

**Erstellt:** 2025-11-24
**Version:** 1.0.0

---

## 📋 Übersicht

Der Gemini Request-Counter ist ein Modul zur automatischen Überwachung und Limitierung von API-Requests an Google Gemini 2.0 Flash. Google's Free Tier erlaubt nur **~15 Requests pro Tag**, weshalb ein striktes Tracking essentiell ist.

---

## 🎯 Warum ein Request-Counter für Gemini?

**Problem:**
- Google Gemini Free Tier: Nur ~15 Requests/Tag
- Sehr niedriges Limit (im Vergleich zu Groq's 14,400/Tag)
- Keine API-Informationen über verbleibende Requests
- Limit-Überschreitung führt zu 429-Fehlern

**Lösung:**
- Automatisches Tracking jedes Requests
- Frühzeitiger Warnungen bei 60%, 80%, 93% Nutzung
- Automatischer Reset um Mitternacht
- Blockiert weitere Requests bei Limit-Erreichung

---

## 🛠️ Architektur

### Dateien

```
gemini-request-counter.js    # Counter-Modul
gemini-request-counter.json  # Persistente Daten
index.js                     # Gemini MCP-Server (nutzt Counter)
```

### Datenstruktur (JSON)

```json
{
  "date": "2025-11-24",
  "count": 3,
  "limit": 15,
  "lastRequest": "2025-11-24T14:23:45.123Z",
  "totalTokens": 45
}
```

**Felder:**
- `date`: Aktuelles Datum (YYYY-MM-DD)
- `count`: Anzahl der Requests heute
- `limit`: Tägliches Limit (15)
- `lastRequest`: Zeitstempel des letzten Requests
- `totalTokens`: Gesamt-Tokens heute (aus usageMetadata)

---

## 🔧 Implementierung

### 1. Counter-Modul (`gemini-request-counter.js`)

**Klasse: `GeminiRequestCounter`**

```javascript
class GeminiRequestCounter {
  constructor() {
    this.data = this.loadCounter();
  }

  canMakeRequest() {
    // Prüft ob Request erlaubt ist
    // Gibt zurück: { allowed, message, remaining, percentage }
  }

  increment(tokens = 0) {
    // Erhöht Counter nach erfolgreichem Request
    // Speichert Token-Count
  }

  getStats() {
    // Gibt aktuelle Statistik zurück
  }

  formatStats() {
    // Formatiert Statistik als Text mit Progress-Bar
  }
}
```

**Export:**
```javascript
export function getCounter() {
  // Singleton-Pattern für einheitliche Counter-Instanz
  if (!counterInstance) {
    counterInstance = new GeminiRequestCounter();
  }
  return counterInstance;
}
```

---

### 2. Integration in MCP-Server (`index.js`)

**Schritt 1: Counter importieren**
```javascript
import { getCounter } from './gemini-request-counter.js';
const counter = getCounter();
```

**Schritt 2: Vor jedem Request prüfen**
```javascript
// Für alle Tools außer gemini_stats
const check = counter.canMakeRequest();
if (!check.allowed) {
  return {
    content: [{
      type: 'text',
      text: `${check.message}\n\n${counter.formatStats()}`
    }],
    isError: true,
  };
}
```

**Schritt 3: Nach erfolgreichem Request erhöhen**
```javascript
const response = result.response;
const usageMetadata = response.usageMetadata || {};
const totalTokens = usageMetadata.totalTokenCount || 0;

// Counter erhöhen
counter.increment(totalTokens);
```

**Schritt 4: Info in Response anzeigen**
```javascript
let responseText = `🤖 **Gemini 2.0 Flash:**\n\n${text}`;

if (totalTokens > 0) {
  responseText += `\n\n📊 **Tokens:** ${promptTokens} prompt + ${candidatesTokens} completion = ${totalTokens} total`;
}

const stats = counter.getStats();
responseText += `\n📈 **Requests heute:** ${stats.used}/${stats.total} (${stats.percentage}%)`;
```

---

## 📊 Features

### 1. Automatisches Request-Tracking

**Bei jedem API-Call:**
```
1. Counter prüft: Limit erreicht?
   ├─ Ja  → Request blockiert, Fehlermeldung
   └─ Nein → Request erlaubt

2. API-Call wird ausgeführt

3. Counter erhöht Count + speichert Tokens

4. Response enthält Counter-Info
```

---

### 2. Tägliches Limit (15 Requests)

**Konfiguration:**
```javascript
const DAILY_LIMIT = 15;
```

**Automatischer Reset:**
```javascript
getToday() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // "2025-11-24"
}

canMakeRequest() {
  const today = this.getToday();
  if (this.data.date !== today) {
    // Neuer Tag → Counter zurücksetzen!
    this.data = this.createNewCounter();
    this.saveCounter();
  }
  // ...
}
```

---

### 3. 3-Stufen-Warnsystem

**Warnschwellen:**
```javascript
const WARNING_THRESHOLDS = {
  LOW: 0.60,    // 60% = 9 Requests
  MEDIUM: 0.80, // 80% = 12 Requests
  HIGH: 0.93,   // 93% = 14 Requests
};
```

**Warnungen:**

| Stufe | % | Requests | Warnung |
|-------|---|----------|---------|
| ✅ **Grün** | 0-59% | 0-8 | Keine Warnung |
| ⚠️ **Gelb** | 60-79% | 9-11 | "Achtung: X/15 Requests" |
| ⚠️⚠️ **Orange** | 80-92% | 12-13 | "WARNUNG: Noch X Request(s) verfügbar" |
| 🚨 **Rot** | 93-99% | 14 | "KRITISCH: Nur noch 1 Request übrig!" |
| 🛑 **Blockiert** | 100% | 15 | "LIMIT ERREICHT! Nutze Groq oder OpenRouter!" |

**Implementierung:**
```javascript
getWarningMessage(percentage) {
  if (percentage >= WARNING_THRESHOLDS.HIGH * 100) {
    return `🚨 KRITISCH: ${this.data.count}/${DAILY_LIMIT} Requests!`;
  } else if (percentage >= WARNING_THRESHOLDS.MEDIUM * 100) {
    return `⚠️⚠️ WARNUNG: ${this.data.count}/${DAILY_LIMIT} Requests!`;
  } else if (percentage >= WARNING_THRESHOLDS.LOW * 100) {
    return `⚠️ Achtung: ${this.data.count}/${DAILY_LIMIT} Requests`;
  }
  return ''; // Keine Warnung
}
```

---

### 4. Token-Tracking

**Gemini liefert detaillierte Token-Informationen:**
```json
{
  "usageMetadata": {
    "promptTokenCount": 7,
    "candidatesTokenCount": 8,
    "totalTokenCount": 15,
    "promptTokensDetails": [
      { "modality": "TEXT", "tokenCount": 7 }
    ],
    "candidatesTokensDetails": [
      { "modality": "TEXT", "tokenCount": 8 }
    ]
  }
}
```

**Im Counter gespeichert:**
```javascript
increment(tokens = 0) {
  this.data.count++;
  this.data.lastRequest = new Date().toISOString();
  this.data.totalTokens += tokens; // ← Kumulativ!
  this.saveCounter();
}
```

---

### 5. Progress-Bar & Live-Statistiken

**Funktion: `formatStats()`**

```javascript
formatStats() {
  const stats = this.getStats();

  // Progress-Bar berechnen
  const barLength = 20;
  const filledLength = Math.round((stats.used / stats.total) * barLength);
  const emptyLength = barLength - filledLength;
  const progressBar = '[' + '▓'.repeat(filledLength) + '░'.repeat(emptyLength) + ']';

  return `📊 Gemini Request-Counter
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Datum: ${stats.date}
📈 Requests heute: ${stats.used} / ${stats.total}
📊 Nutzung: ${stats.percentage}%
📝 Gesamt-Tokens: ${stats.totalTokens}
⏰ Reset in: ${stats.nextReset}

${progressBar} ${stats.percentage}%

${stats.statusEmoji} ${stats.statusText}`;
}
```

**Beispiel-Output:**
```
📊 Gemini Request-Counter
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Datum: 2025-11-24
📈 Requests heute: 3 / 15
📊 Nutzung: 20.00%
📝 Gesamt-Tokens: 45
⏰ Reset in: 09:37:15 Stunden

[▓▓▓▓░░░░░░░░░░░░░░░░] 20.00%

✅ Alles im grünen Bereich!
```

---

## 🎯 Tools

### `gemini_stats`

**Beschreibung:** Zeigt Gemini Request-Counter Statistik

**Input:** Keine Parameter

**Output:**
```
📊 Gemini Request-Counter
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Datum: 2025-11-24
📈 Requests heute: 12 / 15
📊 Nutzung: 80.00%
📝 Gesamt-Tokens: 180
⏰ Reset in: 04:23:45 Stunden

[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░] 80.00%

⚠️⚠️ WARNUNG! Bald am Limit!
```

**Nutzung in Claude Code:**
```
"Zeige mir die Gemini-Stats"
```

---

## ⚠️ Wichtige Unterschiede zu Groq

| Feature | Groq | Gemini |
|---------|------|--------|
| **Tägliches Limit** | 14,400 | 15 |
| **Warnschwellen** | 80%, 90%, 95% | 60%, 80%, 93% |
| **Verhältnis** | 1:1000 | - |
| **Kosten** | $0 | $0 (Free Tier) |
| **Token-Tracking** | Ja | Ja (detaillierter) |

**Warum niedrigere Warnungen bei Gemini?**
- Bei 15 Requests/Tag ist jeder Request wertvoll
- 60% = 9 Requests → User sollte bereits gewarnt werden
- 93% = 14 Requests → Nur noch 1 Request übrig!

---

## 🔐 Sicherheit & Persistenz

### Persistente Speicherung

**Datei:** `gemini-request-counter.json`

**Speicher-Zeitpunkt:**
- Nach jedem Request (via `increment()`)
- Bei Counter-Reset (neuer Tag)

**Lade-Zeitpunkt:**
- Bei MCP-Server-Start
- Bei jeder `canMakeRequest()` Prüfung (für Datum-Check)

**Fehlerbehandlung:**
```javascript
loadCounter() {
  try {
    if (fs.existsSync(COUNTER_FILE)) {
      const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
      return data;
    }
  } catch (error) {
    console.error('Fehler beim Laden:', error.message);
  }
  return this.createNewCounter(); // Fallback
}
```

---

## 🐛 Troubleshooting

### Problem: Counter zählt nicht

**Ursache:** MCP-Server nutzt alte Version ohne Counter-Integration

**Lösung:**
```bash
# MCP-Server neu laden
claude mcp remove gemini-tool
claude mcp add --transport stdio gemini-tool \
  --env GEMINI_API_KEY="..." \
  -- node /Users/sascha/mcp-servers/gemini-tool/index.js
```

---

### Problem: Counter-Datei fehlt/korrupt

**Ursache:** Datei gelöscht oder beschädigt

**Lösung:**
```bash
# Datei wird automatisch neu erstellt beim ersten Request
# Oder manuell erstellen:
echo '{
  "date": "2025-11-24",
  "count": 0,
  "limit": 15,
  "lastRequest": null,
  "totalTokens": 0
}' > gemini-request-counter.json
```

---

### Problem: Counter reset nicht um Mitternacht

**Ursache:** Zeit-Zone-Unterschiede oder Server läuft nicht durch

**Lösung:**
- Counter prüft bei jedem Request das Datum
- Reset erfolgt automatisch beim ersten Request des neuen Tages
- Kein Cron-Job nötig!

---

### Problem: Warnung erscheint, aber Request funktioniert

**Verhalten:** Das ist korrekt!

Warnungen blockieren **keine** Requests, sie informieren nur:
- ⚠️ Gelb = Info
- ⚠️⚠️ Orange = Achtung
- 🚨 Rot = Kritisch
- 🛑 Blockiert = STOP!

Nur bei 100% (15/15) werden Requests blockiert.

---

## 📈 Performance

**Overhead pro Request:**
- Datei lesen: ~1-5ms
- Counter prüfen: <1ms
- Counter erhöhen: <1ms
- Datei schreiben: ~1-5ms
- **Total: ~5-15ms** (vernachlässigbar bei API-Calls von 500-2000ms)

**Speicher-Nutzung:**
- JSON-Datei: ~150 Bytes
- Counter-Objekt im RAM: ~1KB

---

## 🧪 Tests

### Manueller Test

```bash
# 1. Counter-Status prüfen
cat gemini-request-counter.json

# 2. Gemini-Request machen via MCP
# In Claude Code: "Frage Gemini: Was ist 2+2?"

# 3. Counter erneut prüfen
cat gemini-request-counter.json
# → count sollte um 1 erhöht sein

# 4. Stats anzeigen
# In Claude Code: "Zeige mir die Gemini-Stats"
```

---

## 💡 Best Practices

### 1. Sparsam nutzen

Gemini hat nur 15 Requests/Tag!

**Empfehlung:**
```
Tägliche Nutzung begrenzen auf:
- Wichtige Fragen (wo Google-Wissen gebraucht wird)
- Spezielle Gemini-Features
- Als Fallback wenn Groq/OpenRouter nicht passen
```

### 2. Alternative nutzen

Bei Limit-Erreichung:
```bash
🛑 GEMINI LIMIT ERREICHT!

💡 Nutze stattdessen:
   → Groq (14,400/Tag kostenlos)
   → OpenRouter (Credits-basiert)
```

### 3. Stats regelmäßig prüfen

```bash
# Morgens vor Start
"Zeige mir die Gemini-Stats"

# Bei Nutzung beachten
# Response zeigt automatisch: X/15 Requests
```

### 4. Counter respektieren

**Nicht versuchen zu umgehen:**
- Counter-Datei löschen → Funktioniert, aber unklug
- Direkter API-Call → Umgeht Counter, riskiert 429-Fehler
- Mehrere MCP-Server → Jeder Server hat eigenen Counter

---

## 📊 Vergleich zu anderen Countern

| Feature | Groq Counter | Gemini Counter | OpenRouter |
|---------|--------------|----------------|------------|
| **Limit** | 14,400/Tag | 15/Tag | Credits |
| **Warnungen** | 3 Stufen | 3 Stufen | Keine |
| **Token-Tracking** | Ja | Ja | Ja |
| **Kosten-Tracking** | Nein | Nein | Ja |
| **Datei** | groq-request-counter.json | gemini-request-counter.json | Session-Stats |
| **Reset** | Mitternacht | Mitternacht | Bei Neustart |

---

## 🔄 Updates & Wartung

**Version 1.0.0 (2025-11-24):**
- ✅ Initiale Implementierung
- ✅ 15 Requests/Tag Limit
- ✅ 3-Stufen-Warnsystem (60%, 80%, 93%)
- ✅ Token-Tracking
- ✅ `gemini_stats` Tool
- ✅ Automatischer Reset
- ✅ Progress-Bar

**Zukünftige Verbesserungen:**
- [ ] Web-Dashboard für Counter-Übersicht
- [ ] Export zu CSV/JSON
- [ ] Historische Daten (7-Tage-Verlauf)
- [ ] Email-Alerts bei Limit-Warnung

---

## 📚 Siehe auch

- [REQUEST_COUNTER_DOKU.md](REQUEST_COUNTER_DOKU.md) - Groq Counter (ähnliche Implementierung)
- [KOSTEN_MONITORING.md](KOSTEN_MONITORING.md) - Vollständige Kosten-Übersicht
- [MODELL_VERGLEICH.md](MODELL_VERGLEICH.md) - Gemini vs. Groq vs. OpenRouter

---

**Zuletzt aktualisiert:** 2025-11-24
**Version:** 1.0.0
**Status:** ✅ Produktionsreif
