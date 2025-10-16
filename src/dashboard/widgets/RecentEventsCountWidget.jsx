import { useState, useEffect, useRef } from 'react';
import {
  Card, CardContent, Typography, Box, CircularProgress,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { makeStyles } from 'tss-react/mui';
import { useDashboardData } from '../context/DashboardDataContext';

const useStyles = makeStyles()((theme) => ({
  card: {
    height: '100%',
    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
    color: theme.palette.error.contrastText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
      pointerEvents: 'none',
    },
  },
  icon: {
    fontSize: 40,
    opacity: 0.9,
    marginBottom: theme.spacing(0.5),
    animation: 'ring 1s ease-in-out infinite',
    '@keyframes ring': {
      '0%, 100%': { transform: 'rotate(0deg)' },
      '10%, 30%': { transform: 'rotate(-10deg)' },
      '20%, 40%': { transform: 'rotate(10deg)' },
    },
  },
  value: {
    fontSize: '2.2rem',
    fontWeight: 700,
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  label: {
    fontSize: '0.8rem',
    opacity: 0.95,
    marginTop: theme.spacing(0.5),
    fontWeight: 500,
  },
  period: {
    fontSize: '0.7rem',
    opacity: 0.85,
    marginTop: theme.spacing(0.25),
  },
}));

const RecentEventsCountWidget = () => {
  const { classes } = useStyles();
  const { eventsData, eventsLoading, loadEventsData } = useDashboardData();
  const [eventCount, setEventCount] = useState(0);

  // Charger les données une seule fois au montage
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      loadEventsData();
      mountedRef.current = true;
    }
  }, [loadEventsData]);

  // Calculer le total quand les données sont disponibles
  useEffect(() => {
    if (eventsData) {
      setEventCount(eventsData.length);
    }
  }, [eventsData]);

  if (eventsLoading && !eventsData) {
    return (
      <Card className={classes.card} elevation={3}>
        <CardContent>
          <CircularProgress sx={{ color: 'white' }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={classes.card} elevation={3}>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <NotificationsActiveIcon className={classes.icon} />
          <Typography className={classes.value}>
            {eventCount}
          </Typography>
          <Typography className={classes.label}>
            Événements
          </Typography>
          <Typography className={classes.period}>
            Dernières 24h
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentEventsCountWidget;

