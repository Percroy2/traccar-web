import { useSelector } from 'react-redux';
import {
  Card, CardContent, Typography, Box,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  card: {
    height: '100%',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
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
    fontSize: 48,
    opacity: 0.9,
    marginBottom: theme.spacing(1),
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  value: {
    fontSize: '2.2rem',
    fontWeight: 700,
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  label: {
    fontSize: '0.875rem',
    opacity: 0.95,
    marginTop: theme.spacing(0.5),
    fontWeight: 500,
  },
}));

const TotalVehiclesWidget = () => {
  const { classes } = useStyles();
  const devices = useSelector((state) => state.devices.items);
  const totalDevices = Object.keys(devices).length;

  return (
    <Card className={classes.card} elevation={3}>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <DirectionsCarIcon className={classes.icon} />
          <Typography className={classes.value}>
            {totalDevices}
          </Typography>
          <Typography className={classes.label}>
            Véhicules total
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TotalVehiclesWidget;

