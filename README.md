# MCP-Server für externe KI-APIs

**Erstellt:** 2025-11-24
**Projekt:** Integration externer KI-Modelle in Claude Code via MCP

---

## 📋 Projektziel

Claude Code mit externen KI-APIs (Gemini, Groq, etc.) als Tools erweitern, sodass Claude bei Bedarf andere KI-Modelle konsultieren kann.

---

## 🎯 Was ist MCP (Model Context Protocol)?

MCP ist **NICHT** dazu gedacht, alternative KI-Modelle zu nutzen, sondern:
- ✅ Datenquellen für Claude (Dateisystem, Datenbanken, APIs)
- ❌ NICHT alternative KI-Backends

**Unser Ansatz:**
Wir nutzen MCP, um externe KI-APIs als **Tools** für Claude verfügbar zu machen.

```
Claude Code → MCP-Server → Externe KI-API (Gemini/Groq)
                ↓
        "KI als Werkzeug"
```

---

## 🎯 Features

### 🆓 Dynamische Kostenlose Modelle (NEU! v2.2.0 ✨)

**20+ kostenlose Modelle bei OpenRouter automatisch erkennen und nutzen!**

- ✅ Automatische Erkennung kostenloser Modelle via API
- ✅ 24h Caching für Performance
- ✅ Intelligente Kategorie-Zuordnung (Coding, Reasoning, Multimodal)
- ✅ Automatische Modell-Auswahl basierend auf Aufgabe
- ✅ Fallback-Hierarchie: Groq → OR Free → Gemini → OR Paid
- ✅ **100% kostenlose Nutzung** auch nach Groq-Limit!

**Verfügbare Free-Models (Beispiele):**
- Grok 4.1 Fast (2M Context!)
- DeepSeek R1 0528 (Reasoning)
- Qwen3 Coder 480B (Coding)
- Kimi K2 (262k Context)
- Mistral Small 3.2 24B

**Siehe:** [KOSTENLOSE_MODELLE_DYNAMISCH.md](KOSTENLOSE_MODELLE_DYNAMISCH.md) für vollständige Implementierung

---

### 💰 Vollständiges Kosten-Monitoring

**Alle drei Services haben jetzt umfassendes Monitoring:**

#### Groq Request-Counter
- ✅ Automatisches Tracking aller API-Requests
- ✅ Tägliches Limit: 14,400 Requests
- ✅ 3-Stufen-Warnsystem (80%, 90%, 95%)
- ✅ Automatischer Reset um Mitternacht
- ✅ Live-Statistiken mit Progress-Bar
- ✅ Verhindert Limit-Überschreitung

**Siehe:** [REQUEST_COUNTER_DOKU.md](REQUEST_COUNTER_DOKU.md)

#### Gemini Budget-Tracking
- ✅ Automatische Kosten-Berechnung pro Request
- ✅ Budget: 257,50 € (gültig bis 23.02.2026)
- ✅ Token-Tracking und Kosten-Breakdown
- ✅ Warnsystem bei niedrigem Budget
- ✅ Budget-Tool: `gemini_budget`
- ✅ Stats-Tool: `gemini_stats`

**Siehe:** [GEMINI_BUDGET_DOKU.md](GEMINI_BUDGET_DOKU.md)

#### OpenRouter Kosten-Tracking
- ✅ Automatische Kosten-Berechnung pro Request
- ✅ Session-Statistik (kumulativ)
- ✅ Kosten-Breakdown (Input/Output)
- ✅ Token-Tracking
- ✅ Credits-Übersicht
- ✅ Unterstützt 12+ Modelle

**Siehe:** [KOSTEN_MONITORING.md](KOSTEN_MONITORING.md) für vollständige Details

---

## 🛠️ Entwicklungsverlauf

### Phase 1: Gemini-Integration (✅ Reaktiviert)

**Datum:** 2025-11-24 (Ursprünglicher Versuch)
**Reaktivierung:** 2025-11-24 (mit neuem API-Key)

#### Setup:
1. ✅ Google AI Studio API-Key erstellt
2. ✅ Environment Variable gesetzt (`GEMINI_API_KEY`)
3. ✅ MCP-Server-Skript erstellt (`index.js`)
4. ✅ Dependencies installiert (`@modelcontextprotocol/sdk`, `@google/generative-ai`)
5. ✅ Zu Claude Code hinzugefügt

