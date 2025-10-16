import { useState, useEffect, useRef } from 'react';
import {
  Card, CardContent, Typography, Box, CircularProgress,
} from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import { makeStyles } from 'tss-react/mui';
import { formatDistance } from '../../common/util/formatter';
import { useAttributePreference } from '../../common/util/preferences';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useDashboardData } from '../context/DashboardDataContext';

const useStyles = makeStyles()((theme) => ({
  card: {
    height: '100%',
    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
    color: theme.palette.warning.contrastText,
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
  },
  value: {
    fontSize: '1.6rem',
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

const TotalDistanceWidget = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const { summaryData, summaryLoading, loadSummaryData } = useDashboardData();
  const [totalDistance, setTotalDistance] = useState(0);
  const distanceUnit = useAttributePreference('distanceUnit');

  // Charger les données une seule fois au montage
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      loadSummaryData();
      mountedRef.current = true;
    }
  }, [loadSummaryData]);

  // Calculer le total quand les données sont disponibles
  useEffect(() => {
    if (summaryData) {
      const total = summaryData.reduce((sum, item) => sum + (item.distance || 0), 0);
      setTotalDistance(total);
    }
  }, [summaryData]);

  if (summaryLoading && !summaryData) {
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
          <RouteIcon className={classes.icon} />
          <Typography className={classes.value}>
            {formatDistance(totalDistance, distanceUnit, t)}
          </Typography>
          <Typography className={classes.label}>
            Distance totale
          </Typography>
          <Typography className={classes.period}>
            7 derniers jours
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TotalDistanceWidget;

