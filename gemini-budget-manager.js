/**
 * Gemini Budget Manager
 *
 * Verwaltet das Budget für Gemini API Aufrufe
 * Budget: 257,50 € (gültig bis 23. Februar 2026)
 * Quelle: FreeTrialUpgrade-Aktion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUDGET_FILE = path.join(__dirname, 'gemini-budget.json');

// Gemini 2.0 Flash Preise (pro Million Tokens)
const PRICING = {
  'gemini-2.0-flash': {
    input: 0.35,   // $ per 1M tokens
    output: 1.50,  // $ per 1M tokens
  },
  'gemini-2.0-flash-exp': {
    input: 0.35,
    output: 1.50,
  },
  'gemini-1.5-flash': {
    input: 0.15,
    output: 0.60,
  },
  'gemini-1.5-pro': {
    input: 1.25,
    output: 5.00,
  },
};

// USD zu EUR Konvertierung (Durchschnittskurs)
const USD_TO_EUR = 0.92;

/**
 * Budget-Daten laden
 */
function loadBudget() {
  try {
    const data = fs.readFileSync(BUDGET_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Fehler beim Laden von gemini-budget.json:', error.message);
    throw error;
  }
}

/**
 * Budget-Daten speichern
 */
function saveBudget(budget) {
  try {
    budget.lastUpdated = new Date().toISOString().split('T')[0];
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(budget, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Fehler beim Speichern von gemini-budget.json:', error.message);
    throw error;
  }
}

/**
 * Kosten für einen Request berechnen
 *
 * @param {string} model - Modell-Name (z.B. 'gemini-2.0-flash')
 * @param {number} inputTokens - Anzahl Input-Tokens
 * @param {number} outputTokens - Anzahl Output-Tokens
 * @returns {number} Kosten in EUR
 */
export function calculateCost(model, inputTokens, outputTokens) {
  const pricing = PRICING[model] || PRICING['gemini-2.0-flash'];

  // Kosten in USD berechnen
  const inputCostUSD = (inputTokens / 1_000_000) * pricing.input;
  const outputCostUSD = (outputTokens / 1_000_000) * pricing.output;
  const totalCostUSD = inputCostUSD + outputCostUSD;

  // In EUR konvertieren
  const totalCostEUR = totalCostUSD * USD_TO_EUR;

  return totalCostEUR;
}

/**
 * Budget aktualisieren nach einem Request
 *
 * @param {string} model - Modell-Name
 * @param {number} inputTokens - Input-Tokens
 * @param {number} outputTokens - Output-Tokens
 * @param {string} prompt - Prompt (für Logging)
 * @returns {Object} Aktualisierte Budget-Info
 */
export function updateBudget(model, inputTokens, outputTokens, prompt = '') {
  const budget = loadBudget();

  const cost = calculateCost(model, inputTokens, outputTokens);

  budget.spent = parseFloat((budget.spent + cost).toFixed(6));
  budget.remaining = parseFloat((budget.totalBudget - budget.spent).toFixed(6));
  budget.requestCount += 1;

  // Request-Details speichern (max. letzte 100)
  budget.requests.push({
    timestamp: new Date().toISOString(),
    model,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    costEUR: parseFloat(cost.toFixed(6)),
    promptPreview: prompt.substring(0, 50),
  });

  // Nur letzte 100 Requests behalten
  if (budget.requests.length > 100) {
    budget.requests = budget.requests.slice(-100);
  }

  saveBudget(budget);

  return {
    cost,
    spent: budget.spent,
    remaining: budget.remaining,
    percentage: ((budget.spent / budget.totalBudget) * 100).toFixed(2),
  };
}

/**
 * Budget-Status prüfen
 *
 * @returns {Object} Budget-Status mit Warnungen
 */
export function checkBudget() {
  const budget = loadBudget();

  const remaining = budget.remaining;
  const percentage = (budget.spent / budget.totalBudget) * 100;

  // Ablaufdatum prüfen
  const validUntil = new Date(budget.validUntil);
  const now = new Date();
  const daysRemaining = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));

  let warning = null;
  let allowed = true;

  if (remaining <= 0) {
    warning = '❌ Budget aufgebraucht! Keine weiteren Requests möglich.';
    allowed = false;
  } else if (daysRemaining <= 0) {
    warning = '❌ Budget abgelaufen! Gültig bis: ' + budget.validUntil;
    allowed = false;
  } else if (remaining < 1) {
    warning = `⚠️ Warnung: Nur noch ${remaining.toFixed(2)} € verfügbar!`;
  } else if (percentage > 90) {
    warning = `⚠️ Warnung: ${percentage.toFixed(1)}% des Budgets verbraucht`;
  } else if (daysRemaining <= 30) {
    warning = `⚠️ Hinweis: Budget läuft in ${daysRemaining} Tagen ab`;
  }

  return {
    allowed,
    warning,
    budget: {
      total: budget.totalBudget,
      spent: budget.spent,
      remaining: budget.remaining,
      currency: budget.currency,
      percentage: percentage.toFixed(2),
      requestCount: budget.requestCount,
      validUntil: budget.validUntil,
      daysRemaining,
    },
  };
}

/**
 * Budget-Status formatieren für Ausgabe
 *
 * @returns {string} Formatierter Budget-Status
 */
export function formatBudgetStatus() {
  const check = checkBudget();
  const b = check.budget;

  let output = '💰 **Gemini Budget Status**\n\n';

  // Budget-Übersicht
  output += `**Guthaben:** ${b.remaining.toFixed(2)} € / ${b.total.toFixed(2)} € (${b.percentage}%)\n`;
  output += `**Verbraucht:** ${b.spent.toFixed(2)} €\n`;
  output += `**Requests:** ${b.requestCount}\n`;
  output += `**Gültig bis:** ${b.validUntil} (${b.daysRemaining} Tage)\n`;
  output += `**Quelle:** FreeTrialUpgrade-Aktion\n\n`;

  // Fortschrittsbalken
  const barLength = 20;
  const filledLength = Math.round((b.percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  output += `**Verbrauch:** [${bar}] ${b.percentage}%\n\n`;

  // Warnung
  if (check.warning) {
    output += `${check.warning}\n\n`;
  }

  // Durchschnittskosten
  if (b.requestCount > 0) {
    const avgCost = b.spent / b.requestCount;
    const estimatedRemaining = Math.floor(b.remaining / avgCost);
    output += `**Ø pro Request:** ${avgCost.toFixed(4)} €\n`;
    output += `**Geschätzte verbleibende Requests:** ~${estimatedRemaining}\n`;
  }

  return output;
}

/**
 * Budget zurücksetzen (nur für Tests!)
 */
export function resetBudget() {
  const budget = loadBudget();
  budget.spent = 0;
  budget.remaining = budget.totalBudget;
  budget.requestCount = 0;
  budget.requests = [];
  saveBudget(budget);
  return 'Budget zurückgesetzt!';
}
