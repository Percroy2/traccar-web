import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslation } from '../../common/components/LocalizationProvider';

const MapWidget = () => {
  const t = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const positions = useSelector((state) => state.session.positions);
  const devices = useSelector((state) => state.devices.items);

  useEffect(() => {
    if (map.current) return; // Initialiser la carte une seule fois

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
      center: [2.3522, 48.8566], // Paris par défaut
      zoom: 5,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Supprimer les anciens marqueurs
    const markers = document.querySelectorAll('.maplibregl-marker');
    markers.forEach((marker) => marker.remove());

    const positionArray = Object.values(positions);

    if (positionArray.length === 0) return;

    // Ajouter les nouveaux marqueurs
    positionArray.forEach((position) => {
      const device = devices[position.deviceId];
      if (!device) return;

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = device.status === 'online' ? '#4CAF50' : '#F44336';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<strong>${device.name}</strong><br/>
         ${t('positionSpeed')}: ${Math.round(position.speed * 1.852)} km/h`,
      );

      new maplibregl.Marker(el)
        .setLngLat([position.longitude, position.latitude])
        .setPopup(popup)
        .addTo(map.current);
    });

    // Ajuster la vue pour afficher tous les marqueurs
    if (positionArray.length > 0) {
      const bounds = positionArray.reduce((bounds, position) => bounds.extend([position.longitude, position.latitude]), new maplibregl.LngLatBounds());

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
    }
  }, [positions, devices, t]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default MapWidget;

