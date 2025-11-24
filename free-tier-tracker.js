#!/usr/bin/env node

/**
 * Free-Tier-Tracker für OpenRouter
 *
 * Trackt Rate-Limits der kostenlosen Modelle und warnt bei niedrigen Limits.
 *
 * @version 1.0.0
 * @author Claude Code
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRACKER_FILE = path.join(__dirname, 'free-tier-tracker.json');
const LOW_LIMIT_WARNING = 10; // Warnung bei < 10 Requests

/**
 * Lädt die Tracker-Daten aus der JSON-Datei
 */
export async function loadTracker() {
  try {
    const data = await fs.readFile(TRACKER_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Fehler beim Laden des Trackers:', error.message);
    return null;
  }
}

/**
 * Speichert die Tracker-Daten in die JSON-Datei
 */
export async function saveTracker(data) {
  try {
    await fs.writeFile(TRACKER_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Speichern des Trackers:', error.message);
    return false;
  }
}

/**
 * Aktualisiert die Limit-Informationen eines Modells
 *
 * @param {string} modelId - Die Modell-ID
 * @param {object} rateLimitHeaders - Optional: Rate-Limit-Headers (falls vorhanden)
 * @param {boolean} manualCount - Wenn true, wird nur der Counter erhöht (für Modelle ohne Headers)
 */
export async function updateModelLimits(modelId, rateLimitHeaders = {}, manualCount = true) {
  const tracker = await loadTracker();
  if (!tracker || !tracker.models[modelId]) {
    console.error(`❌ Modell nicht gefunden: ${modelId}`);
    return false;
  }

  const model = tracker.models[modelId];

  // Falls Rate-Limit-Headers vorhanden sind, diese nutzen
  if (rateLimitHeaders['x-ratelimit-limit-requests']) {
    model.limit = parseInt(rateLimitHeaders['x-ratelimit-limit-requests']);
  }

  if (rateLimitHeaders['x-ratelimit-remaining-requests']) {
    model.remaining = parseInt(rateLimitHeaders['x-ratelimit-remaining-requests']);
  } else if (manualCount) {
    // Manuelle Zählung: Remaining dekrementieren
    model.remaining = Math.max(0, model.remaining - 1);
  }

  if (rateLimitHeaders['x-ratelimit-reset-requests']) {
    model.resetTime = new Date(parseInt(rateLimitHeaders['x-ratelimit-reset-requests']) * 1000).toISOString();
  } else if (manualCount && !model.resetTime) {
    // Setze Reset-Zeit auf Mitternacht (24h später)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    model.resetTime = tomorrow.toISOString();
  }

  model.lastUpdated = new Date().toISOString();
  model.totalRequests += 1;

  // Update Metadata
  tracker.metadata.lastSync = new Date().toISOString();

  // Speichern
  await saveTracker(tracker);

  // Warnung bei niedrigem Limit
  if (model.remaining < LOW_LIMIT_WARNING) {
    console.warn(`⚠️  WARNUNG: ${model.name} hat nur noch ${model.remaining} Requests übrig!`);
    if (model.resetTime) {
      const resetDate = new Date(model.resetTime);
      const now = new Date();
      const hoursUntilReset = Math.ceil((resetDate - now) / (1000 * 60 * 60));
      console.warn(`   Reset in ca. ${hoursUntilReset} Stunden`);
    }
  }

  return true;
}

/**
 * Gibt den Status aller Modelle aus
 */
export async function showStatus() {
  const tracker = await loadTracker();
  if (!tracker) return;

  console.log('\n📊 Free-Tier Status Report\n');
  console.log('═'.repeat(80));

  for (const [modelId, model] of Object.entries(tracker.models)) {
    const percentage = model.limit > 0 ? ((model.remaining / model.limit) * 100).toFixed(1) : 0;
    const bar = createProgressBar(model.remaining, model.limit);

    console.log(`\n${model.name} (${model.provider})`);
    console.log(`   Modell-ID: ${modelId}`);
    console.log(`   Limit: ${bar} ${model.remaining}/${model.limit} (${percentage}%)`);

    if (model.resetTime) {
      const resetDate = new Date(model.resetTime);
      const now = new Date();
      const hoursUntilReset = Math.ceil((resetDate - now) / (1000 * 60 * 60));
      console.log(`   Reset: ${resetDate.toLocaleString('de-DE')} (in ${hoursUntilReset}h)`);
    }

    console.log(`   Total Requests: ${model.totalRequests}`);

    if (model.lastUpdated) {
      console.log(`   Letztes Update: ${new Date(model.lastUpdated).toLocaleString('de-DE')}`);
    }

    // Warnung
    if (model.remaining < LOW_LIMIT_WARNING) {
      console.log(`   ⚠️  ACHTUNG: Nur noch ${model.remaining} Requests verfügbar!`);
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`\nLetztes Sync: ${tracker.metadata.lastSync || 'Noch nie'}`);
  console.log(`Tracker-Version: ${tracker.metadata.version}\n`);
}

/**
 * Erstellt eine visuelle Progress-Bar
 */
function createProgressBar(current, max, length = 20) {
  const percentage = max > 0 ? current / max : 0;
  const filled = Math.round(percentage * length);
  const empty = length - filled;

  let bar = '[';
  bar += '█'.repeat(filled);
  bar += '░'.repeat(empty);
  bar += ']';

  return bar;
}

/**
 * Gibt das beste verfügbare Modell zurück (höchste Remaining-Requests)
 */
export async function getBestAvailableModel() {
  const tracker = await loadTracker();
  if (!tracker) return null;

  let bestModel = null;
  let maxRemaining = -1;

  for (const [modelId, model] of Object.entries(tracker.models)) {
    if (model.remaining > maxRemaining) {
      maxRemaining = model.remaining;
      bestModel = { id: modelId, ...model };
    }
  }

  return bestModel;
}

/**
 * Prüft ob ein Modell noch Requests übrig hat
 */
export async function hasRequestsAvailable(modelId) {
  const tracker = await loadTracker();
  if (!tracker || !tracker.models[modelId]) return false;

  return tracker.models[modelId].remaining > 0;
}

/**
 * Setzt alle Limits zurück (für Testing)
 */
export async function resetAllLimits() {
  const tracker = await loadTracker();
  if (!tracker) return false;

  for (const model of Object.values(tracker.models)) {
    model.remaining = model.limit;
    model.resetTime = null;
    model.totalRequests = 0;
    model.lastUpdated = null;
  }

  tracker.metadata.lastSync = new Date().toISOString();

  await saveTracker(tracker);
  console.log('✅ Alle Limits zurückgesetzt!');
  return true;
}

// CLI-Unterstützung
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'reset':
      await resetAllLimits();
      break;
    case 'best':
      const best = await getBestAvailableModel();
      if (best) {
        console.log(`\n🏆 Bestes Modell: ${best.name}`);
        console.log(`   Verbleibend: ${best.remaining}/${best.limit}`);
        console.log(`   Modell-ID: ${best.id}\n`);
      }
      break;
    default:
      console.log(`
Free-Tier-Tracker CLI

Usage:
  node free-tier-tracker.js status    - Zeige Status aller Modelle
  node free-tier-tracker.js best      - Zeige bestes verfügbares Modell
  node free-tier-tracker.js reset     - Setze alle Limits zurück

Beispiel:
  node free-tier-tracker.js status
`);
  }
}
