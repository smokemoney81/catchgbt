import React, { useEffect, useState } from "react";
import { TileLayer, useMap } from "react-leaflet";
import { getCachedTile } from "@/components/utils/offlineMapDownload";
import L from "leaflet";

export default function OfflineMapLayer({ isOnline }) {
  const map = useMap();
  const [tileLayer, setTileLayer] = useState(null);

  useEffect(() => {
    if (!map) return;

    // Erstelle Custom Tile Layer mit Offline-Fallback
    const createOfflineLayer = () => {
      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
      const layer = L.tileLayer(tileUrl, {
        attribution: 'OpenStreetMap',
        maxZoom: 19,
        async: true,
        crossOrigin: true
      });

      // Override getTile fuer Offline-Support
      const originalGetTile = layer.getTile.bind(layer);
      layer.getTile = async function(coords, done) {
        try {
          if (!isOnline) {
            // Versuche lokale Version zu laden
            const cachedTile = await getCachedTile(coords.x, coords.y, coords.z);
            if (cachedTile && cachedTile.blob) {
              const url = URL.createObjectURL(cachedTile.blob);
              const img = new Image();
              img.onload = () => {
                done(null, img);
                URL.revokeObjectURL(url);
              };
              img.onerror = () => {
                done(new Error('Failed to load cached tile'));
              };
              img.src = url;
              return img;
            }
          }
        } catch (error) {
          console.warn('Offline tile error:', error);
        }

        // Fallback auf Online-Version
        return originalGetTile(coords, done);
      };

      return layer;
    };

    // Entferne alte Layer
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Erstelle und fuege neue Layer hinzu
    const newLayer = createOfflineLayer();
    newLayer.addTo(map);
    setTileLayer(newLayer);

    return () => {
      if (newLayer && map.hasLayer(newLayer)) {
        map.removeLayer(newLayer);
      }
    };
  }, [map, isOnline]);

  // Render nichts - Layer wird direkt zur Karte hinzugefuegt
  return null;
}