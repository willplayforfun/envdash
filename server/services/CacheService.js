const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class CacheService {
  constructor() {
    this.fileHashes = new Map(); // filename -> hash
    this.dataVersion = null; // combined hash of all files
  }

  /**
   * Calculate hash of file data (not file path)
   */
  calculateDataHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 12);
  }

  /**
   * Update hash for a filename with file data
   */
  updateFileHash(filename, data) {
    const hash = this.calculateDataHash(data);
    this.fileHashes.set(filename, hash);
    return hash;
  }

  /**
   * Get hash for a specific file
   */
  getFileHash(filename) {
    return this.fileHashes.get(filename) || null;
  }

  /**
   * Get all file hashes
   */
  getAllFileHashes() {
    return Object.fromEntries(this.fileHashes);
  }

  /**
   * Calculate and cache hashes for files with their data
   */
  updateMultipleHashes(fileDataMap) {
    const results = [];
    for (const [filename, data] of Object.entries(fileDataMap)) {
      const hash = this.updateFileHash(filename, data);
      results.push({ filename, hash });
    }
    return results;
  }

  /**
   * Get current data version (combined hash)
   */
  getDataVersion() {
    return this.dataVersion;
  }

  /**
   * Clear all cached hashes
   */
  clear() {
    this.fileHashes.clear();
    this.dataVersion = null;
  }

  /**
   * Check if a file exists and has a hash
   */
  hasFile(filename) {
    const hash = this.fileHashes.get(filename);
    return hash !== null && hash !== undefined;
  }

  /**
   * Private method to update the combined data version
   */
  _updateDataVersion() {
    const hashes = Array.from(this.fileHashes.values())
      .filter(hash => hash !== null)
      .sort(); // Sort for consistent ordering

    if (hashes.length === 0) {
      this.dataVersion = null;
    } else {
      const combined = hashes.join('');
      this.dataVersion = crypto.createHash('sha256').update(combined).digest('hex').slice(0, 12);
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;