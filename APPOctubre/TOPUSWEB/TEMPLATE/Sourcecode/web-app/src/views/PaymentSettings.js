import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from '@mui/styles';
import { MAIN_COLOR, SECONDORY_COLOR } from "../common/sharedFunctions"
import Grid from '@mui/material/Grid';
import Button from "components/CustomButtons/Button.js";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { api } from 'common';

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

export default function PaymentSettings() {
    const { t,i18n } = useTranslation();
    const isRTL = i18n.dir();
    const [value, setValue] = React.useState(0);
    const classes = useStyles();
    const {
        editPaymentMethods
    } = api;

    const [paymentSettings, setPaymentSettings] = useState();
    const [oldPaymentSettings, setOldPaymentSettings] = useState();
    const paymentmethods = useSelector(state => state.paymentmethods);
    const dispatch = useDispatch();
    const settings = useSelector((state) => state.settingsdata.settings);
    
    useEffect(() => {
        const copyOfProviders = JSON.parse(JSON.stringify(paymentmethods.providers));
      if (paymentmethods.providers) {
        setPaymentSettings(paymentmethods.providers); 
        setOldPaymentSettings(copyOfProviders); 
      }else{
        setPaymentSettings(null);
        setOldPaymentSettings(null);
      }
    }, [paymentmethods.providers]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleCheck = (e) => {
        let pgName = e.target.name.split("|")[0];
        let pgKey = e.target.name.split("|")[1];
        let ps = Object.assign({}, paymentSettings);;
        ps[pgName][pgKey] = e.target.checked;
        setPaymentSettings(ps);
    }

    const handleText = (e) => {
        let pgName = e.target.name.split("|")[0];
        let pgKey = e.target.name.split("|")[1];
        let ps = Object.assign({}, paymentSettings);;
        ps[pgName][pgKey] = (pgName === 'payulatam') && (pgKey === 'merchantId' || pgKey === 'accountId') && e.target.value.length> 0? parseInt(e.target.value): e.target.value;
        setPaymentSettings(ps);
    }

    const handleSubmit = () => {
        if(settings.AllowCriticalEditsAdmin){
            dispatch(editPaymentMethods(paymentSettings));
        }else{
            alert(t("demo_mode"))
        }
    }

    return (
        paymentSettings?
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange}  variant="scrollable" aria-label="basic tabs example" className={classes.tabs}>
                    {Object.keys(paymentSettings).map((pgname, index) =>
                        <Tab key={"key"+index} label={t(pgname)} {...a11yProps(index)} />
                                            )}
                </Tabs>
            </Box>
            {Object.keys(paymentSettings).map((pgname, index) =>
                <TabPanel value={value} index={index} key={"key"+index}>
                    <Grid container spacing={2} style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }} >
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            {Object.keys(paymentSettings[pgname]).map((pgKey) => 
                                paymentSettings[pgname][pgKey] === true ||  paymentSettings[pgname][pgKey] === false ?
                                <FormControlLabel
                                    key={"key"+pgKey}
                                    style={{ flexDirection: isRTL === 'rtl' ? 'row' : 'row-reverse', paddingTop: 10, paddingBottom: 15, marginLeft: 5 }}
                                    label={pgKey}
                                    control={
                                        <Switch
                                            checked={paymentSettings[pgname][pgKey]}
                                            onChange={handleCheck}
                                            name={pgname + "|" + pgKey}
                                            color="primary"
                                        />
                                    }
                                />
                                :
                                <TextField
                                    key={"key"+pgKey}
                                    className={isRTL === "rtl" ? classes.rootRtl : classes.textField}
                                    variant="outlined"
                                    margin="normal"
                                    type={paymentSettings[pgname][pgKey] === oldPaymentSettings[pgname][pgKey] ? "password" : "text" }
                                    onFocus={(e)=>{
                                        let pgName = e.target.name.split("|")[0];
                                        let pgKey = e.target.name.split("|")[1];
                                        let ps = Object.assign({}, paymentSettings);
                                        ps[pgName][pgKey] = (pgName === 'payulatam') && (pgKey === 'merchantId' || pgKey === 'accountId') && e.target.value.length> 0? "": "";
                                        setPaymentSettings(ps);
                                    }}
                                    required
                                    fullWidth
                                    id={pgname + "|" + pgKey}
                                    label={pgKey}
                                    name={pgname + "|" + pgKey}
                                    autoComplete={pgname + "|" + pgKey}
                                    onChange={handleText}
                                    value={paymentSettings[pgname][pgKey]}
                                />
                            )}
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                variant="contained"
                                color="secondaryButton"
                                className={classes.buttonStyle}
                            >
                                {t('submit')}
                            </Button>   
                        </Grid>
                    </Grid>
                </TabPanel>
            )}
        </Box>
        :null
    );
}