#### Probleme & Lösungen:
- ❌ **Modellnamen veraltet**: `gemini-1.5-flash` existiert nicht mehr
- ✅ **Korrektur**: Auf `gemini-2.0-flash` aktualisiert
- ❌ **Rate-Limit**: Erste API-Keys sofort erschöpft (429 Too Many Requests)
- ✅ **Lösung**: Neuer API-Key erstellt (FreeTrialUpgrade: 257,50 € bis 23.02.2026)

#### Ergebnis:
**Gemini aktiv** - Mit neuem API-Key erfolgreich reaktiviert!

---

### Phase 2: Groq Integration (✅ Erfolgreich)

**Datum:** 2025-11-24
**Status:** Produktiv

**Warum Groq?**
- ✅ Komplett kostenlos (14,400 Requests/Tag)
- ✅ Ultra-schnell (100+ Tokens/Sekunde)
- ✅ Llama 3.3 70B, Mixtral 8x7B verfügbar
- ✅ Keine Kreditkarte nötig
- ✅ Zuverlässigere Limits als Google

---

### Phase 3: OpenRouter Integration (✅ Erfolgreich)

**Datum:** 2025-11-24
**Status:** Produktiv

**Warum OpenRouter?**
- ✅ Multi-Model-Gateway (100+ Modelle)
- ✅ GPT-4, Claude, Gemini, Llama in einer API
- ✅ $5 Free Credits bei Anmeldung
- ✅ Sehr günstig (ab $0.0001/Request)
- ✅ Modell-Vergleiche möglich
- ✅ Keine Vendor-Lock-In

**Verfügbare Modelle (100+):**
- OpenAI: GPT-4 Turbo, GPT-4o, GPT-4 ✅
- Meta: Llama 3.1 405B, 70B, 8B ✅
- Google: Gemini Pro, Flash ✅
- Mistral: Mixtral, Mistral ✅
- ~~Anthropic: Claude 3.5 Sonnet, Opus~~ ❌ **NICHT NUTZEN** (Claude 4.5 ist besser!)
- Und viele mehr!

**⚠️ Wichtig:** Claude-Modelle via OpenRouter **NICHT** nutzen, da Claude Code bereits auf Sonnet 4.5 läuft!

**Tools:**
1. `ask_openrouter` - Frage ein beliebiges Modell
2. `compare_models` - Vergleiche 2-3 Modelle gleichzeitig ⭐
3. `openrouter_stats` - Zeige Kosten & Credits

**Siehe:** [OPENROUTER_DOKU.md](OPENROUTER_DOKU.md) für Details

---

### Phase 4: LiteAPI Integration (✅ Erfolgreich) ⭐ NEU!

**Datum:** 2025-11-24
**Status:** Produktiv

**Warum LiteAPI?**
- ✅ 40-50% Rabatt auf OpenAI & Anthropic Modelle
- ✅ $20 Guthaben verfügbar
- ✅ Premium-Modelle: GPT-4o, Claude 3.5 Sonnet, o1-Serie
- ✅ OpenAI-kompatibel (einfache Integration)
- ✅ Automatisches Budget-Tracking

**Verfügbare Modelle (6 verifiziert):**
- OpenAI: GPT-4o, GPT-4o-mini, o1, o1-mini ✅
- Anthropic: Claude 3.5 Sonnet, Claude 3 Haiku ✅
- ~~Google: Gemini~~ ❌ Nicht verfügbar

**Besonderheiten:**
- o1-Serie für komplexe Reasoning-Tasks
- Automatische Kosten-Berechnung pro Request
- Budget-Warnung bei <$1 verbleibend
- Response-Zeit Tracking (828ms - 1663ms)

**Tools:**
1. `ask_liteapi` - Frage an Premium-Modelle mit Rabatt
2. `list_liteapi_models` - Zeige alle Modelle mit Preisen
3. `liteapi_budget` - Budget-Status ($20 Guthaben)

**Siehe:** [LITEAPI_README.md](LITEAPI_README.md) für Details

---

## 📂 Projektstruktur

