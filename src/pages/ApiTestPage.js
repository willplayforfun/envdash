import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function ApiTestPage() {
  const [apiBaseUrl, setApiBaseUrl] = useState(API_BASE_URL);
  const [loading, setLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState(null);
  const [response, setResponse] = useState(null);
  const [customLevel, setCustomLevel] = useState('');
  const [customParent, setCustomParent] = useState('');

  const showRequest = (method, endpoint) => {
    setRequestInfo({ method, endpoint, url: `${apiBaseUrl}${endpoint}` });
  };

  const showResponse = (data, status, error = null) => {
    setLoading(false);
    setResponse({ data, status, error });
  };

  const testAPI = async (method, endpoint) => {
    setLoading(true);
    setResponse(null);
    showRequest(method, endpoint);

    try {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await fetch(apiBaseUrl + endpoint, options);
      const data = await response.json();

      showResponse(data, response.status);
    } catch (error) {
      showResponse({}, 0, error.message);
    }
  };

  const testCustomBoundary = () => {
    if (!customLevel) {
      alert('Please enter a level (0-2)');
      return;
    }

    let endpoint = `/api/boundaries/${customLevel}`;
    if (customParent) {
      endpoint += `/${customParent}`;
    }

    testAPI('GET', endpoint);
  };

  const clearResponse = () => {
    setResponse(null);
    setRequestInfo(null);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status >= 400) return 'text-red-600';
    if (status >= 300) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Test Page</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* API Base URL Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Configuration</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">API Base URL:</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => setApiBaseUrl(apiBaseUrl)}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* Data API Tests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Data API Tests</h2>
              <div className="space-y-3">
                <button
                  onClick={() => testAPI('GET', '/api/data/status/NATURAL_EARTH')}
                  className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 text-left"
                >
                  GET Data Status
                </button>
                <button
                  onClick={() => testAPI('POST', '/api/data/download/NATURAL_EARTH')}
                  className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 text-left"
                >
                  POST Download Data
                </button>
                <button
                  onClick={() => testAPI('DELETE', '/api/data/files')}
                  className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 text-left"
                >
                  DELETE All Files
                </button>
              </div>
            </div>

            {/* Boundary API Tests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Boundary API Tests</h2>

              {/* Level 0 (Countries) */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Level 0 - Countries</h3>
                <button
                  onClick={() => testAPI('GET', '/api/boundaries/0')}
                  className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 text-left"
                >
                  GET All Countries
                </button>
              </div>

              {/* Level 1 (States) */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Level 1 - States/Provinces</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => testAPI('GET', '/api/boundaries/1/US')}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 text-left"
                  >
                    GET US States
                  </button>
                  <button
                    onClick={() => testAPI('GET', '/api/boundaries/1/CA')}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 text-left"
                  >
                    GET Canada Provinces
                  </button>
                  <button
                    onClick={() => testAPI('GET', '/api/boundaries/1/GB')}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 text-left"
                  >
                    GET UK Regions
                  </button>
                </div>
              </div>

              {/* Level 2 (Counties) */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Level 2 - Counties</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => testAPI('GET', '/api/boundaries/2/US-CA')}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 text-left"
                  >
                    GET California Counties
                  </button>
                  <button
                    onClick={() => testAPI('GET', '/api/boundaries/2/US-TX')}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 text-left"
                  >
                    GET Texas Counties
                  </button>
                </div>
              </div>

              {/* Custom Boundary Test */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Custom Boundary Request</h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Level (0-2)"
                    min="0"
                    max="2"
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Parent Code (optional)"
                    value={customParent}
                    onChange={(e) => setCustomParent(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={testCustomBoundary}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700"
                  >
                    Test Custom Request
                  </button>
                </div>
              </div>

              {/* Error Tests */}
              <div>
                <h3 className="font-medium mb-3">Error Cases</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => testAPI('GET', '/api/boundaries/5')}
                    className="w-full bg-gray-600 text-white px-4 py-3 rounded hover:bg-gray-700 text-left"
                  >
                    Invalid Level (5)
                  </button>
                  <button
                    onClick={() => testAPI('GET', '/api/data/status/INVALID')}
                    className="w-full bg-gray-600 text-white px-4 py-3 rounded hover:bg-gray-700 text-left"
                  >
                    Invalid Dataset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Response Display */}
          <div className="relative">
            <div className="sticky top-6 bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">API Response</h2>
                <button
                  onClick={clearResponse}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>

              {/* Request Info */}
              {requestInfo && (
                <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                  <div className="font-medium text-gray-700">Request:</div>
                  <div className="text-gray-600 font-mono break-all">
                    {requestInfo.method} {requestInfo.url}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <div className="mt-2 text-gray-600">Loading...</div>
                </div>
              )}

              {/* Response */}
              {!loading && !response && (
                <div className="text-gray-500 italic text-center py-8">
                  Click a test button to see API response...
                </div>
              )}

              {response && (
                <div>
                  <div className="mb-4">
                    <span className={`font-medium ${getStatusColor(response.status)}`}>
                      Status: {response.status}
                    </span>
                  </div>

                  {response.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="font-medium text-red-800">Error:</div>
                      <div className="text-red-700">{response.error}</div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <pre className="text-sm overflow-x-auto">
                      <code>{JSON.stringify(response.data, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiTestPage;