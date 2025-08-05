const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cacheService = require('./CacheService');

class DataService {
  constructor() {
    this.router = express.Router();
    this.dataDir = path.join(__dirname, '../../public/data');
    this.config = null;
    this.setupRoutes();
  }

  errorHandler (error, req, res, next) {
    console.error('DataService handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: `Failure handling ${req.path}`
    });
  }

  setupRoutes() {
    this.router.get('/status/:datasetKey', this.getStatus.bind(this), this.errorHandler.bind(this));
    this.router.post('/download/:datasetKey', this.downloadFiles.bind(this), this.errorHandler.bind(this));
    this.router.delete('/files', this.clearFiles.bind(this), this.errorHandler.bind(this));
  }

  async loadConfig() {
    if (!this.config) {
      const configModule = await import('/app/cfg/datasets.mjs');
      this.config = configModule.DATASETS;
    }
    return this.config;
  }

  async ensureDataDir() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  getFilePath(filename) {
    return path.join(this.dataDir, filename);
  }

  /**
   * GET /api/data/status/:datasetKey
   */
  async getStatus(req, res) {
    try {
      console.log(`Getting status for ${req.path}`);

      await this.ensureDataDir();
      const allConfig = await this.loadConfig();
      const { datasetKey } = req.params;
      const config = allConfig[datasetKey];

      if (!config) {
        return res.status(400).json({
          success: false,
          message: `Unknown dataset: ${datasetKey}`
        });
      }

      const files = {};

      for (const download of config.downloads) {
        const filename = `${config.file_prefix}${download.filename}`;
        const filePath = this.getFilePath(filename);

        try {
          //console.log(`Checking file status: ${filePath}`);
          await fs.stat(filePath);

          // File exists, read it and update hash
          const fileData = await fs.readFile(filePath, 'utf8');
          const hash = cacheService.updateFileHash(filename, fileData);

          files[download.filename] = {
            downloaded: true,
          };

        } catch (error) {
          if (error.code === 'ENOENT') {
            files[download.filename] = {
              downloaded: false,
            };
          } else {
            throw error;
          }
        }
      }

      const allFilesDownloaded = Object.values(files).every(r => r.downloaded);

      res.json({
        success: true,
        dataset: datasetKey,
        status: allFilesDownloaded
      });
    } catch (error) {
      console.error('Error checking data status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check data status',
        error: error.message
      });
    }
  }

  /**
   * POST /api/data/download/:datasetKey
   */
  async downloadFiles(req, res) {
    try {
      const { datasetKey } = req.params;
      console.log(`Starting ${datasetKey} data download...`);

      await this.ensureDataDir();
      const allConfig = await this.loadConfig();
      const config = allConfig[datasetKey];

      if (!config) {
        return res.status(400).json({
          success: false,
          message: `Unknown dataset: ${datasetKey}`
        });
      }

      const results = [];

      for (const download of config.downloads) {
        const filename = `${config.file_prefix}${download.filename}`;
        const filePath = this.getFilePath(filename);

        try {
          // Check if file already exists
          try {
            await fs.stat(filePath);
            const fileData = await fs.readFile(filePath, 'utf8');
            const existingHash = cacheService.updateFileHash(filename, fileData);
            results.push({
              filename,
              status: 'already_exists',
              hash: existingHash
            });
            continue;
          } catch (statError) {
            if (statError.code !== 'ENOENT') {
              throw statError;
            }
            // File doesn't exist, proceed with download
          }

          // Download the file
          console.log(`Downloading ${download.url} to ${filename}`);
          const response = await fetch(download.url);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.text();
          await fs.writeFile(filePath, data, 'utf8');

          // Update hash cache with downloaded data
          const newHash = cacheService.updateFileHash(filename, data);

          console.log(`Successfully downloaded ${filename}`);
          results.push({
            filename,
            status: 'downloaded',
            hash: newHash
          });

        } catch (error) {
          console.error(`Failed to download ${filename}:`, error);
          results.push({
            filename,
            status: 'error',
            error: error.message
          });
        }
      }

      const success = results.every(r => r.status !== 'error');

      if (success) {
        res.json({
          success: true,
          dataset: datasetKey,
          message: `Successfully processed ${results.length} files`,
          results
        });
      } else {
        const errors = results.filter(r => r.status === 'error');
        res.status(500).json({
          success: false,
          dataset: datasetKey,
          message: `Failed to download ${errors.length} files`,
          results
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        message: 'Download failed',
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/data/files
   * Clear all downloaded files from all datasets
   */
  async clearFiles(req, res) {
    try {
      const allConfig = await this.loadConfig();
      const results = [];

      // Clear files from all datasets
      for (const [datasetKey, config] of Object.entries(allConfig)) {
        for (const download of config.downloads) {
          const filename = `${config.file_prefix}${download.filename}`;
          const filePath = this.getFilePath(filename);

          try {
            await fs.unlink(filePath);
            results.push({ filename, deleted: true });
          } catch (error) {
            if (error.code !== 'ENOENT') {
              results.push({ filename, deleted: false, error: error.message });
            } else {
              results.push({ filename, deleted: false, error: 'File not found' });
            }
          }
        }
      }

      cacheService.clear();

      res.json({
        success: true,
        message: 'All files cleared',
        results
      });
    } catch (error) {
      console.error('Error clearing files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear files',
        error: error.message
      });
    }
  }
}

module.exports = new DataService();