import React, { useState, useEffect } from 'react'

import DataDownloader, { DOWNLOAD_STATES } from '/app/src/components/DataDownloader'
import { DATASETS } from '/app/src/cfg/datasets.js'

const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const DOWNLOAD_ENDPOINT = `${API_BASE_URL}/api/download`;

// Data Manager Page with Tailwind and enum
function DataPage() {
	const [downloadStatus, setDownloadStatus] = useState({});
	
	// function to initialize the dataset status locally based on server check call
	const checkDataSet = async (key) => 
	{	
		try {
			// post request to server (this works because of the proxy defined in package.json)
			const response = await fetch(DOWNLOAD_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					method: "check",
					datasetKey: key
				})
			});
			
			// convert response to json and use to set status
			const result = await response.json();
			if (result.success) {
				if (false) { //TODO
					setDownloadStatus(prev => ({ ...prev,
						[key]: { state: DOWNLOAD_STATES.OK }
					}));
				} else {
					setDownloadStatus(prev => ({ ...prev,
						[key]: { state: DOWNLOAD_STATES.NOTSTARTED }
					}));
				}
			} else {
				throw new Error(result.message);
			}

		} catch (error) {
			console.error('Init failed:', error);
			setDownloadStatus(prev => ({ ...prev,
				[key]: { state: DOWNLOAD_STATES.ERROR, 
									message: `Server unavailable: ${error.message}` 
								}
			}));
		}
	};
	
	// function to trigger download of the data on the server
	const downloadDataSet = async (key) => 
	{
		setDownloadStatus(prev => ({ ...prev,
			[key]: { state: DOWNLOAD_STATES.DOWNLOADING }
		}));

		try {
			const response = await fetch(DOWNLOAD_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({})
			});
			
			const result = await response.json();

			if (result.success) {
				setDownloadStatus(prev => ({ ...prev,
					[key]: { state: DOWNLOAD_STATES.SUCCESS, 
										message: `${result.message}` 
									}
				}));
			} else {
				throw new Error(result.message);
			}

		} catch (error) {
			console.error('Download failed:', error);
			setDownloadStatus(prev => ({ ...prev,
				[key]: { state: DOWNLOAD_STATES.ERROR, 
									message: `Download failed: ${error.message}` 
								}
			}));
		}
	};
	
	// function to create DataDownloader element for a dataset
	const createDataDownloader = (key, dataset) => 
	{		
		const files = dataset.downloads.map(download => download.filename);
		
		return (
        <DataDownloader
					key={key} // each element needs a unique key
          name={dataset.name}
          description={dataset.description}
          status={downloadStatus[key] || { state: DOWNLOAD_STATES.INIT }}
          onDownload={() => downloadDataSet(key)}
          files={files}
        />
			);
	};
	
	// on-mount effect to request the dataset status from the server
	useEffect(() => {
		const initAllDatasets = async () => {
			// Create array of async operations
			const operations = Object.entries(DATASETS).map(async ([key, dataset]) => {
				setDownloadStatus(prev => ({ ...prev,
					[key]: { state: DOWNLOAD_STATES.INIT }
				}));
				await checkDataSet(key);
			});
			try {	
				// Wait for all to complete
				await Promise.all(operations);
				console.log('All datasets checked.');
			} catch (error) {
				console.error('Error processing datasets:', error);
			}
		};
		initAllDatasets();
  }, []); // Empty dependency array

	// create page layout
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        Environmental Data Manager
      </h1>
      <p className="text-gray-600 mb-8 text-base">
        Download and process environmental and geographic data for the dashboard. 
        All data is stored locally in your browser.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          1. Download Raw Data
        </h2>
				{Object.entries(DATASETS).map( ([key, dataset]) => (
					createDataDownloader(key, dataset)
				))}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          2. Process & Clean Data
        </h2>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
          Data processing tools will appear here once raw data is downloaded.
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          3. Validate Data Quality
        </h2>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
          Data validation reports will appear here once data is processed.
        </div>
      </section>
    </div>
  );
}

export default DataPage;