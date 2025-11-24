# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

---

## [Unreleased]

### Geplante Features
- [ ] `list_free_models` Tool implementieren (Phase 1)
- [ ] Free-Models Caching-System (Phase 2)
- [ ] Intelligente Task-Kategorie-Erkennung (Phase 4)
- [ ] Web-Dashboard für Counter-Übersicht (alle Services)
- [ ] Export zu CSV/JSON
- [ ] Historische Daten (7-Tage-Verlauf)
- [ ] Email-Alerts bei Limit-Warnung

---

## [2.4.0] - 2025-11-24 ⭐ NEU!

### 🎉 Feature: Gemini Paid Budget-Tracking - FreeTrialUpgrade 257,50 €

**Zusammenfassung:**
Gemini von Free-Tier (15 Requests/Tag) auf Paid-Tier mit Budget-Tracking umgestellt. FreeTrialUpgrade-Aktion mit 257,50 € Guthaben (gültig bis 23. Februar 2026). Automatische Kosten-Berechnung und Budget-Überwachung implementiert.

### ✨ Hinzugefügt

#### Budget-System
- ✅ `gemini-budget-manager.js` - Komplettes Budget-Management (200 Zeilen)
- ✅ `gemini-budget.json` - Budget-Tracking-Datei
- ✅ Automatische Kosten-Berechnung (Gemini 2.0 Flash: $0.35 input / $1.50 output per 1M tokens)
- ✅ USD zu EUR Konvertierung (0.92 Kurs)
- ✅ Neues Tool: `gemini_budget` - Budget-Status anzeigen
- ✅ Warnsystem bei niedrigem Budget (<1 €, >90% verbraucht)
- ✅ Ablaufdatum-Prüfung (23.02.2026)
- ✅ Request-Historie (letzte 100 Requests)

#### MCP-Server Updates
- ✅ `index.js` - Budget-Integration (Zeilen 18-22, 144-149, 228-246)
- ✅ Budget-Check vor jedem Request
- ✅ Kosten-Update nach jedem Request
- ✅ Kosten-Breakdown in Response (€0.000XXX pro Request)
- ✅ Verbleibendes Budget in jeder Antwort
- ✅ Tool `gemini_budget` hinzugefügt

#### Request-Counter Anpassung
- ✅ `gemini-request-counter.js` v2.0.0 - Von Limit zu Statistik
- ⚠️ Free-Tier-Limit (15/Tag) entfernt
- ✅ Nur noch Statistik-Counter (keine Blockierung)
- ✅ `canMakeRequest()` gibt immer `allowed: true` zurück
- ✅ Budget-Manager übernimmt Limit-Kontrolle

### 🔧 Geändert

- 🔄 **Neuer API-Key:** Alter Key revoked (GitHub-Sicherheit), neuer Key erstellt
- 🔄 **MCP-Server:** Neu registriert mit neuem GEMINI_API_KEY
- 🔄 **README.md:** Gemini von "Free 15/Tag" zu "Paid 257,50 € Budget"
- 🔄 **Workflow-Version:** v2.3.0 → v2.4.0

### 📊 Statistik

- **Budget:** 257,50 € (FreeTrialUpgrade-Aktion)
- **Gültig bis:** 23. Februar 2026
- **Preise:** Gemini 2.0 Flash
  - Input: $0.35 / 1M Tokens (≈ €0.322 / 1M)
  - Output: $1.50 / 1M Tokens (≈ €1.38 / 1M)
- **Geschätzte Nutzung:** ~186.000 Requests mit durchschnittlich 1.000 Tokens
- **Neue Dateien:** 2 (gemini-budget-manager.js, gemini-budget.json)
- **Code-Änderungen:** ~350 neue Zeilen

### 🔐 Sicherheit

- ✅ **API-Key Security:** Alter Key nach GitHub-Vorfall revoked
- ✅ **Offline-Only:** Neuer Key nur in `.env` (nie committed)
- ✅ **Budget-Protection:** Automatischer Stop bei Budget = 0
- ✅ **Expiry-Check:** Automatische Prüfung des Ablaufdatums

### 📚 Dokumentation

- 📝 README.md aktualisiert (Gemini Paid-Status)
- 📝 CHANGELOG.md v2.4.0 hinzugefügt

### ⚙️ Installation

