# MCP-Server Workflow für LACRYMAE

**Erstellt:** 2025-11-24
**Version:** 2.1.0
**Letzte Änderung:** 2025-11-24

---

## 📋 CHANGELOG

### v2.1.0 (2025-11-24)
- **NEU:** Token-Kosten-Optimierung
- **NEU:** Groq für triviale Aufgaben zur Token-Ersparnis
- **NEU:** Komplexitäts-basierte Entscheidungs-Matrix

### v2.0.0 (2025-11-24) - BREAKING CHANGE
- **WICHTIG:** Claude Code läuft auf Claude Sonnet 4.5
- **ENTFERNT:** Claude 3.5 Sonnet/Opus aus Empfehlungen
- **NEU:** Nur alternative Modell-Familien (GPT, Llama, Gemini)
- **GRUND:** Claude 4.5 ist BESSER als 3.5/Opus!

---

## 📋 Übersicht

Dieser Workflow definiert, wie Claude Code im LACRYMAE-Projekt die externen MCP-Server (Groq, Gemini, OpenRouter) proaktiv und strategisch nutzt.

**Kern-Prinzip:** MCP für **alternative Perspektiven**, NICHT für bessere Qualität!

---

## 🎯 Wann MCP-Server nutzen?

**⚠️ WICHTIG:** Claude Code läuft auf **Claude Sonnet 4.5** (neuestes Modell)!

MCP macht Sinn für **ZWEI Gründe:**

### 💰 GRUND 1: Token-Kosten sparen (NEU!)

**Groq für triviale Aufgaben nutzen → Spart Claude-Tokens!**

```
✅ Triviale Fragen (Standardwissen: "Was ist async/await?")
✅ Einfache Code-Reviews (Syntax-Check, Best-Practices)
✅ Bulk-Operationen (viele kleine Aufgaben)
✅ Wiederholte Fragen (FAQ-artig, dokumentiert)
✅ Schnelle Recherchen (Standard-Dokumentation)
```

**Trade-off:**
- **Groq:** Etwas schlechtere Qualität, aber KOSTENLOS + schnell
- **Claude 4.5:** Beste Qualität, aber Token-Kosten

**Beispiele:**
- "Erkläre SQL INNER JOIN" → Groq (Standard-FAQ, spart 500 Tokens)
- "Reviewe 50 kleine Code-Snippets" → Groq (spart 25.000 Tokens!)
- "Was macht array_map()?" → Groq (PHP-Dokumentation)

### 🔄 GRUND 2: Alternative Perspektiven

```
✅ Andere Modell-Paradigmen (GPT vs Claude vs Llama)
✅ Spezielle Fähigkeiten (Google-Suche, Open-Source-Ansatz)
✅ Vergleich verschiedener Systeme (OpenAI vs Anthropic)
```

**Beispiele:**
- "Vergleiche GPT-4 vs Claude-Ansatz für dieses Problem"
- "Nutze Gemini für Google-spezifische Recherche"
- "Llama-Perspektive zu Open-Source-Strategie"

### ❌ UNSINNIG: Ältere/Schlechtere Modelle

```
❌ NIEMALS ältere Claude-Modelle (3.5 Sonnet, Opus, Haiku)
❌ NIEMALS wenn Claude 4.5 bereits optimal ist
❌ NIEMALS nur weil "externe Hilfe" verfügbar ist
```

**Warum?**
- Claude Sonnet 4.5 ist BESSER als Claude 3.5 Sonnet
- Claude Sonnet 4.5 ist BESSER als Claude 3 Opus
- Es macht keinen Sinn, ein schlechteres Modell zu konsultieren!

### 💡 Komplexitäts-Entscheidungs-Matrix (NEU!)

| Aufgabe | Komplexität | Token-Kosten | Empfehlung | Grund |
|---------|-------------|--------------|------------|-------|
| "Was ist async/await?" | Trivial | 500 | ✅ **GROQ** | Standard-FAQ, spart Tokens |
| "Erkläre SQL JOIN" | Trivial | 800 | ✅ **GROQ** | Dokumentiert, spart Tokens |
| "Syntax-Check für 10 Zeilen Code" | Niedrig | 1.000 | ✅ **GROQ** | Einfach, spart Tokens |
| "Reviewe 50 Code-Snippets" | Bulk | 25.000 | ✅ **GROQ** | Bulk-Operation, spart viele Tokens! |
| "Standard-Code-Review" | Mittel | 3.000 | ✅ **GROQ** → ⚠️ Claude wenn unzufrieden | Erst Groq, dann Claude |
| "Architektur-Entscheidung" | Hoch | 8.000 | ✅ **CLAUDE 4.5** | Qualität wichtiger als Kosten |
| "Kritisches Sicherheits-Audit" | Hoch | 10.000 | ✅ **CLAUDE 4.5** | Qualität kritisch! |
| "LACRYMAE-spezifische Aufgabe" | Hoch | Variabel | ✅ **CLAUDE 4.5** | Projekt-Kontext nötig |

