import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useEffectAsync } from '../../reactHelper';
import fetchOrThrow from '../../common/util/fetchOrThrow';
import dayjs from 'dayjs';

const ChartWidget = () => {
  const t = useTranslation();
  const devices = useSelector((state) => state.devices.items);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const deviceArray = Object.values(devices);

  useEffect(() => {
    if (deviceArray.length > 0 && !selectedDevice) {
      setSelectedDevice(deviceArray[0].id);
    }
  }, [deviceArray, selectedDevice]);

  useEffectAsync(async () => {
    if (!selectedDevice) return;

    setLoading(true);
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 24 * 60 * 60 * 1000); // Dernières 24h

      const query = new URLSearchParams({
        deviceId: selectedDevice,
        from: from.toISOString(),
        to: to.toISOString(),
      });

      const response = await fetchOrThrow(`/api/reports/route?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const positions = await response.json();

      const data = positions.map((position) => ({
        time: dayjs(position.fixTime).format('HH:mm'),
        speed: Math.round(position.speed * 1.852), // Conversion en km/h
        altitude: Math.round(position.altitude || 0),
      }));

      setChartData(data.slice(0, 100)); // Limiter à 100 points
    } catch (error) {
      console.error('Erreur lors du chargement des données du graphique:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDevice]);

  if (deviceArray.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {t('sharedNoData')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t('sharedDevice')}</InputLabel>
        <Select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          label={t('sharedDevice')}
        >
          {deviceArray.map((device) => (
            <MenuItem key={device.id} value={device.id}>
              {device.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="speed"
              stroke="#8884d8"
              name={`${t('positionSpeed')} (km/h)`}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="altitude"
              stroke="#82ca9d"
              name={`${t('positionAltitude')} (m)`}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default ChartWidget;