```bash
# Neuer Gemini API-Key (OFFLINE!)
export GEMINI_API_KEY="AIzaSy..." # (nicht committen!)

# MCP-Server neu registrieren
claude mcp remove gemini-tool
claude mcp add --transport stdio gemini-tool \
  --env GEMINI_API_KEY="$GEMINI_API_KEY" \
  -- node /Users/sascha/mcp-servers/gemini-tool/index.js

# Status prüfen
claude mcp list
```

### 🎯 Nutzung

```markdown
# Budget-Status prüfen
@gemini-tool gemini_budget

# Frage stellen (mit Kosten-Tracking)
@gemini-tool ask_gemini --prompt "Erkläre Quantencomputing"

# Ausgabe zeigt:
# 💰 Kosten: 0.000142 € (257.498 € verbleibend)
# 📈 Requests heute: 1 (0.06% Budget verbraucht)
```

---

## [2.3.0] - 2025-11-24

### 🎉 Feature: LiteAPI Integration - Premium-Modelle mit 40-50% Rabatt

**Zusammenfassung:**
LiteAPI als vierter MCP-Server hinzugefügt. Bietet Zugriff auf Premium-Modelle von OpenAI (GPT-4o, o1-Serie) und Anthropic (Claude 3.5 Sonnet) mit 40-50% Rabatt. $20 Guthaben verfügbar mit automatischem Budget-Tracking.

### ✨ Hinzugefügt

#### MCP-Server
- ✅ `index-liteapi.js` - LiteAPI MCP-Server (380 Zeilen)
- ✅ 3 Tools implementiert:
  - `ask_liteapi` - Fragen an Premium-Modelle
  - `list_liteapi_models` - Alle Modelle mit Details
  - `liteapi_budget` - Budget-Status ($20)
- ✅ Automatisches Budget-Tracking System
- ✅ Kosten-Berechnung pro Request
- ✅ Response-Zeit Monitoring
- ✅ Spezial-Handling für o1-Modelle (`max_completion_tokens`)

#### Modelle (6 verifiziert)
- ✅ OpenAI: gpt-4o, gpt-4o-mini, o1, o1-mini
- ✅ Anthropic: claude-3.5-sonnet, claude-3-haiku
- ❌ Google: Gemini nicht verfügbar

#### Test-Suite
- ✅ `test-liteapi.js` - Basis-Funktionalität (120 Zeilen)
- ✅ `test-liteapi-models.js` - Modell-Discovery (80 Zeilen)
- ✅ `test-liteapi-extended.js` - Erweiterte Tests (60 Zeilen)
- ✅ `test-liteapi-final.js` - Finale Verifikation (100 Zeilen)
- ✅ `test-liteapi-models-endpoint.js` - Endpoint-Debugging (70 Zeilen)

#### Dokumentation (1.130+ Zeilen)
- ✅ `LITEAPI_README.md` - Vollständige Dokumentation (330 Zeilen)
  - Alle 6 Modelle mit Preisen und Details
  - Installation & Setup
  - Tool-Dokumentation mit Beispielen
  - Kosten-Optimierung & Budget-Tipps
  - Vergleich: LiteAPI vs. OpenRouter
  - Troubleshooting Guide
- ✅ `LITEAPI_QUICKSTART.md` - Quick Start Guide (200 Zeilen)
  - 5-Minuten Setup
  - Erste Befehle
  - Modell-Empfehlungen nach Use Case
  - Häufige Fehler & Lösungen
- ✅ `SESSION_LITEAPI_INTEGRATION.md` - Session-Dokumentation (600 Zeilen)
  - Vollständiger Entwicklungsprozess
  - Technische Analyse (4 Phasen)
  - Alle erstellten Dateien
  - Bekannte Probleme & Lösungen
  - Test-Ergebnisse
  - Performance-Analyse
  - Lessons Learned

#### Sicherheit
- ✅ API-Key in `.env` gespeichert (OFFLINE)
- ✅ `.env.example` aktualisiert mit LITEAPI_KEY
- ✅ Keine Keys in Dokumentation oder Code

### 📊 Statistiken

**Modell-Tests:**
- 20+ Modelle getestet
- 6 funktionierende Modelle identifiziert
- Response-Zeit: 828ms - 1663ms (Durchschnitt: 1242ms)

**Code:**
- 810 Zeilen Production Code
- 430 Zeilen Test Code
- 1.130 Zeilen Dokumentation
- **Total:** ~2.370 Zeilen