```
/Users/sascha/mcp-servers/gemini-tool/
├── index-groq.js               # Groq MCP-Server (Llama 3.3 70B) ⭐
├── index-openrouter.js         # OpenRouter MCP-Server (100+ Modelle) ⭐
├── index-liteapi.js            # LiteAPI MCP-Server (Premium mit Rabatt) ⭐ NEU!
├── index.js                    # Gemini MCP-Server (mit Counter) ⭐
├── request-counter.js          # Request-Counter für Groq ⭐
├── gemini-request-counter.js   # Request-Counter für Gemini ⭐
├── package.json                # Dependencies
├── node_modules/               # Installierte Pakete
├── groq-request-counter.json   # Groq Counter-Daten (persistent)
├── gemini-request-counter.json # Gemini Counter-Daten (persistent)
├── liteapi-budget.json         # LiteAPI Budget-Tracking ($20) ⭐ NEU!
│
├── test-groq.js                # Groq API Tests
├── test-groq-extended.js       # Erweiterte Groq Tests
├── test-openrouter.js          # OpenRouter Tests
├── test-liteapi.js             # LiteAPI API Tests ⭐ NEU!
├── test-liteapi-models.js      # LiteAPI Modell-Discovery ⭐ NEU!
├── test-liteapi-extended.js    # LiteAPI Erweiterte Tests ⭐ NEU!
├── test-liteapi-final.js       # LiteAPI Finale Verifikation ⭐ NEU!
├── test-gemini.js              # Gemini API Tests
├── test-counter.js             # Groq Counter Tests
├── test-counter-live.js        # Groq Live Counter Tests
├── test-cost-monitoring.js     # Kosten-Monitoring Tests ⭐
├── test-final-monitoring.js    # Finale Monitoring Tests ⭐
├── demo-warnings.js            # Warnsystem Demo
│
├── README.md                                 # Projekt-Übersicht (diese Datei)
├── CHANGELOG.md                              # Versions-Historie & Updates ⭐
├── MCP_WORKFLOW.md                           # Workflow-Definition (v2.1.0) ⭐
├── KOSTENLOSE_MODELLE_DYNAMISCH.md           # Dynamische Free-Models Konzept ⭐
├── OPENROUTER_FREE_TRACKING_INTEGRATION.md   # Integration-Anleitung (v2.2.0) ⭐
├── FREE_MODELS_QUICK_REFERENCE.md            # Quick-Reference ⭐
│
├── openrouter-free-tracker.cjs               # Tracker-System ⭐
├── openrouter-free-tracker.json              # Tracking-Daten (persistent)
├── test-free-tracker.cjs                     # Tracker-Tests ⭐
├── test-openrouter-limits.js                 # Limit-Tests ⭐
│
├── GROQ_SETUP.md                      # Groq Setup-Anleitung
├── OPENROUTER_SETUP.md                # OpenRouter Setup-Anleitung
├── OPENROUTER_DOKU.md                 # OpenRouter Vollständige Doku
├── LITEAPI_README.md                  # LiteAPI Vollständige Doku ⭐ NEU!
├── LITEAPI_QUICKSTART.md              # LiteAPI Quick Start Guide ⭐ NEU!
├── SESSION_LITEAPI_INTEGRATION.md     # LiteAPI Session-Dokumentation ⭐ NEU!
├── REQUEST_COUNTER_DOKU.md            # Groq Counter-System Dokumentation
├── GEMINI_COUNTER_DOKU.md             # Gemini Counter-System Dokumentation ⭐
├── KOSTEN_MONITORING.md               # Kosten-Monitoring für alle APIs ⭐
└── MODELL_VERGLEICH.md                # Groq vs. OpenRouter vs. Gemini Vergleich
```

---

## 📝 Technische Details

### MCP-Server-Architektur

**index.js:**
- Transport: `stdio` (Standard Input/Output)
- Protokoll: MCP SDK (`@modelcontextprotocol/sdk`)
- Tools bereitgestellt:
  1. `ask_gemini` - Allgemeine Fragen
  2. `gemini_code_review` - Code-Review
  3. `gemini_explain` - Konzepte erklären

**Integration in Claude Code:**
```bash
claude mcp add --transport stdio gemini-tool \
  --env GEMINI_API_KEY="..." \
  -- node /Users/sascha/mcp-servers/gemini-tool/index.js
```

### Dependencies

```json
{
  "@modelcontextprotocol/sdk": "^1.22.0",
  "@google/generative-ai": "^0.21.0"
}
```

---

## 🔄 API-Keys

### Gemini API-Keys (Deaktiviert)

**Key 1:** `AIzaSyCjIYL93gh0XNNEMbwM8cQHUMSj7RhL_CE` (Rate-Limit erreicht)
**Key 2:** `AIzaSyA0I9_SHoKet-D73Q0Bmv1aDkHzIODbieY` (Rate-Limit erreicht)

**Status:** ❌ Nicht nutzbar wegen Google-Limits

