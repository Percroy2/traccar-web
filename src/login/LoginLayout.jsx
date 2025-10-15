import { useMediaQuery, Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
  },
  sidebar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.palette.mode === 'dark' 
      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`
      : theme.palette.primary.main,
    paddingBottom: theme.spacing(5),
    width: theme.dimensions.sidebarWidth,
    position: 'relative',
    overflow: 'hidden',
    [theme.breakpoints.down('lg')]: {
      width: theme.dimensions.sidebarWidthTablet,
    },
    [theme.breakpoints.down('sm')]: {
      width: '0px',
    },
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    boxShadow: theme.palette.mode === 'dark' 
      ? '-8px 0px 32px rgba(0, 0, 0, 0.5)'
      : '-2px 0px 16px rgba(0, 0, 0, 0.25)',
    background: theme.palette.mode === 'dark' 
      ? '#1e1e1e'
      : theme.palette.background.paper,
    position: 'relative',
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(0, 25, 0, 0),
    },
  },
  form: {
    maxWidth: theme.spacing(52),
    padding: theme.spacing(5),
    width: '100%',
    backgroundColor: 'transparent',
  },
}));

const LoginLayout = ({ children }) => {
  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        {!useMediaQuery(theme.breakpoints.down('lg')) && <LogoImage color={theme.palette.secondary.contrastText} />}
      </div>
      <Paper className={classes.paper}>
        <form className={classes.form}>
          {children}
        </form>
      </Paper>
    </main>
  );
};

export default LoginLayout;