**Budget:**
- $20 Guthaben verfügbar
- Mit gpt-4o-mini: ~26.000 Anfragen möglich
- Mit claude-3-haiku: ~54.000 Anfragen möglich

### 🔧 Technische Details

**API-Format:** OpenAI-kompatibel
**Base-URL:** `https://app.liteapi.ai/api/v1`
**Auth:** `Authorization: Bearer <key>`
**Modell-Format:** `provider/model-name`

**Besonderheiten:**
- o1-Modelle benötigen `max_completion_tokens` Parameter
- GET /models Endpoint nicht verfügbar (404) - Modelle hardcoded
- Automatische Budget-Warnung bei <$1

### 📈 Performance

**Modell-Ranking (nach Response-Zeit):**
1. openai/o1 (828ms)
2. openai/o1-mini (1099ms)
3. anthropic/claude-3-haiku (1209ms)
4. openai/gpt-4o (1260ms)
5. openai/gpt-4o-mini (1392ms)
6. anthropic/claude-3.5-sonnet (1663ms)

**Preis-Ranking (Input, per 1M Tokens):**
1. gpt-4o-mini ($0.15) - Beste Preis/Leistung
2. claude-3-haiku ($0.25) - Günstigste Option
3. gpt-4o ($2.50) - Beste Qualität
4. claude-3.5-sonnet ($3.00) - Anthropic-Flaggschiff
5. o1-mini ($3.00) - Reasoning spezialisiert
6. o1 ($15.00) - Premium Reasoning

### 🔄 Workflow-Integration

**Hierarchische Service-Auswahl aktualisiert (v2.3.0):**
```
1. GROQ (kostenlos, schnell)           → 14,400/Tag
2. OPENROUTER FREE (dynamisch)         → 20+ Modelle
3. GEMINI (kostenlos, Google-Suche)    → 15/Tag
4. LITEAPI (Premium mit Rabatt) ⭐ NEU! → $20 Budget, 40-50% günstiger
5. OPENROUTER PAID                     → Notfall
```

**Vorteil:**
- Kostenlose Nutzung: Groq → OR Free → Gemini
- Premium-Aufgaben: LiteAPI für 40-50% Ersparnis

### 🐛 Bekannte Probleme & Lösungen

1. **GET /models gibt 404**
   - Problem: Endpoint dokumentiert aber nicht implementiert
   - Lösung: 6 Modelle hardcoded und verifiziert

2. **o1-Modelle mit max_tokens**
   - Problem: Benötigen `max_completion_tokens` statt `max_tokens`
   - Lösung: Automatische Erkennung im MCP-Server

3. **Google Gemini nicht verfügbar**
   - Problem: Alle Google-Modelle geben "Model not found"
   - Status: Google-Modelle aktuell nicht auf LiteAPI

### 📝 Dokumentations-Struktur

```
LiteAPI Dokumentation (3-teilig):
├── LITEAPI_QUICKSTART.md    → Schneller Einstieg (5 Min)
├── LITEAPI_README.md         → Vollständige Referenz
└── SESSION_LITEAPI_INTEGRATION.md → Entwicklungs-Prozess
```

### ✅ Checkliste

- [x] MCP-Server erstellt und getestet
- [x] 6 Modelle verifiziert
- [x] Budget-Tracking implementiert
- [x] Test-Suite erstellt (5 Skripte)
- [x] Umfassende Dokumentation (1.130+ Zeilen)
- [x] API-Keys sicher gespeichert
- [x] MCP-Server zu Claude Code hinzugefügt
- [x] Verbindung verifiziert (✓ Connected)
- [x] README.md aktualisiert
- [x] CHANGELOG.md aktualisiert

**Status:** ✅ Produktionsbereit
**Geschätzter Zeitaufwand:** 2 Stunden
**Budget verfügbar:** $20
**Erwartete Ersparnis:** 40-50% auf Premium-Modelle

---

## [2.2.0] - 2025-11-24 (In Entwicklung)

### 🎉 Feature: Dynamische Kostenlose Modelle - Tracking-System

**Zusammenfassung:**
OpenRouter bietet 20+ kostenlose Modelle ohne Rate-Limit-Headers. Diese Version implementiert ein lokales Tracking-System, um Verfügbarkeit, Erfolgsraten und Fehler zu tracken und automatisch die besten verfügbaren Modelle zu nutzen.

---

### 📊 Limit-Tests durchgeführt

