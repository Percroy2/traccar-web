import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Avatar,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import LocationOnIcon from '@mui/icons-material/LocationOn';
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
}));

const GeofenceWidget = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const geofences = useSelector((state) => state.geofences.items);
  const devices = useSelector((state) => state.devices.items);
  const { eventsData, eventsLoading, loadEventsData } = useDashboardData();
  const [geofenceEvents, setGeofenceEvents] = useState([]);

  // Charger les événements une seule fois au montage
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      loadEventsData();
      mountedRef.current = true;
    }
  }, [loadEventsData]);

  // Filtrer les événements géofence
  useEffect(() => {
    if (eventsData) {
      const filteredEvents = eventsData.filter(
        (event) => event.type === 'geofenceEnter' || event.type === 'geofenceExit',
      );
      setGeofenceEvents(filteredEvents.slice(0, 20));
    }
  }, [eventsData]);

  const geofenceArray = Object.values(geofences);

  if (eventsLoading && !eventsData) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body1">{t('sharedLoading')}</Typography>
      </Box>
    );
  }

  if (geofenceArray.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <PlaceIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
        <Typography variant="body1">
          Aucune géofence configurée
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Géofences actives: {geofenceArray.length}
      </Typography>

      <List className={classes.list}>
        {geofenceEvents.length > 0 ? (
          geofenceEvents.map((event) => {
            const device = devices[event.deviceId];
            const geofence = geofences[event.geofenceId];
            const isEnter = event.type === 'geofenceEnter';

            return (
              <ListItem key={event.id} divider>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: isEnter ? 'success.main' : 'warning.main' }}>
                    <LocationOnIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {device?.name || 'Appareil inconnu'}
                      </Typography>
                      <Chip
                        label={isEnter ? 'Entré' : 'Sorti'}
                        size="small"
                        color={isEnter ? 'success' : 'warning'}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {geofence?.name || 'Géofence inconnue'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(event.eventTime)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            );
          })
        ) : (
          geofenceArray.slice(0, 10).map((geofence) => (
            <ListItem key={geofence.id} divider>
              <ListItemIcon>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PlaceIcon />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={geofence.name}
                secondary={geofence.description || 'Aucune description'}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default GeofenceWidget;

