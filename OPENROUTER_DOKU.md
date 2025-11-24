# OpenRouter Integration - Dokumentation

**Erstellt:** 2025-11-24
**Version:** 1.0.0

---

## 📋 Übersicht

OpenRouter ist ein **Multi-Model-Gateway**, das Zugriff auf **100+ KI-Modelle** über eine einheitliche API bietet. Keine separate Integration für jedes Modell nötig!

### Verfügbare Modelle:
- **OpenAI:** GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Anthropic:** Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Google:** Gemini Pro, Gemini Flash
- **Meta:** Llama 3.1 70B, Llama 3.1 8B
- **Mistral:** Mixtral 8x7B, Mistral 7B
- **Und viele mehr!**

---

## 🎯 Warum OpenRouter?

### ✅ Vorteile

| Feature | Details |
|---------|---------|
| **Einheitliche API** | Ein API-Key für alle Modelle |
| **100+ Modelle** | GPT-4, Claude, Gemini, Llama, etc. |
| **$5 Free Credits** | Bei Anmeldung kostenlos |
| **Sehr günstig** | Ab $0.0001/Request |
| **Modell-Vergleiche** | Teste mehrere Modelle gleichzeitig |
| **Keine Vendor-Lock-In** | Wechsle jederzeit zwischen Modellen |
| **Transparente Kosten** | Genaue Token-Zählung |

### 💰 Kosten-Vergleich

| Modell | Kosten/Request | Use Case |
|--------|----------------|----------|
| **Llama 3.1 70B** | ~$0.0005-0.001 | Günstig & Gut |
| **Gemini Pro** | ~$0.0005-0.0025 | Google-Integration |
| **GPT-3.5 Turbo** | ~$0.001-0.002 | Schnell & Günstig |
| **Claude 3.5 Sonnet** | ~$0.003-0.015 | Code & Analyse |
| **GPT-4 Turbo** | ~$0.01-0.03 | Beste Qualität |
| **Claude 3 Opus** | ~$0.015-0.075 | Höchste Qualität |

---

## 🛠️ Tools

### 1. ask_openrouter

**Beschreibung:** Frage ein beliebiges KI-Modell

**Parameter:**
- `prompt` (required) - Die Frage/Aufgabe
- `model` (optional) - Modell-Shortcut, Standard: gpt-4-turbo
- `temperature` (optional) - Kreativität (0.0-2.0), Standard: 0.7

**Modell-Shortcuts:**
```
gpt-4-turbo        → OpenAI GPT-4 Turbo
gpt-4              → OpenAI GPT-4
gpt-3.5-turbo      → OpenAI GPT-3.5 Turbo
claude-3.5-sonnet  → Anthropic Claude 3.5 Sonnet
claude-3-opus      → Anthropic Claude 3 Opus
claude-3-haiku     → Anthropic Claude 3 Haiku
gemini-pro         → Google Gemini Pro
gemini-flash       → Google Gemini Flash
llama-3.1-70b      → Meta Llama 3.1 70B
llama-3.1-8b       → Meta Llama 3.1 8B
mixtral-8x7b       → Mistral Mixtral 8x7B
mistral-7b         → Mistral 7B
```

**Beispiele:**
```
"Frage GPT-4: Was ist ein Closure in JavaScript?"
"Frage Claude: Erkläre Docker für Anfänger"
"Frage Gemini Pro: Was sind die Vorteile von TypeScript?"
```

**Voller Modell-Name:**
Falls ein Modell keinen Shortcut hat, kannst du den vollen Namen verwenden:
```
"Frage OpenRouter mit Modell 'openai/gpt-4-32k': [Frage]"
```

---

### 2. compare_models ⭐

**Beschreibung:** Vergleiche 2-3 Modelle gleichzeitig

**Parameter:**
- `prompt` (required) - Die Frage für alle Modelle
- `models` (required) - Array von 2-3 Modell-Shortcuts

**Beispiel:**
```
"Vergleiche GPT-4, Claude und Gemini bei der Frage:
Was ist der Unterschied zwischen async/await und Promises?"

→ models: ["gpt-4-turbo", "claude-3.5-sonnet", "gemini-pro"]
```

**Use Cases:**
- ✅ Quality-Check (verschiedene Perspektiven)
- ✅ Best-Model-Auswahl (welches antwortet am besten?)
- ✅ Kosten-Optimierung (günstiges Modell mit guter Qualität)
- ✅ Speed-Vergleich (welches ist am schnellsten?)