**Faustregel:**
```
Trivial/Niedrig (< 3.000 Tokens)    → ✅ Groq (Token-Ersparnis!)
Mittel (3.000 - 8.000 Tokens)       → ⚠️ Groq zuerst, dann Claude wenn nötig
Hoch/Kritisch (> 8.000 Tokens)      → ✅ Claude 4.5 (Qualität wichtig!)
Bulk-Operationen                    → ✅ Groq (große Ersparnis!)
```

### 🎯 Richtige Use-Cases

1. **Token-Ersparnis (NEU!)**
   - ✅ Groq: Triviale Fragen, FAQ, Bulk-Ops
   - ❌ NICHT für komplexe LACRYMAE-Aufgaben

2. **Nachschlagen & Recherche**
   - ✅ Groq: Schnelle erste Meinung (kostenlos)
   - ✅ Gemini: Google-Suche-Integration
   - ❌ NICHT für Code-Analyse (Claude 4.5 ist besser!)

3. **Alternative Perspektive**
   - ✅ GPT-4: OpenAI-Ansatz vs Anthropic-Ansatz
   - ✅ Llama: Open-Source-Perspektive
   - ❌ NICHT Claude 3.5 (gleiche Familie, aber schlechter!)

4. **Modell-Vergleich**
   - ✅ compare_models: GPT-4 vs Claude 4.5
   - ❌ NICHT Claude 3.5 vs Claude 4.5 (4.5 ist immer besser!)

---

## 🔄 Workflow: Stufenweise Nutzung

**⚠️ NEUE REGEL:** Nur für alternative Perspektiven, NICHT für bessere Qualität!

```
┌───────────────────────────────────────────────────┐
│ Claude Code (Sonnet 4.5) braucht                  │
│ ALTERNATIVE Perspektive (nicht bessere Qualität!) │
└──────────────────┬────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  STUFE 1: GROQ      │
         │  (Llama 3.3 70B)    │
         │  - Kostenlos        │
         │  - Ultra-schnell    │
         │  - Meta-Perspektive │
         │  - 14,400/Tag       │
         └──────┬──────────────┘
                │
                ├─ ✅ Alternative Perspektive hilfreich?
                │   └─→ FERTIG (Kosten: $0)
                │
                └─ ❌ Google-Wissen benötigt oder Limit erreicht
                    │
                    ▼
         ┌─────────────────────┐
         │  STUFE 2: GEMINI    │
         │  (2.0 Flash)        │
         │  - Kostenlos        │
         │  - Google-Suche     │
         │  - Google-Ansatz    │
         │  - 15/Tag           │
         └──────┬──────────────┘
                │
                ├─ ✅ Google-Perspektive hilfreich?
                │   └─→ FERTIG (Kosten: $0)
                │
                └─ ❌ OpenAI-Perspektive benötigt
                    │
                    ▼
         ┌─────────────────────────────────┐
         │  STUFE 3: OPENROUTER            │
         │  (Nur ANDERE Modell-Familien!)  │
         │  - GPT-4 Turbo (OpenAI)         │
         │  - GPT-4o (OpenAI)              │
         │  - Llama 3.1 405B (Meta)        │
         │  ❌ NICHT Claude 3.5/Opus!      │
         └──────┬──────────────────────────┘
                │
                └─→ FERTIG (Kosten: $0.003 - $0.05)

⚠️ WICHTIG: Claude 3.5 Sonnet/Opus NICHT nutzen!
   → Claude 4.5 ist bereits besser!
   → Nur für GPT/Llama-Perspektive nutzen!
```

---

## 📊 Modell-Auswahl-Matrix

### Bei LACRYMAE-spezifischen Aufgaben:

**⚠️ WICHTIG:** Claude Code (Sonnet 4.5) ist BESSER als Claude 3.5/Opus!
**Nutze MCP nur für ALTERNATIVE Perspektiven, NICHT für bessere Qualität!**

