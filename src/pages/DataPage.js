import React, { useState, useEffect } from 'react'

import DataDownloader, { DOWNLOAD_STATES } from '/app/src/components/DataDownloader'
import { DATASETS } from '/app/src/Config.js'

// Data Manager Page with Tailwind and enum
function DataPage() {
  const [downloadStatus, setDownloadStatus] = useState({
    naturalEarth: { state: DOWNLOAD_STATES.READY }
  });

  // Natural Earth downloader
  const downloadNaturalEarth = async () => {
    setDownloadStatus(prev => ({
      ...prev,
      naturalEarth: { 
        state: DOWNLOAD_STATES.DOWNLOADING, 
        message: 'Downloading Natural Earth boundary data...' 
      }
    }));

    try {
      
	  const dataset = DATASETS.NATURAL_EARTH
	  
      // Download each file
      for (const download of dataset.downloads) {
        setDownloadStatus(prev => ({
          ...prev,
          naturalEarth: { 
            state: DOWNLOAD_STATES.DOWNLOADING, 
            message: `Downloading ${download.description}...` 
          }
        }));

        const response = await fetch(download.url);
        if (!response.ok) {
          throw new Error(`Failed to download ${download.filename}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Store in browser's memory (in a real app, you'd save to filesystem or IndexedDB)
        localStorage.setItem(`${dataset.file_prefix}${download.filename}`, JSON.stringify(data));
        
        console.log(`Downloaded ${download.filename}:`, {
          features: data.features?.length || 0,
          size: JSON.stringify(data).length
        });
      }

      setDownloadStatus(prev => ({
        ...prev,
        naturalEarth: { 
          state: DOWNLOAD_STATES.SUCCESS, 
          message: `Successfully downloaded ${downloads.length} files. Check browser console for details.` 
        }
      }));

    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus(prev => ({
        ...prev,
        naturalEarth: { 
          state: DOWNLOAD_STATES.ERROR, 
          message: `Download failed: ${error.message}` 
        }
      }));
    }
  };

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
        
        <DataDownloader
          name="Natural Earth Boundaries"
          description="Global country, state/province, and county boundaries from Natural Earth. Public domain data optimized for web mapping."
          status={downloadStatus.naturalEarth}
          onDownload={downloadNaturalEarth}
          files={['countries.json', 'states.json', 'counties.json']}
        />
        
        <DataDownloader
          name="EPA Air Quality Data"
          description="PM2.5 and AQI data from EPA monitoring stations. County-level aggregated data."
          status={{ state: DOWNLOAD_STATES.READY }}
          onDownload={() => alert('EPA downloader coming soon!')}
          files={['epa_pm25_county.json', 'epa_aqi_monitors.json']}
        />
        
        <DataDownloader
          name="CDC Heat Stress Data"
          description="Heat-related health impacts and temperature data from CDC Environmental Health Tracking."
          status={{ state: DOWNLOAD_STATES.READY }}
          onDownload={() => alert('CDC downloader coming soon!')}
          files={['cdc_heat_county.json', 'cdc_heat_mortality.json']}
        />
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