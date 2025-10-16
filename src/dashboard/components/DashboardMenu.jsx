import {
  Divider, List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../common/components/LocalizationProvider';

const DashboardMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  return (
    <>
      <List>
        <ListItemButton
          key="dashboard"
          component={Link}
          to="/dashboard"
          selected={location.pathname === '/dashboard'}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary={t('dashboardTitle')} />
        </ListItemButton>
      </List>
      <Divider />
    </>
  );
};

export default DashboardMenu;