| Aufgabe | Claude 4.5 | Groq | Gemini | OpenRouter | Wann MCP? |
|---------|------------|------|--------|------------|-----------|
| **PHP Code-Review** | ✅ **SELBST** | ✅ Alternative | ❌ Skip | ✅ GPT-4 (OpenAI-Perspektive) | Nur für Vergleich OpenAI vs Anthropic |
| **SQL-Optimierung** | ✅ **SELBST** | ✅ Schnell-Check | ❌ Skip | ✅ GPT-4 Turbo | Groq für Quick-Check, GPT-4 für Vergleich |
| **JavaScript/Frontend** | ✅ **SELBST** | ✅ Alternative | ❌ Skip | ✅ GPT-4 | Nur für OpenAI-Perspektive |
| **API-Dokumentation** | ❌ (keine Google-Suche) | ✅ Schnell | ✅ **DIREKT** | ❌ Skip | Gemini hat Google-Suche! |
| **Sicherheits-Audit** | ✅ **SELBST** | ✅ Zweite Meinung | ❌ Skip | ✅ GPT-4 | ❌ NICHT Claude Opus (4.5 ist besser!) |
| **Architektur-Entscheidung** | ✅ **SELBST** | ✅ Schnell | ❌ Skip | ✅ compare: GPT-4 vs Llama | Vergleich verschiedener Paradigmen |
| **Schnelle Frage** | ✅ **SELBST** | ✅ Wenn kostenlos gewünscht | ❌ Skip | ❌ Skip | Groq nur für kostenlosen Quick-Check |
| **Fehleranalyse** | ✅ **SELBST** | ✅ Erst-Check | ✅ Google-Suche | ✅ GPT-4 | Stufen: Groq → Gemini → GPT-4 |

**Faustregel:**
- ❌ **NIEMALS:** Claude 3.5 Sonnet oder Opus nutzen (4.5 ist besser!)
- ✅ **NUR:** Groq (kostenlos), Gemini (Google), GPT-4 (OpenAI-Perspektive)
- 🎯 **Zweck:** Alternative Perspektiven, NICHT bessere Qualität!

---

## 💬 Kommunikations-Protokoll

### 1. Vor MCP-Nutzung

**Claude informiert User:**
```
💡 Ich hole mir externe Unterstützung für diese Aufgabe.

📊 Geplante Anfrage:
   Service: Groq (kostenlos)
   Frage: "Wie optimiere ich diese SQL-Query?"

🔄 Anfrage wird gesendet...
```

---

### 2. Nach MCP-Antwort

**Claude zeigt Ergebnis + Kosten:**
```
🤖 Antwort von Groq (Llama 3.3 70B):
[Antwort]

💰 Kosten-Info:
   Service: Groq
   Kosten: $0.00 (kostenlos)
   Tokens: 54
   Requests heute: 12/14,400

📊 Alternative verfügbar:
   - Gemini: 3/15 Requests übrig (kostenlos)
   - OpenRouter: $4.85 Credits verfügbar
```

---

### 3. Fortsetzungs-Frage

**Claude fragt nach:**
```
❓ Möchtest du die MCP-Server für weitere Fragen zu diesem Thema nutzen?

   [Ja, für dieses Thema weiter nutzen]
   [Nein, nur diese eine Frage]
   [Direkt zu OpenRouter wechseln]
```

**Wichtig:** Diese Frage bezieht sich **nur** auf das aktuelle Thema/Problem, nicht auf die gesamte Session!

---

## 🎯 Entscheidungs-Logik

### Wann welchen Service?

```javascript
function selectMCPService(task) {
  // 1. Groq-Limit prüfen
  if (groqRequestsToday < 14400) {
    // Groq ist immer erste Wahl (kostenlos + schnell)
    return 'groq';
  }

  // 2. Gemini-Limit prüfen
  if (geminiRequestsToday < 15) {
    // Nur für spezielle Fälle (Google-Wissen)
    if (task.requiresGoogleKnowledge) {
      return 'gemini';
    }
  }

  // 3. OpenRouter-Modell wählen
  if (task.type === 'code-review') {
    return { service: 'openrouter', model: 'claude-3.5-sonnet' };
  } else if (task.type === 'creative') {
    return { service: 'openrouter', model: 'gpt-4-turbo' };
  } else if (task.type === 'security') {
    return { service: 'openrouter', model: 'claude-3-opus' };
  } else {
    // Günstige Alternative
    return { service: 'openrouter', model: 'llama-3.1-70b' };
  }
}
```

