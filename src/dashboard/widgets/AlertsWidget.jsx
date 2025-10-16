import { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { formatTime } from '../../common/util/formatter';
import { useDashboardData } from '../context/DashboardDataContext';

const useStyles = makeStyles()((theme) => ({
  list: {
    maxHeight: '100%',
    overflow: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  alertItem: {
    borderLeft: `4px solid ${theme.palette.error.main}`,
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));

const AlertsWidget = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const { loadEventsData } = useDashboardData();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger uniquement les alarmes
  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const data = await loadEventsData(false, 'alarm');
        setAlerts(data.slice(0, 20)); // Limiter à 20 alertes
      } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [loadEventsData]);

  if (loading && alerts.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body1">{t('sharedLoading')}</Typography>
      </Box>
    );
  }

  if (alerts.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <InfoIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
        <Typography variant="body1">
          Aucune alerte récente
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aucune alerte n'a été détectée au cours des dernières 24 heures
        </Typography>
      </Box>
    );
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'alarm':
        return <ErrorIcon color="error" />;
      case 'deviceOverspeed':
        return <SpeedIcon color="warning" />;
      case 'alarm.lowBattery':
        return <BatteryAlertIcon color="warning" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getAlertSeverity = (attributes) => {
    if (attributes?.alarm === 'sos') return 'error';
    if (attributes?.alarm === 'powerOff') return 'error';
    return 'warning';
  };

  return (
    <List className={classes.list}>
      {alerts.map((alert) => (
        <ListItem key={alert.id} className={classes.alertItem} divider>
          <ListItemIcon>
            {getAlertIcon(alert.type)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2">
                  {t(`event${alert.type.charAt(0).toUpperCase()}${alert.type.slice(1)}`)}
                </Typography>
                <Chip
                  label={getAlertSeverity(alert.attributes)}
                  size="small"
                  color={getAlertSeverity(alert.attributes)}
                />
              </Box>
            }
            secondary={
              <>
                <Typography variant="caption" display="block">
                  {formatTime(alert.eventTime)}
                </Typography>
                {alert.attributes?.alarm && (
                  <Typography variant="caption" color="text.secondary">
                    Type: {alert.attributes.alarm}
                  </Typography>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default AlertsWidget;

