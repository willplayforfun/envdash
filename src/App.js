import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ROUTES } from './NavConfig'

import Navigation from './components/Navigation'
import ConnectionErrorOverlay from "./components/ConnectionErrorOverlay";

import MapPage from './pages/MapPage';
import DataPage from './pages/DataPage';

import useDataManager from "./hooks/useDataManager";

// ==================
// Fix for default markers in React-Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// ==================

// Main App with React Router
function EnvironmentalDashboardApp() {

  const dataManager = useDataManager();

  const handleRetryConnection = () => {
    // Try to fetch level 0 boundaries (countries) to test connection
    dataManager.getBoundaries(0).catch(() => {
      // Error is already handled by the dataManager
    });
  };


  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navigation />

        {/* Global connection error overlay */}
        {!dataManager.isConnected && (
          <ConnectionErrorOverlay
            error={dataManager.connectionError}
            onRetry={handleRetryConnection}
          />
        )}

        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/map" replace />} />
            <Route path={ROUTES.MAP.path} element={<MapPage />} />
            <Route path={ROUTES.DATA.path} element={<DataPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default EnvironmentalDashboardApp;