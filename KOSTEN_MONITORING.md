# Kosten-Monitoring für MCP-Server

**Erstellt:** 2025-11-24
**Version:** 1.0.0

---

## 📋 Übersicht

Dieses Dokument beschreibt, wie die Kosten für alle drei MCP-Server überwacht werden können.

| Service | Kosten | Limit | Monitoring-Methode | API-Unterstützung | Status |
|---------|--------|-------|-------------------|-------------------|--------|
| **Groq** | 0€ | 14,400/Tag | Request-Counter | ✅ Token-Tracking | ✅ Implementiert |
| **Gemini** | 0€ | 15/Tag | Request-Counter | ✅ Token-Tracking | ✅ Implementiert |
| **OpenRouter** | $5 Free → Pay-per-use | Credits-basiert | Kosten-Tracking + Session-Stats | ✅ Volle Kosten-API | ✅ Implementiert |

---

## 1️⃣ GROQ - Request-Counter (Bereits implementiert)

### Status: ✅ Vollständig implementiert

**Kosten:** KOSTENLOS
**Limit:** 14,400 Requests pro Tag

### Monitoring-Features

✅ **Automatisches Request-Tracking**
- Jeder API-Call wird gezählt
- Persistenter Speicher in `groq-request-counter.json`
- Automatischer Reset um Mitternacht

✅ **3-Stufen-Warnsystem**
```
80% (11,520 Requests) → ⚠️  Warnung
90% (12,960 Requests) → ⚠️⚠️  Kritisch
95% (13,680 Requests) → 🚨 Limit fast erreicht
100% (14,400 Requests) → 🛑 Blockiert weitere Requests
```

✅ **Live-Statistiken**
```bash
# In Claude Code:
"Zeige mir die Groq-Stats"

# Output:
📊 Groq Request-Counter
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Datum: 2025-11-24
📈 Requests heute: 8 / 14,400
📊 Nutzung: 0.06%
⏰ Reset: 23:51:42 Stunden

[▓░░░░░░░░░░░░░░░░░░░] 0.06%

✅ Alles im grünen Bereich!
```

### API-Response-Informationen

Groq gibt detaillierte Usage-Informationen zurück:

```json
{
  "usage": {
    "queue_time": 0.041819957,
    "prompt_tokens": 42,
    "prompt_time": 0.001230121,
    "completion_tokens": 12,
    "completion_time": 0.047524122,
    "total_tokens": 54,
    "total_time": 0.048754243
  }
}
```

**Verfügbare Metriken:**
- ✅ Prompt-Tokens
- ✅ Completion-Tokens
- ✅ Total-Tokens
- ✅ Queue-Time (Wartezeit)
- ✅ Prompt-Time
- ✅ Completion-Time
- ✅ Total-Time

**Kosten-Berechnung:** Nicht nötig (Service ist kostenlos)

### Tools

- **`groq_stats`** - Zeigt aktuelle Request-Counter-Statistik

### Implementierung

Siehe: `request-counter.js` und `REQUEST_COUNTER_DOKU.md`

---

## 2️⃣ GEMINI - Request-Counter (Neu implementiert!)

### Status: ✅ Vollständig implementiert

**Kosten:** KOSTENLOS (Free Tier)
**Limit:** 15 Requests pro Tag (sehr stark limitiert!)

### Monitoring-Features

✅ **Automatisches Request-Tracking**
- Jeder API-Call wird gezählt
- Persistenter Speicher in `gemini-request-counter.json`
- Automatischer Reset um Mitternacht

✅ **3-Stufen-Warnsystem**
```
60% (9 Requests)  → ⚠️  Achtung
80% (12 Requests) → ⚠️⚠️  Warnung
93% (14 Requests) → 🚨 Kritisch - nur noch 1 Request!
100% (15 Requests) → 🛑 Blockiert weitere Requests
```

