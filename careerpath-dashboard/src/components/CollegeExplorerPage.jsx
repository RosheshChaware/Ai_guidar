import React, { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, Search, MapPin, MessageSquare } from 'lucide-react';
import MapComponent from './MapComponent';
import { COLLEGES, haversineDistance } from '../data/CollegeData';

const CollegeExplorerPage = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [nearbyKm, setNearbyKm] = useState(10);
  const [userLocation, setUserLocation] = useState({ lat: 21.1458, lng: 79.0882 });
  const [filteredColleges, setFilteredColleges] = useState(COLLEGES);

  useEffect(() => {
    // Get user location & update if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const filtered = COLLEGES.filter(college => {
      const distance = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        college.lat,
        college.lng
      );
      
      const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          college.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isWithinDistance = parseFloat(distance) <= nearbyKm;
      
      return matchesSearch && isWithinDistance;
    });

    setFilteredColleges(filtered);
  }, [searchQuery, nearbyKm, userLocation]);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-background sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary w-6 h-6" />
            <span className="text-xl font-semibold tracking-tight">ShikshaSetu</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-8 py-10 relative">
        <h1 className="text-4xl font-bold mb-4">College Explorer</h1>
        <p className="text-textMuted mb-12 text-center max-w-2xl">
          Discover and explore nearby colleges with smart search, filters, and favorites.
        </p>

        {/* Search and Filters */}
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text"
              placeholder="Search government colleges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/5 rounded-full py-3.5 pl-12 pr-6 focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-3 bg-surface border border-white/5 rounded-lg px-4 py-3 shrink-0">
            <span className="text-sm font-medium text-gray-400">Nearby (km):</span>
            <input 
              type="number"
              value={nearbyKm}
              onChange={(e) => setNearbyKm(parseFloat(e.target.value) || 0)}
              className="w-16 bg-transparent focus:outline-none text-sm font-bold border-b border-white/10"
            />
          </div>
        </div>

        {/* Map Container */}
        <div className="w-full max-w-6xl h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative mb-20">
          {userLocation ? (
            <MapComponent 
              userLocation={userLocation}
              colleges={filteredColleges}
            />
          ) : (
             <div className="w-full h-full bg-surface/50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-textMuted animate-pulse">Initializing Map...</p>
             </div>
          )}
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-[1000]">
           <MessageSquare className="w-6 h-6 fill-current" />
        </button>
      </main>
    </div>
  );
};

export default CollegeExplorerPage;
