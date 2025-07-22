import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import DriverBilling from './DriverBilling';
import DateBilling from './DateBilling';
import { useTranslation } from "react-i18next";
import CompanyInvoices from './CompanyInvoices';

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
  const [value, setValue] = React.useState(0);
  const { t } = useTranslation();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          textColor="error"
          indicatorColor="secondary"
        >
            <Tab
              style={{ marginRight: '20px', color: '#000' }}
              label={'Facturación Empresas'}
              {...a11yProps(0)}
            />
            <Tab
              style={{ marginRight: '20px', color: '#000' }}
              label={t('Facturación Conductores')}
              {...a11yProps(1)}
            />
            <Tab
              style={{ marginRight: '20px', color: '#000' }}
              label={t('Periodo de Facturación')}
              {...a11yProps(2)}
            />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
      <DriverBilling />
      </TabPanel>
      <TabPanel value={value} index={1}>
      <CompanyInvoices />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <DateBilling />
      </TabPanel>     
    </Box>
  );
}