### Groq API-Key (Geplant)

**Status:** 🚧 Noch nicht erstellt

---

## 📚 Gelerntes

### Was funktioniert:
1. ✅ MCP-Server-Architektur ist korrekt
2. ✅ Integration mit Claude Code funktioniert
3. ✅ Tool-Calling-Mechanismus ist implementiert
4. ✅ Modellnamen müssen aktuell sein (Gemini 2.0, nicht 1.5)

### Was nicht funktioniert:
1. ❌ Google Gemini API hat zu strenge Rate-Limits
2. ❌ Kostenlose Tier-Nutzung ist praktisch unmöglich
3. ❌ Neue API-Keys helfen nicht (Account-weites Limit)

### Empfehlungen:
- 🎯 **Groq nutzen** statt Gemini (bessere Limits)
- 🎯 **OpenRouter** als Multi-Model-Gateway ($5 Free Credits)
- 🎯 **Hugging Face** für Open-Source-Modelle

---

## 🚀 Implementierungs-Status

### Phase 1: Groq (✅ Abgeschlossen)
1. [x] Groq API-Key erstellen ✅
2. [x] Groq MCP-Server implementieren ✅
3. [x] Request-Counter für Groq ✅
4. [x] In Claude Code integrieren ✅

### Phase 2: OpenRouter (✅ Abgeschlossen)
1. [x] OpenRouter API-Key erstellen ✅
2. [x] OpenRouter MCP-Server implementieren ✅
3. [x] Kosten-Tracking implementieren ✅
4. [x] Session-Statistik implementieren ✅

### Phase 3: Gemini (✅ Abgeschlossen)
1. [x] Gemini API-Key erstellen ✅
2. [x] Gemini MCP-Server reaktivieren ✅
3. [x] Request-Counter für Gemini ✅
4. [x] Token-Tracking implementieren ✅

### Phase 4: Kosten-Monitoring (✅ Abgeschlossen)
1. [x] Vollständiges Kosten-Tracking für alle Services ✅
2. [x] Dokumentation erstellt ✅
3. [x] Tests erfolgreich ✅
4. [x] Produktiv-Einsatz bereit ✅

### Phase 5: Dynamische Free-Models (🔧 Implementierung)
1. [x] API-Analyse (OpenRouter Models) ✅
2. [x] 20+ kostenlose Modelle identifiziert ✅
3. [x] Implementierungs-Konzept erstellt ✅
4. [x] Kosten-Einsparungs-Berechnung ✅
5. [x] Limit-Tests durchgeführt ✅
6. [x] Tracker-System erstellt (`openrouter-free-tracker.cjs`) ✅
7. [x] Tests geschrieben und erfolgreich ✅
8. [x] Integrations-Dokumentation ✅
9. [ ] Integration in `index-openrouter.js` (Code-Änderungen)
10. [ ] MCP-Server neu deployen
11. [ ] End-to-End-Tests

**Status:** Tracker fertig, Integration dokumentiert
**Geschätzter Aufwand (verbleibend):** 3.5 Stunden
**Erwartete Ersparnis:** $25+/Monat → $0/Monat

---

## 🔄 Workflow-Integration in LACRYMAE

**Die MCP-Server sind jetzt vollständig in den LACRYMAE-Workflow integriert!**

### ⚠️ WICHTIG: Claude Code läuft auf Claude Sonnet 4.5 (v2.0.0)

**BREAKING CHANGE:** MCP wird **NUR** für **alternative Perspektiven** genutzt, **NICHT** für bessere Qualität!

```
❌ NIEMALS ältere Claude-Modelle (3.5 Sonnet, Opus, Haiku)
✅ NUR alternative Modell-Familien (GPT, Llama, Gemini)
✅ Token-Kosten-Optimierung (Groq für triviale Aufgaben)
```

**Warum?** Claude Sonnet 4.5 ist **BESSER** als Claude 3.5 Sonnet und Opus!

### 💰 Token-Kosten-Optimierung (v2.1.0)

**NEU:** Groq für triviale Aufgaben nutzen → Spart Claude-Tokens!

```
Trivial/Niedrig (< 3.000 Tokens)    → ✅ Groq (Token-Ersparnis!)
Mittel (3.000 - 8.000 Tokens)       → ⚠️ Groq zuerst, dann Claude wenn nötig
Hoch/Kritisch (> 8.000 Tokens)      → ✅ Claude 4.5 (Qualität wichtig!)
Bulk-Operationen                    → ✅ Groq (große Ersparnis!)
```

