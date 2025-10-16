import {
  useState, useMemo, useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Fab, Tooltip, Typography, Box, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import { makeStyles } from 'tss-react/mui';
import PageLayout from '../common/components/PageLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import DashboardMenu from './components/DashboardMenu';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { DashboardDataProvider } from './context/DashboardDataContext';
import WidgetContainer from './components/WidgetContainer';
import AddWidgetDialog from './components/AddWidgetDialog';
import DashboardToolbar from './components/DashboardToolbar';
import { useAdministrator } from '../common/util/permissions';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #1e1e2e 0%, #2d2d3e 100%)'
      : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
  toolbar: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  canvas: {
    flex: 1,
    position: 'relative',
    overflow: 'auto',
    padding: theme.spacing(3),
    minHeight: '100%',
    '&::-webkit-scrollbar': {
      width: '12px',
      height: '12px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.main,
      borderRadius: '10px',
      '&:hover': {
        background: theme.palette.primary.dark,
      },
    },
  },
  canvasInner: {
    position: 'relative',
    minHeight: '100%',
    width: '100%',
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'scale(1.1) rotate(90deg)',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
    },
  },
  gridBackground: {
    backgroundImage: `
      linear-gradient(to right, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px),
      linear-gradient(to bottom, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
  },
  accessDenied: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: theme.spacing(2),
    padding: theme.spacing(4),
  },
}));

const DashboardContent = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const {
    widgets, editMode, loading, saving,
  } = useDashboard();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Calculer la hauteur minimale nécessaire basée sur les widgets
  const minHeight = useMemo(() => {
    if (widgets.length === 0) return 800;
    
    const maxBottom = widgets.reduce((max, widget) => {
      const bottom = widget.position.y + widget.size.height;
      return Math.max(max, bottom);
    }, 0);
    
    // Ajouter 300px de marge en bas pour permettre d'ajouter de nouveaux widgets
    return Math.max(maxBottom + 300, 800);
  }, [widgets]);

  if (loading) {
    return (
      <div className={classes.root}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="h6" color="text.secondary">
            {t('sharedLoading')}...
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <DashboardToolbar />
      {saving && (
        <Box 
          sx={{ 
            position: 'fixed', 
            top: 80, 
            right: 24, 
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              from: { opacity: 0, transform: 'translateX(100%)' },
              to: { opacity: 1, transform: 'translateX(0)' },
            },
          }}
        >
          <Paper 
            sx={{ 
              p: 1.5, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <CircularProgress size={16} />
            <Typography variant="caption" color="primary" fontWeight={600}>
              Sauvegarde en cours...
            </Typography>
          </Paper>
        </Box>
      )}
      <div className={classes.canvas}>
        <div 
          className={`${classes.canvasInner} ${editMode ? classes.gridBackground : ''}`}
          style={{ minHeight: `${minHeight}px` }}
        >
          {widgets.map((widget) => (
            <WidgetContainer
              key={widget.id}
              widget={widget}
            />
          ))}
        </div>
      </div>

      {editMode && (
        <Tooltip title={t('sharedAdd')}>
          <Fab
            color="primary"
            className={classes.fab}
            onClick={() => setAddDialogOpen(true)}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      <AddWidgetDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
};

const DashboardPage = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const navigate = useNavigate();
  const admin = useAdministrator();

  useEffect(() => {
    if (!admin) {
      // Rediriger vers la page d'accueil après 3 secondes
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [admin, navigate]);

  if (!admin) {
    return (
      <PageLayout menu={<DashboardMenu />} breadcrumbs={['settingsTitle', 'dashboardTitle']}>
        <Box className={classes.accessDenied}>
          <LockIcon sx={{ fontSize: 80, color: 'error.main' }} />
          <Typography variant="h4" color="error">
            {t('sharedAccess')} {t('sharedDenied')}
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Le tableau de bord est réservé aux administrateurs uniquement.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirection automatique vers la page d'accueil...
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <DashboardProvider>
      <DashboardDataProvider>
        <PageLayout menu={<DashboardMenu />} breadcrumbs={['settingsTitle', 'dashboardTitle']}>
          <DashboardContent />
        </PageLayout>
      </DashboardDataProvider>
    </DashboardProvider>
  );
};

export default DashboardPage;

