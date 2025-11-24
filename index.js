#!/usr/bin/env node

/**
 * MCP Server für Gemini Tool
 *
 * Stellt Gemini 1.5 Flash als Tool für Claude Code bereit.
 * Claude kann Gemini für spezielle Aufgaben konsultieren.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCounter } from './gemini-request-counter.js';
import {
  checkBudget,
  updateBudget,
  formatBudgetStatus,
} from './gemini-budget-manager.js';

// Request-Counter initialisieren (nur für Statistik, keine Limits mehr)
const counter = getCounter();

// Gemini API konfigurieren
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('FEHLER: GEMINI_API_KEY Environment Variable nicht gesetzt!');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// MCP Server erstellen
const server = new Server(
  {
    name: 'gemini-tool',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: ask_gemini
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ask_gemini',
        description: 'Frage Google Gemini 2.0 Flash für alternative Perspektiven, Bewertungen oder spezielle Aufgaben. Nutze dies, wenn du eine zweite Meinung brauchst oder Geminis Stärken (Mehrsprachigkeit, Google-Wissen) nutzen möchtest.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Die Frage/Aufgabe für Gemini',
            },
            temperature: {
              type: 'number',
              description: 'Kreativität (0.0 = präzise, 1.0 = kreativ). Standard: 0.7',
              default: 0.7,
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'gemini_code_review',
        description: 'Lasse Gemini Code reviewen und Verbesserungsvorschläge geben',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Der zu reviewende Code',
            },
            language: {
              type: 'string',
              description: 'Programmiersprache (z.B. JavaScript, Python, PHP)',
              default: 'JavaScript',
            },
          },
          required: ['code'],
        },
      },
      {
        name: 'gemini_explain',
        description: 'Lasse Gemini komplexe Konzepte einfach erklären',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'Das zu erklärende Konzept/Thema',
            },
            level: {
              type: 'string',
              description: 'Niveau: beginner, intermediate, advanced',
              default: 'intermediate',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'gemini_stats',
        description: 'Zeige Gemini Request-Counter Statistik',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'gemini_budget',
        description: 'Zeige Gemini Budget-Status (257,50 € Guthaben bis 23.02.2026)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Tool-Aufrufe verarbeiten
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Spezial-Tools (brauchen keine API-Anfrage)
    if (name === 'gemini_stats') {
      const stats = counter.formatStats();
      return {
        content: [{ type: 'text', text: stats }],
      };
    }

    if (name === 'gemini_budget') {
      const status = formatBudgetStatus();
      return {
        content: [{ type: 'text', text: status }],
      };
    }

    // Budget-Check durchführen
    const budgetCheck = checkBudget();
    if (!budgetCheck.allowed) {
      return {
        content: [
          {
            type: 'text',
            text: `${budgetCheck.warning}\n\n${formatBudgetStatus()}`,
          },
        ],
        isError: true,
      };
    }

    // Warnung anzeigen falls nötig
    const warning = budgetCheck.warning ? `${budgetCheck.warning}\n\n` : '';

    let prompt = '';
    let temperature = 0.7;

    switch (name) {
      case 'ask_gemini':
        prompt = args.prompt;
        temperature = args.temperature || 0.7;
        break;

      case 'gemini_code_review':
        prompt = `Bitte reviewe folgenden ${args.language || 'Code'} und gib konstruktives Feedback:

\`\`\`${args.language || ''}
${args.code}
\`\`\`

Analysiere:
1. Code-Qualität & Best Practices
2. Potenzielle Bugs oder Sicherheitslücken
3. Performance-Optimierungen
4. Lesbarkeit & Wartbarkeit
5. Konkrete Verbesserungsvorschläge`;
        temperature = 0.3;
        break;

      case 'gemini_explain':
        const levelMap = {
          beginner: 'für Anfänger, sehr einfach und mit vielen Beispielen',
          intermediate: 'für Fortgeschrittene mit technischem Hintergrund',
          advanced: 'für Experten mit detaillierten technischen Details',
        };
        const level = levelMap[args.level] || levelMap.intermediate;

        prompt = `Erkläre das Konzept "${args.topic}" ${level}.
Nutze klare Analogien und praktische Beispiele.`;
        temperature = 0.5;
        break;

      default:
        throw new Error(`Unbekanntes Tool: ${name}`);
    }

    // Gemini API aufrufen
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const text = response.text();

    // Token-Informationen extrahieren
    const usageMetadata = response.usageMetadata || {};
    const promptTokens = usageMetadata.promptTokenCount || 0;
    const candidatesTokens = usageMetadata.candidatesTokenCount || 0;
    const totalTokens = usageMetadata.totalTokenCount || 0;

    // Budget aktualisieren mit tatsächlichen Kosten
    const budgetUpdate = updateBudget(
      'gemini-2.0-flash',
      promptTokens,
      candidatesTokens,
      prompt.substring(0, 50)
    );

    // Counter erhöhen (nur für Statistik)
    counter.increment(totalTokens);

    // Response formatieren
    let responseText = `${warning}🤖 **Gemini 2.0 Flash:**\n\n${text}`;

    // Token- und Kosten-Informationen anhängen
    if (totalTokens > 0) {
      responseText += `\n\n📊 **Tokens:** ${promptTokens} prompt + ${candidatesTokens} completion = ${totalTokens} total`;
      responseText += `\n💰 **Kosten:** ${budgetUpdate.cost.toFixed(6)} € (${budgetUpdate.remaining.toFixed(2)} € verbleibend)`;
    }

    // Counter-Status anhängen (nur zur Info)
    const stats = counter.getStats();
    responseText += `\n📈 **Requests heute:** ${stats.used} (${budgetUpdate.percentage}% Budget verbraucht)`;

    return {
      content: [
        {
          type: 'text',
          text: responseText,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Fehler beim Gemini-Aufruf: ${error.message}`,
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
  console.error('✅ Gemini MCP Server läuft...');
}

main().catch((error) => {
  console.error('❌ Server-Fehler:', error);
  process.exit(1);
});