**Erkenntnisse:**
- ❌ OpenRouter sendet **KEINE** Rate-Limit-Headers für Free-Models
- ✅ Upstream-Limits beim Provider (xAI, DeepSeek, etc.)
- ⚠️ Limits sind dynamisch und nicht vorhersagbar
- ✅ Manche Modelle funktionieren (Grok, Qwen3)
- ❌ Manche sind rate-limited (DeepSeek R1, Mistral Small)
- ❌ Manche haben Privacy-Restrictions (Kimi K2)

**Test-Ergebnisse:**
```
✅ Grok 4.1 Fast          → Funktioniert
❌ DeepSeek R1 0528       → 429 (rate-limited)
✅ Qwen3 Coder            → Funktioniert
❌ Kimi K2                → 404 (privacy policy)
❌ Mistral Small 3.2 24B  → 429 (rate-limited)
```

---

### 📋 Added (Tracker-System implementiert)

#### Tracker-System
- ✅ **`openrouter-free-tracker.cjs`** - Lokales Tracking-System (300 Zeilen)
  - Tracked Requests, Erfolge, Fehler pro Modell
  - Verfügbarkeits-Status (available, rate_limited, unavailable)
  - Erfolgsraten-Berechnung
  - Intelligente Modell-Sortierung
  - Automatischer Reset um Mitternacht
  - Persistierung in `openrouter-free-tracker.json`

- ✅ **`test-free-tracker.cjs`** - Umfangreiche Tests
  - Simuliert erfolgreiche Requests
  - Simuliert verschiedene Fehler (429, 404)
  - Verifiziert Statistik-Berechnungen
  - Prüft formatierte Ausgabe

- ✅ **`test-openrouter-limits.js`** - Live-Tests gegen API
  - Testet 5 verschiedene Free-Models
  - Analysiert Rate-Limit-Headers (Ergebnis: keine vorhanden)
  - Dokumentiert Verfügbarkeit

#### Dokumentation
- ✅ **`KOSTENLOSE_MODELLE_DYNAMISCH.md`** - Implementierungs-Konzept (16 KB)
  - API-Analyse (OpenRouter Models API)
  - 20+ verfügbare Free-Models identifiziert
  - Implementierungs-Strategie (4 Phasen, ~8h)
  - Code-Beispiele für alle Komponenten
  - Kosten-Einsparungs-Berechnung ($25.50/Monat → $0.00)
  - Kategorisierung (Coding, Reasoning, Multimodal)

- ✅ **`OPENROUTER_FREE_TRACKING_INTEGRATION.md`** - Integration-Anleitung (26 KB)
  - Problem-Analyse (keine Rate-Limit-Headers)
  - Vollständige Code-Beispiele für Integration
  - Neue MCP-Tools: `openrouter_free_stats`, `ask_free_model`
  - Workflow-Integration (v2.2.0)
  - Test-Szenarien
  - Checkliste für Implementation

- ✅ **`FREE_MODELS_QUICK_REFERENCE.md`** - Schnell-Nachschlagewerk (5 KB)
  - Top 5 Modell-Empfehlungen
  - Vollständige kategorisierte Liste
  - API-Abfrage-Befehle
  - Nutzungs-Tipps

#### API-Findings
- ✅ **Grok 4.1 Fast** - 2M Context, kostenlos! ⭐
- ✅ **DeepSeek R1 0528** - Reasoning-Spezialist, kostenlos
- ✅ **Qwen3 Coder 480B** - Coding-Experte, kostenlos
- ✅ **Kimi K2** - 262k Context, kostenlos
- ✅ **Nemotron Nano 12B VL** - Video+Image, kostenlos
- ✅ **Mistral Small 3.2 24B** - Allround, kostenlos

### 🔄 Changed (Geplant)

#### Workflow-Hierarchie (v2.2.0)
**Alt (v2.1.0):**
```
1. GROQ (14,400/Tag)
2. GEMINI (15/Tag)
3. OPENROUTER PAID
```

**Neu (v2.2.0 - geplant):**
```
1. GROQ (14,400/Tag)
2. OPENROUTER FREE (20+ Modelle) ⭐ NEU!
3. GEMINI (15/Tag)
4. OPENROUTER PAID
```

#### Geplante Tools
- [ ] `list_free_models` - Listet kostenlose Modelle mit Kategorien
- [ ] Automatisches 24h Caching
- [ ] Intelligente Modell-Auswahl basierend auf Task-Kategorie
- [ ] Fallback-Logik bei Rate-Limits

