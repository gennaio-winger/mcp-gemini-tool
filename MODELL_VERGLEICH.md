# Modell-Vergleich - Groq vs. OpenRouter

**Erstellt:** 2025-11-24
**Version:** 1.0.0

---

## 📊 Übersicht: Verfügbare Modelle

| Server | Modelle | Kosten | Limit | Status |
|--------|---------|--------|-------|--------|
| **Groq** | Llama 3.3 70B, Mixtral 8x7B, Gemma 2 9B | 0€ | 14,400 Req/Tag | ✅ Aktiv |
| **OpenRouter** | 100+ (GPT-4, Claude, Gemini, Llama, etc.) | $5 Free → Pay-per-use | Credits-basiert | ✅ Aktiv |
| **Gemini** | Gemini 2.0 Flash | 0€ | ~15 Req/Tag | ✅ Aktiv |

---

## 🎯 Wann welchen Server nutzen?

### Schnell-Entscheidung:

```
Kostenlos & Schnell      → Groq (Llama 3.3 70B)
Beste Qualität (Code)    → OpenRouter (Claude 3.5 Sonnet)
Beste Qualität (Allg.)   → OpenRouter (GPT-4 Turbo)
Premium Features         → OpenRouter (Claude 3 Opus)
Modell-Vergleich         → OpenRouter (compare_models)
Günstig & Gut            → OpenRouter (Llama via OpenRouter)
```

---

## 📈 Detaillierter Vergleich

### Performance

| Modell | Server | Geschwindigkeit | Qualität | Kosten |
|--------|--------|----------------|----------|---------|
| **Llama 3.3 70B** | Groq | ⚡⚡⚡ Ultra (100+ tok/s) | ⭐⭐⭐⭐ | 0€ |
| **Llama 3.1 70B** | OpenRouter | ⚡⚡ Schnell | ⭐⭐⭐⭐ | $0.0005 |
| **Mixtral 8x7B** | Groq | ⚡⚡⚡ Ultra | ⭐⭐⭐⭐ | 0€ |
| **GPT-3.5 Turbo** | OpenRouter | ⚡⚡⚡ Sehr schnell | ⭐⭐⭐ | $0.001 |
| **Claude 3 Haiku** | OpenRouter | ⚡⚡ Schnell | ⭐⭐⭐⭐ | $0.0003 |
| **Gemini Pro** | OpenRouter | ⚡⚡ Schnell | ⭐⭐⭐⭐ | $0.0005 |
| **GPT-4 Turbo** | OpenRouter | ⚡ Normal | ⭐⭐⭐⭐⭐ | $0.01-0.03 |
| **Claude 3.5 Sonnet** | OpenRouter | ⚡ Normal | ⭐⭐⭐⭐⭐ | $0.003-0.015 |
| **Claude 3 Opus** | OpenRouter | ⚡ Langsam | ⭐⭐⭐⭐⭐ | $0.015-0.075 |

---

## 🎯 Use Case Matrix

### Code-Generierung & Review

| Rang | Modell | Server | Warum? |
|------|--------|--------|--------|
| 🥇 | **Claude 3.5 Sonnet** | OpenRouter | Beste Code-Qualität, versteht Kontext |
| 🥈 | **GPT-4 Turbo** | OpenRouter | Sehr gut, schneller |
| 🥉 | **Llama 3.3 70B** | Groq | Kostenlos, gut, ultra-schnell |

**Empfehlung:**
- Entwicklung: Groq (kostenlos, schnell)
- Produktion/Review: Claude 3.5 Sonnet (beste Qualität)

---

### Schnelle Fragen

| Rang | Modell | Server | Warum? |
|------|--------|--------|--------|
| 🥇 | **Llama 3.3 70B** | Groq | Kostenlos, ultra-schnell |
| 🥈 | **GPT-3.5 Turbo** | OpenRouter | Sehr schnell, günstig |
| 🥉 | **Claude 3 Haiku** | OpenRouter | Schnell, gute Qualität |

**Empfehlung:** Groq für alles Kostenlose