✅ **Live-Statistiken**
```bash
# In Claude Code:
"Zeige mir die Gemini-Stats"

# Output:
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

✅ **Token-Tracking in jeder Response**

### API-Response-Informationen

Gemini gibt sehr detaillierte Token-Informationen zurück:

```json
{
  "usageMetadata": {
    "promptTokenCount": 7,
    "candidatesTokenCount": 8,
    "totalTokenCount": 15,
    "promptTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 7
      }
    ],
    "candidatesTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 8
      }
    ]
  }
}
```

**Verfügbare Metriken:**
- ✅ Prompt-Token-Count (mit Modalität)
- ✅ Candidates-Token-Count (mit Modalität)
- ✅ Total-Token-Count
- ❌ Keine Kosten-Informationen
- ❌ Keine Request-Limit-Informationen

### Kosten-Berechnung (falls kostenpflichtig)

**Preise für Gemini 2.0 Flash (Pay-per-use):**
```
Input:  $0.00001 - $0.00005 pro Token
Output: $0.00002 - $0.00010 pro Token
```

**Beispiel-Berechnung:**
```
Prompt: 7 Tokens × $0.00001 = $0.00007
Output: 8 Tokens × $0.00002 = $0.00016
─────────────────────────────────────────
TOTAL:                     = $0.00023
```

**Im Free Tier:** KOSTENLOS bis ~15 Requests/Tag

### Tools

**`gemini_stats`** - Zeigt Gemini Request-Counter Statistik

```bash
# In Claude Code:
"Zeige mir die Gemini-Stats"
```

### Implementierung

**Dateien:**
- `gemini-request-counter.js` - Counter-Modul
- `gemini-request-counter.json` - Persistente Daten
- `index.js` - MCP-Server mit Counter-Integration

**Siehe:** [GEMINI_COUNTER_DOKU.md](GEMINI_COUNTER_DOKU.md) für vollständige Implementierungs-Details

---

## 3️⃣ OPENROUTER - Vollständige Kosten-API

### Status: ✅ Volle API-Unterstützung

**Kosten:** $5 Free Credits → Pay-per-use
**Limit:** Credits-basiert (kein Request-Limit)

### Monitoring-Features

✅ **Token-Tracking in jeder Response**
✅ **Kosten-Berechnung möglich**
✅ **Generation-API für detaillierte Kosten**
✅ **Credits-Dashboard im Browser**

### API-Response-Informationen

OpenRouter gibt umfassende Usage-Informationen zurück:

```json
{
  "usage": {
    "prompt_tokens": 14,
    "completion_tokens": 8,
    "total_tokens": 22,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "audio_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "audio_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  }
}
```

**Verfügbare Metriken:**
- ✅ Prompt-Tokens (mit Cache-Details)
- ✅ Completion-Tokens (mit Details)
- ✅ Total-Tokens
- ✅ Cached-Tokens (gespart!)
- ✅ Audio-Tokens (falls verwendet)
- ✅ Reasoning-Tokens (z.B. o1-Modelle)

### Kosten-Berechnung (in Response)

**Methode 1: Token-basierte Schätzung**

Wir können Kosten basierend auf Tokens schätzen:

```javascript
// Beispiel: GPT-3.5 Turbo
const MODEL_PRICES = {
  'openai/gpt-3.5-turbo': {
    input: 0.001,   // $0.001 per 1k tokens
    output: 0.002,  // $0.002 per 1k tokens
  },
  'anthropic/claude-3.5-sonnet': {
    input: 0.003,   // $0.003 per 1k tokens
    output: 0.015,  // $0.015 per 1k tokens
  },
  'openai/gpt-4-turbo': {
    input: 0.01,    // $0.01 per 1k tokens
    output: 0.03,   // $0.03 per 1k tokens
  },
};

function calculateCost(model, promptTokens, completionTokens) {
  const prices = MODEL_PRICES[model];
  const inputCost = (promptTokens / 1000) * prices.input;
  const outputCost = (completionTokens / 1000) * prices.output;
  return inputCost + outputCost;
}

