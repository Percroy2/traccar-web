import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { formatTime } from '../../common/util/formatter';
import { useDashboardData } from '../context/DashboardDataContext';

const useStyles = makeStyles()((theme) => ({
  table: {
    minWidth: 650,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const EventsWidget = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const devices = useSelector((state) => state.devices.items);
  const { eventsData, eventsLoading, loadEventsData } = useDashboardData();
  const [events, setEvents] = useState([]);

  // Charger les données une seule fois au montage
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      loadEventsData();
      mountedRef.current = true;
    }
  }, [loadEventsData]);

  // Mettre à jour les événements locaux
  useEffect(() => {
    if (eventsData) {
      setEvents(eventsData.slice(0, 50)); // Limiter à 50 événements
    }
  }, [eventsData]);

  if (eventsLoading && !eventsData) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body1">{t('sharedLoading')}</Typography>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body1">{t('sharedNoData')}</Typography>
      </Box>
    );
  }

  const getEventColor = (type) => {
    const colorMap = {
      alarm: 'error',
      deviceOnline: 'success',
      deviceOffline: 'default',
      deviceMoving: 'primary',
      deviceStopped: 'warning',
      geofenceEnter: 'info',
      geofenceExit: 'warning',
    };
    return colorMap[type] || 'default';
  };

  return (
    <Box sx={{ overflowX: 'auto', maxHeight: '100%' }}>
      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedType')}</TableCell>
            <TableCell>{t('sharedDevice')}</TableCell>
            <TableCell>{t('positionFixTime')}</TableCell>
            <TableCell>{t('sharedAttributes')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <Chip
                  label={t(`event${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`)}
                  color={getEventColor(event.type)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {devices[event.deviceId]?.name || event.deviceId}
              </TableCell>
              <TableCell>{formatTime(event.eventTime)}</TableCell>
              <TableCell>
                {event.attributes && Object.keys(event.attributes).length > 0
                  ? JSON.stringify(event.attributes).substring(0, 50)
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default EventsWidget;

