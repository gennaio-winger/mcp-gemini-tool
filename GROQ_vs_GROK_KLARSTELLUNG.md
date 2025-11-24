# 🔍 Klarstellung: Groq vs. Grok

**Wichtig:** Es gibt ZWEI verschiedene Dinge mit ähnlichen Namen!

**Erstellt:** 2025-11-24
**Problem:** Namensverwirrung zwischen Groq (Inferenz) und Grok (LLM)

---

## ⚠️ Die Verwirrung

Viele verwechseln **Groq** und **Grok**, weil die Namen sehr ähnlich sind. Aber es sind **komplett unterschiedliche Produkte** von verschiedenen Unternehmen!

---

## 📊 Vergleichs-Tabelle

| Aspekt | **Groq** (mit 'o') | **Grok** (mit 'o') |
|--------|-------------------|-------------------|
| **Unternehmen** | Groq Inc. | xAI (Elon Musk) |
| **Was ist es?** | Hardware/Inferenz-Plattform | Large Language Model (LLM) |
| **Technologie** | LPU (Language Processing Units) | KI-Modell (Transformer) |
| **Produkt** | API für schnelle LLM-Inferenz | Eigenes LLM (wie GPT, Claude) |
| **Modelle** | Llama 3.3 70B, Mixtral, Gemma | Grok 2, Grok 4.1, Grok Beta |
| **Website** | https://groq.com | https://x.ai |
| **API-Zugriff** | Direkt bei Groq | Über xAI oder OpenRouter |
| **Kostenlos?** | ✅ Ja (14,400/Tag) | ❌ Nein (über xAI API) |
| **Via OpenRouter?** | ❌ Nein (eigene API) | ✅ Ja (als "x-ai/grok-...") |

---

## 1️⃣ Groq (mit 'o') - Die Inferenz-Plattform

### Was ist Groq?

**Groq** ist ein **Hardware-Unternehmen**, das spezialisierte **LPU-Chips** (Language Processing Units) entwickelt hat. Diese Chips sind extrem schnell bei der Inferenz von Large Language Models.

### Was bietet Groq?

- **Inferenz-API** für Open-Source-Modelle
- **Ultra-schnelle** Antworten (100+ Tokens/Sekunde)
- **Kostenlos** (14,400 Requests/Tag)
- **Verfügbare Modelle:**
  - Llama 3.3 70B (Meta)
  - Llama 3.1 8B (Meta)
  - Mixtral 8x7B (Mistral AI)
  - Gemma 7B (Google)

### Groq in unserem Projekt:

```
MCP-Server:    index-groq.js
API-Key:       GROQ_API_KEY
Environment:   GROQ_API_KEY=gsk_...
Website:       https://console.groq.com
```

**Nutzung:**
```markdown
@groq-tool ask_groq --prompt "Erkläre Quantencomputing"
@groq-tool groq_stats
```

---

## 2️⃣ Grok (mit 'o') - Das xAI LLM

### Was ist Grok?

