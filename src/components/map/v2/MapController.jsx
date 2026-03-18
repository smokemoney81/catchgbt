import React, { useState, useEffect } from "react";
import { Spot } from "@/entities/Spot";
import { FishingClub } from "@/entities/FishingClub";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Layers, Navigation, X, Loader2, Info, Download } from "lucide-react";
import { useLocation } from "@/components/location/LocationManager";
import { toast } from "sonner";
import { useHaptic } from "@/components/utils/HapticFeedback";
import { useSound } from "@/components/utils/SoundManager";
import MapView from "./MapView";
import AddSpotModal from "./AddSpotModal";
import LocationDetailPanel from "./LocationDetailPanel";
import MapDownloadDialog from "./MapDownloadDialog";

export default function MapController() {
  const { currentLocation, requestGpsLocation, setSpotAsLocation } = useLocation();
  const { triggerHaptic } = useHaptic();
  const { playSound } = useSound();

  const [spots, setSpots] = useState([]);
  const [fishingClubs, setFishingClubs] = useState([]);
  const [waterBodies, setWaterBodies] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSpotCoords, setNewSpotCoords] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    spots: true,
    clubs: true,
    parks: true,
    waters: true
  });
  const [reviews, setReviews] = useState([]);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadAllData();
    initializeMap();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (currentLocation && currentLocation.lat != null && currentLocation.lon != null && !isInitialized) {
      console.log("Setting map center from currentLocation:", currentLocation);
      setMapCenter({ lat: currentLocation.lat, lng: currentLocation.lon });
      setIsInitialized(true);
    }
  }, [currentLocation, isInitialized]);

  const initializeMap = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lon = urlParams.get('lon');
    
    if (lat && lon) {
      console.log("Setting map center from URL params:", { lat, lon });
      setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
      setMapZoom(15);
      setIsInitialized(true);
    } else if (currentLocation && currentLocation.lat != null && currentLocation.lon != null) {
      console.log("Setting map center from currentLocation:", currentLocation);
      setMapCenter({ lat: currentLocation.lat, lng: currentLocation.lon });
      setIsInitialized(true);
    } else {
      console.log("Setting default map center (Germany)");
      setMapCenter({ lat: 51.1657, lng: 10.4515 });
      setMapZoom(6);
      setIsInitialized(true);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [spotsData, clubsData] = await Promise.all([
        Spot.list().catch(() => []),
        FishingClub.list()
      ]);
      
      console.log("Loaded spots:", spotsData.length);
      console.log("Loaded clubs:", clubsData.length);
      
      setSpots(spotsData);
      setFishingClubs(clubsData);
    } catch (error) {
      console.error("Error loading map data:", error);
      toast.error("Fehler beim Laden der Kartendaten");
    }
    setLoading(false);
  };

  const handleMapClick = (coords) => {
    if (!showAddModal && !selectedLocation) {
      console.log("Map clicked at:", coords);
      setNewSpotCoords(coords);
      triggerHaptic('light');
    }
  };

  const handleAddSpotClick = () => {
    if (!newSpotCoords) {
      toast.warning("Bitte setze zuerst einen Pin auf der Karte");
      return;
    }
    setShowAddModal(true);
    triggerHaptic('medium');
    playSound('click');
  };

  const handleSpotAdded = async (newSpot) => {
    await loadAllData();
    setNewSpotCoords(null);
    setShowAddModal(false);
    triggerHaptic('success');
    playSound('success');
    toast.success("Spot erfolgreich hinzugefügt!");
  };

  const handleLocationClick = (location, type) => {
    console.log("Location clicked:", location, type);
    setSelectedLocation({ ...location, type });
    triggerHaptic('light');
    playSound('selection');
  };

  const handleMyLocation = async () => {
    triggerHaptic('medium');
    await requestGpsLocation();
    
    if (currentLocation && currentLocation.lat != null && currentLocation.lon != null) {
      setMapCenter({ lat: currentLocation.lat, lng: currentLocation.lon });
      setMapZoom(15);
      toast.success("Standort aktualisiert");
    }
  };

  const filteredSpots = filters.spots ? spots : [];
  const filteredClubs = fishingClubs.filter(fc => {
    if (fc.category === 'club') return filters.clubs;
    if (fc.category === 'spot') return filters.parks;
    return false;
  });
  const filteredWaters = filters.waters ? waterBodies : [];

  if (loading || !isInitialized || !mapCenter) {
    return (
      <div className="relative h-[calc(100vh-250px)] min-h-[500px] rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Karte wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] min-h-[500px] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      
      {/* Button-Leiste */}
      <div className="flex-shrink-0 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800 p-2">
        <div className="flex justify-between items-center gap-2">
          
          {/* Linke Button-Gruppe */}
          <div className="flex gap-1.5">
            <Button
              onClick={() => setShowInfo(!showInfo)}
              className="bg-gray-800/90 hover:bg-gray-700 border border-gray-700 h-11 px-3"
            >
              <Info className="w-4 h-4 sm:mr-1.5 text-cyan-400" />
              <span className="hidden sm:inline text-xs">Info</span>
            </Button>
            
            <Button
              onClick={handleMyLocation}
              className="bg-gray-800/90 hover:bg-gray-700 border border-gray-700 h-11 px-3"
            >
              <Navigation className="w-4 h-4 sm:mr-1.5 text-cyan-400" />
              <span className="hidden sm:inline text-xs">Standort</span>
            </Button>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-800/90 hover:bg-gray-700 border border-gray-700 h-11 px-3"
            >
              <Layers className="w-4 h-4 sm:mr-1.5 text-cyan-400" />
              <span className="hidden sm:inline text-xs">Filter</span>
            </Button>
          </div>

          {/* Rechte Buttons */}
           <div className="flex gap-1.5">
             <Button
               onClick={() => setShowDownloadDialog(true)}
               className="bg-purple-700/90 hover:bg-purple-600 border border-purple-600/50 h-11 px-3"
               title="Karte fuer offline Download"
             >
               <Download className="w-4 h-4 sm:mr-1.5 text-purple-300" />
               <span className="hidden sm:inline text-xs">Download</span>
             </Button>
             {newSpotCoords && !showAddModal && (
               <Button
                 onClick={handleAddSpotClick}
                 className="bg-emerald-600/90 hover:bg-emerald-700 border border-emerald-500/50 text-white h-11 px-3"
               >
                 <Plus className="w-4 h-4 sm:mr-1.5" />
                 <span className="hidden sm:inline text-xs">Spot</span>
               </Button>
             )}
           </div>
          </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-2 bg-gray-800/50 rounded-lg p-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.spots}
                onChange={(e) => setFilters({ ...filters, spots: e.target.checked })}
                className="w-3.5 h-3.5"
              />
              <span className="text-xs text-white">Meine Spots</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.clubs}
                onChange={(e) => setFilters({ ...filters, clubs: e.target.checked })}
                className="w-3.5 h-3.5"
              />
              <span className="text-xs text-white">Angelvereine</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.parks}
                onChange={(e) => setFilters({ ...filters, parks: e.target.checked })}
                className="w-3.5 h-3.5"
              />
              <span className="text-xs text-white">Angelparks</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.waters}
                onChange={(e) => setFilters({ ...filters, waters: e.target.checked })}
                className="w-3.5 h-3.5"
              />
              <span className="text-xs text-white">Gewässer (OSM)</span>
            </div>
          </div>
        )}
      </div>

      {/* Karten-Container */}
      <div className="relative flex-1">
        
        {/* Info-Banner */}
        {showInfo && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-gray-950/95 via-gray-950/90 to-transparent backdrop-blur-md z-[1001] border-b border-cyan-500/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]">
                    Deine Angelkarte
                  </h2>
                </div>
                <p className="text-xs text-gray-300 mb-2">
                  Entdecke, plane und navigiere zu deinen Angelspots:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <span><strong className="text-blue-300">Blaue Marker:</strong> Deine persönlichen Spots</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                    <span><strong className="text-green-300">Grüne Marker:</strong> Angelvereine & Parks</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    <span><strong className="text-red-300">Roter Marker:</strong> Dein aktueller Standort</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                    <span><strong className="text-orange-300">Orange Marker:</strong> Neuer Spot (zum Speichern)</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-700/50">
                  <p className="text-xs text-gray-400">
                    💡 <strong>Tipp:</strong> Klicke auf die Karte um einen neuen Spot zu markieren, oder auf einen Marker für Details & Navigation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Map View */}
         <MapView
           center={mapCenter}
           zoom={mapZoom}
           spots={filteredSpots}
           fishingClubs={filteredClubs}
           waterBodies={filteredWaters}
           currentLocation={currentLocation}
           newSpotMarker={newSpotCoords}
           onMapClick={handleMapClick}
           onLocationClick={handleLocationClick}
           onSpotClick={(spot) => handleLocationClick(spot, 'spot')}
           onClubClick={(club) => handleLocationClick(club, 'club')}
           onWaterBodiesLoad={setWaterBodies}
           onReviewsLoad={setReviews}
           isOnline={isOnline}
         />

        {/* Location Detail Panel */}
        {selectedLocation && (
          <LocationDetailPanel
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            onSetAsLocation={() => {
              if (selectedLocation.type === 'spot') {
                setSpotAsLocation(selectedLocation);
              }
              setSelectedLocation(null);
            }}
          />
        )}

        {/* Add Spot Modal */}
         {showAddModal && (
           <AddSpotModal
             isOpen={showAddModal}
             coordinates={newSpotCoords}
             onClose={() => {
               setShowAddModal(false);
               setNewSpotCoords(null);
             }}
             onSpotAdded={handleSpotAdded}
           />
         )}

        {/* Map Download Dialog */}
         <MapDownloadDialog
           isOpen={showDownloadDialog}
           onClose={() => setShowDownloadDialog(false)}
           bounds={mapCenter ? {
             north: mapCenter.lat + 0.05,
             south: mapCenter.lat - 0.05,
             east: mapCenter.lng + 0.05,
             west: mapCenter.lng - 0.05
           } : null}
           currentZoom={mapZoom}
         />
        </div>
        </div>
        );
        }