---

### Kreative Aufgaben

| Rang | Modell | Server | Warum? |
|------|--------|--------|--------|
| 🥇 | **GPT-4 Turbo** | OpenRouter | Sehr kreativ, vielseitig |
| 🥈 | **Claude 3 Opus** | OpenRouter | Kreativ, nuanciert |
| 🥉 | **Mixtral 8x7B** | Groq | Gut, kostenlos |

**Empfehlung:** GPT-4 Turbo für wichtige kreative Tasks

---

### Lange Texte (Context Length)

| Rang | Modell | Context | Server |
|------|--------|---------|--------|
| 🥇 | **Claude 3.5 Sonnet** | 200k Tokens | OpenRouter |
| 🥈 | **GPT-4 Turbo** | 128k Tokens | OpenRouter |
| 🥉 | **Llama 3.3 70B** | 128k Tokens | Groq |

**Empfehlung:** Claude 3.5 für sehr lange Dokumente

---

### Kosten-Optimiert

| Rang | Modell | Kosten/Request | Server |
|------|--------|----------------|--------|
| 🥇 | **Llama 3.3 70B** | 0€ | Groq |
| 🥈 | **Claude 3 Haiku** | ~$0.0003 | OpenRouter |
| 🥉 | **Llama 3.1 70B** | ~$0.0005 | OpenRouter |

**Empfehlung:** Groq für kostenlosen Betrieb

---

## 💰 Kosten-Kalkulation

### Beispiel: 1000 Requests

| Modell | Tokens/Req (Avg) | Kosten/Req | Gesamt (1000 Req) |
|--------|------------------|------------|-------------------|
| **Llama 3.3 70B (Groq)** | 500 | 0€ | **0€** |
| **Llama 3.1 70B** | 500 | $0.0005 | **$0.50** |
| **GPT-3.5 Turbo** | 500 | $0.001 | **$1.00** |
| **Claude 3 Haiku** | 500 | $0.0003 | **$0.30** |
| **Gemini Pro** | 500 | $0.0005 | **$0.50** |
| **Claude 3.5 Sonnet** | 500 | $0.007 | **$7.00** |
| **GPT-4 Turbo** | 500 | $0.02 | **$20.00** |
| **Claude 3 Opus** | 500 | $0.04 | **$40.00** |

**Fazit:**
- Groq = 0€ (bis zu 14,400 Requests/Tag!)
- OpenRouter günstig = $0.30-1.00
- OpenRouter premium = $7-40

---

## 🎯 Strategien

### Strategie 1: Kostenlos-Maximum (Empfohlen für Entwicklung)

```
1. Groq Llama 3.3 70B → Alles was kostenlos sein soll
2. OpenRouter Haiku → Wenn Groq-Limit erreicht
3. OpenRouter Claude 3.5 → Nur für kritische Code-Reviews
```

**Kosten:** ~$0-5/Monat

---

### Strategie 2: Quality-First (Empfohlen für Produktion)

```
1. OpenRouter Claude 3.5 Sonnet → Code & Analyse
2. OpenRouter GPT-4 Turbo → Komplexe Fragen
3. Groq Llama 3.3 → Tests & Prototyping
```

**Kosten:** ~$10-50/Monat

---

### Strategie 3: Hybrid (Best of Both)

```
1. Groq → Tägliche Arbeit (kostenlos)
2. OpenRouter compare_models → Quality-Checks
3. OpenRouter Premium → Finale Deliverables
```

**Kosten:** ~$5-20/Monat

---

## 📊 Modell-Entscheidungsbaum

```
Ist es kostenlos möglich?
├─ Ja → Groq (Llama 3.3 70B)
└─ Nein → Ist Code-Qualität kritisch?
    ├─ Ja → OpenRouter (Claude 3.5 Sonnet)
    └─ Nein → Ist Geschwindigkeit wichtig?
        ├─ Ja → OpenRouter (GPT-3.5 Turbo)
        └─ Nein → OpenRouter (GPT-4 Turbo)

Brauchst du Modell-Vergleich?
└─ Ja → OpenRouter compare_models
    → ["claude-3.5-sonnet", "gpt-4-turbo"]

Groq-Limit erreicht?
└─ Ja → Wechsel zu OpenRouter (Llama 3.1 70B)
    → Ähnliche Qualität, minimal Kosten
```

