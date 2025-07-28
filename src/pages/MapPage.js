import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

  // Mock environmental data for different locations
const mockEnvironmentalData = {
  "Global": {
    topIssues: [
      { name: "Air Pollution (PM2.5)", qalysLost: 2.1, severity: "high" },
      { name: "Water Contamination", qalysLost: 1.3, severity: "medium" },
      { name: "Heat Stress", qalysLost: 0.8, severity: "medium" }
    ]
  },
  "United States": {
    topIssues: [
      { name: "Air Pollution (PM2.5)", qalysLost: 1.2, severity: "medium" },
      { name: "Heat Stress", qalysLost: 0.9, severity: "medium" },
      { name: "Water Contamination", qalysLost: 0.4, severity: "low" }
    ]
  },
  "California": {
    topIssues: [
      { name: "Air Pollution (PM2.5)", qalysLost: 1.8, severity: "high" },
      { name: "Heat Stress", qalysLost: 1.2, severity: "medium" },
      { name: "Wildfire Smoke", qalysLost: 0.7, severity: "medium" }
    ]
  },
  "Los Angeles": {
    topIssues: [
      { name: "Air Pollution (PM2.5)", qalysLost: 2.4, severity: "high" },
      { name: "Heat Stress", qalysLost: 1.1, severity: "medium" },
      { name: "Traffic-Related NOx", qalysLost: 0.8, severity: "medium" }
    ]
  }
};

// Sample cities with coordinates
const sampleCities = [
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, country: "United States" },
  { name: "New York", lat: 40.7128, lng: -74.0060, country: "United States" },
  { name: "London", lat: 51.5074, lng: -0.1278, country: "United Kingdom" },
  { name: "Delhi", lat: 28.7041, lng: 77.1025, country: "India" },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, country: "China" },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333, country: "Brazil" }
];



function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      // For demo purposes, we'll use reverse geocoding simulation
      // In a real app, you'd use a geocoding service
      const nearestCity = sampleCities.reduce((prev, curr) => {
        const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lng - lng, 2));
        const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lng - lng, 2));
        return prevDist < currDist ? prev : curr;
      });
      
      if (Math.sqrt(Math.pow(nearestCity.lat - lat, 2) + Math.pow(nearestCity.lng - lng, 2)) < 5) {
        onLocationSelect(nearestCity.name, lat, lng);
      } else {
        onLocationSelect("Unknown Location", lat, lng);
      }
    }
  });
  return null;
}

function SeverityBadge({ severity }) {
  const colors = {
    high: "bg-red-500",
    medium: "bg-yellow-500", 
    low: "bg-green-500"
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs text-white ${colors[severity]}`}>
      {severity}
    </span>
  );
}

function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState("Global");
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedFactor, setSelectedFactor] = useState(null);

  const handleLocationSelect = (locationName, lat, lng) => {
    setSelectedLocation(locationName);
    setSelectedCoords([lat, lng]);
    setSelectedFactor(null); // Reset factor selection when location changes
  };

  const currentData = mockEnvironmentalData[selectedLocation] || mockEnvironmentalData["Global"];

  const handleFactorClick = (factor) => {
    setSelectedFactor(factor);
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={selectedCoords || [20, 0]}
          zoom={selectedCoords ? 10 : 2}
          style={{ height: '100vh', width: '100%' }}
          key={selectedCoords ? `${selectedCoords[0]}-${selectedCoords[1]}` : 'global'}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {/* Sample city markers */}
          {!selectedCoords && sampleCities.map((city) => (
            <Marker 
              key={city.name} 
              position={[city.lat, city.lng]}
              eventHandlers={{
                click: () => handleLocationSelect(city.name, city.lat, city.lng)
              }}
            >
              <Popup>{city.name}</Popup>
            </Marker>
          ))}
          
          {/* Selected location marker */}
          {selectedCoords && (
            <Marker position={selectedCoords}>
              <Popup>{selectedLocation}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Sidebar */}
      <div style={{ width: '384px', backgroundColor: 'white', boxShadow: '-2px 0 4px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        <div style={{ padding: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Environmental Health Dashboard
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Click on the map to explore environmental health impacts by location
          </p>

          {/* Location Header */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>
              {selectedLocation}
            </h2>
            {selectedCoords && (
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                {selectedCoords[0].toFixed(3)}, {selectedCoords[1].toFixed(3)}
              </p>
            )}
          </div>

          {/* Factor Selection or Deep Dive */}
          {!selectedFactor ? (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Top Environmental Health Risks
              </h3>
              <div className="space-y-3">
                {currentData.topIssues.map((issue, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleFactorClick(issue)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{issue.name}</h4>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>{issue.qalysLost}</strong> QALYs lost per 100k population annually
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Click for details →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <button 
                onClick={() => setSelectedFactor(null)}
                className="text-blue-600 hover:text-blue-800 text-sm mb-4"
              >
                ← Back to overview
              </button>
              
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {selectedFactor.name}
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedFactor.qalysLost} QALYs
                  </div>
                  <div className="text-sm text-gray-600">
                    Lost per 100,000 people annually
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Health Impact</h4>
                  <p className="text-sm text-gray-600">
                    This environmental factor reduces average life expectancy and quality of life 
                    in {selectedLocation}. The impact varies by age group, with children and 
                    elderly populations typically experiencing higher risks.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Severity Level</h4>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={selectedFactor.severity} />
                    <span className="text-sm text-gray-600 capitalize">
                      {selectedFactor.severity} priority
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapPage;