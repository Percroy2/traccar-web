import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Box,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WifiIcon from '@mui/icons-material/Wifi';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import RouteIcon from '@mui/icons-material/Route';
import SpeedIcon from '@mui/icons-material/Speed';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DevicesIcon from '@mui/icons-material/Devices';
import EventIcon from '@mui/icons-material/Event';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import WarningIcon from '@mui/icons-material/Warning';
import PlaceIcon from '@mui/icons-material/Place';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useDashboard } from '../context/DashboardContext';

const WIDGET_TYPES = [
  { type: 'totalVehicles', icon: DirectionsCarIcon, label: 'dashboardWidgetTotalVehicles' },
  { type: 'onlineVehicles', icon: WifiIcon, label: 'dashboardWidgetOnlineVehicles' },
  { type: 'movingVehicles', icon: DirectionsRunIcon, label: 'dashboardWidgetMovingVehicles' },
  { type: 'totalDistance', icon: RouteIcon, label: 'dashboardWidgetTotalDistance' },
  { type: 'averageSpeed', icon: SpeedIcon, label: 'dashboardWidgetAverageSpeed' },
  { type: 'recentEvents', icon: NotificationsActiveIcon, label: 'dashboardWidgetRecentEvents' },
  { type: 'dailyDistanceChart', icon: TimelineIcon, label: 'dashboardWidgetDailyDistance' },
  { type: 'fleetComparison', icon: CompareArrowsIcon, label: 'dashboardWidgetFleetComparison' },
  { type: 'devices', icon: DevicesIcon, label: 'dashboardWidgetDevices' },
  { type: 'events', icon: EventIcon, label: 'dashboardWidgetEvents' },
  { type: 'chart', icon: BarChartIcon, label: 'dashboardWidgetChart' },
  { type: 'map', icon: MapIcon, label: 'dashboardWidgetMap' },
  { type: 'alerts', icon: WarningIcon, label: 'dashboardWidgetAlerts' },
  { type: 'geofence', icon: PlaceIcon, label: 'dashboardWidgetGeofence' },
];

const AddWidgetDialog = ({ open, onClose }) => {
  const t = useTranslation();
  const { addWidget } = useDashboard();
  const [selectedType, setSelectedType] = useState(null);
  const [title, setTitle] = useState('');

  const handleAdd = () => {
    if (selectedType) {
      addWidget(selectedType, title || t(WIDGET_TYPES.find((w) => w.type === selectedType).label));
      setSelectedType(null);
      setTitle('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setTitle('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('dashboardAddWidget')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label={t('sharedName')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={selectedType ? t(WIDGET_TYPES.find((w) => w.type === selectedType).label) : ''}
          />
        </Box>
        <List>
          {WIDGET_TYPES.map(({ type, icon: Icon, label }) => (
            <ListItemButton
              key={type}
              selected={selectedType === type}
              onClick={() => setSelectedType(type)}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={t(label)} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('sharedCancel')}</Button>
        <Button onClick={handleAdd} disabled={!selectedType} variant="contained">
          {t('sharedAdd')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWidgetDialog;