**Grok** ist ein **Large Language Model** (LLM), entwickelt von **xAI** (Elon Musk's KI-Firma). Es ist vergleichbar mit GPT-4, Claude oder Gemini.

### Was bietet Grok?

- **Eigenes LLM** mit verschiedenen Versionen
- **Verfügbar über:**
  - xAI API (kostenpflichtig)
  - OpenRouter (teilweise kostenlos)
- **Besonderheiten:**
  - Zugriff auf X (Twitter) Daten
  - Sehr großer Context (2M Tokens bei Grok 4.1)

### Grok-Modelle:

| Modell | Context | Status | Verfügbar über |
|--------|---------|--------|----------------|
| Grok 2 | 128k | Standard | xAI API, OpenRouter |
| Grok 4.1 Fast | 2M Tokens | Schnell | OpenRouter (FREE!) |
| Grok Beta | Variabel | Beta | xAI API |

### Grok in unserem Projekt:

```
MCP-Server:    index-openrouter.js (nicht eigener Server!)
API-Key:       OPENROUTER_API_KEY
Modell-ID:     x-ai/grok-4.1-fast:free
Website:       https://x.ai
```

**Nutzung:**
```markdown
@openrouter-tool ask_openrouter --model grok-free --prompt "..."
```

**WICHTIG:** Grok ist **KEIN eigener MCP-Server**, sondern über OpenRouter verfügbar!

---

## 🎯 Unser Setup

### Aktive MCP-Server (4):

1. **Groq** (`index-groq.js`) ✅
   - Eigener MCP-Server
   - Nutzt Groq-API direkt
   - Llama 3.3 70B
   - 14,400 Requests/Tag kostenlos

2. **OpenRouter** (`index-openrouter.js`) ✅
   - Eigener MCP-Server
   - Zugriff auf 100+ Modelle
   - **Inkl. Grok** von xAI
   - $5 Free Credits + Free-Models

3. **Gemini** (`index.js`) ✅
   - Eigener MCP-Server
   - Google Gemini 2.0 Flash
   - 15 Requests/Tag kostenlos

4. **LiteAPI** (`index-liteapi.js`) ✅
   - Eigener MCP-Server
   - Premium-Modelle mit Rabatt
   - $20 Guthaben

---

## 🔄 Wie sind sie verbunden?

```
Groq (Plattform)
├── Eigene API: console.groq.com
├── Modelle: Llama, Mixtral (NICHT Grok!)
└── Unser MCP: index-groq.js ✅

Grok (LLM von xAI)
├── xAI API: x.ai
├── Auch über: OpenRouter
├── Modell: x-ai/grok-4.1-fast
└── Unser Zugriff: Via OpenRouter ✅
```

**Klarstellung:**
- **Groq-Service** hostet **NICHT** das Grok-Modell!
- **Grok-Modell** läuft **NICHT** auf Groq-Hardware!
- Es sind **komplett getrennte** Produkte!

---

## 🛠️ Praktische Unterschiede

### Wenn du Groq nutzen willst (Llama 3.3):
```markdown
@groq-tool ask_groq --prompt "Deine Frage"
```
- Nutzt: Groq-Plattform
- Modell: Llama 3.3 70B
- Kosten: Kostenlos

### Wenn du Grok nutzen willst (xAI's LLM):
```markdown
@openrouter-tool ask_openrouter --model grok-free --prompt "Deine Frage"
```
- Nutzt: OpenRouter
- Modell: Grok 4.1 Fast
- Kosten: Kostenlos (via OpenRouter Free)

---

## 📝 Korrekte Schreibweise

| ✅ Richtig | ❌ Falsch | Kontext |
|-----------|----------|---------|
| Groq API | Grok API | Inferenz-Plattform |
| Groq Inc. | Grok Inc. | Hardware-Firma |
| GROQ_API_KEY | GROK_API_KEY | Environment Variable |
| index-groq.js | index-grok.js | MCP-Server Datei |
| Grok 2 | Groq 2 | xAI's LLM |
| x-ai/grok | x-ai/groq | Modell-ID |
| Grok 4.1 Fast | Groq 4.1 Fast | xAI's schnelles Modell |

---

## 🔍 Wo könnte Verwirrung entstehen?

### 1. In OpenRouter Free-Models Liste:
```
❌ Falsch: "Groq 4.1 Fast" (das wäre die Plattform)
✅ Richtig: "Grok 4.1 Fast" (das ist das xAI LLM)
```

### 2. In Dokumentation:
```
❌ Falsch: "Groq von xAI"
✅ Richtig: "Grok von xAI" ODER "Groq von Groq Inc."
```

### 3. In API-Keys:
```
✅ Richtig: GROQ_API_KEY (für Groq-Plattform)
❌ Falsch: GROK_API_KEY (gibt es nicht, nutze OPENROUTER_API_KEY)
```

---

## 📊 Zusammenfassung

### Groq (Plattform):
- ✅ Eigener MCP-Server
- ✅ Kostenlos (14,400/Tag)
- ✅ Ultra-schnell
- ✅ Llama 3.3 70B
- ❌ KEIN Grok-Modell

### Grok (LLM):
- ✅ Über OpenRouter verfügbar
- ✅ Teilweise kostenlos (Free-Models)
- ✅ 2M Context
- ✅ Von xAI (Elon Musk)
- ❌ NICHT auf Groq-Plattform

---

## 🔧 Was muss korrigiert werden?

### In Dokumentationen:
- [x] Klarstellung erstellt (dieses Dokument)
- [ ] README.md prüfen
- [ ] CHANGELOG.md prüfen
- [ ] OpenRouter Docs prüfen
- [ ] Alle "Grok" vs "Groq" Erwähnungen verifizieren

### In Code:
- [x] `index-groq.js` - Korrekt (Groq-Plattform)
- [x] `GROQ_API_KEY` - Korrekt
- [ ] Kommentare in Code prüfen

### In Modell-Listen:
- [ ] FREE_MODELS_QUICK_REFERENCE.md prüfen
- [ ] free-tier-tracker.json prüfen
- [ ] index-openrouter.js FREE_MODELS prüfen

---

## ✅ Empfehlung

**Wenn unsicher:**
1. **Groq** = Plattform/Hardware (wie "AWS Lambda")
2. **Grok** = KI-Modell (wie "GPT-4")

**Eselsbrücke:**
- Gr**o**q = **O**pen-Source Inferenz
- Gr**o**k = **O**riginal xAI Model

---

## 📞 Quick Reference

### Für Groq (Plattform):
```bash
# Setup
export GROQ_API_KEY="gsk_..."
claude mcp add --transport stdio groq-tool --env GROQ_API_KEY="$GROQ_API_KEY" -- node index-groq.js

# Nutzung
@groq-tool ask_groq --prompt "..."
```

### Für Grok (xAI LLM):
```bash
# Setup
export OPENROUTER_API_KEY="sk-or-v1-..."
claude mcp add --transport stdio openrouter-tool --env OPENROUTER_API_KEY="$OPENROUTER_API_KEY" -- node index-openrouter.js

# Nutzung
@openrouter-tool ask_openrouter --model grok-free --prompt "..."
```

---

## 🎯 Fazit

**Groq** und **Grok** sind **NICHT dasselbe**!

- **Groq** = Inferenz-Plattform von Groq Inc.
- **Grok** = LLM von xAI (Elon Musk)

**In unserem Projekt:**
- ✅ Wir haben einen **Groq-MCP-Server** (Llama 3.3)
- ✅ Wir haben **Zugriff auf Grok** (via OpenRouter)
- ✅ Beide sind **unterschiedliche Services**

---

**Version:** 1.0.0
**Erstellt:** 2025-11-24
**Status:** ✅ Klarstellung abgeschlossen

**Nächste Schritte:**
1. Alle Dokumentationen prüfen
2. "Grok" vs "Groq" Schreibweise verifizieren
3. Bei Bedarf korrigieren