### 💰 Impact (Erwartet)

**Kosten-Einsparung:**
- **Vorher:** Nach Groq-Limit → Gemini (15 Requests) → OpenRouter bezahlen
- **Nachher:** Nach Groq-Limit → 20+ Free OR-Modelle → Immer noch $0.00!
- **Beispiel:** 100 Requests/Tag nach Groq-Limit
  - Alt: $0.85/Tag = $25.50/Monat
  - Neu: $0.00/Tag = $0.00/Monat
  - **Ersparnis: 100%** 🎉

### 📚 Dokumentation

- ✅ README.md aktualisiert mit v2.2.0 Feature
- ✅ Projektstruktur erweitert
- ✅ Hierarchie-Diagramm angepasst

### ⏳ Status

**Tracker-System:** ✅ Fertig implementiert und getestet
**Integration:** 📋 Dokumentiert, Code-Änderungen ausstehend
**Geschätzter Aufwand (verbleibend):** 3.5 Stunden
**Nächster Schritt:** Integration in `index-openrouter.js`

#### Verbleibende Tasks
- [ ] Tracker in `index-openrouter.js` importieren
- [ ] Tool `openrouter_free_stats` hinzufügen
- [ ] Tool `ask_free_model` hinzufügen
- [ ] Tracking in bestehende Tools einbauen
- [ ] End-to-End-Tests
- [ ] MCP-Server neu deployen

---

## [2.0.0] - 2025-11-24

### 🎉 Major Release: Vollständiges Kosten-Monitoring

**Zusammenfassung:**
Alle drei MCP-Server (Groq, Gemini, OpenRouter) haben jetzt umfassendes Kosten- und Limit-Monitoring. Du wirst zu jeder Zeit über entstandene Kosten und Nutzungslimits informiert!

---

### ✨ Added (Neu)

#### Gemini Request-Counter
- ✅ **`gemini-request-counter.js`** - Counter-Modul analog zu Groq
  - Tägliches Limit: 15 Requests
  - 3-Stufen-Warnsystem (60%, 80%, 93%)
  - Automatischer Reset um Mitternacht
  - Token-Tracking (kumulativ)
  - Persistente Speicherung in `gemini-request-counter.json`

- ✅ **`gemini_stats` Tool** - Zeigt Counter-Statistik
  - Progress-Bar
  - Verbleibende Requests
  - Zeit bis Reset
  - Gesamt-Tokens

- ✅ **Token-Info in Gemini-Responses**
  - Prompt-Tokens
  - Completion-Tokens
  - Total-Tokens
  - Requests heute (X/15)

#### OpenRouter Kosten-Tracking
- ✅ **Modell-Preise** - Für 12+ beliebte Modelle
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude 3.5, Opus, Haiku)
  - Google (Gemini Pro, Flash)
  - Meta (Llama 3.1 70B, 8B)
  - Mistral (Mixtral, Mistral)

- ✅ **Kosten-Berechnung** - `calculateCost()` Funktion
  - Input-Kosten (prompt_tokens × Preis)
  - Output-Kosten (completion_tokens × Preis)
  - Total-Kosten
  - Kosten pro Request in Response angezeigt

- ✅ **Session-Statistik** - Kumulatives Tracking
  - Total Requests
  - Total Kosten
  - Total Tokens
  - Pro-Modell-Breakdown
  - Anzeige in `openrouter_stats`

- ✅ **Kosten in `compare_models`**
  - Einzelne Kosten pro Modell
  - Gesamt-Kosten des Vergleichs
  - Session-Total

#### Dokumentation
- ✅ **GEMINI_COUNTER_DOKU.md** - Vollständige Gemini Counter-Dokumentation (82 KB)
  - Architektur
  - Features
  - Tools
  - Troubleshooting
  - Best Practices

- ✅ **CHANGELOG.md** - Versions-Historie (diese Datei)

- ✅ **Test-Skripte**
  - `test-final-monitoring.js` - Finale Monitoring-Tests
  - Verifiziert Kosten-Berechnung für OpenRouter
  - Tests mit GPT-3.5 und Claude Haiku

---

### 🔄 Changed (Geändert)

#### index.js (Gemini MCP-Server)
- **Counter-Integration**
  - Import von `gemini-request-counter.js`
  - Counter-Prüfung vor jedem Request
  - Counter-Erhöhung nach erfolgreichem Request
  - Token-Info in Response

