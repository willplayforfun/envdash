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
   * Extract only essential properties from a feature
   */
  extractEssentialProperties(feature, level) {
    const props = feature.properties;
    let code, name;

    // Extract code and name based on level
    if (level === 0) {
      // Countries
      code = props.ISO_A2 || props.iso_a2;
      name = props.NAME || props.name || props.NAME_EN || props.ADMIN || props.admin;
    } else if (level === 1) {
      // States/Provinces
      // Try to find the state code - it might be in various formats
      code = props.iso_3166_2 || props.ISO_3166_2 ||
             props.postal || props.POSTAL ||
             props.STUSPS || props.code_hasc ||
             props.abbrev || props.ABBREV;

      // If we have a full ISO code like "US-CA", extract just the state part
      if (code && code.includes('-')) {
        code = code.split('-')[1];
      }

      name = props.NAME || props.name || props.NAME_1 || props.name_1 ||
             props.ADMIN || props.admin;
    } else if (level === 2) {
      // Counties
      code = props.GEOID || props.FIPS || props.fips ||
             props.ADM2_CODE || props.adm2_code ||
             props.CODE || props.code;

      name = props.NAME || props.name || props.NAME_2 || props.name_2 ||
             props.ADMIN || props.admin;
    }

    // Return simplified feature
    return {
      type: 'Feature',
      properties: {
        code: code || 'UNKNOWN',
        name: name || 'Unknown',
        level: level
      },
      geometry: feature.geometry,
      bbox: feature.bbox // Include bbox if it exists
    };
  }

  /**
   * Filter GeoJSON features based on parent code
   */
  filterFeatures(geojson, level, parentCode) {
    if (!parentCode) {
      return geojson.features; // No filtering needed
    }

    let filteredFeatures;

    if (level == 1) {
      // Level 1 (states) - filter by country
      filteredFeatures = geojson.features.filter(feature => {
        const props = feature.properties;

        // Check country code
        const countryCode = props.ISO_A2 || props.iso_a2 ||
                           props.ADM0_A3 || props.adm0_a3;

        // Check if iso_3166_2 starts with the parent code
        const fullCode = props.iso_3166_2 || props.ISO_3166_2;
        const matchesFullCode = fullCode && fullCode.startsWith(parentCode + '-');

        return countryCode === parentCode || matchesFullCode;
      });
    } else if (level == 2) {
      // Level 2 (counties) - filter by state
      const [countryCode, stateCode] = parentCode.split('-');

      filteredFeatures = geojson.features.filter(feature => {
        const props = feature.properties;

        // Check country
        const featureCountry = props.ISO_A2 || props.iso_a2 ||
                              props.ADM0_A3 || props.adm0_a3;

        // Check state - multiple possible fields
        const stateAbbr = props.STUSPS || props.STATE || props.state ||
                         props.POSTAL || props.postal;
        const stateName = props.NAME_1 || props.name_1 || props.admin_1;
        const stateISO = props.iso_3166_2 || props.ISO_3166_2;

        // Extract state code from full ISO if needed
        let stateFromISO = null;
        if (stateISO && stateISO.includes('-')) {
          stateFromISO = stateISO.split('-')[1];
        }

        const countryMatches = featureCountry === countryCode;
        const stateMatches = stateAbbr === stateCode ||
                           stateName === stateCode ||
                           stateFromISO === stateCode;

        return countryMatches && stateMatches;
      });
    } else {
      // Level 0 or unknown level, return all
      filteredFeatures = geojson.features;
    }

    return filteredFeatures;
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
      const filteredFeatures = this.filterFeatures(geojson, level, parentCode);

      // Extract only essential properties from each feature
      const simplifiedFeatures = filteredFeatures.map(feature =>
        this.extractEssentialProperties(feature, level)
      );

      // Create simplified GeoJSON
      const simplifiedData = {
        type: 'FeatureCollection',
        features: simplifiedFeatures
      };

      res.json({
        success: true,
        data: simplifiedData,
        version,
        metadata: {
          level,
          parentCode,
          count: simplifiedFeatures.length,
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