# 💰 Gemini Budget-Tracking Dokumentation

**Version:** 2.4.0
**Erstellt:** 2025-11-24
**Status:** ✅ Produktionsreif

---

## 📋 Übersicht

Das Gemini Budget-Tracking-System verwaltet das FreeTrialUpgrade-Guthaben von **257,50 €** (gültig bis 23. Februar 2026). Es berechnet automatisch die Kosten für jeden Request und überwacht das verbleibende Budget.

---

## 💶 Budget-Details

| Eigenschaft | Wert |
|-------------|------|
| **Gesamt-Budget** | 257,50 € |
| **Quelle** | FreeTrialUpgrade-Aktion |
| **Gültig bis** | 23. Februar 2026 (455 Tage) |
| **Währung** | EUR (Euro) |
| **Status** | Aktiv ✅ |

---

## 💵 Preise: Gemini 2.0 Flash

| Metrik | Preis (USD) | Preis (EUR) |
|--------|-------------|-------------|
| **Input Tokens** | $0.35 / 1M | ~€0.322 / 1M |
| **Output Tokens** | $1.50 / 1M | ~€1.38 / 1M |
| **USD → EUR Kurs** | 0.92 | (Durchschnitt) |

### Beispiel-Kosten

| Request-Typ | Tokens | Kosten (EUR) |
|-------------|--------|--------------|
| Kurze Frage | 500 input + 200 output | €0.000437 |
| Code-Review | 1500 input + 800 output | €0.001587 |
| Lange Analyse | 3000 input + 2000 output | €0.003426 |

---

## 🎯 Geschätzte Nutzung

Mit dem aktuellen Budget von **257,50 €** sind möglich:

| Szenario | Requests | Tokens/Request |
|----------|----------|----------------|
| **Kurze Fragen** | ~589.000 | 700 (500+200) |
| **Standard-Nutzung** | ~162.000 | 2.300 (1500+800) |
| **Lange Analysen** | ~75.000 | 5.000 (3000+2000) |

**Durchschnitt:** ~186.000 Requests bei gemischter Nutzung

---

## 🛠️ Tools

### 1. gemini_budget

Zeigt detaillierten Budget-Status an.

**Nutzung:**
```markdown
@gemini-tool gemini_budget
```

**Ausgabe:**
```
💰 **Gemini Budget Status**

**Guthaben:** 257.50 € / 257.50 € (0.00%)
**Verbraucht:** 0.00 €
**Requests:** 0
**Gültig bis:** 2026-02-23 (455 Tage)
**Quelle:** FreeTrialUpgrade-Aktion

**Verbrauch:** [░░░░░░░░░░░░░░░░░░░░] 0.00%
```

---

### 2. ask_gemini (mit Budget-Tracking)

Normale Gemini-Anfrage mit automatischem Budget-Tracking.

**Nutzung:**
```markdown
@gemini-tool ask_gemini --prompt "Erkläre Quantencomputing"
```

**Ausgabe:**
```
🤖 **Gemini 2.0 Flash:**

Quantencomputing nutzt Quantenmechanik...

📊 **Tokens:** 10 prompt + 250 completion = 260 total
💰 **Kosten:** 0.000348 € (257.500 € verbleibend)
📈 **Requests heute:** 1 (0.00% Budget verbraucht)
```

---

### 3. gemini_stats

Zeigt Request-Statistik (ohne Budget-Details).

**Nutzung:**
```markdown
@gemini-tool gemini_stats
```

**Ausgabe:**
```
📊 **Gemini Request-Statistik**

**Datum:** 2025-11-24
**Requests heute:** 5
**Gesamt-Tokens:** 3.420
**Letzter Request:** 14:23:15
**Reset in:** 09:36:45 Stunden

ℹ️ Budget-Limits werden von gemini_budget verwaltet
```

---

## ⚠️ Warnsystem

Das System warnt automatisch bei:

### 1. Niedriges Budget (<1 €)
```
⚠️ Warnung: Nur noch 0.85 € verfügbar!
```

### 2. Hoher Verbrauch (>90%)
```
⚠️ Warnung: 92.3% des Budgets verbraucht
```

### 3. Ablaufdatum nah (≤30 Tage)
```
⚠️ Hinweis: Budget läuft in 28 Tagen ab
```

### 4. Budget aufgebraucht
```
❌ Budget aufgebraucht! Keine weiteren Requests möglich.

💰 **Gemini Budget Status**
**Guthaben:** 0.00 € / 257.50 € (100.00%)
```

### 5. Budget abgelaufen
```
❌ Budget abgelaufen! Gültig bis: 2026-02-23

💰 **Gemini Budget Status**
**Guthaben:** 123.45 € / 257.50 € (52.04%)
**Gültig bis:** 2026-02-23 (0 Tage)
```

---

## 📊 Budget-Datei

Die Budget-Daten werden in `gemini-budget.json` gespeichert:

```json
{
  "totalBudget": 257.50,
  "currency": "EUR",
  "spent": 0,
  "remaining": 257.50,
  "requestCount": 0,
  "validUntil": "2026-02-23",
  "source": "FreeTrialUpgrade-Aktion",
  "createdAt": "2025-11-24",
  "lastUpdated": "2025-11-24",
  "requests": []
}
```

