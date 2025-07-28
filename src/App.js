import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ROUTES } from '/app/src/Config'

import Navigation from '/app/src/components/Navigation'
import MapPage from './pages/MapPage';
import DataPage from './pages/DataPage';

// Main App with React Router
function EnvironmentalDashboardApp() {
  return (
    <Router>
      <div className="h-screen flex flex-col">
        <Navigation />
        
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path={ROUTES.MAP.path} element={<MapPage />} />
            <Route path={ROUTES.DATA.path} element={<DataPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default EnvironmentalDashboardApp;