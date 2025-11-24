#!/usr/bin/env node

/**
 * Gemini Request Counter
 *
 * Statistik-Counter für Gemini-Requests (KEINE Limits mehr!)
 * Budget-Management übernimmt gemini-budget-manager.js
 *
 * @version 2.0.0
 * @date 2025-11-24
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfiguration
const COUNTER_FILE = path.join(__dirname, 'gemini-request-counter.json');

/**
 * Request-Counter für Gemini
 */
class GeminiRequestCounter {
  constructor() {
    this.data = this.loadCounter();
  }

  /**
   * Lade Counter-Daten aus JSON-Datei
   */
  loadCounter() {
    try {
      if (fs.existsSync(COUNTER_FILE)) {
        const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
        return data;
      }
    } catch (error) {
      console.error('Fehler beim Laden des Gemini-Counters:', error.message);
    }
    return this.createNewCounter();
  }

  /**
   * Erstelle neuen Counter für heute
   */
  createNewCounter() {
    return {
      date: this.getToday(),
      count: 0,
      lastRequest: null,
      totalTokens: 0, // Gesamt-Tokens heute
    };
  }

  /**
   * Speichere Counter-Daten
   */
  saveCounter() {
    try {
      fs.writeFileSync(COUNTER_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Fehler beim Speichern des Gemini-Counters:', error.message);
    }
  }

  /**
   * Heutiges Datum als String (YYYY-MM-DD)
   */
  getToday() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Prüfe ob Request erlaubt ist
   * (Keine Limits mehr! Budget-Check übernimmt gemini-budget-manager.js)
   */
  canMakeRequest() {
    const today = this.getToday();

    // Neuer Tag? Counter zurücksetzen!
    if (this.data.date !== today) {
      this.data = this.createNewCounter();
      this.saveCounter();
    }

    // Immer erlaubt - Budget-Manager übernimmt die Kontrolle
    return {
      allowed: true,
      message: null,
    };
  }

  /**
   * Zeit bis zum nächsten Reset
   */
  getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} Stunden`;
  }

  /**
   * Erhöhe Counter nach erfolgreichem Request
   */
  increment(tokens = 0) {
    this.data.count++;
    this.data.lastRequest = new Date().toISOString();
    this.data.totalTokens += tokens;
    this.saveCounter();
  }

  /**
   * Hole aktuelle Statistik
   */
  getStats() {
    const today = this.getToday();

    // Neuer Tag? Reset!
    if (this.data.date !== today) {
      this.data = this.createNewCounter();
      this.saveCounter();
    }

    const used = this.data.count;

    return {
      date: this.data.date,
      used: used,
      totalTokens: this.data.totalTokens,
      nextReset: this.getNextResetTime(),
      lastRequest: this.data.lastRequest,
    };
  }

  /**
   * Formatiere Statistik als Text
   */
  formatStats() {
    const stats = this.getStats();

    let output = `📊 **Gemini Request-Statistik**\n\n`;
    output += `**Datum:** ${stats.date}\n`;
    output += `**Requests heute:** ${stats.used}\n`;
    output += `**Gesamt-Tokens:** ${stats.totalTokens}\n`;

    if (stats.lastRequest) {
      const lastTime = new Date(stats.lastRequest).toLocaleTimeString('de-DE');
      output += `**Letzter Request:** ${lastTime}\n`;
    }

    output += `**Reset in:** ${stats.nextReset}\n\n`;
    output += `ℹ️ Budget-Limits werden von gemini_budget verwaltet`;

    return output;
  }
}

// Singleton-Instanz
let counterInstance = null;

/**
 * Hole Counter-Instanz (Singleton)
 */
export function getCounter() {
  if (!counterInstance) {
    counterInstance = new GeminiRequestCounter();
  }
  return counterInstance;
}

// Export für Tests
export { GeminiRequestCounter };
