import {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sessionActions } from '../../store';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const DASHBOARD_CONFIG_KEY = 'dashboardConfig';
const SAVE_DELAY = 2000; // Attendre 2 secondes avant de sauvegarder

export const useDashboardConfig = (defaultConfig) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Charger la configuration au démarrage
  useEffect(() => {
    if (user) {
      const savedConfig = user.attributes[DASHBOARD_CONFIG_KEY];
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setConfig(parsed);
        } catch (error) {
          console.error('Erreur lors du parsing de la config dashboard:', error);
          setConfig(defaultConfig);
        }
      } else {
        setConfig(defaultConfig);
      }
      setLoading(false);
    }
  }, [user, defaultConfig]);

  // Fonction pour sauvegarder sur le serveur
  const saveToServer = useCallback(async (newConfig) => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedUser = {
        ...user,
        attributes: {
          ...user.attributes,
          [DASHBOARD_CONFIG_KEY]: JSON.stringify(newConfig),
        },
      };

      const response = await fetchOrThrow(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      const result = await response.json();
      dispatch(sessionActions.updateUser(result));
      
      console.log('✅ Configuration dashboard sauvegardée sur le serveur');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la config dashboard:', error);
    } finally {
      setSaving(false);
    }
  }, [user, dispatch]);

  // Fonction pour mettre à jour la configuration
  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig);

    // Annuler la sauvegarde en attente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Programmer une nouvelle sauvegarde (debounce)
    saveTimeoutRef.current = setTimeout(() => {
      saveToServer(newConfig);
    }, SAVE_DELAY);
  }, [saveToServer]);

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    config,
    updateConfig,
    loading,
    saving,
  };
};

