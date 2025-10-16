import { useSelector } from 'react-redux';
import {
  Card, CardContent, Typography, Box,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  card: {
    height: '100%',
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    color: theme.palette.secondary.contrastText,
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
    animation: 'spin 3s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },
  value: {
    fontSize: '1.8rem',
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

const AverageSpeedWidget = () => {
  const { classes } = useStyles();
  const positions = useSelector((state) => state.session.positions);

  const positionArray = Object.values(positions);
  const averageSpeed = positionArray.length > 0
    ? positionArray.reduce((sum, p) => sum + (p.speed || 0), 0) / positionArray.length
    : 0;

  return (
    <Card className={classes.card} elevation={3}>
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <SpeedIcon className={classes.icon} />
          <Typography className={classes.value}>
            {Math.round(averageSpeed * 1.852)} km/h
          </Typography>
          <Typography className={classes.label}>
            Vitesse moyenne
          </Typography>
          <Typography className={classes.period}>
            En temps réel
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AverageSpeedWidget;