---

## 📝 Beispiel-Workflows

### Beispiel 1: PHP Code-Review

**Situation:** User möchte `dashboard.php` reviewen lassen

```
1. Claude erkennt: Code-Review-Aufgabe
2. Claude wählt: Groq (kostenlos, schnell)
3. Claude fragt Groq: "Reviewe diesen PHP-Code..."
4. Groq antwortet mit Feedback
5. Claude zeigt:
   - Antwort
   - Kosten: $0.00
   - Requests: 13/14,400
6. Claude fragt: "MCP weiter für Code-Reviews nutzen?"
7. User antwortet: "Ja"
8. Bei nächstem Code-Review → Groq direkt nutzen
```

**Kosten:** $0.00

---

### Beispiel 2: Komplexe Architektur-Entscheidung

**Situation:** User fragt "Soll ich Microservices oder Monolith nutzen?"

```
1. Claude erkennt: Wichtige Architektur-Entscheidung
2. Claude wählt: OpenRouter compare_models
3. Claude vergleicht:
   - Claude 3.5 Sonnet (Code-Expertise)
   - GPT-4 Turbo (Architektur-Expertise)
4. Beide Modelle antworten
5. Claude zeigt:
   - Beide Antworten
   - Kosten: $0.000942
   - Session-Total: $0.000942
6. Claude fragt: "MCP weiter für Architektur-Fragen nutzen?"
7. User antwortet: "Nein, nur diese Frage"
```

**Kosten:** $0.000942 (~0,1 Cent)

---

### Beispiel 3: Fehlermeldung analysieren

**Situation:** Unklare PHP-Fehlermeldung

```
1. Claude erkennt: Fehleranalyse
2. Claude wählt: Groq (erste Stufe)
3. Groq liefert Standard-Antwort
4. Claude: "Nicht zufriedenstellend"
5. Claude wählt: Gemini (Google-Suche-Integration)
6. Gemini findet spezifische Lösung
7. Claude zeigt:
   - Antwort von Gemini
   - Kosten: $0.00
   - Requests: 4/15
8. Claude fragt: "MCP weiter für Fehleranalysen nutzen?"
9. User antwortet: "Ja"
```

**Kosten:** $0.00

---

## ⚠️ Wichtige Regeln

### 1. Proaktiv, aber nicht aufdringlich
```
✅ Claude nutzt MCP selbstständig wenn sinnvoll
✅ Claude informiert User vor jeder Nutzung
✅ Claude fragt nach bei kostenpflichtigen Services (OpenRouter)
❌ Claude nutzt NICHT MCP für triviale Fragen
❌ Claude nutzt NICHT MCP ohne User zu informieren
```

### 2. Kostenlos priorisieren
```
Hierarchie:
1. Groq (kostenlos, 14,400/Tag) → IMMER zuerst
2. Gemini (kostenlos, 15/Tag) → Nur für spezielle Fälle
3. OpenRouter (Credits) → Nur wenn nötig
```

### 3. Transparenz
```
✅ Vor jeder Anfrage: Service + geschätzte Kosten anzeigen
✅ Nach jeder Anfrage: Tatsächliche Kosten + Stats anzeigen
✅ User kann jederzeit ablehnen
```

### 4. Fortsetzungs-Kontext
```
❓ Frage nach jeder MCP-Nutzung:
   "MCP weiter für [DIESES THEMA] nutzen?"

✅ Ja → Weitere Fragen zu diesem Thema nutzen MCP direkt
❌ Nein → Nur diese eine Frage, sonst wieder fragen

⚠️ Wichtig: Kontext gilt nur für DIESES THEMA, nicht die ganze Session!
```

---

## 🔧 Integration in LACRYMAE

### CLAUDE.md Ergänzung

```markdown
## 🤖 MCP-Server-Nutzung

Claude Code nutzt externe KI-Modelle (Groq, Gemini, OpenRouter)
selbstständig für:
- Nachschlagen & Recherche
- Zweite Meinungen
- Code-Reviews
- Fehleranalysen

**Workflow:**
1. Groq (kostenlos) → Zuerst
2. Gemini (kostenlos) → Falls nötig
3. OpenRouter (Credits) → Für Premium-Aufgaben

**Nach jeder Nutzung:**
- Kosten-Info anzeigen
- Fragen: "MCP für dieses Thema weiter nutzen?"

**Siehe:** [MCP_WORKFLOW.md](../mcp-servers/gemini-tool/MCP_WORKFLOW.md)
```