---

## 🔄 Migration zwischen Servern

### Von Groq zu OpenRouter

**Wann:**
- Groq-Limit erreicht (14,400/Tag)
- Premium-Features benötigt
- Modell-Vergleiche nötig

**Wie:**
```
# Gleiche Frage, anderer Server
Groq:       "Frage Groq: Was ist async/await?"
OpenRouter: "Frage GPT-4: Was ist async/await?"

# Ähnliches Modell
Groq Llama 3.3 70B   → OpenRouter Llama 3.1 70B
Groq Mixtral 8x7B    → OpenRouter Mixtral 8x7B
```

---

### Von OpenRouter zu Groq

**Wann:**
- Kosten sparen
- Schnelligkeit priorisieren
- Entwicklung/Testing

**Wie:**
```
# Premium zu Free
OpenRouter GPT-4     → Groq Llama 3.3 70B
OpenRouter Claude    → Groq Llama 3.3 70B

# Qualität bleibt gut!
```

---

## 📚 Tool-Mapping

| Aufgabe | Groq Tool | OpenRouter Tool |
|---------|-----------|-----------------|
| **Einfache Frage** | `ask_groq` | `ask_openrouter` |
| **Code-Review** | `groq_code_review` | `ask_openrouter` + Prompt |
| **Erklärung** | `groq_explain` | `ask_openrouter` + Prompt |
| **Übersetzung** | `groq_translate` | `ask_openrouter` + Prompt |
| **Statistik** | `groq_stats` | `openrouter_stats` |
| **Modell-Vergleich** | ❌ Nicht verfügbar | ✅ `compare_models` ⭐ |

---

## ✅ Empfohlener Workflow

### Tägliche Entwicklung

```
1. Groq für alles Normale (kostenlos)
   → ask_groq, code_review, explain

2. Bei Groq-Limit:
   → Wechsel zu OpenRouter Llama 3.1 70B

3. Für kritische Reviews:
   → OpenRouter compare_models
   → ["claude-3.5-sonnet", "gpt-4-turbo"]

4. Stats checken:
   → groq_stats (Limit-Übersicht)
   → gemini_stats (Limit-Übersicht) ⭐
   → openrouter_stats (Credits-Stand + Kosten) ⭐
```

---

## 🎯 Zusammenfassung

| Kriterium | Groq | Gemini | OpenRouter |
|-----------|------|--------|------------|
| **Kosten** | 0€ | 0€ | $5 Free → Pay-per-use |
| **Geschwindigkeit** | ⚡⚡⚡ Ultra | ⚡⚡ Schnell | ⚡⚡ Schnell bis Normal |
| **Qualität** | ⭐⭐⭐⭐ Sehr gut | ⭐⭐⭐⭐ Sehr gut | ⭐⭐⭐⭐⭐ Exzellent |
| **Modelle** | 3 (Llama, Mixtral, Gemma) | 1 (Gemini 2.0 Flash) | 100+ |
| **Limit** | 14,400/Tag | 15/Tag | Credits-basiert |
| **Monitoring** | ✅ Request-Counter | ✅ Request-Counter | ✅ Kosten-Tracking |
| **Modell-Vergleich** | ❌ | ❌ | ✅ |
| **Best for** | Entwicklung, Tests | Google-Features | Produktion, Premium |

**Empfehlung:** Nutze alle drei strategisch!
- **Groq** für tägliche Arbeit (14,400/Tag kostenlos)
- **Gemini** sparsam für Google-spezifische Features (15/Tag)
- **OpenRouter** für kritische Tasks & Premium-Modelle (Credits-basiert)

---

**Zuletzt aktualisiert:** 2025-11-24
**Version:** 1.0.0
