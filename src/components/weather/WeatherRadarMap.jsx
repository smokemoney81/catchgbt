import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default Marker Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RadarLayer({ frame, opacity }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!frame) return;

    const url = `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
    const newLayer = L.tileLayer(url, {
      opacity: opacity,
      zIndex: 500,
    });

    newLayer.addTo(map);

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    layerRef.current = newLayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [frame, opacity, map]);

  return null;
}

export default function WeatherRadarMap() {
  const [center, setCenter] = useState([51.1657, 10.4515]); // Deutschland
  const [frames, setFrames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const playRef = useRef(null);

  // Standort laden
  useEffect(() => {
    const saved = localStorage.getItem("fm_current_location");
    if (saved) {
      try {
        const loc = JSON.parse(saved);
        if (loc?.lat && loc?.lon) {
          setCenter([loc.lat, loc.lon]);
        }
      } catch (e) {
        console.warn("Standort-Parse-Fehler:", e);
      }
    }
  }, []);

  // RainViewer Frames laden
  useEffect(() => {
    const loadFrames = async () => {
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
        const data = await res.json();
        const allFrames = [
          ...(data.radar?.past || []),
          ...(data.radar?.nowcast || []),
        ];
        setFrames(allFrames);
        setCurrentIndex(data.radar?.past?.length - 1 || 0);
      } catch (e) {
        console.error("RainViewer Fehler:", e);
      } finally {
        setLoading(false);
      }
    };
    loadFrames();
  }, []);

  // Animation
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    playRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % frames.length);
    }, 700);
    return () => clearInterval(playRef.current);
  }, [isPlaying, frames.length]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp * 1000).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentFrame = frames[currentIndex];
  const isForecast = currentFrame && currentIndex >= (frames.findIndex((f) => f === frames.find((fr) => fr.time > Date.now() / 1000 - 60)) || frames.length);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="text-xs text-gray-400">
          {loading ? "Lade Radar..." : currentFrame ? (
            <>
              <span className={isForecast ? "text-amber-400" : "text-cyan-400"}>
                {isForecast ? "Vorhersage" : "Aktuell"}
              </span>
              <span className="ml-2">{formatTime(currentFrame.time)}</span>
            </>
          ) : "Keine Daten"}
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1 rounded-md bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-xs text-cyan-300 transition-colors"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-gray-800/50 min-h-[280px]">
        <MapContainer
          center={center}
          zoom={7}
          style={{ height: "100%", width: "100%", minHeight: "280px" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {currentFrame && <RadarLayer frame={currentFrame} opacity={0.7} />}
          <Marker position={center} />
        </MapContainer>
      </div>

      {frames.length > 0 && (
        <div className="mt-2">
          <input
            type="range"
            min="0"
            max={frames.length - 1}
            value={currentIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentIndex(parseInt(e.target.value));
            }}
            className="w-full accent-cyan-500"
          />
        </div>
      )}

      <div className="text-[10px] text-gray-500 mt-1 text-right">
        Daten: RainViewer
      </div>
    </div>
  );
}