### Request-Historie

Die letzten **100 Requests** werden gespeichert:

```json
{
  "requests": [
    {
      "timestamp": "2025-11-24T14:23:15.123Z",
      "model": "gemini-2.0-flash",
      "inputTokens": 10,
      "outputTokens": 250,
      "totalTokens": 260,
      "costEUR": 0.000348,
      "promptPreview": "Erkläre Quantencomputing"
    }
  ]
}
```

---

## 🔧 Technische Details

### Budget-Manager: `gemini-budget-manager.js`

**Hauptfunktionen:**

#### 1. `calculateCost(model, inputTokens, outputTokens)`

Berechnet die Kosten für einen Request in EUR.

```javascript
const cost = calculateCost('gemini-2.0-flash', 1000, 500);
// cost = 0.001012 EUR
```

#### 2. `updateBudget(model, inputTokens, outputTokens, prompt)`

Aktualisiert das Budget nach einem Request.

```javascript
const result = updateBudget('gemini-2.0-flash', 1000, 500, 'Test');
// result = {
//   cost: 0.001012,
//   spent: 0.001012,
//   remaining: 257.498988,
//   percentage: "0.00"
// }
```

#### 3. `checkBudget()`

Prüft den aktuellen Budget-Status und gibt Warnungen zurück.

```javascript
const check = checkBudget();
// check = {
//   allowed: true,
//   warning: null,
//   budget: { ... }
// }
```

#### 4. `formatBudgetStatus()`

Formatiert den Budget-Status für Ausgabe.

```javascript
const status = formatBudgetStatus();
// Gibt formatierten String zurück (siehe Tool-Ausgabe oben)
```

---

## 🔐 Sicherheit

### API-Key-Schutz

- ✅ **Offline-Only:** Key nur in `.env` Datei
- ✅ **Nie committed:** `.env` in `.gitignore`
- ✅ **Neu erstellt:** Alter Key nach GitHub-Vorfall revoked

### Budget-Protection

- ✅ **Automatischer Stop:** Bei Budget = 0
- ✅ **Ablaufdatum-Check:** Automatische Prüfung vor jedem Request
- ✅ **Warnsystem:** Frühzeitige Warnungen bei niedrigem Budget

---

## 📈 Monitoring

### Budget-Überwachung

```markdown
# Täglicher Check
@gemini-tool gemini_budget

# Nach mehreren Requests
@gemini-tool gemini_stats
```

### Durchschnittskosten

Der `gemini_budget` Tool zeigt automatisch:

```
**Ø pro Request:** 0.0014 €
**Geschätzte verbleibende Requests:** ~183.000
```

---

## 🚨 Troubleshooting

### Problem: "Budget aufgebraucht"

**Ursache:** Budget = 0 €

**Lösung:**
- Prüfe Budget-Status: `@gemini-tool gemini_budget`
- Falls Test-Umgebung: Budget manuell zurücksetzen (siehe unten)
- Falls Produktion: Neues Budget benötigt

### Problem: "Budget abgelaufen"

**Ursache:** Aktuelles Datum > 23.02.2026

**Lösung:**
- Neues Budget erforderlich
- API-Key erneuern mit neuem Trial/Paid-Plan

### Budget manuell zurücksetzen (NUR für Tests!)

```bash
# ACHTUNG: Nur in Entwicklung nutzen!
echo '{
  "totalBudget": 257.50,
  "currency": "EUR",
  "spent": 0,
  "remaining": 257.50,
  "requestCount": 0,
  "validUntil": "2026-02-23",
  "source": "FreeTrialUpgrade-Aktion",
  "createdAt": "2025-11-24",
  "lastUpdated": "2025-11-24",
  "requests": []
}' > gemini-budget.json
```

---

## 📚 Verwandte Dokumentation

- [README.md](README.md) - Projekt-Übersicht
- [CHANGELOG.md](CHANGELOG.md) - Version 2.4.0
- [GEMINI_COUNTER_DOKU.md](GEMINI_COUNTER_DOKU.md) - Request-Counter (alt)
- [LITEAPI_README.md](LITEAPI_README.md) - Ähnliches Budget-System

---

## 🎯 Best Practices

### 1. Regelmäßiges Monitoring

```markdown
# Täglich
@gemini-tool gemini_budget

# Nach 10-20 Requests
@gemini-tool gemini_stats
```

### 2. Kostenoptimierung

- Nutze kurze, präzise Prompts
- Vermeide unnötig lange Outputs
- Bei einfachen Fragen: Nutze Groq (kostenlos)
- Nur komplexe Anfragen an Gemini

### 3. Budget-Planung

Mit 257,50 € und durchschnittlich 0.0014 € pro Request:
- **Pro Tag:** ~512 Requests möglich
- **Pro Woche:** ~3.584 Requests
- **Bis 23.02.2026:** ~183.000 Requests (bei normaler Nutzung)

---

**Version:** 2.4.0 | **Status:** ✅ Einsatzbereit | **Budget:** 257,50 € bis 23.02.2026
