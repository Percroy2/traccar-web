import {
  Paper,
  Tooltip,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  ButtonGroup,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestoreIcon from '@mui/icons-material/Restore';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useDashboard } from '../context/DashboardContext';

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    padding: theme.spacing(2.5, 3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
    gap: theme.spacing(2),
    backdropFilter: 'blur(10px)',
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontWeight: 700,
    fontSize: '1.5rem',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}));

const DashboardToolbar = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const { editMode, setEditMode, resetDashboard } = useDashboard();

  return (
    <Paper className={classes.toolbar} elevation={0}>
      <Typography variant="h5" className={classes.title}>
        {t('dashboardTitle')}
      </Typography>

      <div className={classes.actions}>
        <FormControlLabel
          control={
            <Switch
              checked={editMode}
              onChange={(e) => setEditMode(e.target.checked)}
              color="primary"
            />
          }
          label={t('dashboardEditMode')}
        />

        <ButtonGroup variant="outlined" size="small">
          <Tooltip title={t('dashboardReset')}>
            <Button onClick={resetDashboard}>
              <RestoreIcon />
            </Button>
          </Tooltip>
          <Tooltip title={t('sharedRefresh')}>
            <Button onClick={() => window.location.reload()}>
              <RefreshIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </div>
    </Paper>
  );
};

export default DashboardToolbar;

