#!/usr/bin/env node

/**
 * MCP Server für OpenRouter (Multi-Model Gateway)
 *
 * Stellt OpenRouter als Tool für Claude Code bereit.
 * Zugriff auf 100+ KI-Modelle (GPT, Claude, Gemini, Llama, etc.)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import { updateModelLimits, showStatus as showTrackerStatus, getBestAvailableModel } from './free-tier-tracker.js';

// OpenRouter API konfigurieren
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('FEHLER: OPENROUTER_API_KEY Environment Variable nicht gesetzt!');
  process.exit(1);
}

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://claude-code-mcp',
    'X-Title': 'Claude Code MCP Server',
  },
});

// MCP Server erstellen
const server = new Server(
  {
    name: 'openrouter-tool',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Beliebte Modelle für schnellen Zugriff
const POPULAR_MODELS = {
  // OpenAI
  'gpt-4-turbo': 'openai/gpt-4-turbo',
  'gpt-4': 'openai/gpt-4',
  'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',

  // Anthropic Claude
  'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
  'claude-3-opus': 'anthropic/claude-3-opus',
  'claude-3-haiku': 'anthropic/claude-3-haiku',

  // Google Gemini
  'gemini-pro': 'google/gemini-pro',
  'gemini-flash': 'google/gemini-flash-1.5',

  // Meta Llama
  'llama-3.1-70b': 'meta-llama/llama-3.1-70b-instruct',
  'llama-3.1-8b': 'meta-llama/llama-3.1-8b-instruct',

  // Mistral
  'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct',
  'mistral-7b': 'mistralai/mistral-7b-instruct',
};

// Kostenlose Modelle (Top 7) - Sortiert nach Speed
const FREE_MODELS = {
  'mistral-7b-free': 'mistralai/mistral-7b-instruct:free',          // #1 Fastest (365ms)
  'nemotron-free': 'nvidia/nemotron-nano-12b-v2-vl:free',           // #2 Vision (628ms)
  'qwen-coder-free': 'qwen/qwen3-coder:free',                       // #3 Coding (901ms)
  'gemini-free': 'google/gemini-2.0-flash-exp:free',                // #4 Google (961ms)
  'grok-free': 'x-ai/grok-4.1-fast:free',                           // #5 2M context (1226ms)
  'llama-70b-free': 'meta-llama/llama-3.3-70b-instruct:free',       // #6 Large (1665ms)
  'llama-3b-free': 'meta-llama/llama-3.2-3b-instruct:free',         // #7 Small (2089ms)
};

// Modell-Preise (pro 1000 Tokens)
const MODEL_PRICES = {
  'openai/gpt-4-turbo': { input: 0.01, output: 0.03 },
  'openai/gpt-4': { input: 0.03, output: 0.06 },
  'openai/gpt-3.5-turbo': { input: 0.001, output: 0.002 },

  'anthropic/claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  'anthropic/claude-3-opus': { input: 0.015, output: 0.075 },
  'anthropic/claude-3-haiku': { input: 0.00025, output: 0.00125 },

  'google/gemini-pro': { input: 0.0005, output: 0.0015 },
  'google/gemini-flash-1.5': { input: 0.000075, output: 0.0003 },

  'meta-llama/llama-3.1-70b-instruct': { input: 0.00052, output: 0.00075 },
  'meta-llama/llama-3.1-8b-instruct': { input: 0.00006, output: 0.00006 },

  'mistralai/mixtral-8x7b-instruct': { input: 0.00024, output: 0.00024 },
  'mistralai/mistral-7b-instruct': { input: 0.00006, output: 0.00006 },
};

// Session-Counter für Kosten-Tracking
let sessionStats = {
  totalRequests: 0,
  totalCost: 0,
  totalTokens: 0,
  models: {},
};

/**
 * Berechne geschätzte Kosten basierend auf Tokens
 */
function calculateCost(modelName, promptTokens, completionTokens) {
  const prices = MODEL_PRICES[modelName];
  if (!prices) {
    return null; // Preise nicht bekannt
  }

  const inputCost = (promptTokens / 1000) * prices.input;
  const outputCost = (completionTokens / 1000) * prices.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost,
    outputCost,
    totalCost,
    inputPrice: prices.input,
    outputPrice: prices.output,
  };
}

/**
 * Aktualisiere Session-Statistik
 */
function updateSessionStats(modelName, cost, tokens) {
  sessionStats.totalRequests++;
  sessionStats.totalCost += cost || 0;
  sessionStats.totalTokens += tokens || 0;

  if (!sessionStats.models[modelName]) {
    sessionStats.models[modelName] = { requests: 0, cost: 0, tokens: 0 };
  }
  sessionStats.models[modelName].requests++;
  sessionStats.models[modelName].cost += cost || 0;
  sessionStats.models[modelName].tokens += tokens || 0;
}

