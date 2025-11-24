#!/usr/bin/env node

/**
 * MCP Server für LiteAPI (AI Aggregator)
 *
 * Stellt LiteAPI als Tool für Claude Code bereit.
 * Zugriff auf OpenAI, Anthropic Modelle mit 40-50% Rabatt.
 * Budget: $20 Guthaben
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// LiteAPI konfigurieren
const apiKey = process.env.LITEAPI_KEY;
if (!apiKey) {
  console.error('FEHLER: LITEAPI_KEY Environment Variable nicht gesetzt!');
  process.exit(1);
}

const liteapi = new OpenAI({
  baseURL: 'https://app.liteapi.ai/api/v1',
  apiKey: apiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://claude-code-mcp',
    'X-Title': 'Claude Code MCP Server',
  },
});

// MCP Server erstellen
const server = new Server(
  {
    name: 'liteapi-tool',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Verfügbare Modelle auf LiteAPI (verifiziert)
const AVAILABLE_MODELS = {
  // OpenAI Modelle
  'gpt-4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Neuestes GPT-4 Modell, multimodal (Text + Vision)',
    avgResponseTime: 1260,
    inputPrice: 0.0025,    // $2.50 per 1M tokens
    outputPrice: 0.01,     // $10 per 1M tokens
  },
  'gpt-4o-mini': {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Kleinere, schnellere Version von GPT-4o',
    avgResponseTime: 1392,
    inputPrice: 0.00015,   // $0.15 per 1M tokens
    outputPrice: 0.0006,   // $0.60 per 1M tokens
  },
  'o1': {
    id: 'openai/o1',
    name: 'OpenAI o1',
    provider: 'OpenAI',
    description: 'Reasoning-Modell für komplexe Aufgaben (benötigt max_completion_tokens)',
    avgResponseTime: 828,
    inputPrice: 0.015,     // $15 per 1M tokens
    outputPrice: 0.06,     // $60 per 1M tokens
    requiresCompletionTokens: true,
  },
  'o1-mini': {
    id: 'openai/o1-mini',
    name: 'OpenAI o1-mini',
    provider: 'OpenAI',
    description: 'Kleineres Reasoning-Modell (benötigt max_completion_tokens)',
    avgResponseTime: 1099,
    inputPrice: 0.003,     // $3 per 1M tokens
    outputPrice: 0.012,    // $12 per 1M tokens
    requiresCompletionTokens: true,
  },

  // Anthropic Modelle
  'claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Aktuellstes Claude-Modell, sehr leistungsstark',
    avgResponseTime: 1663,
    inputPrice: 0.003,     // $3 per 1M tokens
    outputPrice: 0.015,    // $15 per 1M tokens
  },
  'claude-3-haiku': {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Schnelles, günstiges Claude-Modell',
    avgResponseTime: 1209,
    inputPrice: 0.00025,   // $0.25 per 1M tokens
    outputPrice: 0.00125,  // $1.25 per 1M tokens
  },
};

// Budget-Tracking
const BUDGET_FILE = path.join(__dirname, 'liteapi-budget.json');
const INITIAL_BUDGET = 20.00; // $20 Guthaben

function loadBudget() {
  try {
    if (fs.existsSync(BUDGET_FILE)) {
      const data = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf-8'));
      return data;
    }
  } catch (error) {
    console.error('Fehler beim Laden des Budgets:', error.message);
  }

  // Initialisiere neues Budget
  return {
    totalBudget: INITIAL_BUDGET,
    spent: 0,
    remaining: INITIAL_BUDGET,
    requestCount: 0,
    lastUpdated: new Date().toISOString(),
  };
}

function saveBudget(budget) {
  try {
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(budget, null, 2));
  } catch (error) {
    console.error('Fehler beim Speichern des Budgets:', error.message);
  }
}

function calculateCost(model, inputTokens, outputTokens) {
  const modelInfo = Object.values(AVAILABLE_MODELS).find(m => m.id === model);
  if (!modelInfo) return 0;

  const inputCost = (inputTokens / 1_000_000) * modelInfo.inputPrice;
  const outputCost = (outputTokens / 1_000_000) * modelInfo.outputPrice;

  return inputCost + outputCost;
}

function updateBudget(model, usage) {
  const budget = loadBudget();
  const cost = calculateCost(model, usage.prompt_tokens, usage.completion_tokens);

  budget.spent += cost;
  budget.remaining = budget.totalBudget - budget.spent;
  budget.requestCount += 1;
  budget.lastUpdated = new Date().toISOString();

  saveBudget(budget);

  return { cost, remaining: budget.remaining };
}

// Tool Handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ask_liteapi',
        description: 'Stelle eine Frage an LiteAPI (OpenAI, Anthropic Modelle mit 40-50% Rabatt). Budget: $20 verfügbar.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Die Frage oder Anfrage an das KI-Modell',
            },
            model: {
              type: 'string',
              description: `Modell-Auswahl: ${Object.keys(AVAILABLE_MODELS).join(', ')}. Standard: gpt-4o-mini`,
              enum: Object.keys(AVAILABLE_MODELS),
            },
            max_tokens: {
              type: 'number',
              description: 'Maximale Anzahl Tokens in der Antwort (Standard: 1000)',
              default: 1000,
            },
            temperature: {
              type: 'number',
              description: 'Kreativität (0-2, Standard: 1)',
              default: 1,
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'list_liteapi_models',
        description: 'Zeige alle verfügbaren LiteAPI-Modelle mit Details (Provider, Geschwindigkeit, Preise)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'liteapi_budget',
        description: 'Zeige aktuelles LiteAPI Budget ($20 Guthaben), Ausgaben und verbleibende Credits',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'ask_liteapi') {
      const modelKey = args.model || 'gpt-4o-mini';
      const modelInfo = AVAILABLE_MODELS[modelKey];

      if (!modelInfo) {
        throw new Error(`Unbekanntes Modell: ${modelKey}. Verfügbar: ${Object.keys(AVAILABLE_MODELS).join(', ')}`);
      }

      // Budget-Check
      const budget = loadBudget();
      if (budget.remaining <= 0) {
        return {
          content: [{
            type: 'text',
            text: `❌ Budget aufgebraucht!\n\nAusgegeben: $${budget.spent.toFixed(4)}\nAnfragen: ${budget.requestCount}`,
          }],
        };
      }

      // Anfrage vorbereiten
      const params = {
        model: modelInfo.id,
        messages: [{ role: 'user', content: args.prompt }],
        temperature: args.temperature || 1,
      };

      // o1-Modelle brauchen max_completion_tokens
      if (modelInfo.requiresCompletionTokens) {
        params.max_completion_tokens = args.max_tokens || 1000;
      } else {
        params.max_tokens = args.max_tokens || 1000;
      }

      // API-Aufruf
      const startTime = Date.now();
      const response = await liteapi.chat.completions.create(params);
      const responseTime = Date.now() - startTime;

      const answer = response.choices[0]?.message?.content || 'Keine Antwort';

      // Budget aktualisieren
      const { cost, remaining } = updateBudget(modelInfo.id, response.usage);

      return {
        content: [{
          type: 'text',
          text: `${answer}\n\n---\n📊 Modell: ${modelInfo.name} (${modelInfo.provider})\n⏱️  Response-Zeit: ${responseTime}ms\n🎫 Tokens: ${response.usage.total_tokens} (Input: ${response.usage.prompt_tokens}, Output: ${response.usage.completion_tokens})\n💰 Kosten: $${cost.toFixed(6)} | Verbleibend: $${remaining.toFixed(4)}`,
        }],
      };
    }

    if (name === 'list_liteapi_models') {
      let output = '📋 Verfügbare LiteAPI-Modelle\n\n';
      output += 'LiteAPI bietet OpenAI und Anthropic Modelle mit 40-50% Rabatt.\n';
      output += 'Guthaben: $20 verfügbar\n\n';
      output += '═'.repeat(70) + '\n\n';

      const modelsByProvider = {};
      Object.entries(AVAILABLE_MODELS).forEach(([key, model]) => {
        if (!modelsByProvider[model.provider]) {
          modelsByProvider[model.provider] = [];
        }
        modelsByProvider[model.provider].push({ key, ...model });
      });

      Object.entries(modelsByProvider).forEach(([provider, models]) => {
        output += `## ${provider}\n\n`;
        models.forEach(model => {
          output += `### ${model.key} - ${model.name}\n`;
          output += `   ID: ${model.id}\n`;
          output += `   ${model.description}\n`;
          output += `   ⏱️  Durchschnitt: ${model.avgResponseTime}ms\n`;
          output += `   💰 Preis: $${model.inputPrice}/1M input, $${model.outputPrice}/1M output\n`;
          if (model.requiresCompletionTokens) {
            output += `   ⚠️  Benötigt max_completion_tokens Parameter\n`;
          }
          output += '\n';
        });
      });

      output += '═'.repeat(70) + '\n';
      output += '\nNutzung: ask_liteapi --model <model-key> --prompt "Deine Frage"';

      return {
        content: [{
          type: 'text',
          text: output,
        }],
      };
    }

    if (name === 'liteapi_budget') {
      const budget = loadBudget();
      const percentUsed = (budget.spent / budget.totalBudget) * 100;

      let output = '💰 LiteAPI Budget-Status\n\n';
      output += '═'.repeat(70) + '\n\n';
      output += `Gesamt-Budget:  $${budget.totalBudget.toFixed(2)}\n`;
      output += `Ausgegeben:     $${budget.spent.toFixed(4)} (${percentUsed.toFixed(2)}%)\n`;
      output += `Verbleibend:    $${budget.remaining.toFixed(4)}\n\n`;
      output += `Anfragen:       ${budget.requestCount}\n`;
      output += `Letztes Update: ${new Date(budget.lastUpdated).toLocaleString('de-DE')}\n\n`;

      // Fortschrittsbalken
      const barLength = 50;
      const filledLength = Math.floor((percentUsed / 100) * barLength);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      output += `[${bar}] ${percentUsed.toFixed(1)}%\n\n`;

      output += '═'.repeat(70) + '\n\n';

      if (budget.remaining < 1) {
        output += '⚠️  Warnung: Weniger als $1 verbleibend!\n';
      }

      return {
        content: [{
          type: 'text',
          text: output,
        }],
      };
    }

    throw new Error(`Unbekanntes Tool: ${name}`);

  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Fehler: ${error.message}`,
      }],
      isError: true,
    };
  }
});

// Server starten
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('LiteAPI MCP Server läuft...');
}

main().catch((error) => {
  console.error('Server-Fehler:', error);
  process.exit(1);
});
