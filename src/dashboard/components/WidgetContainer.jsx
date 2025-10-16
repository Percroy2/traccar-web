import { Rnd } from 'react-rnd';
import {
  Paper, IconButton, Typography, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { makeStyles } from 'tss-react/mui';
import { useDashboard } from '../context/DashboardContext';
import DevicesWidget from '../widgets/DevicesWidget';
import EventsWidget from '../widgets/EventsWidget';
import ChartWidget from '../widgets/ChartWidget';
import MapWidget from '../widgets/MapWidget';
import AlertsWidget from '../widgets/AlertsWidget';
import GeofenceWidget from '../widgets/GeofenceWidget';
import FleetComparisonWidget from '../widgets/FleetComparisonWidget';
import TotalVehiclesWidget from '../widgets/TotalVehiclesWidget';
import OnlineVehiclesWidget from '../widgets/OnlineVehiclesWidget';
import MovingVehiclesWidget from '../widgets/MovingVehiclesWidget';
import TotalDistanceWidget from '../widgets/TotalDistanceWidget';
import AverageSpeedWidget from '../widgets/AverageSpeedWidget';
import RecentEventsCountWidget from '../widgets/RecentEventsCountWidget';
import DailyDistanceChartWidget from '../widgets/DailyDistanceChartWidget';

const useStyles = makeStyles()((theme) => ({
  widget: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: `2px solid transparent`,
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    background: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.9)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 12px 40px 0 rgba(0, 0, 0, 0.5)'
        : '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
    },
  },
  widgetEdit: {
    borderColor: theme.palette.primary.light,
    borderStyle: 'dashed',
  },
  header: {
    padding: theme.spacing(1.5, 2),
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'move',
    borderBottom: `1px solid ${theme.palette.divider}`,
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontWeight: 600,
    fontSize: '0.95rem',
    flex: 1,
    letterSpacing: '0.3px',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing(2),
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.main,
      borderRadius: '4px',
    },
  },
  dragHandle: {
    marginRight: theme.spacing(1),
    cursor: 'move',
    opacity: 0.8,
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 1,
    },
  },
}));

const WIDGET_COMPONENTS = {
  devices: DevicesWidget,
  events: EventsWidget,
  chart: ChartWidget,
  map: MapWidget,
  alerts: AlertsWidget,
  geofence: GeofenceWidget,
  fleetComparison: FleetComparisonWidget,
  totalVehicles: TotalVehiclesWidget,
  onlineVehicles: OnlineVehiclesWidget,
  movingVehicles: MovingVehiclesWidget,
  totalDistance: TotalDistanceWidget,
  averageSpeed: AverageSpeedWidget,
  recentEvents: RecentEventsCountWidget,
  dailyDistanceChart: DailyDistanceChartWidget,
};

const WidgetContainer = ({ widget }) => {
  const { classes } = useStyles();
  const {
    editMode, removeWidget, updateWidgetPosition, updateWidgetSize,
  } = useDashboard();

  const WidgetComponent = WIDGET_COMPONENTS[widget.type];

  if (!WidgetComponent) {
    return null;
  }

  return (
    <Rnd
      position={widget.position}
      size={widget.size}
      onDragStop={(e, d) => {
        if (editMode) {
          updateWidgetPosition(widget.id, { x: d.x, y: d.y });
        }
      }}
      onResize={(e, direction, ref, delta, position) => {
        if (editMode) {
          updateWidgetSize(widget.id, {
            width: parseInt(ref.style.width, 10),
            height: parseInt(ref.style.height, 10),
          });
          updateWidgetPosition(widget.id, position);
        }
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (editMode) {
          updateWidgetSize(widget.id, {
            width: parseInt(ref.style.width, 10),
            height: parseInt(ref.style.height, 10),
          });
          updateWidgetPosition(widget.id, position);
        }
      }}
      disableDragging={!editMode}
      enableResizing={editMode}
      minWidth={200}
      minHeight={180}
      bounds="parent"
      dragHandleClassName="widget-drag-handle"
      dragGrid={[20, 20]}
      resizeGrid={[20, 20]}
    >
      <Paper className={`${classes.widget} ${editMode ? classes.widgetEdit : ''}`} elevation={3}>
        <Box className={`${classes.header} widget-drag-handle`}>
          {editMode && <DragIndicatorIcon className={classes.dragHandle} />}
          <Typography className={classes.title} variant="h6">
            {widget.title}
          </Typography>
          {editMode && (
            <IconButton
              size="small"
              onClick={() => removeWidget(widget.id)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Box className={classes.content}>
          <WidgetComponent widget={widget} />
        </Box>
      </Paper>
    </Rnd>
  );
};

export default WidgetContainer;