// Tools definieren
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ask_openrouter',
        description: 'Frage ein beliebiges KI-Modell über OpenRouter (100+ Modelle verfügbar: GPT-4, Claude, Gemini, Llama, etc.). Ideal für Modell-Vergleiche oder spezielle Model-Stärken.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Die Frage/Aufgabe',
            },
            model: {
              type: 'string',
              description: 'Modell-Shortcut oder voller Name. Shortcuts: gpt-4-turbo, gpt-4, claude-3.5-sonnet, claude-3-opus, gemini-pro, llama-3.1-70b, mixtral-8x7b',
              default: 'gpt-4-turbo',
            },
            temperature: {
              type: 'number',
              description: 'Kreativität (0.0 = präzise, 1.0 = kreativ). Standard: 0.7',
              default: 0.7,
              minimum: 0.0,
              maximum: 2.0,
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'compare_models',
        description: 'Vergleiche die Antworten von 2-3 verschiedenen KI-Modellen auf die gleiche Frage. Perfekt für Quality-Checks oder verschiedene Perspektiven.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Die Frage/Aufgabe für alle Modelle',
            },
            models: {
              type: 'array',
              description: 'Array von Modell-Shortcuts (2-3 Modelle). Beispiel: ["gpt-4", "claude-3.5-sonnet", "gemini-pro"]',
              items: {
                type: 'string',
              },
              minItems: 2,
              maxItems: 3,
            },
          },
          required: ['prompt', 'models'],
        },
      },
      {
        name: 'openrouter_stats',
        description: 'Zeige Kosten-Statistik und verfügbare Credits für OpenRouter',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'ask_openrouter_free',
        description: 'Frage ein KOSTENLOSES OpenRouter-Modell (7 Top-Modelle mit Auto-Tracking). Limit: 50/Tag. Modelle: Mistral 7B (fastest), Nemotron VL (vision), Qwen Coder (coding), Gemini 2.0, Grok (2M ctx), Llama 70B, Llama 3B.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Die Frage/Aufgabe',
            },
            model: {
              type: 'string',
              description: 'Free-Modell-Shortcut: mistral-7b-free (fastest), nemotron-free (vision), qwen-coder-free (coding), gemini-free, grok-free (2M ctx), llama-70b-free, llama-3b-free. Standard: auto (bestes verfügbar)',
              default: 'auto',
            },
            temperature: {
              type: 'number',
              description: 'Kreativität (0.0 = präzise, 1.0 = kreativ). Standard: 0.7',
              default: 0.7,
              minimum: 0.0,
              maximum: 2.0,
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'free_tier_status',
        description: 'Zeige den aktuellen Status aller kostenlosen OpenRouter-Modelle (verbleibende Requests, Limits, Reset-Zeiten)',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Tool-Aufrufe verarbeiten
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Stats-Tool (kein API-Call)
    if (name === 'openrouter_stats') {
      let statsText = `📊 OpenRouter Statistik
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Credits: $5.00 Free Credits bei Anmeldung
💳 Pay-per-use nach Free Credits
📊 Kosten: Ab $0.0001/Request (sehr günstig!)

`;

      // Session-Statistik
      if (sessionStats.totalRequests > 0) {
        statsText += `📈 **Diese Session:**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Requests: ${sessionStats.totalRequests}
Geschätzte Kosten: $${sessionStats.totalCost.toFixed(6)}
Tokens gesamt: ${sessionStats.totalTokens}

`;

        // Pro Modell
        if (Object.keys(sessionStats.models).length > 0) {
          statsText += `📊 **Pro Modell:**\n`;
          for (const [model, stats] of Object.entries(sessionStats.models)) {
            const shortName = Object.keys(POPULAR_MODELS).find(key => POPULAR_MODELS[key] === model) || model;
            statsText += `   ${shortName}: ${stats.requests} Requests, $${stats.cost.toFixed(6)}, ${stats.tokens} Tokens\n`;
          }
          statsText += '\n';
        }
      }

      statsText += `🎯 **Verfügbare Modelle:** 100+
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3.5, Opus, Haiku)
- Google (Gemini Pro, Flash)
- Meta (Llama 3.1 70B, 8B)
- Mistral (Mixtral, Mistral)

💡 **Kosten-Beispiele:**
- GPT-4 Turbo: ~$0.01-0.03/Request
- Claude 3.5 Sonnet: ~$0.003-0.015/Request
- Gemini Pro: ~$0.0005-0.0025/Request
- Llama 3.1 70B: ~$0.0005-0.001/Request

📚 Credits prüfen: https://openrouter.ai/credits
`;

      return {
        content: [
          {
            type: 'text',
            text: statsText,
          },
        ],
      };
    }

    // Modell-Vergleich
    if (name === 'compare_models') {
      const models = args.models || [];
      const prompt = args.prompt;

      if (models.length < 2 || models.length > 3) {
        throw new Error('Bitte 2-3 Modelle angeben');
      }

      let resultsText = `🔄 Modell-Vergleich\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📝 Frage: ${prompt}\n\n`;
      let totalComparisonCost = 0;

      for (const modelShortcut of models) {
        const modelName = POPULAR_MODELS[modelShortcut] || modelShortcut;

        try {
          console.error(`\n🔄 Frage ${modelName}...`);

          const completion = await openrouter.chat.completions.create({
            model: modelName,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 500,
          });

          const answer = completion.choices[0]?.message?.content || 'Keine Antwort';

          resultsText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          resultsText += `🤖 **${modelShortcut.toUpperCase()}**:\n\n${answer}\n`;

          // Kosten-Info hinzufügen
          if (completion.usage) {
            const promptTokens = completion.usage.prompt_tokens || 0;
            const completionTokens = completion.usage.completion_tokens || 0;
            const totalTokens = promptTokens + completionTokens;

            const cost = calculateCost(modelName, promptTokens, completionTokens);
            if (cost) {
              resultsText += `\n💰 Kosten: $${cost.totalCost.toFixed(6)} | Tokens: ${totalTokens}`;
              totalComparisonCost += cost.totalCost;
              updateSessionStats(modelName, cost.totalCost, totalTokens);
            } else {
              resultsText += `\n📊 Tokens: ${totalTokens}`;
              updateSessionStats(modelName, 0, totalTokens);
            }
          }

        } catch (error) {
          resultsText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          resultsText += `🤖 **${modelShortcut.toUpperCase()}**: ❌ Fehler: ${error.message}\n`;
        }

        // Kurze Pause zwischen Requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Gesamt-Kosten des Vergleichs
      if (totalComparisonCost > 0) {
        resultsText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        resultsText += `💰 **Vergleichs-Kosten gesamt:** $${totalComparisonCost.toFixed(6)}`;
        resultsText += `\n📈 **Session-Total:** ${sessionStats.totalRequests} Requests, $${sessionStats.totalCost.toFixed(6)}`;
      }

      return {
        content: [
          {
            type: 'text',
            text: resultsText,
          },
        ],
      };
    }

    // Einzelner Request
    if (name === 'ask_openrouter') {
      const modelShortcut = args.model || 'gpt-4-turbo';
      const modelName = POPULAR_MODELS[modelShortcut] || modelShortcut;
      const prompt = args.prompt;
      const temperature = args.temperature || 0.7;

      console.error(`\n🔄 Verwende Modell: ${modelName}`);

      const completion = await openrouter.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature,
        max_tokens: 2048,
      });

      const responseText = completion.choices[0]?.message?.content || 'Keine Antwort erhalten.';

      // Kosten-Info (falls verfügbar)
      let costInfo = '';
      if (completion.usage) {
        const promptTokens = completion.usage.prompt_tokens || 0;
        const completionTokens = completion.usage.completion_tokens || 0;
        const totalTokens = promptTokens + completionTokens;

        // Kosten berechnen
        const cost = calculateCost(modelName, promptTokens, completionTokens);

        if (cost) {
          costInfo = `\n\n💰 **Kosten:** $${cost.totalCost.toFixed(6)} ($${cost.inputPrice}/1k input, $${cost.outputPrice}/1k output)`;
          costInfo += `\n📊 **Tokens:** ${promptTokens} prompt + ${completionTokens} completion = ${totalTokens} total`;

          // Session-Stats aktualisieren
          updateSessionStats(modelName, cost.totalCost, totalTokens);
        } else {
          costInfo = `\n\n📊 **Tokens:** ${promptTokens} prompt + ${completionTokens} completion = ${totalTokens} total`;
          costInfo += `\n💡 Kosten-Info für ${modelName} nicht verfügbar`;

          // Session-Stats aktualisieren (ohne Kosten)
          updateSessionStats(modelName, 0, totalTokens);
        }

        // Session-Total
        costInfo += `\n📈 **Session-Total:** ${sessionStats.totalRequests} Requests, $${sessionStats.totalCost.toFixed(6)}`;
      }

      return {
        content: [
          {
            type: 'text',
            text: `🤖 **OpenRouter (${modelShortcut}):**\n\n${responseText}${costInfo}`,
          },
        ],
      };
    }

    throw new Error(`Unbekanntes Tool: ${name}`);

  } catch (error) {
    let errorMessage = `❌ Fehler beim OpenRouter-Aufruf: ${error.message}`;

    if (error.status === 429) {
      errorMessage += '\n\n💡 Rate-Limit erreicht. Warte kurz und versuche es erneut.';
    } else if (error.status === 401) {
      errorMessage += '\n\n💡 API-Key ungültig. Prüfe OPENROUTER_API_KEY.';
    } else if (error.status === 402) {
      errorMessage += '\n\n💡 Keine Credits mehr. Füge Credits hinzu auf https://openrouter.ai/credits';
    }

    return {
      content: [
        {
          type: 'text',
          text: errorMessage,
        },
      ],
      isError: true,
    };
  }
});

// Server starten
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('✅ OpenRouter MCP Server läuft (100+ Modelle verfügbar)...');
}

main().catch((error) => {
  console.error('❌ Server-Fehler:', error);
  process.exit(1);
});
