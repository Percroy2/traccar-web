import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { formatDistance, formatSpeed } from '../../common/util/formatter';
import { useAttributePreference } from '../../common/util/preferences';
import { useDashboardData } from '../context/DashboardDataContext';

const FleetComparisonWidget = () => {
  const t = useTranslation();
  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);
  const { summaryData, summaryLoading, loadSummaryData } = useDashboardData();
  const [deviceStats, setDeviceStats] = useState([]);

  const distanceUnit = useAttributePreference('distanceUnit');
  const speedUnit = useAttributePreference('speedUnit');

  // Charger les données une seule fois au montage
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      loadSummaryData();
      mountedRef.current = true;
    }
  }, [loadSummaryData]);

  // Enrichir les données avec infos temps réel
  useEffect(() => {
    if (summaryData) {
      const enrichedStats = summaryData.map((summary) => {
        const device = devices[summary.deviceId];
        const position = positions[summary.deviceId];

        return {
          ...summary,
          deviceName: device?.name || 'Inconnu',
          status: device?.status || 'unknown',
          currentSpeed: position?.speed || 0,
        };
      });

      // Trier par distance décroissante
      enrichedStats.sort((a, b) => (b.distance || 0) - (a.distance || 0));
      setDeviceStats(enrichedStats);
    }
  }, [summaryData, devices, positions]);

  if (summaryLoading && !summaryData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {t('sharedLoading')}
        </Typography>
      </Box>
    );
  }

  if (deviceStats.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {t('sharedNoData')}
        </Typography>
      </Box>
    );
  }

  const maxDistance = Math.max(...deviceStats.map((d) => d.distance || 0));
  const maxSpeed = Math.max(...deviceStats.map((d) => d.averageSpeed || 0));

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <TableContainer sx={{ maxHeight: '100%', overflow: 'auto' }}>
      <Table sx={{ minWidth: 650 }} stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Véhicule</strong></TableCell>
            <TableCell align="center"><strong>Statut</strong></TableCell>
            <TableCell align="right"><strong>Distance (7j)</strong></TableCell>
            <TableCell align="right"><strong>Vitesse moy.</strong></TableCell>
            <TableCell align="right"><strong>Vitesse actuelle</strong></TableCell>
            <TableCell align="right"><strong>Heures moteur</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deviceStats.map((stat) => (
            <TableRow key={stat.deviceId} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {stat.deviceName}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Chip
                  label={t(`deviceStatus${stat.status.charAt(0).toUpperCase()}${stat.status.slice(1)}`)}
                  color={getStatusColor(stat.status)}
                  size="small"
                />
              </TableCell>

              <TableCell align="right">
                <Box>
                  <Typography variant="body2">
                    {formatDistance(stat.distance || 0, distanceUnit, t)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={maxDistance > 0 ? ((stat.distance || 0) / maxDistance) * 100 : 0}
                    sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </TableCell>

              <TableCell align="right">
                <Box>
                  <Typography variant="body2">
                    {stat.averageSpeed > 0
                      ? formatSpeed(stat.averageSpeed, speedUnit, t)
                      : '-'}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={maxSpeed > 0 ? ((stat.averageSpeed || 0) / maxSpeed) * 100 : 0}
                    sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
                    color="secondary"
                  />
                </Box>
              </TableCell>

              <TableCell align="right">
                <Typography variant="body2" color={stat.currentSpeed > 1 ? 'primary' : 'text.secondary'}>
                  {formatSpeed(stat.currentSpeed, speedUnit, t)}
                </Typography>
              </TableCell>

              <TableCell align="right">
                <Typography variant="body2">
                  {stat.engineHours > 0 ? `${Math.round(stat.engineHours)}h` : '-'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 Les barres de progression montrent les performances relatives par rapport au véhicule le plus performant.
        </Typography>
      </Box>
    </TableContainer>
  );
};

export default FleetComparisonWidget;