- **Neue Response-Formatierung**
  ```
  🤖 Gemini 2.0 Flash:
  [Antwort]

  📊 Tokens: 7 prompt + 8 completion = 15 total
  📈 Requests heute: 3/15 (20.00%)
  ```

- **gemini_stats Tool hinzugefügt**

#### index-openrouter.js (OpenRouter MCP-Server)
- **Kosten-Tracking-System**
  - `MODEL_PRICES` Konstante hinzugefügt
  - `calculateCost()` Funktion implementiert
  - `updateSessionStats()` Funktion implementiert
  - `sessionStats` Objekt für Session-Tracking

- **Erweiterte Response-Formatierung**
  ```
  🤖 OpenRouter (gpt-3.5-turbo):
  [Antwort]

  💰 Kosten: $0.000030 ($0.001/1k input, $0.002/1k output)
  📊 Tokens: 14 prompt + 8 completion = 22 total
  📈 Session-Total: 1 Requests, $0.000030
  ```

- **openrouter_stats erweitert**
  - Session-Statistik
  - Pro-Modell-Breakdown
  - Kumulierte Kosten

#### README.md
- **Features-Sektion erweitert**
  - Vollständiges Kosten-Monitoring für alle Services
  - Gemini Counter-Info
  - OpenRouter Kosten-Tracking-Info

- **Projektstruktur aktualisiert**
  - `gemini-request-counter.js` hinzugefügt
  - `gemini-request-counter.json` hinzugefügt
  - `test-final-monitoring.js` hinzugefügt
  - Neue Dokumentationsdateien

- **Implementierungs-Status** (statt "Nächste Schritte")
  - Phase 1: Groq ✅
  - Phase 2: OpenRouter ✅
  - Phase 3: Gemini ✅
  - Phase 4: Kosten-Monitoring ✅

#### KOSTEN_MONITORING.md
- **Gemini-Sektion komplett überarbeitet**
  - Status: "Manuelles Tracking" → "Vollständig implementiert"
  - Counter-Features dokumentiert
  - Tools-Sektion hinzugefügt

- **Implementierungs-Vorschläge** → **Implementierungs-Status**
  - Alle Features als ✅ markiert
  - Test-Status hinzugefügt

- **Zusammenfassung-Tabelle aktualisiert**
  - Gemini: "Fehlt" → "Implementiert"
  - OpenRouter: "Nicht nötig" → "Session-Stats"
  - Status: "Verbesserungs-Potenzial" → "Vollständig implementiert"

#### MODELL_VERGLEICH.md
- **Status-Spalte in Übersichtstabelle**
  - Gemini: "Deaktiviert" → "Aktiv"

---

### 🐛 Fixed (Behoben)

- **Gemini:** Fehlende Limit-Überwachung
  - Vorher: Keine Warnung bei Limit-Annäherung
  - Nachher: 3-Stufen-Warnsystem ab 60% Nutzung

- **OpenRouter:** Keine Kosten-Transparenz
  - Vorher: User wusste nicht, was Requests kosten
  - Nachher: Kosten in jeder Response + Session-Total

- **Alle Services:** Inkonsistente Monitoring-Strategien
  - Vorher: Groq hatte Counter, andere nicht
  - Nachher: Einheitliches Monitoring für alle

---

### 📊 Performance

**Counter-Overhead:**
- Groq Counter: ~5-15ms pro Request
- Gemini Counter: ~5-15ms pro Request
- OpenRouter Kosten-Berechnung: <1ms pro Request

**Speicher-Nutzung:**
- Groq Counter-Datei: ~150 Bytes
- Gemini Counter-Datei: ~150 Bytes
- OpenRouter Session-Stats: ~1KB RAM

---

### 🧪 Testing

**Neue Tests:**
- ✅ `test-cost-monitoring.js` - Kosten-Monitoring für alle drei APIs
- ✅ `test-final-monitoring.js` - OpenRouter Kosten-Berechnung
- ✅ Gemini Counter manuell getestet
- ✅ Alle MCP-Server-Verbindungen verifiziert

**Test-Ergebnisse:**
```
✅ Groq:       Request-Counter funktioniert (8/14,400)
✅ Gemini:     Request-Counter funktioniert (0/15)
✅ OpenRouter: Kosten-Berechnung korrekt
               - GPT-3.5: $0.000030 (22 Tokens)
               - Claude Haiku: $0.000130 (119 Tokens)
```

