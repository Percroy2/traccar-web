import { useSelector } from 'react-redux';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { formatSpeed } from '../../common/util/formatter';
import { useAttributePreference } from '../../common/util/preferences';

const useStyles = makeStyles()((theme) => ({
  list: {
    maxHeight: '100%',
    overflow: 'auto',
  },
  statusOnline: {
    color: theme.palette.success.main,
  },
  statusOffline: {
    color: theme.palette.error.main,
  },
  statusUnknown: {
    color: theme.palette.warning.main,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const DevicesWidget = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);
  const speedUnit = useAttributePreference('speedUnit');

  const deviceArray = Object.values(devices).slice(0, 20); // Limiter à 20 appareils

  if (deviceArray.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <DirectionsCarIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
        <Typography variant="body1">
          {t('sharedNoData')}
        </Typography>
      </Box>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'online':
        return classes.statusOnline;
      case 'offline':
        return classes.statusOffline;
      default:
        return classes.statusUnknown;
    }
  };

  return (
    <List className={classes.list}>
      {deviceArray.map((device) => {
        const position = positions[device.id];
        const status = device.status || 'unknown';

        return (
          <ListItem key={device.id} divider>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <DirectionsCarIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={device.name}
              secondary={
                position
                  ? `${t('positionSpeed')}: ${formatSpeed(position.speed, speedUnit, t)}`
                  : t('sharedNoData')
              }
            />
            <ListItemSecondaryAction>
              <Chip
                icon={<FiberManualRecordIcon className={getStatusClass(status)} />}
                label={t(`device${status.charAt(0).toUpperCase()}${status.slice(1)}`)}
                size="small"
                variant="outlined"
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
};

export default DevicesWidget;

