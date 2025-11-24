# OpenRouter Setup - Quick Start

**Dauer:** ~3 Minuten
**Kosten:** $5 Free Credits

---

## 🚀 Schnell-Setup (3 Schritte)

### Schritt 1: Account & API-Key

```bash
# 1. Website öffnen
open https://openrouter.ai/keys

# 2. Account erstellen (Google/GitHub/Email)
# 3. "Create Key" klicken
# 4. Key kopieren (beginnt mit: sk-or-v1-...)
```

---

### Schritt 2: MCP-Server einrichten

```bash
# API-Key speichern
echo 'export OPENROUTER_API_KEY="sk-or-v1-DEIN_KEY_HIER"' >> ~/.zshrc
source ~/.zshrc

# SDK installieren (falls noch nicht geschehen)
cd ~/mcp-servers/gemini-tool
npm install openai

# MCP-Server zu Claude Code hinzufügen
claude mcp add --transport stdio openrouter-tool \
  --env OPENROUTER_API_KEY="$OPENROUTER_API_KEY" \
  -- node ~/mcp-servers/gemini-tool/index-openrouter.js

# Status prüfen
claude mcp list
```

---

### Schritt 3: Testen

```bash
# Test-Skript ausführen
node test-openrouter.js

# Oder in neuer Claude Code Session:
cd ~/mcp-servers/gemini-tool
claude

# Dann:
"Frage GPT-4: Was ist 2+2?"
"Zeige mir die OpenRouter-Stats"
```

---

## ✅ Fertig!

**Du hast jetzt Zugriff auf:**
- ✅ 100+ KI-Modelle
- ✅ GPT-4, Claude, Gemini, Llama
- ✅ $5 Free Credits
- ✅ Modell-Vergleiche

---

## 🎯 Erste Schritte

### Einfache Frage
```
"Frage GPT-4 Turbo: Erkläre async/await in JavaScript"
```

### Modell-Vergleich
```
"Vergleiche GPT-4 und Claude bei:
Was sind die Vorteile von TypeScript?"
```

### Credits prüfen
```
"Zeige mir die OpenRouter-Stats"
```

---

## 📚 Nächste Schritte

- Siehe: **OPENROUTER_DOKU.md** für Details
- Modell-Liste: https://openrouter.ai/models
- Credits aufladen: https://openrouter.ai/credits

---

**Status:** ✅ Bereit für Produktiv-Einsatz!
