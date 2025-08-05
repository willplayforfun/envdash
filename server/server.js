const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Mount services
const dataService = require('./services/DataService');
app.use('/api/data', dataService.router);

const boundaryService = require('./services/BoundaryService');
app.use('/api/boundaries', boundaryService.router);

// Error handling middleware
jsonErrorHandler = (error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};
app.use(jsonErrorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Environmental Dashboard API running on port ${PORT}`);
});

/*
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
		CONFIG_CACHE = await import('/app/cfg/datasets.mjs');
	}
  return CONFIG_CACHE;
};

const dataDir = path.join(__dirname, '../public/data');
		
// =====
// Helper functions
const fileExists = async (filePath) => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};
const getFullFilePath = (filename) => path.join(dataDir, filename);
// =====


// Download endpoint
app.post('/api/download', async (req, res) => {
  try {

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });
		
		// load datasets cfg
    const { DATASETS } = await loadConfig();
		
		// get dataset based on request key
		const datasetKey = req.body.datasetKey;
		if (DATASETS[datasetKey] == undefined) {
			throw new Error(`No dataset ${datasetKey}`);
		}
    const dataset = DATASETS[datasetKey];

		// perform operation based on request method
		const method = req.body.method;
		if (method === "check") 
		{
			// Check if all required files exist
			const fileChecks = dataset.downloads.map(async (download) => fileExists(getFullFilePath(download.filename)) );
			const results = await Promise.all(fileChecks);
			const allFilesExist = results.every(exists => exists);

			res.json({
				success: true,
				status: allFilesExist,
			});
		}
		else if (method === "download") 
		{
			const results = [];
		
			for (const download of dataset.downloads) {
				
				const filePath = getFullFilePath(download.filename);
				
				if (await fileExists(filePath)) {
					console.log(`Skipping ${filePath}...`);
					continue;
				}
				
				console.log(`Downloading ${download.description}...`);
				
				const response = await fetch(download.url);
				if (!response.ok) {
					throw new Error(`Failed to download ${download.filename}`);
				}
				
				const data = await response.json();
				
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
			
			res.json({
				success: true,
				message: `Downloaded ${results.length} files`,
				files: results
			});
		}
		
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// Delete all data endpoint
app.post('/api/delete-all', async (req, res) => {
  try {
    // Check if data directory exists
    if (!(await fileExists(dataDir))) {
      return res.json({
        success: true,
        message: 'No data directory found - nothing to delete',
        filesDeleted: 0
      });
    }

    // Read directory contents
    const files = await fs.readdir(dataDir);
    let deletedCount = 0;
    const deletedFiles = [];

    // Delete each file in the data directory
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      
      try {
        // Check if it's a file (not a subdirectory)
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          await fs.unlink(filePath);
          deletedFiles.push(file);
          deletedCount++;
          console.log(`Deleted file: ${file}`);
        }
      } catch (fileError) {
        console.warn(`Failed to delete file ${file}:`, fileError.message);
        // Continue with other files even if one fails
      }
    }

    // Try to remove the directory if it's empty
    try {
      const remainingFiles = await fs.readdir(dataDir);
      if (remainingFiles.length === 0) {
        await fs.rmdir(dataDir);
        console.log('Removed empty data directory');
      }
    } catch (dirError) {
      console.log('Could not remove data directory:', dirError.message);
    }

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} file${deletedCount !== 1 ? 's' : ''}`,
      filesDeleted: deletedCount,
      deletedFiles: deletedFiles
    });

    console.log(`Delete operation completed: ${deletedCount} files removed`);

  } catch (error) {
    console.error('Server error:', error);
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
*/