**Output-Format:**
```
🔄 Modell-Vergleich
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Frage: [Deine Frage]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 GPT-4-TURBO:
[Antwort von GPT-4]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 CLAUDE-3.5-SONNET:
[Antwort von Claude]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 GEMINI-PRO:
[Antwort von Gemini]
```

---

### 3. openrouter_stats

**Beschreibung:** Zeige Kosten-Info und verfügbare Modelle

**Parameter:** Keine

**Output:**
```
📊 OpenRouter Statistik
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Credits: $5.00 Free Credits bei Anmeldung
💳 Pay-per-use nach Free Credits
📊 Kosten: Ab $0.0001/Request

🎯 Verfügbare Modelle: 100+
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3.5, Opus, Haiku)
- Google (Gemini Pro, Flash)
- Meta (Llama 3.1 70B, 8B)
- Mistral (Mixtral, Mistral)

💡 Kosten-Beispiele: [...]
```

---

## 📊 Modell-Empfehlungen

### Nach Use Case:

**Code-Generierung & Review:**
1. 🥇 `claude-3.5-sonnet` - Beste Code-Qualität
2. 🥈 `gpt-4-turbo` - Sehr gut, schneller
3. 🥉 `llama-3.1-70b` - Günstig, gut

**Schnelle Fragen:**
1. 🥇 `gpt-3.5-turbo` - Sehr schnell, günstig
2. 🥈 `claude-3-haiku` - Schnell, gute Qualität
3. 🥉 `gemini-flash` - Schnell, kostenlos via Groq besser

**Kreative Aufgaben:**
1. 🥇 `gpt-4-turbo` - Sehr kreativ
2. 🥈 `claude-3-opus` - Kreativ, teurer
3. 🥉 `mixtral-8x7b` - Gut, günstig

**Lange Texte (hoher Context):**
1. 🥇 `claude-3.5-sonnet` - 200k Tokens
2. 🥈 `gpt-4-turbo` - 128k Tokens
3. 🥉 `gemini-pro` - 32k Tokens

**Kosten-Optimiert:**
1. 🥇 `llama-3.1-70b` - ~$0.0005/Request
2. 🥈 `gemini-pro` - ~$0.0005/Request
3. 🥉 `gpt-3.5-turbo` - ~$0.001/Request

---

## 💡 Best Practices

### 1. Modell-Auswahl

**Faustregel:**
```
Einfache Fragen    → gpt-3.5-turbo (günstig & schnell)
Code-Tasks         → claude-3.5-sonnet (beste Code-Qualität)
Komplexe Analyse   → gpt-4-turbo (beste Reasoning)
Kosten-bewusst     → llama-3.1-70b (günstig & gut)
```

### 2. Temperatur-Einstellungen

```
0.0 - 0.3  → Präzise Antworten (Mathematik, Code)
0.4 - 0.7  → Ausgewogen (Standard für die meisten Tasks)
0.8 - 1.0  → Kreativ (Brainstorming, Storytelling)
1.1 - 2.0  → Sehr kreativ (Experimentell)
```

### 3. Kosten-Kontrolle

**Tipps:**
- ✅ Nutze günstige Modelle für Tests
- ✅ Starte mit `llama-3.1-70b`, upgrade nur wenn nötig
- ✅ `compare_models` nur für wichtige Entscheidungen
- ✅ Setze `max_tokens` Limits (im Code anpassen)
- ✅ Prüfe Credits regelmäßig: https://openrouter.ai/credits

**Credits-Übersicht:**
```bash
# Credits prüfen im Browser:
open https://openrouter.ai/credits

# In Claude Code:
"Zeige mir die OpenRouter-Stats"
```

### 4. Modell-Vergleiche

**Wann nutzen?**
- ✅ Bei wichtigen Entscheidungen
- ✅ Für Quality-Checks
- ✅ Bei neuen komplexen Aufgaben
- ❌ Nicht für einfache Fragen (teuer!)

**Empfohlene Kombinationen:**
```
Code-Review:
["claude-3.5-sonnet", "gpt-4-turbo"]

Kreative Texte:
["gpt-4-turbo", "claude-3-opus"]

Günstig vs. Premium:
["llama-3.1-70b", "gpt-4-turbo"]
```

---

## 🔧 Technische Details

### API-Endpoint
```
https://openrouter.ai/api/v1
```

### Authentifizierung
```javascript
headers: {
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'HTTP-Referer': 'https://claude-code-mcp',
  'X-Title': 'Claude Code MCP Server'
}
```

