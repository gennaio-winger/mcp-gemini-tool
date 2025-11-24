#!/usr/bin/env node

/**
 * MCP Server für Groq (Llama 3.3 70B)
 *
 * Stellt Groq als Tool für Claude Code bereit.
 * Claude kann Groq/Llama für spezielle Aufgaben konsultieren.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Groq from 'groq-sdk';
import { getCounter } from './request-counter.js';

// Request Counter initialisieren
const counter = getCounter();

// Groq API konfigurieren
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error('FEHLER: GROQ_API_KEY Environment Variable nicht gesetzt!');
  process.exit(1);
}

const groq = new Groq({ apiKey });

// MCP Server erstellen
const server = new Server(
  {
    name: 'groq-tool',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tools definieren
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ask_groq',
        description: 'Frage Groq/Llama 3.3 70B für alternative Perspektiven, schnelle Antworten oder zweite Meinungen. Nutze dies für: Code-Generierung, Debugging, Erklärungen, kreative Aufgaben.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Die Frage/Aufgabe für Groq/Llama',
            },
            temperature: {
              type: 'number',
              description: 'Kreativität (0.0 = präzise, 1.0 = kreativ). Standard: 0.7',
              default: 0.7,
              minimum: 0.0,
              maximum: 2.0,
            },
            model: {
              type: 'string',
              description: 'Modell-Auswahl: llama-3.3-70b (default), mixtral-8x7b, gemma2-9b',
              default: 'llama-3.3-70b-versatile',
              enum: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'groq_code_review',
        description: 'Lasse Groq/Llama Code reviewen mit detailliertem Feedback zu Qualität, Bugs, Performance und Best Practices',
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
            focus: {
              type: 'string',
              description: 'Review-Fokus: security, performance, readability, all',
              default: 'all',
              enum: ['security', 'performance', 'readability', 'all'],
            },
          },
          required: ['code'],
        },
      },
      {
        name: 'groq_explain',
        description: 'Lasse Groq/Llama komplexe Konzepte einfach und verständlich erklären',
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
              enum: ['beginner', 'intermediate', 'advanced'],
            },
            language: {
              type: 'string',
              description: 'Sprache der Erklärung (de, en, etc.)',
              default: 'de',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'groq_translate',
        description: 'Übersetze Text mit Groq/Llama (unterstützt 100+ Sprachen)',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Der zu übersetzende Text',
            },
            from: {
              type: 'string',
              description: 'Quellsprache (z.B. de, en, fr)',
              default: 'auto',
            },
            to: {
              type: 'string',
              description: 'Zielsprache (z.B. de, en, fr)',
            },
          },
          required: ['text', 'to'],
        },
      },
      {
        name: 'groq_stats',
        description: 'Zeige aktuelle Request-Statistik und verbleibende API-Calls für heute',
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
    // Spezial-Tool: Statistik anzeigen (kein API-Call)
    if (name === 'groq_stats') {
      const stats = counter.formatStats();
      return {
        content: [
          {
            type: 'text',
            text: stats,
          },
        ],
      };
    }

    // Prüfen, ob Request-Limit erreicht ist
    const check = counter.canMakeRequest();
    if (!check.allowed) {
      return {
        content: [
          {
            type: 'text',
            text: `${check.message}\n\n${counter.formatStats()}`,
          },
        ],
        isError: true,
      };
    }

    // Warnung ausgeben, falls vorhanden
    if (check.message) {
      console.error(`\n${check.message}\n`);
    }

    let messages = [];
    let temperature = 0.7;
    let model = 'llama-3.3-70b-versatile';
    let maxTokens = 2048;

    switch (name) {
      case 'ask_groq':
        messages = [{ role: 'user', content: args.prompt }];
        temperature = args.temperature || 0.7;
        model = args.model || 'llama-3.3-70b-versatile';
        break;

      case 'groq_code_review':
        const focusMap = {
          security: 'Sicherheitslücken und potenzielle Exploits',
          performance: 'Performance-Optimierungen und Effizienz',
          readability: 'Code-Lesbarkeit und Wartbarkeit',
          all: 'alle Aspekte (Sicherheit, Performance, Lesbarkeit)',
        };
        const focus = focusMap[args.focus] || focusMap.all;

        messages = [{
          role: 'user',
          content: `Bitte reviewe folgenden ${args.language || 'Code'} mit Fokus auf ${focus}:

\`\`\`${args.language || ''}
${args.code}
\`\`\`

Analysiere:
1. Code-Qualität & Best Practices
2. Potenzielle Bugs oder Sicherheitslücken
3. Performance-Optimierungen
4. Lesbarkeit & Wartbarkeit
5. Konkrete Verbesserungsvorschläge mit Code-Beispielen

Sei konstruktiv und praktisch!`
        }];
        temperature = 0.3;
        maxTokens = 3000;
        break;

      case 'groq_explain':
        const levelMap = {
          beginner: 'für Anfänger, sehr einfach und mit vielen Beispielen',
          intermediate: 'für Fortgeschrittene mit technischem Hintergrund',
          advanced: 'für Experten mit detaillierten technischen Details',
        };
        const level = levelMap[args.level] || levelMap.intermediate;
        const lang = args.language === 'de' ? 'auf Deutsch' : `in ${args.language}`;

        messages = [{
          role: 'user',
          content: `Erkläre das Konzept "${args.topic}" ${level} ${lang}.
Nutze klare Analogien, praktische Beispiele und strukturiere die Erklärung gut.`
        }];
        temperature = 0.5;
        break;

      case 'groq_translate':
        const fromLang = args.from === 'auto' ? '(automatisch erkannt)' : args.from;
        messages = [{
          role: 'user',
          content: `Übersetze folgenden Text von ${fromLang} nach ${args.to}:

${args.text}

Gib NUR die Übersetzung zurück, keine Erklärungen.`
        }];
        temperature = 0.2;
        break;

      default:
        throw new Error(`Unbekanntes Tool: ${name}`);
    }

    // Groq API aufrufen
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: model,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: 1,
      stream: false,
    });

    // Request erfolgreich → Counter inkrementieren
    counter.increment();

    const responseText = completion.choices[0]?.message?.content || 'Keine Antwort erhalten.';

    // Modell-Info für Transparenz
    const modelName = model === 'llama-3.3-70b-versatile' ? 'Llama 3.3 70B' :
                      model === 'mixtral-8x7b-32768' ? 'Mixtral 8x7B' :
                      model === 'gemma2-9b-it' ? 'Gemma 2 9B' : model;

    return {
      content: [
        {
          type: 'text',
          text: `🤖 **Groq (${modelName}):**\n\n${responseText}`,
        },
      ],
    };
  } catch (error) {
    // Detaillierte Fehler-Informationen
    let errorMessage = `❌ Fehler beim Groq-Aufruf: ${error.message}`;

    if (error.status === 429) {
      errorMessage += '\n\n💡 Rate-Limit erreicht. Warte kurz und versuche es erneut.';
    } else if (error.status === 401) {
      errorMessage += '\n\n💡 API-Key ungültig. Prüfe GROQ_API_KEY.';
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
  console.error('✅ Groq MCP Server läuft (Llama 3.3 70B)...');
}

main().catch((error) => {
  console.error('❌ Server-Fehler:', error);
  process.exit(1);
});
