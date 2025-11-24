# 🚀 LiteAPI MCP-Server - KI-Modelle mit 40-50% Rabatt

**LiteAPI** ist ein AI-Aggregator, der Zugriff auf Premium-Modelle von **OpenAI** und **Anthropic** mit **40-50% Rabatt** bietet.

**Guthaben:** $20 verfügbar
**Format:** OpenAI-kompatibel
**Base-URL:** https://app.liteapi.ai/api/v1

---

## 📊 Verfügbare Modelle (6 verifiziert)

### OpenAI Modelle

| Modell | ID | Beschreibung | Avg. Zeit | Preis (Input/Output) |
|--------|----|--------------|-----------|-----------------------|
| **gpt-4o** | `openai/gpt-4o` | Neuestes GPT-4, multimodal (Text + Vision) | 1260ms | $2.50/$10 per 1M tokens |
| **gpt-4o-mini** | `openai/gpt-4o-mini` | Kleinere, schnellere GPT-4o-Version | 1392ms | $0.15/$0.60 per 1M tokens |
| **o1** | `openai/o1` | Reasoning-Modell für komplexe Aufgaben | 828ms | $15/$60 per 1M tokens |
| **o1-mini** | `openai/o1-mini` | Kleineres Reasoning-Modell | 1099ms | $3/$12 per 1M tokens |

**⚠️ Hinweis:** o1-Modelle benötigen `max_completion_tokens` statt `max_tokens`

### Anthropic Modelle

| Modell | ID | Beschreibung | Avg. Zeit | Preis (Input/Output) |
|--------|----|--------------|-----------|-----------------------|
| **claude-3.5-sonnet** | `anthropic/claude-3.5-sonnet` | Aktuellstes Claude, sehr leistungsstark | 1663ms | $3/$15 per 1M tokens |
| **claude-3-haiku** | `anthropic/claude-3-haiku` | Schnelles, günstiges Claude-Modell | 1209ms | $0.25/$1.25 per 1M tokens |

---

## 🔧 Installation

### 1. API-Key in .env speichern

```bash
# /Users/sascha/mcp-servers/gemini-tool/.env
LITEAPI_KEY=[YOUR_LITEAPI_KEY]
```

### 2. MCP-Server zu Claude Code hinzufügen

```bash
claude mcp add --transport stdio liteapi-tool \
  --env LITEAPI_KEY="[YOUR_LITEAPI_KEY]" \
  -- node /Users/sascha/mcp-servers/gemini-tool/index-liteapi.js
```

### 3. Verbindung prüfen

```bash
claude mcp list
```

Sollte zeigen:
```
liteapi-tool: node /Users/sascha/mcp-servers/gemini-tool/index-liteapi.js - ✓ Connected
```

---

## 💬 Nutzung in Claude Code

### Tool 1: ask_liteapi - KI-Anfragen stellen

```markdown
@liteapi-tool ask_liteapi
--prompt "Erkläre Quantencomputing in 3 Sätzen"
--model gpt-4o-mini
--max_tokens 500
```

**Verfügbare Modelle:**
- `gpt-4o` - Bestes OpenAI-Modell
- `gpt-4o-mini` - Günstig und schnell (Standard)
- `o1` - Reasoning für komplexe Aufgaben
- `o1-mini` - Kleineres Reasoning-Modell
- `claude-3.5-sonnet` - Bestes Anthropic-Modell
- `claude-3-haiku` - Schnelles Anthropic-Modell

**Beispiele:**

```markdown
# Schnelle Frage (gpt-4o-mini)
@liteapi-tool ask_liteapi --prompt "Was ist 2+2?"

# Komplexe Analyse (claude-3.5-sonnet)
@liteapi-tool ask_liteapi --model claude-3.5-sonnet --prompt "Analysiere diesen Code..."

# Reasoning-Task (o1)
@liteapi-tool ask_liteapi --model o1 --prompt "Löse dieses Logik-Puzzle..."
```

### Tool 2: list_liteapi_models - Modelle anzeigen