---

## [1.5.0] - 2025-11-24

### Added
- **Gemini reaktiviert** mit neuem API-Key
- Gemini als dritter aktiver MCP-Server

### Fixed
- Gemini API-Key-Problem behoben
- MCP-Server-Konfiguration korrigiert

---

## [1.0.0] - 2025-11-24

### Added (Initial Release)

#### Groq Integration
- **index-groq.js** - Groq MCP-Server
  - Llama 3.3 70B Integration
  - Kostenlos: 14,400 Requests/Tag
  - Ultra-schnell (100+ Tokens/Sekunde)

- **request-counter.js** - Groq Request-Counter
  - Automatisches Tracking
  - 3-Stufen-Warnsystem (80%, 90%, 95%)
  - Automatischer Reset um Mitternacht
  - `groq_stats` Tool

- **REQUEST_COUNTER_DOKU.md** - Counter-Dokumentation

#### OpenRouter Integration
- **index-openrouter.js** - OpenRouter MCP-Server
  - 100+ Modelle (GPT, Claude, Gemini, Llama)
  - $5 Free Credits
  - `ask_openrouter` Tool
  - `compare_models` Tool (2-3 Modelle gleichzeitig)
  - `openrouter_stats` Tool

- **OPENROUTER_DOKU.md** - OpenRouter vollständige Dokumentation (83 KB)
- **OPENROUTER_SETUP.md** - 3-Minuten Quick-Start

#### Gemini (Initial, später deaktiviert)
- **index.js** - Gemini MCP-Server
  - Gemini 2.0 Flash
  - `ask_gemini` Tool
  - `gemini_code_review` Tool
  - `gemini_explain` Tool

#### Dokumentation
- **README.md** - Projekt-Übersicht
- **MODELL_VERGLEICH.md** - Groq vs. OpenRouter Vergleich
- **KOSTEN_MONITORING.md** - Kosten-Monitoring-Grundlagen
- **GROQ_SETUP.md** - Groq Setup-Anleitung

#### Tests
- **test-groq.js** - Groq API Tests
- **test-groq-extended.js** - 6 verschiedene Fragen
- **test-openrouter.js** - OpenRouter Tests (GPT-4, Claude)
- **test-gemini.js** - Gemini API Tests
- **test-counter.js** - Counter-Funktionalität
- **test-counter-live.js** - Live Counter mit echten Requests
- **demo-warnings.js** - Warnsystem-Demo

---

## Versionshistorie Übersicht

| Version | Datum | Beschreibung | Breaking Changes |
|---------|-------|--------------|------------------|
| **2.0.0** | 2025-11-24 | **Vollständiges Kosten-Monitoring** | Nein |
| 1.5.0 | 2025-11-24 | Gemini reaktiviert | Nein |
| 1.0.0 | 2025-11-24 | Initial Release (Groq + OpenRouter) | - |

---

## Migration Guide

### Von 1.5.0 zu 2.0.0

**Keine Breaking Changes!** Alle bestehenden Tools funktionieren weiterhin.

**Neue Features nutzen:**

```bash
# 1. MCP-Server neu laden für Updates
claude mcp remove gemini-tool
claude mcp remove openrouter-tool

claude mcp add --transport stdio gemini-tool \
  --env GEMINI_API_KEY="..." \
  -- node /path/to/index.js

claude mcp add --transport stdio openrouter-tool \
  --env OPENROUTER_API_KEY="..." \
  -- node /path/to/index-openrouter.js

# 2. Neue Tools nutzen
"Zeige mir die Gemini-Stats"
"Zeige mir die OpenRouter-Stats"

# 3. Kosten beachten in OpenRouter-Responses
# → Automatisch in jeder Response angezeigt!
```

---

## Lizenz

Dieses Projekt ist privat und nicht zur öffentlichen Nutzung bestimmt.

---

## Danksagungen

- **Groq** - Für kostenlose, ultra-schnelle LLM-API
- **OpenRouter** - Für Multi-Model-Gateway mit $5 Free Credits
- **Google** - Für Gemini 2.0 Flash API
- **Anthropic** - Für MCP (Model Context Protocol)

---

**Projekt:** MCP-Server für externe KI-APIs
**Maintainer:** Sascha
**Erstellt:** 2025-11-24
**Letztes Update:** 2025-11-24
