const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();

// middleware
app.use(express.json());

const corsOptions = {
  origin: [
    'http://localhost:3000'          // Keep for local development
	// add more sources here
  ],
  credentials: true
};

app.use(cors(corsOptions));
//app.use(cors());


// Dynamic import config
let CONFIG_CACHE = null;
const loadConfig = async () => {
	if (!CONFIG_CACHE) {
		CONFIG_CACHE = await import('/app/cfg/datasets.js');
	}
  return CONFIG_CACHE;
};

// Download endpoint
app.post('/api/download', async (req, res) => {
  try {

    const { DATASETS } = await loadConfig();
    const reqJson = req.body;
		const datasetKey = reqJson.datasetKey;
    const dataset = DATASETS[datasetKey];

    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../public/data');
    await fs.mkdir(dataDir, { recursive: true });

    const results = [];
	
	
		/*
    for (const download of downloads) {
      console.log(`Downloading ${download.description}...`);
      
      const response = await fetch(download.url);
      if (!response.ok) {
        throw new Error(`Failed to download ${download.filename}`);
      }
      
      const data = await response.json();
      const filePath = path.join(dataDir, download.filename);
      
      // Save to filesystem
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      results.push({
        filename: download.filename,
        features: data.features?.length || 0,
        size: JSON.stringify(data).length,
        path: filePath
      });
      
      console.log(`Saved ${download.filename}`);
    }
		*/
    res.json({
      success: true,
      message: `Downloaded ${results.length} files`,
      files: results
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});