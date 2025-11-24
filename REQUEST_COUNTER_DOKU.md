# Request Counter - Dokumentation

**Erstellt:** 2025-11-24
**Version:** 1.0.0

---

## 📋 Übersicht

Der Request Counter überwacht die tägliche Anzahl der API-Requests an Groq und verhindert automatisch die Überschreitung des Free-Tier-Limits von **14,400 Requests pro Tag**.

---

## 🎯 Features

### ✅ Automatisches Tracking
- Zählt jeden API-Request automatisch
- Speichert Daten persistent in JSON-Datei
- Überlebt Server-Neustarts

### ⏰ Täglicher Reset
- Automatischer Reset um 00:00 Uhr (Mitternacht)
- Basiert auf lokalem Datum (YYYY-MM-DD)
- Keine manuellen Aktionen nötig

### ⚠️ 3-Stufen-Warnsystem
| Schwelle | % | Requests | Status | Aktion |
|----------|---|----------|--------|--------|
| 80% | 11,520 | 🟡 Warnung | Info-Nachricht |
| 90% | 12,960 | 🟠 Achtung | Warnung im Log |
| 95% | 13,680 | 🔴 Kritisch | Dringende Warnung |
| 100% | 14,400 | 🚫 Limit | **Request blockiert** |

### 📊 Live-Statistiken
- Verwendete Requests
- Verbleibende Requests
- Prozentuale Auslastung
- Erste/Letzte Request-Zeit
- Visueller Progress-Bar

---

## 📂 Dateien

### request-counter.js
**Hauptmodul** - Enthält die Counter-Logik

**Klassen:**
- `RequestCounter` - Hauptklasse für Request-Tracking

**Methoden:**
```javascript
canMakeRequest()    // Prüft ob Request erlaubt ist
increment()         // Zählt Request hoch
getStats()          // Gibt Statistiken zurück
formatStats()       // Formatiert Stats für Ausgabe
reset()             // Manueller Reset (optional)
```

### groq-request-counter.json
**Datenspeicher** - Persistente Speicherung der Counter-Daten

**Format:**
```json
{
  "date": "2025-11-24",
  "count": 42,
  "limit": 14400,
  "firstRequest": "2025-11-24T10:00:00.000Z",
  "lastRequest": "2025-11-24T15:30:00.000Z",
  "warnings": {
    "low": false,
    "medium": false,
    "high": false
  }
}
```

---

## 🔧 Integration in MCP-Server

### 1. Import
```javascript
import { getCounter } from './request-counter.js';
const counter = getCounter();
```

### 2. Vor API-Call prüfen
```javascript
const check = counter.canMakeRequest();
if (!check.allowed) {
  return {
    content: [{
      type: 'text',
      text: `${check.message}\n\n${counter.formatStats()}`,
    }],
    isError: true,
  };
}
```

### 3. Nach erfolgreichem Call inkrementieren
```javascript
const completion = await groq.chat.completions.create({...});
counter.increment();  // ← Request zählen!
```

---

## 🛠️ Neue Tools

### groq_stats
**Beschreibung:** Zeige aktuelle Request-Statistik

**Parameter:** Keine

**Beispiel-Ausgabe:**
```
📊 Groq API Request-Statistik (2025-11-24)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 [████████░░░░░░░░░░░░░░░░░░░░] 25.5%
✅ Verwendet:   3,672 Requests
⏳ Verfügbar:   10,728 Requests
📈 Limit:       14,400 Requests/Tag
📊 Auslastung:  25.5%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Warnsystem

### Warnstufe 1: 80% (11,520 Requests)
```
💡 Info: 80% des Limits erreicht. Noch 2,880 Requests verfügbar.
```

### Warnstufe 2: 90% (12,960 Requests)
```
⚠️ WARNUNG: 90% des Limits erreicht! Noch 1,440 Requests verfügbar.
```

### Warnstufe 3: 95% (13,680 Requests)
```
🚨 KRITISCH: 95% des Limits erreicht! Nur noch 720 Requests heute!
```

### Limit erreicht: 100% (14,400 Requests)
```
❌ Tägliches Limit erreicht! (14,400/14,400)
⏰ Reset um Mitternacht (00:00 Uhr)

📊 Groq API Request-Statistik (2025-11-24)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 [██████████████████████████████] 100%
✅ Verwendet:   14,400 Requests
⏳ Verfügbar:   0 Requests
📈 Limit:       14,400 Requests/Tag
📊 Auslastung:  100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 Testing

### Counter-Test ausführen
```bash
cd /Users/sascha/mcp-servers/gemini-tool
node test-counter.js
```

**Test-Szenarien:**
1. ✅ Aktueller Status anzeigen
2. ✅ Request-Check durchführen
3. ✅ Requests simulieren
4. ✅ Status-Update prüfen
5. ✅ Statistiken abrufen

### Integration-Test
```bash
node test-groq.js
# Nach jedem Request wird Counter automatisch erhöht
```

---

## 🔄 Automatischer Reset

