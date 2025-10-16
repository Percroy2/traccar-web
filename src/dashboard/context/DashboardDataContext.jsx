import {
  createContext, useContext, useState, useCallback, useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { useEffectAsync } from '../../reactHelper';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const DashboardDataContext = createContext(null);

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData doit être utilisé dans un DashboardDataProvider');
  }
  return context;
};

const CACHE_DURATION = 30000; // 30 secondes
const DAILY_CACHE_DURATION = 300000; // 5 minutes pour les données journalières

export const DashboardDataProvider = ({ children }) => {
  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);
  
  // Cache pour les résumés (summary)
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const summaryTimestampRef = useRef(null);

  // Cache pour les événements
  const [eventsData, setEventsData] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const eventsTimestampRef = useRef(null);

  // Cache pour les données journalières par période
  const dailyCacheRef = useRef({});
  const [dailyLoading, setDailyLoading] = useState(false);

  // Fonction pour charger les résumés (7 jours)
  const loadSummaryData = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Vérifier si on a des données récentes dans le cache
    if (!force && summaryData && summaryTimestampRef.current 
        && (now - summaryTimestampRef.current < CACHE_DURATION)) {
      return summaryData;
    }

    if (summaryLoading) {
      return summaryData;
    }

    setSummaryLoading(true);
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      const deviceIds = Object.keys(devices);

      if (deviceIds.length === 0) {
        setSummaryData([]);
        return [];
      }

      const query = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        daily: false,
      });

      deviceIds.forEach((id) => query.append('deviceId', id));

      const response = await fetchOrThrow(`/api/reports/summary?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();
      
      setSummaryData(data);
      summaryTimestampRef.current = now;
      return data;
    } catch (error) {
      console.error('Erreur chargement summary:', error);
      return [];
    } finally {
      setSummaryLoading(false);
    }
  }, [devices, summaryData, summaryLoading]);

  // Fonction pour charger les résumés journaliers avec cache et limitation
  const loadDailySummaryData = useCallback(async (days = 7, maxDevices = 20) => {
    const cacheKey = `daily_${days}_${maxDevices}`;
    const now = Date.now();

    // Vérifier le cache
    const cached = dailyCacheRef.current[cacheKey];
    if (cached && (now - cached.timestamp < DAILY_CACHE_DURATION)) {
      console.log(`✅ Données daily (${days}j) depuis le cache`);
      return cached.data;
    }

    if (dailyLoading) {
      return cached?.data || [];
    }

    setDailyLoading(true);
    try {
      const to = new Date();
      const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
      let deviceIds = Object.keys(devices);

      if (deviceIds.length === 0) {
        setDailyLoading(false);
        return [];
      }

      // OPTIMISATION : Limiter aux N appareils les plus actifs (en ligne d'abord)
      if (deviceIds.length > maxDevices) {
        console.log(`⚡ Limitation à ${maxDevices} appareils les plus actifs (sur ${deviceIds.length})`);
        // Trier: en ligne avec vitesse > hors ligne
        const sortedIds = [...deviceIds].sort((a, b) => {
          const statusA = devices[a]?.status === 'online' ? 1 : 0;
          const statusB = devices[b]?.status === 'online' ? 1 : 0;
          if (statusA !== statusB) return statusB - statusA; // En ligne d'abord
          // Parmi les en ligne, prioriser ceux qui bougent
          const speedA = positions[a]?.speed || 0;
          const speedB = positions[b]?.speed || 0;
          return speedB - speedA;
        });
        deviceIds = sortedIds.slice(0, maxDevices);
      }

      console.log(`🔄 Chargement daily summary pour ${deviceIds.length} appareils sur ${days} jours...`);

      const query = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        daily: true,
      });

      deviceIds.forEach((id) => query.append('deviceId', id));

      const response = await fetchOrThrow(`/api/reports/summary?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();

      // Mettre en cache
      dailyCacheRef.current[cacheKey] = {
        data,
        timestamp: now,
      };

      console.log(`✅ Daily summary chargé : ${data.length} entrées`);
      setDailyLoading(false);
      return data;
    } catch (error) {
      console.error('Erreur chargement daily summary:', error);
      setDailyLoading(false);
      return [];
    }
  }, [devices, positions, dailyLoading]);

  // Fonction pour charger les événements (24h)
  const loadEventsData = useCallback(async (force = false, eventType = null) => {
    const now = Date.now();
    
    // Vérifier si on a des données récentes dans le cache (seulement pour tous les événements)
    if (!force && !eventType && eventsData && eventsTimestampRef.current 
        && (now - eventsTimestampRef.current < CACHE_DURATION)) {
      return eventsData;
    }

    if (eventsLoading && !eventType) {
      return eventsData;
    }

    setEventsLoading(true);
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

      const query = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
      });

      if (eventType) {
        query.append('type', eventType);
      }

      const response = await fetchOrThrow(`/api/reports/events?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();
      
      // Mettre en cache seulement si c'est tous les événements
      if (!eventType) {
        setEventsData(data);
        eventsTimestampRef.current = now;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur chargement events:', error);
      return [];
    } finally {
      setEventsLoading(false);
    }
  }, [devices, eventsData, eventsLoading]);

  // Invalider le cache quand les devices changent
  useEffectAsync(async () => {
    if (Object.keys(devices).length > 0) {
      summaryTimestampRef.current = null;
      eventsTimestampRef.current = null;
    }
  }, [devices]);

  const value = {
    // Summary data
    summaryData,
    summaryLoading,
    loadSummaryData,
    loadDailySummaryData,
    dailyLoading,
    
    // Events data
    eventsData,
    eventsLoading,
    loadEventsData,
  };

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
};

