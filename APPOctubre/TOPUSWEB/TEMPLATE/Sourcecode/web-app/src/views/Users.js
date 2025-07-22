import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Riders from './Riders';
import Drivers from './Drivers';
import FleetAdmins from './FleetAdmins';
import CreateAdmin from './CreateAdmin';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { makeStyles } from '@mui/styles';
import { MAIN_COLOR, SECONDORY_COLOR } from "../common/sharedFunctions"
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Corps from './Corp';
import Topus from './Topus';
import Insurers from './Insurers';
import UsersUpdates from './UsersUpdates';

const useStyles = makeStyles({
  tabs: {

    "& .MuiTabs-indicator": {
      backgroundColor: SECONDORY_COLOR,
      height: 3,
    },
    "& .MuiTab-root.Mui-selected": {
      color: MAIN_COLOR
    }
  }
})
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Users() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
  const { t } = useTranslation();
  const auth = useSelector(state => state.auth);
  const [role, setRole] = React.useState(null);
  const classes = useStyles();

  React.useEffect(() => {
    if (auth.profile && auth.profile.usertype) {
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);

  const handleChange = (event, newValue) => {
    navigate(`/users/${newValue}`)
  };

  React.useEffect(() => {
    if (id && typeof (Number(id)) === "number" && Number(id) >= 0 && Number(id) <= 7) {
      setValue(Number(id));
    } else {
      navigate("/404");
    }
  }, [id, navigate])

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" className={classes.tabs}>
          <Tab label={t('riders')} {...a11yProps(0)} />
         {role === 'company' ?
         null :  <Tab label={t('drivers')} {...a11yProps(1)} /> }
          {role === 'fleetadmin'|| role === 'company' ?
            null : <Tab label={t('fleetadmins')} {...a11yProps(2)} />
          }
          {role === 'fleetadmin'|| role === 'company' ?
            null : <Tab label={t('alladmin')} {...a11yProps(3)} />
          }
          {role === 'fleetadmin' || role === 'company' ?
            null : <Tab label={t('Empresas/Hoteles')} {...a11yProps(4)} />
          }
          {role === 'fleetadmin' || role === 'company' ?
            null : <Tab label={t('Externos')} {...a11yProps(5)} />
          }

          {role === 'fleetadmin' || role === 'company' ?
            null : <Tab label={t('Seguridad')} {...a11yProps(6)} />
          }

          {role === 'fleetadmin' || role === 'company' ?
            null : <Tab label={t('Actualizados')} {...a11yProps(7)} />
          }

        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Riders />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Drivers />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <FleetAdmins />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <CreateAdmin />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Corps />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <Insurers />
      </TabPanel>
      <TabPanel value={value} index={6}>
        <Topus />
      </TabPanel>
      <TabPanel value={value} index={7}>
        <UsersUpdates />
      </TabPanel>
    </Box>
  );
}