### Response-Format
```javascript
{
  choices: [{
    message: {
      content: "Antwort..."
    }
  }],
  usage: {
    prompt_tokens: 15,
    completion_tokens: 42,
    total_tokens: 57
  }
}
```

---

## 🐛 Troubleshooting

### Problem: "402 Payment Required"

**Ursache:** Credits aufgebraucht

**Lösung:**
```bash
# 1. Credits prüfen
open https://openrouter.ai/credits

# 2. Credits hinzufügen (ab $5)
# 3. API-Key bleibt gleich
```

### Problem: "401 Unauthorized"

**Ursache:** API-Key ungültig

**Lösung:**
```bash
# 1. Neuen Key erstellen
open https://openrouter.ai/keys

# 2. Environment Variable aktualisieren
export OPENROUTER_API_KEY="sk-or-v1-..."

# 3. MCP-Server neu laden
claude mcp remove openrouter-tool
claude mcp add --transport stdio openrouter-tool \
  --env OPENROUTER_API_KEY="$OPENROUTER_API_KEY" \
  -- node index-openrouter.js
```

### Problem: "404 Model Not Found"

**Ursache:** Falscher Modell-Name

**Lösung:**
```bash
# Verfügbare Modelle anzeigen
open https://openrouter.ai/models

# Oder Shortcut nutzen statt vollem Namen
"Frage gpt-4-turbo: ..."  # Statt "openai/gpt-4-turbo"
```

### Problem: Langsame Responses

**Mögliche Ursachen:**
- ✅ Modell ist langsam (Claude Opus, GPT-4)
- ✅ Hohe Server-Last
- ✅ Großer Prompt

**Optimierung:**
```
Schnellere Modelle nutzen:
- gpt-3.5-turbo (sehr schnell)
- claude-3-haiku (schnell)
- llama-3.1-8b (schnell)
```

---

## 📈 Kosten-Tracking

### Automatisches Tracking

**Im Code (index-openrouter.js):**
```javascript
if (completion.usage) {
  const tokens = completion.usage.total_tokens;
  // Tokens werden automatisch im Response angezeigt
}
```

**Output:**
```
🤖 OpenRouter (gpt-4-turbo):
[Antwort]

💰 Tokens: 15 prompt + 42 completion = 57 total
```

### Manuelle Kalkulation

**Formel:**
```
Kosten = (Prompt-Tokens × Input-Preis) + (Completion-Tokens × Output-Preis)
```

**Beispiel (GPT-4 Turbo):**
```
Input:  $0.01 / 1000 Tokens
Output: $0.03 / 1000 Tokens

Request: 15 prompt + 42 completion
Kosten: (15 × $0.01/1000) + (42 × $0.03/1000)
      = $0.00015 + $0.00126
      = $0.00141 pro Request
```

---

## 🔐 Sicherheit

### API-Key Schutz

**Gespeichert in:**
```bash
~/.zshrc
export OPENROUTER_API_KEY="sk-or-v1-..."
```

**Niemals committen:**
```bash
# In .gitignore:
.env
*.key
.zshrc
```

### Best Practices

- ✅ Key nur lokal speichern
- ✅ Niemals in Code hardcoden
- ✅ Bei Leak: Sofort neuen Key erstellen
- ✅ Regelmäßig Credits prüfen
- ✅ Alerts für ungewöhnliche Nutzung

---

## 📚 Ressourcen

### Offizielle Links

- **Website:** https://openrouter.ai
- **API Keys:** https://openrouter.ai/keys
- **Credits:** https://openrouter.ai/credits
- **Modelle:** https://openrouter.ai/models
- **Dokumentation:** https://openrouter.ai/docs
- **Preise:** https://openrouter.ai/docs#models

### Community

- **Discord:** https://discord.gg/openrouter
- **GitHub:** https://github.com/OpenRouterTeam
- **Updates:** https://twitter.com/OpenRouterAI

---

## ✅ Checkliste

### Setup
- [x] Account erstellt
- [x] API-Key generiert
- [x] Environment Variable gesetzt
- [x] MCP-Server hinzugefügt
- [x] Mit 2 Modellen getestet

### Vor Produktiv-Nutzung
- [ ] Credits aufgeladen (optional, $5 Free verfügbar)
- [ ] Kosten-Limits verstanden
- [ ] Modell-Shortcuts gelernt
- [ ] `compare_models` ausprobiert
- [ ] Backup-API-Key erstellt

---

**Zuletzt aktualisiert:** 2025-11-24
**Version:** 1.0.0
**Status:** ✅ Produktionsreif
