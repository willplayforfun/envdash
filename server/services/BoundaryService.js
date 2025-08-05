const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cacheService = require('./CacheService');

class BoundaryService {
  constructor() {
    this.router = express.Router();
    this.dataDir = path.join(__dirname, '../../public/data');
    this.config = null;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.get('/:level', this.getBoundaries.bind(this));
    this.router.get('/:level/:parentCode', this.getBoundaries.bind(this));
  }

  async loadConfig() {
    if (!this.config) {
      const configModule = await import('/app/cfg/datasets.mjs');
      this.config = configModule.DATASETS.NATURAL_EARTH;
    }
    return this.config;
  }

  getFilePath(filename) {
    return path.join(this.dataDir, filename);
  }

  /**
   * Get filename for a boundary level
   */
  async getLevelFilename(level) {
    const config = await this.loadConfig();
    const download = config.downloads[level];

    if (!download) {
      throw new Error(`Invalid boundary level: ${level}`);
    }

    return `${config.file_prefix}${download.filename}`;
  }

  /**
   * Filter GeoJSON features based on parent code
   */
  filterFeatures(geojson, level, parentCode) {
    if (!parentCode) {
      return geojson; // No filtering needed
    }

    // Filter logic based on level and parentCode
    let filteredFeatures;

    if (level == 1) {
      // Level 1 (states) - filter by country
      filteredFeatures = geojson.features.filter(feature => {
        const countryCode = feature.properties.ISO_A2 ||
                           feature.properties.adm0_a3 ||
                           feature.properties.admin;
        return countryCode === parentCode;
      });
    } else if (level == 2) {
      // Level 2 (counties) - filter by state
      // parentCode format expected: "US-CA" (country-state)
      const [countryCode, stateCode] = parentCode.split('-');
      filteredFeatures = geojson.features.filter(feature => {
        const featureCountry = feature.properties.ISO_A2 || feature.properties.adm0_a3;
        const featureState = feature.properties.NAME_1 ||
                            feature.properties.state ||
                            feature.properties.admin_1;
        return featureCountry === countryCode && featureState === stateCode;
      });
    } else {
      // Unknown level, return as-is
      filteredFeatures = geojson.features;
    }

    return {
      ...geojson,
      features: filteredFeatures
    };
  }

  /**
   * GET /api/boundaries/:level/:parentCode?
   */
  async getBoundaries(req, res) {
    try {
      const level = parseInt(req.params.level);
      const parentCode = req.params.parentCode || null;

      if (isNaN(level) || level < 0 || level > 2) {
        return res.status(400).json({
          success: false,
          message: 'Invalid level. Must be 0 (countries), 1 (states), or 2 (counties)'
        });
      }

      // Get the filename for this level
      const filename = await this.getLevelFilename(level);
      const filePath = this.getFilePath(filename);

      // Check if file exists
      try {
        await fs.stat(filePath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return res.status(404).json({
            success: false,
            message: `Boundary data not available for level ${level}. Please download the data first.`
          });
        }
        throw error;
      }

      // Read and parse the GeoJSON file
      const fileData = await fs.readFile(filePath, 'utf8');
      const geojson = JSON.parse(fileData);

      // Update cache with file data and get hash
      const version = cacheService.updateFileHash(filename, fileData);

      // Filter features if parentCode is provided
      const filteredData = this.filterFeatures(geojson, level, parentCode);

      res.json({
        success: true,
        data: filteredData,
        version,
        metadata: {
          level,
          parentCode,
          count: filteredData.features.length,
          sourceFile: filename
        }
      });

    } catch (error) {
      console.error('Error serving boundaries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to serve boundary data',
        error: error.message
      });
    }
  }
}

module.exports = new BoundaryService();