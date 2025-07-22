import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CarIcon from '@mui/icons-material/DirectionsCar';
import ExitIcon from '@mui/icons-material/ExitToApp';
import OfferIcon from '@mui/icons-material/LocalOffer';
import NotifyIcon from '@mui/icons-material/NotificationsActive';
import { api } from 'common';
import { colors } from '../components/Theme/WebTheme';
import { useTranslation } from "react-i18next";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoneyIcon from '@mui/icons-material/Money';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { calcEst, showEst, optionsRequired } from '../common/sharedFunctions';
import SosIcon from '@mui/icons-material/Sos';
import { MAIN_COLOR, SECONDORY_COLOR } from "../common/sharedFunctions"
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread'

const drawerWidth = 260;

export default function ResponsiveDrawer(props) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const {
    signOff
  } = api;
  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const dispatch = useDispatch();

  const LogOut = () => {
    dispatch(signOff());
  };

  const [role, setRole] = useState(null);

  useEffect(() => {
    if (auth.profile && auth.profile.usertype) {
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleDrawer = () => {
    setMobileOpen(false);
  };

  const renderAccount = (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[700], 0.12),
      }}
    >
      <Avatar
        src={auth.profile.profile_image ? auth.profile.profile_image : require("../assets/img/logo192x192.png").default}
      >

      </Avatar>
      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2"> {auth.profile.usertype === 'company' ? <> {auth.profile.bussinesName} </> : <> {auth.profile.firstName} {auth.profile.lastName} </>} </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        V {settings.versionWeb}
        </Typography>
      </Box>
    </Box>
  );


  const renderUpgrade = (
    <Box sx={{ px: 2.5, pb: 3, mt: 10 }}>
      <Stack alignItems="center" spacing={3} sx={{ pt: 5, borderRadius: 2, position: 'relative' }}>
        <img style={{ marginTop: '20px', marginBottom: '20px', width: '120px', height: '120px' }} src={require("../assets/img/suport.png").default} alt="Logo" />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">¿Necesitas ayuda?</Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Comunícate con soporte de TREASAPP
          </Typography>
        </Box>

        <Button
          href="https://wa.me/message/BTQOY5GZC7REF1"
          target="_blank"
          variant="contained"
          color="error"
        >
          Servicio al Cliente
        </Button>
      </Stack>
    </Box>
  );

  const drawer = (
    <div style={{ backgroundColor: colors.WHITE, height: '100%' }}>
      {renderAccount}
      <div style={{ backgroundColor: colors.WHITE }}>
        {role ?
          <List disablePadding={true} dense={false}>
            {[
              { name: t('home'), url: '/', icon: <HomeIcon />, access: ['admin', 'fleetadmin', 'driver', 'customer', 'company'] },
              { name: 'Cambiar Turno', url: '/SubUsers', icon: <ChangeCircleIcon />, access: ['company'] },
              { name: t('dashboard_text'), url: '/dashboard', icon: <DashboardIcon />, access: ['admin', 'fleetadmin'] },
              { name: t('dashboard_text'), url: '/CompanyDashboard', icon: <DashboardIcon />, access: ['company', 'insurers'] },
              { name: t('booking_history'), url: '/bookings', icon: <ViewListIcon />, access: ['admin', 'fleetadmin', 'driver', 'customer', 'company'] },
              { name: t('Resumen de Servicio'), url: '/billing', icon: <PriceChangeIcon />, access: ['admin', 'company'] },
              { name: t('Modulo Facturación'), url: '/BillingModule', icon: <ReceiptLongIcon />, access: ['admin'] },

              { name: t('addbookinglable'), url: '/addbookings', icon: <ContactPhoneIcon />, access: calcEst && !showEst && !optionsRequired ? ['customer'] : ['admin', 'fleetadmin', 'customer', 'company'] },
              { name: t('user'), url: '/users/0', icon: <EmojiPeopleIcon />, access: ['admin', 'fleetadmin', 'company', 'insurers'] },
              { name: t('Buscador de referido'), url: '/idReferal', icon: <CoPresentIcon />, access: ['admin'] },

              { name: 'Funcionarios', url:'/Employees',icon: <EmojiPeopleIcon />, access: ['company'] },
              { name: t('Quejas'), url: '/Quejas', icon: <AnnouncementOutlinedIcon />, access: ['company', 'admin' ] },
              { name: t('ChatBot'), url: '/ChatBot', icon: <MarkChatUnreadIcon/>, access: [ 'admin' ] },
              { name: t('car_type'), url: '/cartypes', icon: <CarIcon />, access: ['admin'] },
              { name: t('cars'), url: '/cars', icon: <CarIcon />, access: ['admin', 'fleetadmin', 'driver', 'insurers'] },
              { name: t('Contratos'), url: '/contracts', icon: <AssessmentIcon />, access: [ 'driver',] },
              { name: t('withdraws_web'), url: '/withdraws', icon: <MoneyIcon />, access: ['admin'] },
              { name: t('add_to_wallet'), url: '/addtowallet', icon: <AccountBalanceWalletIcon />, access: ['admin'] },
              { name: t('Debitar de Monedero'), url: '/DebitWallet', icon: <AccountBalanceWalletIcon />, access: ['admin'] },

              { name: t('report'), url: '/allreports', icon: <AssessmentIcon />, access: ['admin', 'fleetadmin'] },
              { name: t('promo'), url: '/promos', icon: <OfferIcon />, access: ['admin'] },
              { name: t('push_notifications'), url: '/notifications', icon: <NotifyIcon />, access: ['admin'] },
              { name: t('sos'), url: '/sos', icon: <SosIcon />, access: ['admin'] },
              { name: t('complain'), url: '/complain', icon: <AnnouncementOutlinedIcon />, access: ['admin'] },
              { name: t('my_wallet_tile'), url: '/userwallet', icon: <AccountBalanceWalletIcon />, access: ['driver', 'customer'] },
              { name: t('settings_title'), url: '/settings', icon: <PhoneIphoneIcon />, access: ['admin'] },
              { name: t('payment_settings'), url: '/paymentsettings', icon: <PhoneIphoneIcon />, access: ['admin'] },
              { name: t('profile'), url: '/profile', icon: <AccountCircleIcon />, access: ['admin', 'fleetadmin', 'driver', 'customer', 'insurers'] },
              { name: t('logout'), url: 'logout', icon: <ExitIcon />, access: ['admin', 'fleetadmin', 'driver', 'customer', 'company', 'insurers'] }
            ].map((item, index) => (
              item.access.includes(role) ?
                <div style={{ display: 'flex', height: '50px' }} key={"key" + index}>
                  <ListItem key={item} disableGutters={true} disablePadding={true} style={{ paddingLeft: 5, }} alignItems='center' dense={false} onClick={handleDrawer}>
                    <ListItemButton disableGutters={true} dense={false} component={Link} to={item.url === 'logout' ? null : item.url} onClick={item.url === 'logout' ? LogOut : null}>
                      <ListItemIcon style={{ color: colors.Black, }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText inset={false} disableTypography={false} primary={item.name} style={{ color: colors.Black, textAlign: isRTL === 'rtl' ? 'right' : 'left' }} />
                    </ListItemButton>
                    <Divider />
                  </ListItem>
                </div>
                : null
            ))}
          </List>
          : null}

      </div>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex', direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }}>
      <CssBaseline />
      <style>
        {`
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-thumb {
            background-color: ${SECONDORY_COLOR};
            border-radius: 6px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background-color: ${MAIN_COLOR};
          }

          ::-webkit-scrollbar-track {
            background-color:#FFF;
          }
        `}
      </style>
      <AppBar
        position="fixed"
        style={isRTL === 'rtl' ? { marginRight: drawerWidth, backgroundColor: MAIN_COLOR, } : { marginLeft: drawerWidth, backgroundColor: MAIN_COLOR, }}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="#fff"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, }}
          >
            <MenuIcon style={{ color: '#fff' }} />
          </IconButton>
          <Typography variant="h6" noWrap component="div" style={{ color: '#fff' }}>
            {settings && settings.appName ? settings.appName : ''}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          anchor={isRTL === 'rtl' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }, direction: isRTL === 'rtl' ? 'rtl' : 'ltr'
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          anchor={isRTL === 'rtl' ? 'right' : 'left'}
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }, direction: isRTL === 'rtl' ? 'rtl' : 'ltr'
          }}
          open
        >
          {drawer}

          {renderUpgrade}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {props.children}
      </Box>
    </Box>
  );
}