// Beispiel
const cost = calculateCost('openai/gpt-3.5-turbo', 14, 8);
// → $0.000030
```

**Methode 2: Generation-API (präzise Kosten)**

OpenRouter bietet eine Generation-API, die **exakte Kosten** zurückgibt!

```bash
# 1. Request machen (ID speichern)
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Response enthält:
# "id": "gen-abc123xyz"

# 2. Kosten abrufen mit Generation-API
curl https://openrouter.ai/api/v1/generation?id=gen-abc123xyz \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"

# Response:
{
  "data": {
    "id": "gen-abc123xyz",
    "model": "openai/gpt-3.5-turbo",
    "tokens_prompt": 14,
    "tokens_completion": 8,
    "native_tokens_prompt": 14,
    "native_tokens_completion": 8,
    "total_cost": 0.000030
  }
}
```

**⭐ Wichtig:** Die Abrechnung basiert auf `native_tokens`, nicht auf normalisierten Tokens!

### Credits-Dashboard

**Browser-basiert:**
```bash
open https://openrouter.ai/credits
```

Zeigt:
- ✅ Verfügbare Credits ($5.00 Free)
- ✅ Verbrauchte Credits
- ✅ Credit-History
- ✅ Usage pro Modell
- ✅ Credit-Käufe

### Tools

**`openrouter_stats`** - Zeigt verfügbare Informationen:

```bash
# In Claude Code:
"Zeige mir die OpenRouter-Stats"

# Output:
📊 OpenRouter Statistik
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Credits: $5.00 Free Credits bei Anmeldung
💳 Pay-per-use nach Free Credits
📊 Kosten: Ab $0.0001/Request

🎯 Verfügbare Modelle: 100+
[...]

💡 Credits prüfen: https://openrouter.ai/credits
```

### Empfohlene Monitoring-Strategie

**Option 1: Token-basierte Schätzung (schnell)**
- Preise für häufig genutzte Modelle im MCP-Server speichern
- Nach jedem Request Kosten schätzen
- Kumulierte Kosten in Session tracken

**Option 2: Generation-API (präzise)**
- Generation-ID aus Response speichern
- Periodisch (z.B. alle 10 Requests) Kosten abrufen
- Präzise Kosten-Übersicht

**Option 3: Credits-Dashboard (manuell)**
- Regelmäßig `openrouter.ai/credits` prüfen
- Alerts bei niedrigem Credit-Stand setzen
- Credit-History für Analyse nutzen

---

## 📊 Kosten-Vergleich: Beispiel-Request

**Test-Prompt:** "Was ist 2+2?"

| Service | Tokens | Kosten | Antwortzeit | Limit-Impact |
|---------|--------|--------|-------------|--------------|
| **Groq** | 54 | $0.00 | 0.05s | 1/14,400 (0.007%) |
| **Gemini** | 15 | $0.00 | 1.2s | 1/15 (6.67%) |
| **OpenRouter (GPT-3.5)** | 22 | $0.000030 | 0.8s | -$0.000030 Credits |

**Fazit:**
- Groq: Schnellste & kostenlos mit hohem Limit
- Gemini: Kostenlos aber sehr niedriges Limit
- OpenRouter: Minimal-Kosten, keine Request-Limits

---

## 🎯 Best Practices

### 1. Groq nutzen für tägliche Arbeit
```
✅ 14,400 Requests/Tag kostenlos
✅ Ultra-schnell
✅ Request-Counter schützt vor Limit
→ Ideal für Entwicklung & Testing
```

### 2. Gemini sparsam einsetzen
```
⚠️ Nur 15 Requests/Tag
✅ Automatisches Limit-Tracking
✅ Warnt bei 60%, 80%, 93%
→ Nur für spezielle Google-Features nutzen
```

### 3. OpenRouter für Production
```
✅ $5 Free Credits
✅ Keine Request-Limits
✅ 100+ Modelle verfügbar
✅ Präzises Kosten-Tracking
→ Ideal wenn Groq-Limit erreicht
```

### 4. Kosten-Bewusstsein
```
💡 Immer günstigstes passendes Modell wählen:
   - Einfache Fragen → Groq (kostenlos)
   - Code-Review → OpenRouter Claude 3.5 (~$0.01)
   - Kreative Tasks → OpenRouter GPT-4 (~$0.03)
   - Google-Wissen → Gemini (sparsam nutzen!)
