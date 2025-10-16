import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { useAttributePreference } from '../../common/util/preferences';
import { useDashboardData } from '../context/DashboardDataContext';

const DailyDistanceChartWidget = () => {
  const devices = useSelector((state) => state.devices.items);
  const { loadDailySummaryData, dailyLoading } = useDashboardData();
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('line'); // 'line' ou 'bar'
  const [period, setPeriod] = useState(7); // 7 ou 30 jours
  const [maxDevices, setMaxDevices] = useState(15); // Limiter par défaut
  const distanceUnit = useAttributePreference('distanceUnit');
  const loadFnRef = useRef(loadDailySummaryData);

  // Mettre à jour la référence
  useEffect(() => {
    loadFnRef.current = loadDailySummaryData;
  }, [loadDailySummaryData]);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        const deviceIds = Object.keys(devices);
        if (deviceIds.length === 0) {
          return;
        }

        // Charger avec limitation d'appareils
        const summaries = await loadFnRef.current(period, maxDevices);
        
        if (!mounted) return;

      // Agréger les données par jour
      const dailyData = {};

      summaries.forEach((summary) => {
        const date = dayjs(summary.startTime).format('DD/MM');
        
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            distance: 0,
            vehicles: 0,
          };
        }

        dailyData[date].distance += summary.distance || 0;
        dailyData[date].vehicles += 1;
      });

      // Convertir en tableau et trier par date
      const chartArray = Object.values(dailyData).map((item) => ({
        date: item.date,
        distance: distanceUnit === 'km' 
          ? Math.round(item.distance / 1000) 
          : Math.round(item.distance / 1609.34), // Miles
        vehicles: item.vehicles,
      }));

      // Trier chronologiquement
      chartArray.sort((a, b) => {
        const dateA = dayjs(a.date, 'DD/MM');
        const dateB = dayjs(b.date, 'DD/MM');
        return dateA.isBefore(dateB) ? -1 : 1;
      });

      setChartData(chartArray);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setChartData([]);
    }
    };

    loadData();
    
    return () => {
      mounted = false;
    };
  }, [period, maxDevices, distanceUnit, devices]);

  const getDistanceLabel = () => {
    switch (distanceUnit) {
      case 'mi':
        return 'Distance (mi)';
      case 'nmi':
        return 'Distance (nmi)';
      default:
        return 'Distance (km)';
    }
  };

  if (Object.keys(devices).length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Aucun véhicule configuré
        </Typography>
      </Box>
    );
  }

  const totalDevices = Object.keys(devices).length;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Contrôles */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(e, value) => value && setChartType(value)}
          size="small"
        >
          <ToggleButton value="line">
            <ShowChartIcon sx={{ mr: 0.5 }} fontSize="small" />
            Courbe
          </ToggleButton>
          <ToggleButton value="bar">
            <BarChartIcon sx={{ mr: 0.5 }} fontSize="small" />
            Histogramme
          </ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            label="Période"
          >
            <MenuItem value={7}>7 jours</MenuItem>
            <MenuItem value={14}>14 jours</MenuItem>
            <MenuItem value={30}>30 jours</MenuItem>
          </Select>
        </FormControl>

        {totalDevices > 15 && (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Véhicules max</InputLabel>
            <Select
              value={maxDevices}
              onChange={(e) => setMaxDevices(e.target.value)}
              label="Véhicules max"
            >
              <MenuItem value={10}>10 véhicules</MenuItem>
              <MenuItem value={15}>15 véhicules</MenuItem>
              <MenuItem value={20}>20 véhicules</MenuItem>
              <MenuItem value={50}>50 véhicules</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Info limitation */}
      {totalDevices > maxDevices && (
        <Box sx={{ px: 1 }}>
          <Typography variant="caption" color="info.main" fontWeight={600}>
            ℹ️ Affichage limité aux {maxDevices} véhicules les plus actifs (total: {totalDevices})
          </Typography>
        </Box>
      )}

      {/* Graphique */}
      {dailyLoading && !chartData.length ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Chargement des données de {totalDevices > maxDevices ? maxDevices : totalDevices} véhicules sur {period} jours...
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cela peut prendre quelques secondes
          </Typography>
        </Box>
      ) : chartData.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Aucune donnée disponible
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis 
                style={{ fontSize: '0.75rem' }}
                label={{ value: getDistanceLabel(), angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'distance') return [value, getDistanceLabel()];
                  return [value, 'Véhicules actifs'];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="distance"
                stroke="#8884d8"
                strokeWidth={2}
                name={getDistanceLabel()}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis 
                style={{ fontSize: '0.75rem' }}
                label={{ value: getDistanceLabel(), angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'distance') return [value, getDistanceLabel()];
                  return [value, 'Véhicules actifs'];
                }}
              />
              <Legend />
              <Bar
                dataKey="distance"
                fill="#8884d8"
                name={getDistanceLabel()}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}

      {/* Info */}
      {chartData.length > 0 && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Total sur {period} jours: {' '}
            <strong>
              {chartData.reduce((sum, item) => sum + item.distance, 0)} {distanceUnit || 'km'}
            </strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DailyDistanceChartWidget;

