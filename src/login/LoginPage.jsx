import { useEffect, useState } from 'react';
import {
  useMediaQuery, Select, MenuItem, FormControl, Button, TextField, Link, Snackbar, IconButton, Tooltip, Box, InputAdornment,
} from '@mui/material';
import ReactCountryFlag from 'react-country-flag';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import VpnLockIcon from '@mui/icons-material/VpnLock';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sessionActions } from '../store';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import LoginLayout from './LoginLayout';
import usePersistedState from '../common/util/usePersistedState';
import {
  generateLoginToken, handleLoginTokenListeners, nativeEnvironment, nativePostMessage,
} from '../common/components/NativeInterface';
import LogoImage from './LogoImage';
import { useCatch } from '../reactHelper';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  options: {
    position: 'fixed',
    top: theme.spacing(2),
    right: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    zIndex: 10,
    '& button': {
      transition: 'all 0.3s ease',
      backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : 'rgba(255, 255, 255, 0.9)',
      color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 12px rgba(255, 255, 255, 0.15)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
        backgroundColor: theme.palette.mode === 'dark' ? '#3d3d3d' : 'rgba(255, 255, 255, 1)',
      },
    },
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    animation: 'fadeIn 0.6s ease-in-out',
  },
  extraContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing(4),
    marginTop: theme.spacing(3),
  },
  registerButton: {
    minWidth: 'unset',
  },
  link: {
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s ease',
    fontWeight: 500,
    color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.primary.main,
      transform: 'translateY(-1px)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -2,
      left: 0,
      width: 0,
      height: 2,
      background: theme.palette.primary.main,
      transition: 'width 0.3s ease',
    },
    '&:hover::after': {
      width: '100%',
    },
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
      transition: 'all 0.3s ease',
      backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : theme.palette.background.paper,
      borderColor: theme.palette.mode === 'dark' ? '#404040' : undefined,
      '&:hover': {
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 8px rgba(255, 255, 255, 0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      '&.Mui-focused': {
        boxShadow: `0 4px 12px ${theme.palette.primary.main}33`,
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary,
    },
    '& .MuiOutlinedInput-input': {
      color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
    },
  },
  languageSelect: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
      transition: 'all 0.3s ease',
      backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : theme.palette.background.paper,
      '&:hover': {
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 8px rgba(255, 255, 255, 0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    },
    '& .MuiSelect-select': {
      color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
    },
  },
  submitButton: {
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1.5),
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    marginTop: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 20px ${theme.palette.secondary.main}66`,
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  logoContainer: {
    marginBottom: theme.spacing(4),
    animation: 'slideDown 0.6s ease-in-out',
  },
  welcomeText: {
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    fontSize: '1rem',
    color: theme.palette.mode === 'dark' ? '#b0b0b0' : theme.palette.text.secondary,
    lineHeight: 1.5,
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '@keyframes slideDown': {
    '0%': {
      opacity: 0,
      transform: 'translateY(-30px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const LoginPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLocalLanguage } = useLocalization();
  const serverTitle = useSelector((state) => state.session.server?.attributes?.title || 'Trakino');
  const languageList = Object.entries(languages).map((values) => ({ code: values[0], country: values[1].country, name: values[1].name }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showServerTooltip, setShowServerTooltip] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const languageEnabled = useSelector((state) => {
    const attributes = state.session.server.attributes;
    return !attributes.language && !attributes['ui.disableLoginLanguage'];
  });
  const changeEnabled = useSelector((state) => !state.session.server.attributes.disableChange);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);
  const openIdEnabled = useSelector((state) => state.session.server.openIdEnabled);
  const openIdForced = useSelector((state) => state.session.server.openIdEnabled && state.session.server.openIdForce);
  const [codeEnabled, setCodeEnabled] = useState(false);

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector((state) => state.session.server.announcement);

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch('/api/session', {
        method: 'POST',
        body: new URLSearchParams(code.length ? `${query}&code=${code}` : query),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        const target = window.sessionStorage.getItem('postLogin') || '/';
        window.sessionStorage.removeItem('postLogin');
        navigate(target, { replace: true });
      } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'TOTP') {
        setCodeEnabled(true);
      } else {
        throw Error(await response.text());
      }
    } catch {
      setFailed(true);
      setPassword('');
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetchOrThrow(`/api/session?token=${encodeURIComponent(token)}`);
    const user = await response.json();
    dispatch(sessionActions.updateUser(user));
    navigate('/');
  });

  const handleOpenIdLogin = () => {
    document.location = '/api/session/openid/auth';
  };

  useEffect(() => nativePostMessage('authentication'), []);

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem('hostname') !== window.location.hostname) {
      window.localStorage.setItem('hostname', window.location.hostname);
      setShowServerTooltip(true);
    }
  }, []);

  return (
    <LoginLayout>
      <div className={classes.options}>
        {nativeEnvironment && changeEnabled && (
          <IconButton color="primary" onClick={() => navigate('/change-server')}>
            <Tooltip
              title={`${t('settingsServer')}: ${window.location.hostname}`}
              open={showServerTooltip}
              arrow
            >
              <VpnLockIcon />
            </Tooltip>
          </IconButton>
        )}
        {!nativeEnvironment && (
          <IconButton color="primary" onClick={() => setShowQr(true)}>
            <QrCode2Icon />
          </IconButton>
        )}
        {languageEnabled && (
          <FormControl className={classes.languageSelect} size="small">
            <Select 
              value={language} 
              onChange={(e) => setLocalLanguage(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                }
              }}
            >
              {languageList.map((it) => (
                <MenuItem key={it.code} value={it.code}>
                  <Box component="span" sx={{ mr: 1 }}>
                    <ReactCountryFlag countryCode={it.country} svg />
                  </Box>
                  {it.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
      <div className={classes.container}>
        {useMediaQuery(theme.breakpoints.down('lg')) && (
          <div className={classes.logoContainer}>
            <LogoImage color={theme.palette.primary.main} />
          </div>
        )}
        
        <div className={classes.welcomeText}>
          <h1 className={classes.title}>Bienvenue</h1>
          <p className={classes.subtitle}>
            Connectez-vous à votre compte {serverTitle} pour accéder à vos données de suivi
          </p>
        </div>

        {!openIdForced && (
          <>
            <TextField
              required
              error={failed}
              label={t('userEmail')}
              name="email"
              value={email}
              autoComplete="email"
              autoFocus={!email}
              onChange={(e) => setEmail(e.target.value)}
              helperText={failed && 'Invalid username or password'}
              className={classes.textField}
            />
            <TextField
              required
              error={failed}
              label={t('userPassword')}
              name="password"
              value={password}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              autoFocus={!!email}
              onChange={(e) => setPassword(e.target.value)}
              className={classes.textField}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {codeEnabled && (
              <TextField
                required
                error={failed}
                label={t('loginTotpCode')}
                name="code"
                value={code}
                type="number"
                onChange={(e) => setCode(e.target.value)}
                className={classes.textField}
              />
            )}
            <Button
              onClick={handlePasswordLogin}
              type="submit"
              variant="contained"
              color="secondary"
              disabled={!email || !password || (codeEnabled && !code)}
              className={classes.submitButton}
            >
              {t('loginLogin')}
            </Button>
          </>
        )}
        {openIdEnabled && (
          <Button
            onClick={() => handleOpenIdLogin()}
            variant="contained"
            color="secondary"
            className={classes.submitButton}
          >
            {t('loginOpenId')}
          </Button>
        )}
        {!openIdForced && (
          <div className={classes.extraContainer}>
            {registrationEnabled && (
              <Link
                onClick={() => navigate('/register')}
                className={classes.link}
                underline="none"
                variant="caption"
              >
                {t('loginRegister')}
              </Link>
            )}
            {emailEnabled && (
              <Link
                onClick={() => navigate('/reset-password')}
                className={classes.link}
                underline="none"
                variant="caption"
              >
                {t('loginReset')}
              </Link>
            )}
          </div>
        )}
      </div>
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={(
          <IconButton size="small" color="inherit" onClick={() => setAnnouncementShown(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      />
    </LoginLayout>
  );
};

export default LoginPage;
