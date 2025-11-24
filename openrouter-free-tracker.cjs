/**
 * OpenRouter Free-Models Tracker
 *
 * Tracked lokale Nutzung kostenloser Modelle, da OpenRouter keine
 * Rate-Limit-Headers für Free-Models zurückgibt.
 *
 * @version 1.0.0
 * @date 2025-11-24
 */

const fs = require('fs');
const path = require('path');

const TRACKER_FILE = path.join(__dirname, 'openrouter-free-tracker.json');

class OpenRouterFreeTracker {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    if (!fs.existsSync(TRACKER_FILE)) {
      return {
        models: {},
        lastReset: this.getStartOfDay(),
        totalRequests: 0
      };
    }

    try {
      const data = JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));

      // Auto-Reset um Mitternacht
      if (this.shouldReset(data.lastReset)) {
        console.log('🔄 Täglicher Reset...');
        return this.resetData();
      }

      return data;
    } catch {
      return this.resetData();
    }
  }

  saveData() {
    fs.writeFileSync(TRACKER_FILE, JSON.stringify(this.data, null, 2));
  }

  shouldReset(lastReset) {
    const now = Date.now();
    const today = this.getStartOfDay();
    return lastReset < today;
  }

  getStartOfDay() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }

  resetData() {
    const newData = {
      models: {},
      lastReset: this.getStartOfDay(),
      totalRequests: 0
    };
    this.data = newData;
    this.saveData();
    return newData;
  }

  /**
   * Initialisiert ein Modell im Tracker
   */
  initModel(modelId) {
    if (!this.data.models[modelId]) {
      this.data.models[modelId] = {
        requests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalTokens: 0,
        lastUsed: null,
        lastError: null,
        errorCount: 0,
        availability: 'unknown' // unknown, available, rate_limited, unavailable
      };
    }
  }

  /**
   * Tracked eine erfolgreiche Anfrage
   */
  trackSuccess(modelId, tokens = 0) {
    this.initModel(modelId);

    this.data.models[modelId].requests++;
    this.data.models[modelId].successfulRequests++;
    this.data.models[modelId].totalTokens += tokens;
    this.data.models[modelId].lastUsed = Date.now();
    this.data.models[modelId].availability = 'available';

    // Reset error count bei Erfolg
    if (this.data.models[modelId].errorCount > 0) {
      this.data.models[modelId].errorCount = Math.max(0, this.data.models[modelId].errorCount - 1);
    }

    this.data.totalRequests++;
    this.saveData();
  }

  /**
   * Tracked einen Fehler
   */
  trackError(modelId, errorCode, errorMessage = '') {
    this.initModel(modelId);

    this.data.models[modelId].requests++;
    this.data.models[modelId].failedRequests++;
    this.data.models[modelId].lastError = {
      code: errorCode,
      message: errorMessage,
      timestamp: Date.now()
    };
    this.data.models[modelId].errorCount++;

    // Availability basierend auf Fehler
    if (errorCode === 429) {
      this.data.models[modelId].availability = 'rate_limited';
    } else if (errorCode === 404) {
      this.data.models[modelId].availability = 'unavailable';
    }

    this.data.totalRequests++;
    this.saveData();
  }

  /**
   * Gibt verfügbare Modelle zurück (sortiert nach Erfolgsrate)
   */
  getAvailableModels() {
    const models = Object.entries(this.data.models)
      .map(([id, stats]) => ({
        id,
        ...stats,
        successRate: stats.requests > 0
          ? (stats.successfulRequests / stats.requests) * 100
          : 0
      }))
      .filter(model =>
        model.availability === 'available' ||
        model.availability === 'unknown' ||
        (model.availability === 'rate_limited' && this.isRecentError(model.lastError) === false)
      )
      .sort((a, b) => b.successRate - a.successRate);

    return models;
  }

  /**
   * Prüft ob ein Fehler "frisch" ist (< 5 Minuten)
   */
  isRecentError(lastError) {
    if (!lastError) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastError.timestamp < fiveMinutes;
  }

  /**
   * Gibt die besten N Modelle zurück
   */
  getBestModels(count = 3) {
    return this.getAvailableModels().slice(0, count);
  }

  /**
   * Gibt Statistiken für ein Modell zurück
   */
  getModelStats(modelId) {
    if (!this.data.models[modelId]) {
      return null;
    }

    const stats = this.data.models[modelId];
    const successRate = stats.requests > 0
      ? ((stats.successfulRequests / stats.requests) * 100).toFixed(1)
      : '0.0';

    return {
      ...stats,
      successRate: `${successRate}%`,
      avgTokens: stats.successfulRequests > 0
        ? Math.round(stats.totalTokens / stats.successfulRequests)
        : 0
    };
  }

  /**
   * Gibt Gesamt-Statistiken zurück
   */
  getOverallStats() {
    const modelCount = Object.keys(this.data.models).length;
    const availableCount = this.getAvailableModels().length;
    const totalSuccessful = Object.values(this.data.models)
      .reduce((sum, model) => sum + model.successfulRequests, 0);
    const totalFailed = Object.values(this.data.models)
      .reduce((sum, model) => sum + model.failedRequests, 0);

    return {
      totalModels: modelCount,
      availableModels: availableCount,
      totalRequests: this.data.totalRequests,
      successfulRequests: totalSuccessful,
      failedRequests: totalFailed,
      successRate: this.data.totalRequests > 0
        ? `${((totalSuccessful / this.data.totalRequests) * 100).toFixed(1)}%`
        : '0.0%',
      lastReset: new Date(this.data.lastReset).toLocaleString('de-DE'),
      nextReset: new Date(this.data.lastReset + 24 * 60 * 60 * 1000).toLocaleString('de-DE')
    };
  }

  /**
   * Gibt eine formatierte Übersicht zurück
   */
  getFormattedStats() {
    const overall = this.getOverallStats();
    const available = this.getAvailableModels();

    let output = '';
    output += '╔════════════════════════════════════════════════════════════╗\n';
    output += '║  OpenRouter Free-Models Tracker                            ║\n';
    output += '╠════════════════════════════════════════════════════════════╣\n';
    output += `║  Total Modelle:        ${String(overall.totalModels).padEnd(34)} ║\n`;
    output += `║  Verfügbar:            ${String(overall.availableModels).padEnd(34)} ║\n`;
    output += `║  Requests heute:       ${String(overall.totalRequests).padEnd(34)} ║\n`;
    output += `║  Erfolgsrate:          ${String(overall.successRate).padEnd(34)} ║\n`;
    output += `║  Nächster Reset:       ${overall.nextReset.padEnd(34)} ║\n`;
    output += '╠════════════════════════════════════════════════════════════╣\n';
    output += '║  Verfügbare Modelle (sortiert nach Erfolgsrate)            ║\n';
    output += '╠════════════════════════════════════════════════════════════╣\n';

    if (available.length === 0) {
      output += '║  ⚠️  Keine verfügbaren Modelle!                            ║\n';
    } else {
      available.slice(0, 5).forEach((model, idx) => {
        const name = model.id.split('/').pop().substring(0, 30);
        const rate = `${model.successRate.toFixed(1)}%`;
        const requests = `${model.successfulRequests}/${model.requests}`;
        output += `║  ${idx + 1}. ${name.padEnd(30)} ${rate.padStart(6)} (${requests.padStart(7)}) ║\n`;
      });
    }

    output += '╚════════════════════════════════════════════════════════════╝\n';
    return output;
  }
}

// Singleton-Instanz
const tracker = new OpenRouterFreeTracker();

module.exports = tracker;
