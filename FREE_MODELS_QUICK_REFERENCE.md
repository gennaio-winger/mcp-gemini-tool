# Kostenlose Modelle - Quick Reference

**Stand:** 2025-11-24
**Total:** 20+ kostenlose Modelle bei OpenRouter

---

## 🚀 Top 5 Empfehlungen

| Rang | Modell | Context | Use-Case | ID |
|------|--------|---------|----------|-----|
| 🥇 | **Grok 4.1 Fast** | 2M | Bulk-Ops, Lange Docs | `x-ai/grok-4.1-fast:free` |
| 🥈 | **DeepSeek R1 0528** | 128k | Reasoning, Logik | `deepseek/deepseek-r1-0528:free` |
| 🥉 | **Qwen3 Coder 480B** | 32k | Coding, Debugging | `qwen/qwen3-coder:free` |
| 4 | **Kimi K2** | 262k | Lange Kontexte | `moonshotai/kimi-k2:free` |
| 5 | **Nemotron Nano 12B VL** | 128k | Video, Images | `nvidia/nemotron-nano-12b-v2-vl:free` |

---

## 📋 Vollständige Liste (Kategorisiert)

### 🎯 General Purpose
- `x-ai/grok-4.1-fast:free` - **2M Context!** ⭐
- `moonshotai/kimi-k2:free` - 262k Context
- `mistralai/mistral-small-3.2-24b-instruct:free` - 32k
- `alibaba/tongyi-deepresearch-30b-a3b:free`
- `meituan/longcat-flash-chat:free`
- `z-ai/glm-4.5-air:free`

### 💻 Coding
- `qwen/qwen3-coder:free` - **480B A35B** ⭐
- `kwaipilot/kat-coder-pro:free` - 256k Context
- `openai/gpt-oss-20b:free` - 131k Context

### 🧠 Reasoning
- `deepseek/deepseek-r1-0528:free` ⭐
- `deepseek/deepseek-r1-0528-qwen3-8b:free`
- `tngtech/deepseek-r1t2-chimera:free`

### 🎨 Multimodal (Vision)
- `nvidia/nemotron-nano-12b-v2-vl:free` - **Video+Image** ⭐
- `nvidia/nemotron-nano-9b-v2:free`

### 🔓 Uncensored
- `cognitivecomputations/dolphin-mistral-24b-venice-edition:free`

### 🪶 Lightweight
- `google/gemma-3n-e4b-it:free` - 4B
- `google/gemma-3n-e2b-it:free` - 2B
- `qwen/qwen3-4b:free` - 4B
- `qwen/qwen3-30b-a3b:free` - 30B A3B

---

## 🔍 Wie finde ich die aktuellen?

### API-Abfrage
```bash
# Alle kostenlosen Modelle
curl -s https://openrouter.ai/api/v1/models | \
  jq -r '.data[] | select(.pricing.prompt == "0" and .pricing.completion == "0") | .id'
```

### Mit Details
```bash
# Mit Name + Context
curl -s https://openrouter.ai/api/v1/models | \
  jq -r '.data[] |
    select(.pricing.prompt == "0" and .pricing.completion == "0") |
    "\(.id)|\(.name)|\(.context_length)"'
```

---

## 💡 Nutzungs-Tipps

### 1. Nach Context-Länge wählen
```
Kurze Fragen (<10k)     → Beliebiges Modell
Mittlere Docs (10-100k) → Kimi K2, Nemotron, DeepSeek
Lange Docs (>100k)      → Grok 4.1 Fast (2M!) ⭐
```

### 2. Nach Aufgabe wählen
```
Code-Review        → Qwen3 Coder, KAT-Coder-Pro
Logik-Probleme     → DeepSeek R1
Bulk-Operationen   → Grok 4.1 Fast
Multimodal         → Nemotron Nano VL
Unzensiert         → Dolphin Mistral Venice
```

### 3. Fallback-Strategie
```javascript
const freeModels = [
  'x-ai/grok-4.1-fast:free',      // 1. Versuch
  'moonshotai/kimi-k2:free',      // 2. Versuch
  'qwen/qwen3-coder:free',        // 3. Versuch
  'mistralai/mistral-small-3.2-24b-instruct:free'  // 4. Versuch
];

// Bei 429 Rate-Limit → Nächstes Modell
for (const model of freeModels) {
  try {
    return await callOpenRouter(model, prompt);
  } catch (err) {
    if (err.status === 429) continue;
    throw err;
  }
}
```

---

## ⚠️ Wichtige Hinweise

### Rate-Limits beachten!
Auch kostenlose Modelle haben Limits:
- Unterschiedlich pro Modell
- Meist: 10-100 Requests/Minute
- Bei 429 → Nächstes Modell versuchen

### Qualität variiert
```
Tier S: Grok 4.1, DeepSeek R1, Qwen3 Coder
Tier A: Kimi K2, Mistral Small, Nemotron
Tier B: Gemma 3n, LongCat Flash
Tier C: Kleinere Modelle (<10B)
```

### Verfügbarkeit ändert sich
- Kostenlose Modelle können jederzeit wegfallen
- Neue können hinzukommen
- **Lösung:** Täglich API abfragen (24h Cache)

---

## 🎯 Workflow-Integration

### Alte Hierarchie (v2.1.0)
```
1. Groq (14,400/Tag)
2. Gemini (15/Tag)
3. OpenRouter Paid → 💸 KOSTEN!
```

### Neue Hierarchie (v2.2.0)
```
1. Groq (14,400/Tag)
2. OpenRouter Free (20+ Modelle) ⭐ NEU!
   - Grok 4.1 Fast
   - DeepSeek R1
   - Qwen3 Coder
   - Kimi K2
   - ...
3. Gemini (15/Tag)
4. OpenRouter Paid → Nur absolute Notfälle
```

**Resultat:** Nach Groq-Limit immer noch **$0.00**! 🎉

---

## 📊 Vergleich: Groq vs OR Free

| Feature | Groq | OpenRouter Free |
|---------|------|-----------------|
| **Daily Limit** | 14,400 | Variabel (10-100+) |
| **Max Context** | 128k | **2M** (Grok) |
| **Modell-Auswahl** | 1 (Llama 3.3) | **20+** |
| **Spezialisierung** | General | Coding, Reasoning, Vision |
| **Kosten** | $0.00 | $0.00 |
| **Geschwindigkeit** | ⚡ Ultra-schnell | Schnell |
| **Stabilität** | ✅ Sehr stabil | ⚠️ Variiert |

**Empfehlung:** Groq zuerst, dann OR Free als Fallback!

---

## 🔗 Links

- [OpenRouter Models API](https://openrouter.ai/api/v1/models)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Vollständiges Konzept](KOSTENLOSE_MODELLE_DYNAMISCH.md)
- [Workflow v2.2.0](MCP_WORKFLOW.md)

---

**Tipp:** Speichere diese Liste ab und aktualisiere sie wöchentlich via API!
