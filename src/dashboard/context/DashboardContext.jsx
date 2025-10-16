import {
  createContext, useContext, useState, useCallback,
} from 'react';
import { useDashboardConfig } from '../hooks/useDashboardConfig';

const DashboardContext = createContext(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard doit être utilisé dans un DashboardProvider');
  }
  return context;
};

// Tailles optimales par défaut pour chaque type de widget
const WIDGET_DEFAULT_SIZES = {
  // Widgets de stats simples (petits, carrés)
  totalVehicles: { width: 240, height: 220 },
  onlineVehicles: { width: 240, height: 220 },
  movingVehicles: { width: 240, height: 220 },
  totalDistance: { width: 240, height: 220 },
  averageSpeed: { width: 240, height: 220 },
  recentEvents: { width: 240, height: 220 },
  
  // Widgets de listes (moyens, verticaux)
  devices: { width: 400, height: 400 },
  alerts: { width: 400, height: 400 },
  geofence: { width: 400, height: 400 },
  
  // Widgets de tableaux (larges, moyens)
  events: { width: 800, height: 400 },
  fleetComparison: { width: 900, height: 500 },
  
  // Widgets de graphiques (moyens-larges)
  chart: { width: 600, height: 400 },
  dailyDistanceChart: { width: 700, height: 420 },
  
  // Widget de carte (large, haut)
  map: { width: 700, height: 500 },
};

const DEFAULT_WIDGETS = [
  {
    id: 'total-vehicles-1',
    type: 'totalVehicles',
    title: 'Total véhicules',
    position: { x: 20, y: 20 },
    size: { width: 240, height: 220 },
  },
  {
    id: 'online-vehicles-1',
    type: 'onlineVehicles',
    title: 'En ligne',
    position: { x: 280, y: 20 },
    size: { width: 240, height: 220 },
  },
  {
    id: 'moving-vehicles-1',
    type: 'movingVehicles',
    title: 'En mouvement',
    position: { x: 540, y: 20 },
    size: { width: 240, height: 220 },
  },
  {
    id: 'total-distance-1',
    type: 'totalDistance',
    title: 'Distance parcourue',
    position: { x: 800, y: 20 },
    size: { width: 240, height: 220 },
  },
  {
    id: 'average-speed-1',
    type: 'averageSpeed',
    title: 'Vitesse moyenne',
    position: { x: 1060, y: 20 },
    size: { width: 240, height: 220 },
  },
  {
    id: 'recent-events-1',
    type: 'recentEvents',
    title: 'Événements',
    position: { x: 1320, y: 20 },
    size: { width: 240, height: 220 },
  },
];

export const DashboardProvider = ({ children }) => {
  // Charger la configuration depuis le serveur
  const { config, updateConfig, loading, saving } = useDashboardConfig({
    widgets: DEFAULT_WIDGETS,
    editMode: false,
  });

  const [selectedWidget, setSelectedWidget] = useState(null);

  // Si config n'est pas encore chargée, utiliser des valeurs par défaut
  const widgets = config?.widgets || DEFAULT_WIDGETS;
  const editMode = config?.editMode || false;

  const setWidgets = useCallback((newWidgets) => {
    updateConfig({
      ...config,
      widgets: newWidgets,
    });
  }, [config, updateConfig]);

  const setEditMode = useCallback((newEditMode) => {
    updateConfig({
      ...config,
      editMode: newEditMode,
    });
  }, [config, updateConfig]);

  const addWidget = useCallback((type, title) => {
    // Utiliser la taille par défaut optimale pour ce type de widget
    const defaultSize = WIDGET_DEFAULT_SIZES[type] || { width: 400, height: 300 };
    
    // Calculer une position intelligente pour éviter les chevauchements
    const calculatePosition = () => {
      // Si pas de widgets, position initiale
      if (widgets.length === 0) {
        return { x: 20, y: 20 };
      }
      
      // Trouver le widget le plus bas
      const maxBottom = widgets.reduce((max, widget) => {
        const bottom = widget.position.y + widget.size.height;
        return Math.max(max, bottom);
      }, 0);
      
      // Placer le nouveau widget en dessous avec un espacement de 20px
      return { x: 20, y: maxBottom + 20 };
    };
    
    const newWidget = {
      id: `${type}-${Date.now()}`,
      type,
      title: title || `Widget ${type}`,
      position: calculatePosition(),
      size: defaultSize,
      config: {},
    };
    setWidgets([...widgets, newWidget]);
  }, [widgets, setWidgets]);

  const removeWidget = useCallback((id) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
  }, [widgets, setWidgets, selectedWidget]);

  const updateWidget = useCallback((id, updates) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }, [widgets, setWidgets]);

  const updateWidgetPosition = useCallback((id, position) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, position } : w)));
  }, [widgets, setWidgets]);

  const updateWidgetSize = useCallback((id, size) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, size } : w)));
  }, [widgets, setWidgets]);

  const resetDashboard = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
  }, [setWidgets]);

  const value = {
    widgets,
    setWidgets,
    editMode,
    setEditMode,
    selectedWidget,
    setSelectedWidget,
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetPosition,
    updateWidgetSize,
    resetDashboard,
    loading,
    saving,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

