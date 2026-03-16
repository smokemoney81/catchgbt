import L from 'leaflet';

const FISH_ICONS = {
  'Hecht': '#FF6B6B',
  'Zander': '#4ECDC4',
  'Karpfen': '#FFE66D',
  'Brassen': '#95E1D3',
  'Rotauge': '#F38181',
  'Forelle': '#AA96DA',
  'Aal': '#2C3E50',
  'Barsch': '#A8D8EA',
  'default': '#6C5CE7'
};

export const getIconColorForSpecies = (species) => {
  return FISH_ICONS[species] || FISH_ICONS['default'];
};

export const createCatchMarkerIcon = (species) => {
  const color = getIconColorForSpecies(species);
  
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 2 C8 8, 2 15, 2 22 C2 32, 9 38, 16 38 C23 38, 30 32, 30 22 C30 15, 24 8, 16 2 Z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="18" r="3" fill="white"/>
    </svg>
  `;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    className: 'catch-marker'
  });
};