import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icons
const spotIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const clubIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const locationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const newSpotIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapEvents({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

function RecenterMap({ center }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);

  return null;
}

export default function MapView({
  center,
  zoom,
  spots,
  fishingClubs,
  currentLocation,
  newSpotMarker,
  onMapClick,
  onLocationClick,
  onSpotClick,
  onClubClick
}) {
  if (!center) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-cyan-400">Karte wird geladen...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ width: "100%", height: "100%" }}
      className="rounded-2xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapEvents onMapClick={onMapClick} />
      <RecenterMap center={center} />

      {/* Current Location */}
      {currentLocation && currentLocation.lat != null && currentLocation.lon != null && (
        <Marker
          position={[currentLocation.lat, currentLocation.lon]}
          icon={locationIcon}
        >
          <Popup>
            <div className="text-sm">
              <strong>Mein Standort</strong>
              <p className="text-xs text-gray-600 mt-1">
                {currentLocation.name || "Aktueller Standort"}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* User Spots */}
      {spots.filter(spot => spot.latitude != null && spot.longitude != null).map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.latitude, spot.longitude]}
          icon={spotIcon}
          eventHandlers={{
            click: () => onSpotClick(spot)
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong>{spot.name}</strong>
              <p className="text-xs text-gray-600 mt-1">
                {spot.water_type} • {spot.notes || "Kein Kommentar"}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Fishing Clubs/Parks */}
      {fishingClubs.filter(club => club.coordinates && club.coordinates.lat != null && club.coordinates.lng != null).map((club) => (
        <Marker
          key={club.id}
          position={[club.coordinates.lat, club.coordinates.lng]}
          icon={clubIcon}
          eventHandlers={{
            click: () => onClubClick(club)
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong>{club.name}</strong>
              <p className="text-xs text-gray-600 mt-1">
                {club.category === 'club' ? 'Angelverein' : 'Angelpark'}
              </p>
              {club.address && (
                <p className="text-xs text-gray-600">
                  {club.address.city}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* New Spot Marker (temporary) */}
      {newSpotMarker && (
        <Marker
          position={[newSpotMarker.lat, newSpotMarker.lng]}
          icon={newSpotIcon}
        >
          <Popup>
            <div className="text-sm">
              <strong>Neuer Spot</strong>
              <p className="text-xs text-gray-600 mt-1">
                Klicke auf "Spot hinzufügen" um Details einzugeben
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}