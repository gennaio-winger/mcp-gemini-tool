/**
 * Request Counter für Groq API
 *
 * Überwacht die tägliche Request-Anzahl und verhindert
 * Überschreitung des Limits (14,400 Requests/Tag)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COUNTER_FILE = path.join(__dirname, 'groq-request-counter.json');
const DAILY_LIMIT = 14400; // Groq Free Tier Limit
const WARNING_THRESHOLDS = {
  LOW: 0.80,    // 80% = 11,520 Requests
  MEDIUM: 0.90, // 90% = 12,960 Requests
  HIGH: 0.95,   // 95% = 13,680 Requests
};

class RequestCounter {
  constructor() {
    this.data = this.loadCounter();
  }

  /**
   * Lädt den Counter aus der JSON-Datei
   */
  loadCounter() {
    try {
      if (fs.existsSync(COUNTER_FILE)) {
        const raw = fs.readFileSync(COUNTER_FILE, 'utf8');
        const data = JSON.parse(raw);

        // Prüfen, ob ein neuer Tag begonnen hat
        const today = this.getToday();
        if (data.date !== today) {
          console.error(`🔄 Neuer Tag erkannt! Counter wird zurückgesetzt.`);
          return this.createNewCounter();
        }

        return data;
      }
    } catch (error) {
      console.error(`⚠️ Fehler beim Laden des Counters: ${error.message}`);
    }

    return this.createNewCounter();
  }

  /**
   * Erstellt einen neuen Counter für den aktuellen Tag
   */
  createNewCounter() {
    return {
      date: this.getToday(),
      count: 0,
      limit: DAILY_LIMIT,
      firstRequest: new Date().toISOString(),
      lastRequest: null,
      warnings: {
        low: false,
        medium: false,
        high: false,
      },
    };
  }

  /**
   * Gibt das heutige Datum als String zurück (YYYY-MM-DD)
   */
  getToday() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Speichert den Counter in die JSON-Datei
   */
  saveCounter() {
    try {
      fs.writeFileSync(COUNTER_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error(`⚠️ Fehler beim Speichern des Counters: ${error.message}`);
    }
  }

  /**
   * Prüft, ob noch Requests verfügbar sind
   * @returns {Object} { allowed: boolean, message: string, stats: Object }
   */
  canMakeRequest() {
    // Prüfen ob neuer Tag
    const today = this.getToday();
    if (this.data.date !== today) {
      this.data = this.createNewCounter();
      this.saveCounter();
    }

    const remaining = DAILY_LIMIT - this.data.count;
    const percentage = (this.data.count / DAILY_LIMIT) * 100;

    if (this.data.count >= DAILY_LIMIT) {
      return {
        allowed: false,
        message: `❌ Tägliches Limit erreicht! (${this.data.count}/${DAILY_LIMIT})\n` +
                 `⏰ Reset um Mitternacht (00:00 Uhr)`,
        stats: this.getStats(),
      };
    }

    return {
      allowed: true,
      message: this.getWarningMessage(percentage),
      stats: this.getStats(),
    };
  }

  /**
   * Gibt eine Warnung aus, wenn Schwellenwerte erreicht werden
   */
  getWarningMessage(percentage) {
    const remaining = DAILY_LIMIT - this.data.count;

    if (percentage >= WARNING_THRESHOLDS.HIGH * 100 && !this.data.warnings.high) {
      this.data.warnings.high = true;
      return `🚨 KRITISCH: 95% des Limits erreicht! Nur noch ${remaining} Requests heute!`;
    }

    if (percentage >= WARNING_THRESHOLDS.MEDIUM * 100 && !this.data.warnings.medium) {
      this.data.warnings.medium = true;
      return `⚠️ WARNUNG: 90% des Limits erreicht! Noch ${remaining} Requests verfügbar.`;
    }

    if (percentage >= WARNING_THRESHOLDS.LOW * 100 && !this.data.warnings.low) {
      this.data.warnings.low = true;
      return `💡 Info: 80% des Limits erreicht. Noch ${remaining} Requests verfügbar.`;
    }

    return null;
  }

  /**
   * Inkrementiert den Counter
   */
  increment() {
    this.data.count++;
    this.data.lastRequest = new Date().toISOString();
    this.saveCounter();
  }

  /**
   * Gibt Statistiken zurück
   */
  getStats() {
    const remaining = DAILY_LIMIT - this.data.count;
    const percentage = ((this.data.count / DAILY_LIMIT) * 100).toFixed(1);

    return {
      date: this.data.date,
      used: this.data.count,
      remaining: remaining,
      limit: DAILY_LIMIT,
      percentage: parseFloat(percentage),
      firstRequest: this.data.firstRequest,
      lastRequest: this.data.lastRequest,
    };
  }

  /**
   * Formatiert die Statistiken für die Ausgabe
   */
  formatStats() {
    const stats = this.getStats();
    const bar = this.createProgressBar(stats.percentage);

    return `
📊 Groq API Request-Statistik (${stats.date})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${bar}
✅ Verwendet:   ${stats.used.toLocaleString()} Requests
⏳ Verfügbar:   ${stats.remaining.toLocaleString()} Requests
📈 Limit:       ${stats.limit.toLocaleString()} Requests/Tag
📊 Auslastung:  ${stats.percentage}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();
  }

  /**
   * Erstellt eine visuelle Progress-Bar
   */
  createProgressBar(percentage) {
    const barLength = 30;
    const filled = Math.floor((percentage / 100) * barLength);
    const empty = barLength - filled;

    let bar = '[';
    bar += '█'.repeat(filled);
    bar += '░'.repeat(empty);
    bar += `] ${percentage}%`;

    // Farb-Indikator (durch Emoji)
    if (percentage >= 95) {
      bar = '🔴 ' + bar;
    } else if (percentage >= 80) {
      bar = '🟡 ' + bar;
    } else {
      bar = '🟢 ' + bar;
    }

    return bar;
  }

  /**
   * Setzt den Counter zurück (manuell)
   */
  reset() {
    this.data = this.createNewCounter();
    this.saveCounter();
    console.error('✅ Counter wurde zurückgesetzt!');
  }
}

// Singleton-Instanz
let instance = null;

export function getCounter() {
  if (!instance) {
    instance = new RequestCounter();
  }
  return instance;
}

export default { getCounter };
