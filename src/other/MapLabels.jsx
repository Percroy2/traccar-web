import { useEffect } from 'react';
import { map } from '../map/core/MapView';

const MapLabels = ({ items, selectedItem }) => {
  useEffect(() => {
    if (!items || items.length === 0) return;

    // Add labels for each item
    items.forEach((item) => {
      const isSelected = selectedItem && `${selectedItem.deviceId}-${selectedItem.entryTime}` === `${item.deviceId}-${item.entryTime}`;
      const labelId = `label-${item.deviceId}-${item.entryTime}`;
      
      // Create label element
      const label = document.createElement('div');
      label.id = labelId;
      label.className = 'map-label';
      label.textContent = item.deviceName || item.name;
      label.style.cssText = `
        position: absolute;
        background: ${isSelected ? '#1976d2' : 'rgba(0, 0, 0, 0.8)'};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        pointer-events: none;
        z-index: 1000;
        border: ${isSelected ? '2px solid #fff' : 'none'};
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        transform: translate(-50%, -100%);
        margin-top: -8px;
      `;

      // Add to map container
      const mapContainer = document.querySelector('.mapboxgl-map');
      if (mapContainer) {
        mapContainer.appendChild(label);
      }

      // Position the label
      const updatePosition = () => {
        const point = map.project([item.longitude, item.latitude]);
        label.style.left = `${point.x}px`;
        label.style.top = `${point.y}px`;
      };

      updatePosition();
      
      // Update position on map move
      map.on('move', updatePosition);
      map.on('zoom', updatePosition);
    });

    // Cleanup function
    return () => {
      items.forEach((item) => {
        const labelId = `label-${item.deviceId}-${item.entryTime}`;
        const label = document.getElementById(labelId);
        if (label) {
          label.remove();
        }
      });
      map.off('move');
      map.off('zoom');
    };
  }, [items, selectedItem]);

  return null;
};

export default MapLabels;