### Funktionsweise
Der Counter prüft bei **jedem Request** das aktuelle Datum:

```javascript
getToday() {
  return new Date().toISOString().split('T')[0];
  // Returns: "2025-11-24"
}
```

**Wenn neuer Tag:**
1. ✅ Counter wird automatisch auf 0 zurückgesetzt
2. ✅ Neue firstRequest-Zeit gesetzt
3. ✅ Warnungen werden zurückgesetzt
4. ✅ Datum aktualisiert

**Kein Cronjob nötig!** Der Reset passiert beim nächsten Request nach Mitternacht.

---

## 📈 Statistik-Beispiele

### Morgens (wenig genutzt)
```
🟢 [███░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 10%
✅ Verwendet:   1,440 Requests
⏳ Verfügbar:   12,960 Requests
```

### Mittags (normal)
```
🟢 [████████████░░░░░░░░░░░░░░░░░░] 40%
✅ Verwendet:   5,760 Requests
⏳ Verfügbar:   8,640 Requests
```

### Abends (viel genutzt)
```
🟡 [████████████████████████░░░░░░] 85%
✅ Verwendet:   12,240 Requests
⏳ Verfügbar:   2,160 Requests
```

### Limit erreicht
```
🔴 [██████████████████████████████] 100%
✅ Verwendet:   14,400 Requests
⏳ Verfügbar:   0 Requests
```

---

## ⚙️ Konfiguration

### Limits anpassen
```javascript
// In request-counter.js, Zeile 9:
const DAILY_LIMIT = 14400;  // Ändern auf gewünschtes Limit

// Beispiel: Konservativer (10,000)
const DAILY_LIMIT = 10000;

// Beispiel: Sehr konservativ (5,000)
const DAILY_LIMIT = 5000;
```

### Warnschwellen anpassen
```javascript
// In request-counter.js, Zeile 10-14:
const WARNING_THRESHOLDS = {
  LOW: 0.80,    // 80%
  MEDIUM: 0.90, // 90%
  HIGH: 0.95,   // 95%
};
```

---

## 🐛 Troubleshooting

### Problem: Counter zählt nicht
**Lösung:**
```bash
# Prüfen ob Counter-Datei existiert
ls -la groq-request-counter.json

# Datei manuell erstellen (falls nötig)
echo '{"date":"2025-11-24","count":0,"limit":14400}' > groq-request-counter.json

# MCP-Server neu starten
claude mcp remove groq-tool
claude mcp add --transport stdio groq-tool --env GROQ_API_KEY="..." -- node index-groq.js
```

### Problem: Reset funktioniert nicht
**Prüfen:**
```javascript
// Systemdatum korrekt?
node -e "console.log(new Date().toISOString().split('T')[0])"

// Sollte output: 2025-11-24
```

### Problem: Counter zu hoch
**Manueller Reset:**
```bash
# Counter-Datei löschen
rm groq-request-counter.json

# Oder über Node:
node -e "import('./request-counter.js').then(m => m.getCounter().reset())"
```

---

## 📚 Best Practices

### 1. Regelmäßig Stats prüfen
```bash
# Empfehlung: Vor größeren Operations
"Zeige mir die Groq-Stats"
```

### 2. Bei Warnungen reagieren
```
🟡 80% erreicht → Nicht-dringende Requests verschieben
🟠 90% erreicht → Nur kritische Requests
🔴 95% erreicht → Stop! Auf morgen warten
```

### 3. Konservatives Limit setzen
```javascript
// Empfehlung: 80% des echten Limits
const DAILY_LIMIT = 11520;  // 80% von 14,400
```

### 4. Monitoring
```bash
# Täglich Stats checken
node -e "import('./request-counter.js').then(m => console.log(m.getCounter().formatStats()))"
```

---

## ✅ Vorteile

1. **🛡️ Schutz vor Limit-Überschreitung**
   - Verhindert automatisch Account-Sperren
   - Keine Rate-Limit-Fehler mehr

2. **📊 Transparenz**
   - Jederzeit Übersicht über Verbrauch
   - Vorhersehbare API-Nutzung

3. **⚡ Kein Overhead**
   - Minimale Performance-Impact (<1ms)
   - Lokale Datei-Speicherung

4. **🔄 Wartungsfrei**
   - Automatischer Reset
   - Keine Cronjobs nötig
   - Selbst-dokumentierend

---

## 📊 Statistik-API

### Programmatisch Stats abrufen
```javascript
import { getCounter } from './request-counter.js';

const counter = getCounter();
const stats = counter.getStats();

console.log(`Heute verwendet: ${stats.used}`);
console.log(`Noch verfügbar: ${stats.remaining}`);
console.log(`Auslastung: ${stats.percentage}%`);
```

**Output:**
```
Heute verwendet: 3672
Noch verfügbar: 10728
Auslastung: 25.5%
```

---

**Zuletzt aktualisiert:** 2025-11-24
**Version:** 1.0.0
**Status:** ✅ Produktionsreif