```

### 5. Monitoring-Routine
```bash
# Täglich vor Start:
"Zeige mir die Groq-Stats"           # Request-Counter prüfen

# Wöchentlich:
open https://openrouter.ai/credits   # Credits-Stand prüfen

# Monatlich:
# OpenRouter Credit-History analysieren
# Gemini-Nutzung evaluieren (lohnt sich Upgrade?)
```

---

## ✅ Implementierungs-Status

### Alle Features implementiert! (2025-11-24)

**Gemini Request-Counter:**
- ✅ `gemini-request-counter.js` erstellt
- ✅ Counter in `index.js` integriert
- ✅ `gemini_stats` Tool hinzugefügt
- ✅ Token-Tracking in jeder Response
- ✅ 3-Stufen-Warnsystem (60%, 80%, 93%)

**OpenRouter Kosten-Tracking:**
- ✅ Modell-Preise für 12+ Modelle definiert
- ✅ `calculateCost()` Funktion implementiert
- ✅ Session-Stats (kumulativ) hinzugefügt
- ✅ Kosten in jeder Response angezeigt
- ✅ `openrouter_stats` erweitert

**Tests:**
- ✅ Gemini Counter getestet
- ✅ OpenRouter Kosten-Berechnung verifiziert
- ✅ Alle MCP-Server verbunden

**Siehe:**
- [GEMINI_COUNTER_DOKU.md](GEMINI_COUNTER_DOKU.md) - Gemini Counter Details
- [CHANGELOG.md](CHANGELOG.md) - Vollständige Änderungs-Historie

---

## 📚 Referenzen

### Groq
- Request-Counter: `REQUEST_COUNTER_DOKU.md`
- Implementation: `request-counter.js`
- API-Docs: https://console.groq.com/docs

### Gemini
- API-Docs: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing
- (Free Tier: ~15 Requests/Tag)

### OpenRouter
- **Usage Accounting:** https://openrouter.ai/docs/use-cases/usage-accounting
- **Generation API:** https://openrouter.ai/docs/api-reference/get-a-generation
- **Credits Dashboard:** https://openrouter.ai/credits
- **Pricing:** https://openrouter.ai/pricing
- **Models:** https://openrouter.ai/models

---

## ✅ Zusammenfassung

| Feature | Groq | Gemini | OpenRouter |
|---------|------|--------|------------|
| **Token-Tracking** | ✅ Ja | ✅ Ja | ✅ Ja |
| **Kosten-Tracking** | ❌ Nein (kostenlos) | ❌ Nein (Free Tier) | ✅ Ja (automatisch) |
| **Request-Counter** | ✅ Implementiert | ✅ Implementiert | ✅ Session-Stats |
| **Dashboard** | ❌ Nein | ❌ Nein | ✅ Ja (openrouter.ai/credits) |
| **Stats-Tool** | ✅ groq_stats | ✅ gemini_stats | ✅ openrouter_stats |
| **Empfehlung** | Request-Counter nutzen | Request-Counter nutzen | Kosten in Response beachten |

**Status:** ✅ Alle Services vollständig implementiert! (2025-11-24)

---

**Zuletzt aktualisiert:** 2025-11-24
**Version:** 1.0.0

**Sources:**
- [OpenRouter Usage Accounting](https://openrouter.ai/docs/use-cases/usage-accounting)
- [OpenRouter Generation API](https://openrouter.ai/docs/api-reference/get-a-generation)
- [OpenRouter FAQ](https://openrouter.ai/docs/faq)
- [OpenRouter Pricing](https://openrouter.ai/pricing)
