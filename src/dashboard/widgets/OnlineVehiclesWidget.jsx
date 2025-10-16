import { useSelector } from 'react-redux';
import {
  Card, CardContent, Typography, Box,
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  card: {
    height: '100%',
    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
    color: theme.palette.success.contrastText,
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
    animation: 'pulse 2s ease-in-out infinite',
    '@keyframes pulse': {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
    },
  },
  value: {
    fontSize: '2rem',
    fontWeight: 700,
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  label: {
    fontSize: '0.8rem',
    opacity: 0.95,
    marginTop: theme.spacing(0.5),
    fontWeight: 500,
  },
  percentage: {
    fontSize: '1rem',
    marginTop: theme.spacing(0.5),
    fontWeight: 600,
  },
}));

const OnlineVehiclesWidget = () => {
  const { classes } = useStyles();
  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);

  const totalDevices = Object.keys(devices).length;
  const onlineDevices = Object.values(positions).filter((p) => {
    const device = devices[p.deviceId];
    return device && device.status === 'online';
  }).length;

  const percentage = totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0;

  return (
    <Card className={classes.card} elevation={3}>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <WifiIcon className={classes.icon} />
          <Typography className={classes.value}>
            {onlineDevices}
          </Typography>
          <Typography className={classes.label}>
            Véhicules en ligne
          </Typography>
          <Typography className={classes.percentage}>
            {percentage}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OnlineVehiclesWidget;