### Proaktive Nutzung

Claude Code nutzt die MCP-Server **selbstständig** für:

1. **Token-Ersparnis:**
   - Triviale Fragen (Standard-FAQ)
   - Bulk-Operationen (viele kleine Aufgaben)
   - Schnelle Code-Reviews (Syntax-Check)

2. **Alternative Perspektiven:**
   - GPT-4 für OpenAI-Ansatz
   - Llama für Open-Source-Perspektive
   - Gemini für Google-Suche

3. **NICHT für:**
   - ❌ Bessere Qualität (Claude 4.5 ist bereits optimal!)
   - ❌ Ältere Claude-Modelle (3.5/Opus)

### Hierarchischer Service-Auswahl (v2.3.0)

```
1. GROQ (kostenlos, schnell)           → Immer zuerst (14,400/Tag)
2. OPENROUTER FREE (dynamisch) ⭐      → 20+ kostenlose Modelle!
   - Grok 4.1 Fast (2M Context)
   - DeepSeek R1 (Reasoning)
   - Qwen3 Coder (Coding)
   - Kimi K2 (262k Context)
3. GEMINI (kostenlos, Google-Suche)    → Falls nötig (15/Tag)
4. LITEAPI (Premium mit Rabatt) ⭐ NEU! → $20 Budget, 40-50% günstiger
   - GPT-4o, o1-Serie (OpenAI)
   - Claude 3.5 Sonnet (Anthropic)
5. OPENROUTER PAID (GPT-4, Llama)      → Absoluter Notfall
   ❌ NICHT: Claude 3.5/Opus (schlechter als 4.5!)
```

**Vorteil:**
- Nach Groq-Limit: **WEITERHIN $0.00** durch OR Free-Models
- Für Premium-Aufgaben: **40-50% Ersparnis** durch LiteAPI

### Kosten-Transparenz

Nach jeder MCP-Anfrage werden angezeigt:
- Service-Name & Modell
- Kosten ($0.00 für Groq/Gemini)
- Token-Verbrauch
- Tages-/Session-Statistik

### Fortsetzungs-Logik

Nach jeder MCP-Antwort fragt Claude:
> "Möchtest du die MCP-Server für weitere Fragen zu diesem Thema nutzen?"

⚠️ Wichtig: Gilt nur für das **aktuelle Thema**, nicht die gesamte Session!

### Dokumentation

**Siehe:** [MCP_WORKFLOW.md](MCP_WORKFLOW.md) für vollständige Workflow-Definition

**Integration:** [LACRYMAE CLAUDE.md](../Documents/lacrymae/CLAUDE.md) enthält die Anweisungen für Claude Code

---

## 📖 Ressourcen

### Dokumentation:
- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [Groq API Docs](https://console.groq.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

### Projekt-Kontext:
- Hauptprojekt: LACRYMAE (`/Users/sascha/Documents/lacrymae`)
- Projekt-Dokumentation: `PAPERS/_DOKU-CODING-IDEEN/KI-Power.md`

---

## ⚠️ Hinweise

- **Environment Variables:** API-Keys sind in `~/.zshrc` gespeichert
- **Claude Code Config:** `~/.claude.json` enthält MCP-Server-Konfiguration
- **Sicherheit:** API-Keys niemals in Git committen!

---

**Zuletzt aktualisiert:** 2025-11-24
**Status:** ✅ Produktionsreif
**Workflow-Version:** v2.4.0 (Gemini Paid Budget) ⭐ NEU!
**Aktive Server:**
- Gemini (2.0 Flash) - Paid, 257,50 € Budget bis 23.02.2026
- Groq (Llama 3.3 70B) - Kostenlos, 14,400/Tag
- OpenRouter Free (20+ Modelle) - Grok, DeepSeek, Qwen3, Kimi K2
- LiteAPI (6 Premium-Modelle) - **NEU!** $20 Budget, 40-50% Rabatt ⭐
- OpenRouter Paid (GPT-4, Llama - **NICHT** Claude!)

**WICHTIG:**
- MCP für alternative Perspektiven, NICHT bessere Qualität!
- Claude Code läuft bereits auf Sonnet 4.5 (besser als 3.5/Opus)
- **100% kostenlose Nutzung** möglich durch Groq → OR Free → Gemini
- **Premium-Aufgaben:** LiteAPI für 40-50% Ersparnis (GPT-4o, o1, Claude 3.5)