```markdown
@liteapi-tool list_liteapi_models
```

Zeigt:
- Alle 6 verfügbaren Modelle
- Provider (OpenAI, Anthropic)
- Durchschnittliche Response-Zeit
- Preise (Input/Output)
- Besonderheiten (z.B. o1-Modelle)

### Tool 3: liteapi_budget - Budget-Status

```markdown
@liteapi-tool liteapi_budget
```

Zeigt:
- Gesamt-Budget: $20
- Ausgegeben: $X.XX (Y%)
- Verbleibend: $X.XX
- Anzahl Anfragen
- Fortschrittsbalken

**Beispiel-Output:**
```
💰 LiteAPI Budget-Status

══════════════════════════════════════════════════════════════════
Gesamt-Budget:  $20.00
Ausgegeben:     $0.0245 (0.12%)
Verbleibend:    $19.9755

Anfragen:       15
Letztes Update: 24.11.2025, 14:30:22

[█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0.1%
══════════════════════════════════════════════════════════════════
```

---

## 📈 Kosten-Optimierung

### Modell-Empfehlungen nach Anwendungsfall

| Anwendungsfall | Empfohlenes Modell | Warum? |
|----------------|-------------------|--------|
| Schnelle Fragen | `gpt-4o-mini` | Günstig ($0.15 input), schnell |
| Lange Konversationen | `claude-3-haiku` | Günstigste Option ($0.25 input) |
| Komplexe Aufgaben | `claude-3.5-sonnet` | Beste Balance Preis/Leistung |
| Code-Generierung | `gpt-4o` | Beste Code-Qualität |
| Logik-Puzzles | `o1-mini` | Reasoning spezialisiert, günstiger als o1 |
| Kritische Reasoning | `o1` | Bestes Reasoning-Modell |

### Budget-Beispiele

Mit **$20 Guthaben** kannst du ungefähr ausführen:

| Modell | 1000-Token Anfrage | Anzahl möglich |
|--------|-------------------|----------------|
| **gpt-4o-mini** | $0.00075 | ~26.000 |
| **claude-3-haiku** | $0.00037 | ~54.000 |
| **gpt-4o** | $0.0125 | ~1.600 |
| **claude-3.5-sonnet** | $0.018 | ~1.100 |
| **o1-mini** | $0.015 | ~1.300 |
| **o1** | $0.075 | ~270 |

---

## 🔍 Modell-Details

### OpenAI o1-Serie (Besonderheiten)

Die **o1** und **o1-mini** Modelle sind spezialisierte Reasoning-Modelle:

**⚠️ Wichtig:** Diese Modelle verwenden `max_completion_tokens` statt `max_tokens`

**Wann nutzen?**
- Komplexe mathematische Probleme
- Logik-Puzzles
- Multi-Step Reasoning
- Code-Debugging mit Analyse

**Beispiel:**
```markdown
@liteapi-tool ask_liteapi --model o1 --prompt "Löse: Wenn A > B und B > C, und C = 5, und A + B + C = 20, was ist A?" --max_tokens 100
```

### Vision-Fähigkeiten

**gpt-4o** unterstützt Vision (Bilder analysieren):

```markdown
@liteapi-tool ask_liteapi --model gpt-4o --prompt "Beschreibe dieses Bild: [base64-encoded image]"
```

---

## 🛠️ Technische Details

### API-Format

LiteAPI ist **OpenAI-kompatibel**:

```javascript
// Standard Chat-Completion
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "max_tokens": 100
}

// o1-Modelle
{
  "model": "openai/o1",
  "messages": [
    { "role": "user", "content": "Complex reasoning task" }
  ],
  "max_completion_tokens": 100  // ⚠️ Nicht max_tokens!
}
```

### Budget-Tracking

Budget wird automatisch getrackt in:
```
/Users/sascha/mcp-servers/gemini-tool/liteapi-budget.json
```

