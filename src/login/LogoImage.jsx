import { useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import Logo from '../resources/images/logo.svg?react';

const useStyles = makeStyles()((theme) => ({
  image: {
    alignSelf: 'center',
    maxWidth: '280px',
    maxHeight: '140px',
    width: 'auto',
    height: 'auto',
    margin: theme.spacing(2),
    filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.15))',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      filter: 'drop-shadow(0 6px 24px rgba(0, 0, 0, 0.2))',
    },
  },
}));

const LogoImage = ({ color }) => {
  const theme = useTheme();
  const { classes } = useStyles();

  const expanded = !useMediaQuery(theme.breakpoints.down('lg'));

  const logo = useSelector((state) => state.session.server.attributes?.logo);
  const logoInverted = useSelector((state) => state.session.server.attributes?.logoInverted);

  if (logo) {
    if (expanded && logoInverted) {
      return <img className={classes.image} src={logoInverted} alt="" />;
    }
    return <img className={classes.image} src={logo} alt="" />;
  }
  return <Logo className={classes.image} style={{ color }} />;
};

export default LogoImage;
