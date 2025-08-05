const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Data management endpoints
  dataStatus: (datasetKey) => `${API_BASE_URL}/api/data/status/${datasetKey}`,
  dataDownload: (datasetKey) => `${API_BASE_URL}/api/data/download/${datasetKey}`,
  dataClear: () => `${API_BASE_URL}/api/data/files`,

  // Boundary data endpoints (for future use)
  boundaries: (level, parentCode = null) => {
    if (parentCode) {
      return `${API_BASE_URL}/api/boundaries/${level}/${parentCode}`;
    }
    return `${API_BASE_URL}/api/boundaries/${level}`;
  }
};

export default API_ENDPOINTS;