**Struktur:**
```json
{
  "totalBudget": 20.00,
  "spent": 0.0245,
  "remaining": 19.9755,
  "requestCount": 15,
  "lastUpdated": "2025-11-24T13:30:22.000Z"
}
```

---

## 🧪 Test-Skripte

### Modelle testen

```bash
# Alle 6 Modelle testen
export LITEAPI_KEY="[YOUR_LITEAPI_KEY]"
node /Users/sascha/mcp-servers/gemini-tool/test-liteapi-final.js
```

### Einzelnes Modell testen

```bash
export LITEAPI_KEY="[YOUR_LITEAPI_KEY]"
node /Users/sascha/mcp-servers/gemini-tool/test-liteapi.js
```

---

## 📚 Vergleich: LiteAPI vs. OpenRouter

| Feature | LiteAPI | OpenRouter |
|---------|---------|------------|
| **Rabatt** | 40-50% | Variabel |
| **Modelle** | 6 (OpenAI, Anthropic) | 100+ (alle Provider) |
| **Guthaben** | $20 | $5 Free Credits |
| **OpenAI o1** | ✅ Verfügbar | ✅ Verfügbar |
| **Google Gemini** | ❌ Nicht verfügbar | ✅ Verfügbar |
| **Free Tier** | ❌ Nein | ✅ 7 kostenlose Modelle |

**Empfehlung:**
- **LiteAPI** für: Premium-Modelle mit Rabatt, wenn Budget vorhanden
- **OpenRouter** für: Breite Modell-Auswahl, Free-Tier, Experimente

---

## 🚨 Troubleshooting

### Fehler: "Model not found"

✅ **Lösung:** Nutze verifizierte Modell-IDs (siehe Tabelle oben)

```bash
# ❌ Falsch
openai/gpt-3.5-turbo

# ✅ Korrekt
openai/gpt-4o-mini
```

### Fehler: "LITEAPI_KEY nicht gesetzt"

✅ **Lösung:** Key in `.env` eintragen oder MCP-Server neu registrieren

```bash
# .env prüfen
cat /Users/sascha/mcp-servers/gemini-tool/.env | grep LITEAPI_KEY

# MCP-Server neu registrieren
claude mcp remove liteapi-tool
claude mcp add --transport stdio liteapi-tool \
  --env LITEAPI_KEY="[YOUR_LITEAPI_KEY]" \
  -- node /Users/sascha/mcp-servers/gemini-tool/index-liteapi.js
```

### Fehler: "Unsupported parameter: 'max_tokens'"

✅ **Lösung:** o1-Modelle benötigen `max_completion_tokens`

Dies wird automatisch vom MCP-Server gehandhabt, wenn `requiresCompletionTokens: true` im Modell gesetzt ist.

### GET /models gibt 404

⚠️ **Bekanntes Problem:** Der `/models` Endpoint ist nicht implementiert, trotz Dokumentation.

**Workaround:** Die 6 verfügbaren Modelle sind im MCP-Server hardcoded und verifiziert.

---

## 🎯 Quick Start

```bash
# 1. In Claude Code
@liteapi-tool list_liteapi_models

# 2. Einfache Frage stellen
@liteapi-tool ask_liteapi --prompt "Was ist Rust?" --model gpt-4o-mini

# 3. Budget checken
@liteapi-tool liteapi_budget
```

---

## 📝 Zusammenfassung

✅ **6 verifizierte Modelle** (4x OpenAI, 2x Anthropic)
✅ **$20 Guthaben** mit automatischem Tracking
✅ **40-50% Rabatt** auf Premium-Modelle
✅ **OpenAI-kompatibel** (einfache Integration)
✅ **MCP-Server** für Claude Code bereit

**Status:** ✅ Produktionsbereit
**Version:** 1.0.0
**Datum:** 2025-11-24

---

**Verwandte Dokumentation:**
- [OpenRouter Free-Tier](FREE_TIER_README.md)
- [Groq MCP-Server](MCP_WORKFLOW.md)
- [Gemini MCP-Server](README.md)

**LiteAPI Dashboard:** https://app.liteapi.ai/dashboard
