# ⚡ LiteAPI Quick Start Guide

**5 Minuten Setup** - Von Installation bis zur ersten Anfrage

---

## 🚀 Setup (bereits erledigt!)

✅ MCP-Server bereits registriert und verbunden!

```bash
# Verbindung prüfen
claude mcp list
```

Sollte zeigen:
```
liteapi-tool: node .../index-liteapi.js - ✓ Connected
```

---

## 💬 Erste Schritte

### 1. Verfügbare Modelle anzeigen

```markdown
@liteapi-tool list_liteapi_models
```

**Zeigt:** 6 Modelle mit Preisen, Response-Zeit und Beschreibungen

---

### 2. Erste Anfrage stellen (Standard-Modell)

```markdown
@liteapi-tool ask_liteapi --prompt "Erkläre Quantencomputing in 3 Sätzen"
```

**Nutzt automatisch:** `gpt-4o-mini` (schnell & günstig)

---

### 3. Spezifisches Modell nutzen

```markdown
@liteapi-tool ask_liteapi --model claude-3.5-sonnet --prompt "Analysiere diesen Code..."
```

---

### 4. Budget checken

```markdown
@liteapi-tool liteapi_budget
```

**Zeigt:**
- Verbleibendes Guthaben ($20)
- Anzahl Anfragen
- Kosten bisher

---

## 🎯 Modell-Empfehlungen

### Für schnelle Fragen:
```markdown
@liteapi-tool ask_liteapi --model gpt-4o-mini --prompt "Was ist 2+2?"
```
**Warum:** Günstig ($0.15 input), schnell (1392ms)

---

### Für komplexe Analysen:
```markdown
@liteapi-tool ask_liteapi --model claude-3.5-sonnet --prompt "Analysiere..."
```
**Warum:** Beste Qualität von Anthropic

---

### Für Reasoning/Logik:
```markdown
@liteapi-tool ask_liteapi --model o1-mini --prompt "Löse dieses Logik-Puzzle..."
```
**Warum:** Spezialisiert auf komplexe Reasoning-Tasks

---

### Für Code-Generierung:
```markdown
@liteapi-tool ask_liteapi --model gpt-4o --prompt "Schreibe eine React-Komponente..."
```
**Warum:** Beste Code-Qualität

---

## 📊 Alle Modelle auf einen Blick

| Modell | Wofür? | Kosten | Zeit |
|--------|--------|--------|------|
| **gpt-4o-mini** | Alltag, schnell | $0.15 | 1392ms |
| **claude-3-haiku** | Günstig, lange Texte | $0.25 | 1209ms |
| **gpt-4o** | Code, beste Qualität | $2.50 | 1260ms |
| **claude-3.5-sonnet** | Komplexe Analyse | $3.00 | 1663ms |
| **o1-mini** | Reasoning, Logik | $3.00 | 1099ms |
| **o1** | Premium Reasoning | $15.00 | 828ms |

---

## 🔧 Parameter

### Alle verfügbaren Parameter:

```markdown
@liteapi-tool ask_liteapi
  --prompt "Deine Frage"              # Pflicht
  --model gpt-4o-mini                 # Optional (Standard: gpt-4o-mini)
  --max_tokens 1000                   # Optional (Standard: 1000)
  --temperature 1                     # Optional (Standard: 1, Range: 0-2)
```

### Kreativität steuern:

```markdown
# Sehr präzise (faktisch)
@liteapi-tool ask_liteapi --temperature 0 --prompt "Was ist die Hauptstadt von Deutschland?"

# Kreativ (Storytelling)
@liteapi-tool ask_liteapi --temperature 1.5 --prompt "Schreibe eine kurze Geschichte..."
```

---

## 💰 Budget-Tipps

### Budget checken (jederzeit):
```markdown
@liteapi-tool liteapi_budget
```

### Kosten-Beispiele (1000 Tokens):

| Was kostet... | Modell | Preis |
|--------------|--------|-------|
| 100 kurze Fragen | gpt-4o-mini | $0.075 |
| 10 Code-Reviews | gpt-4o | $0.125 |
| 5 lange Analysen | claude-3.5-sonnet | $0.090 |
| 1 Reasoning-Task | o1 | $0.075 |

**Mit $20 möglich:**
- ~26.000 Anfragen mit gpt-4o-mini
- ~1.600 Anfragen mit gpt-4o
- ~270 Anfragen mit o1

---

## 🎯 Use Cases

### Use Case 1: Code-Review

```markdown
@liteapi-tool ask_liteapi --model gpt-4o --prompt "Review diesen Code:

\`\`\`python
def calculate(x, y):
    return x / y
\`\`\`

Finde Bugs und schlage Verbesserungen vor."
```

---

### Use Case 2: Text-Zusammenfassung

```markdown
@liteapi-tool ask_liteapi --model claude-3-haiku --prompt "Fasse diesen Artikel in 3 Bullet Points zusammen:

[Langer Text hier...]"
```

---

### Use Case 3: Logik-Puzzle

```markdown
@liteapi-tool ask_liteapi --model o1-mini --prompt "Löse: Wenn A > B und B > C, und C = 5, und A + B + C = 20, was ist A?"
```

---

### Use Case 4: Brainstorming

```markdown
@liteapi-tool ask_liteapi --model claude-3.5-sonnet --temperature 1.5 --prompt "Gib mir 10 kreative Ideen für..."
```

---

## 🚨 Häufige Fehler

### ❌ "Model not found"

**Problem:** Falscher Modell-Name

**Lösung:**
```markdown
# ❌ Falsch
@liteapi-tool ask_liteapi --model gpt-3.5-turbo --prompt "..."

# ✅ Korrekt
@liteapi-tool ask_liteapi --model gpt-4o-mini --prompt "..."
```

**Verfügbare Modelle anzeigen:**
```markdown
@liteapi-tool list_liteapi_models
```

---

### ❌ Budget aufgebraucht

**Problem:** $20 Guthaben verbraucht

**Lösung:**
```bash
# Budget-Status prüfen
@liteapi-tool liteapi_budget

# Budget manuell zurücksetzen (für Tests)
echo '{"totalBudget":20,"spent":0,"remaining":20,"requestCount":0}' > \
  /Users/sascha/mcp-servers/gemini-tool/liteapi-budget.json
```

---

## 📚 Weitere Dokumentation

- **Ausführliche Doku:** [LITEAPI_README.md](LITEAPI_README.md)
- **Session-Details:** [SESSION_LITEAPI_INTEGRATION.md](SESSION_LITEAPI_INTEGRATION.md)

---

## 🎉 Du bist ready!

**Nächster Schritt:**
```markdown
@liteapi-tool ask_liteapi --prompt "Hallo! Was kannst du für mich tun?"
```

**Budget:** $20 verfügbar
**Modelle:** 6 sofort nutzbar
**Status:** ✅ Einsatzbereit

---

**Quick Links:**
- [Dashboard](https://app.liteapi.ai/dashboard)
- [Modelle anzeigen](#1-verfügbare-modelle-anzeigen)
- [Budget checken](#4-budget-checken)

**Version:** 1.0.0 | **Datum:** 2025-11-24