---

## 📊 Kosten-Tracking

### Tägliche Limits im Blick behalten

```bash
# Morgens prüfen:
"Zeige mir die Groq-Stats"
"Zeige mir die Gemini-Stats"

# Bei OpenRouter-Nutzung:
"Zeige mir die OpenRouter-Stats"
```

### Monatliche Kosten-Übersicht

```
Groq:       $0.00 (immer kostenlos)
Gemini:     $0.00 (Free Tier)
OpenRouter: ~$0.50 - $5.00 (je nach Nutzung)
────────────────────────────────
TOTAL:      ~$0.50 - $5.00/Monat
```

**Empfehlung:** Durch intelligente Nutzung (Groq zuerst) sollten monatliche Kosten unter $1 bleiben!

---

## 💡 Best Practices

### 1. Groq maximal ausnutzen
```
✅ 14,400 Requests/Tag = ~450 Requests/Stunde
✅ Für 99% der Fragen ausreichend
✅ Komplett kostenlos
→ Immer zuerst versuchen!
```

### 2. Gemini sparsam einsetzen
```
⚠️ Nur 15 Requests/Tag
✅ Für Google-spezifische Fragen
✅ Als Fallback wenn Groq-Limit erreicht
→ Strategisch nutzen!
```

### 3. OpenRouter gezielt nutzen
```
💰 Kostet Credits
✅ Für kritische Entscheidungen
✅ Für Code-Reviews mit Claude 3.5
✅ Für Modell-Vergleiche
→ Nur wenn Qualität wichtig ist!
```

### 4. Fortsetzungs-Logik nutzen
```
✅ User sagt "Ja" → Weitere Fragen direkt stellen
✅ User sagt "Nein" → Nur diese eine Frage
⚠️ Kontext gilt nur für aktuelles Thema!
```

---

## 🐛 Troubleshooting

### Problem: Groq-Limit erreicht

**Symptom:**
```
🛑 GROQ LIMIT ERREICHT!
Heute bereits 14,400/14,400 Requests verwendet.
```

**Lösung:**
```
1. Automatisch zu Gemini wechseln (falls unter 15/Tag)
2. Oder zu OpenRouter wechseln
3. User informieren über Kosten-Wechsel
```

---

### Problem: Gemini-Limit erreicht

**Symptom:**
```
🛑 GEMINI LIMIT ERREICHT!
Heute bereits 15/15 Requests verwendet.
```

**Lösung:**
```
1. Automatisch zu OpenRouter wechseln
2. Günstigstes passendes Modell wählen (Llama 3.1 70B)
3. User über Kosten informieren
```

---

### Problem: OpenRouter Credits aufgebraucht

**Symptom:**
```
❌ 402 Payment Required
Keine Credits mehr.
```

**Lösung:**
```
1. User informieren
2. Link zu Credits: https://openrouter.ai/credits
3. Zurück zu Claude-eigenen Fähigkeiten
```

---

## 📚 Referenzen

### Dokumentation
- [README.md](README.md) - Projekt-Übersicht
- [KOSTEN_MONITORING.md](KOSTEN_MONITORING.md) - Kosten-Details
- [MODELL_VERGLEICH.md](MODELL_VERGLEICH.md) - Service-Vergleich
- [CHANGELOG.md](CHANGELOG.md) - Versions-Historie

### LACRYMAE
- [CLAUDE.md](/Users/sascha/Documents/lacrymae/CLAUDE.md) - Claude-Anweisungen
- [CRITICAL_RULES.md](/Users/sascha/Documents/lacrymae/CRITICAL_RULES.md) - Projekt-Regeln

---

## ✅ Checkliste: Workflow implementieren

### Für Claude Code:
- [ ] Vor jeder MCP-Nutzung User informieren
- [ ] Service nach Hierarchie wählen (Groq → Gemini → OpenRouter)
- [ ] Nach Nutzung Kosten anzeigen
- [ ] Fortsetzungs-Frage stellen (für dieses Thema)
- [ ] User-Antwort respektieren

### Für User:
- [ ] MCP-Workflow verstanden
- [ ] Kosten-Hierarchie klar
- [ ] Stats-Tools bekannt (groq_stats, gemini_stats, openrouter_stats)
- [ ] Fortsetzungs-Logik verstanden

---

**Zuletzt aktualisiert:** 2025-11-24
**Version:** 1.0.0
**Status:** ✅ Workflow definiert
