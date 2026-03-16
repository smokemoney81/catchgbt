import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import CatchDetailPopup from '@/components/catches/CatchDetailPopup';
import { createCatchMarkerIcon, getIconColorForSpecies } from '@/components/catches/CatchMarkerIcon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Filter, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const MapLegend = ({ species }) => {
  const uniqueSpecies = [...new Set(species)];

  return (
    <Card className="glass-morphism border-gray-800 absolute bottom-20 left-4 z-40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-cyan-400">Fischarten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {uniqueSpecies.length > 0 ? (
          uniqueSpecies.map((sp) => (
            <div key={sp} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getIconColorForSpecies(sp) }}
              />
              <span className="text-xs text-gray-300">{sp}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400">Keine Fischarten</p>
        )}
      </CardContent>
    </Card>
  );
};

const MapRecenter = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, map]);

  return null;
};

export default function CatchMap() {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatch, setSelectedCatch] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [mapCenter, setMapCenter] = useState({ lat: 51.5074, lng: -0.1278 });

  useEffect(() => {
    loadCatches();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  };

  const loadCatches = async () => {
    setLoading(true);
    try {
      const catchesData = await base44.entities.Catch.list('-catch_time', 100);
      const validCatches = catchesData.filter(
        (c) => c.latitude && c.longitude && c.species
      );
      setCatches(validCatches);
    } catch (error) {
      console.error('Fehler beim Laden der Fänge:', error);
      toast.error('Fänge konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const filteredCatches =
    filterSpecies === 'all'
      ? catches
      : catches.filter((c) => c.species === filterSpecies);

  const uniqueSpecies = [...new Set(catches.map((c) => c.species))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Lade Karte...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-950">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.icon({
              iconUrl:
                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSIjMjJkM2VlIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjJkM2VlIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          >
            <Popup>Dein Standort</Popup>
          </Marker>
        )}

        {filteredCatches.map((catchItem) => (
          <Marker
            key={catchItem.id}
            position={[catchItem.latitude, catchItem.longitude]}
            icon={createCatchMarkerIcon(catchItem.species)}
            eventHandlers={{
              click: () => setSelectedCatch(catchItem)
            }}
          >
            <Popup>
              <div className="text-sm font-semibold text-gray-900">
                {catchItem.species}
              </div>
              <div className="text-xs text-gray-700">
                {catchItem.length_cm && `${catchItem.length_cm} cm`}
                {catchItem.weight_kg && ` / ${catchItem.weight_kg} kg`}
              </div>
            </Popup>
          </Marker>
        ))}

        <MapRecenter center={mapCenter} />
      </MapContainer>

      <div className="absolute top-4 left-4 z-40 space-y-3">
        <Card className="glass-morphism border-gray-800 w-72">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Fangkarte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-2">
                Filteriere nach Fischart
              </label>
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-xs text-white"
              >
                <option value="all">Alle Fischarten ({catches.length})</option>
                {uniqueSpecies.map((species) => (
                  <option key={species} value={species}>
                    {species} ({catches.filter((c) => c.species === species).length})
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={getUserLocation}
              variant="outline"
              size="sm"
              className="w-full border-gray-700 text-gray-300 hover:text-gray-100"
            >
              <MapPin className="w-3 h-3 mr-2" />
              Zu meinem Standort
            </Button>

            <div className="text-xs text-gray-500">
              {filteredCatches.length} Fang{filteredCatches.length !== 1 ? 'e' : ''} angezeigt
            </div>
          </CardContent>
        </Card>
      </div>

      <MapLegend species={uniqueSpecies} />

      {selectedCatch && (
        <div className="absolute bottom-4 right-4 z-40">
          <CatchDetailPopup
            catchData={selectedCatch}
            onClose={() => setSelectedCatch(null)}
          />
        </div>
      )}
    </div>
  );
}