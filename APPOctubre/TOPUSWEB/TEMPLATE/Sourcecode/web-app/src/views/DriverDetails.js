import React, { useState, useEffect, useRef } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector, } from "react-redux";
import { useTranslation } from "react-i18next";
import DriverCars from "./DriverCars";
import { MAIN_COLOR, SECONDORY_COLOR } from "../common/sharedFunctions";
import { makeStyles } from '@mui/styles';
import { BankDetails } from "./BannkDetails";
import UserRides from "./UserRides";
import UserWalletDetails from "./UserWalletDetails";
//import UserInfoDetails from "./UserInfoDetails";
import DriverInfo from "./DriverInfo";

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
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function DriverDetails() {
  const { id } = useParams();
  const [value, setValue] = React.useState(0);
  const { t, } = useTranslation();
  const [data, setData] = useState([])
  const staticusers = useSelector((state) => state.usersdata.staticusers);
  const navigate = useNavigate();
  const loaded = useRef(false);
  const classes = useStyles();

  useEffect(() => {
    if (staticusers) {
      const user = staticusers.filter((user) => (user.id === id.toString()) && (user.usertype === "driver"))[0];
      if (!user) {
        navigate("/404");
      }
      setData(user);
    } else {
      setData([]);
    }
    loaded.current = true;
  }, [staticusers, id, navigate]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Driver tabs"
          className={classes.tabs}
        >
          <Tab
            label={t("info")}
            {...a11yProps(0)}
          />
          <Tab
            label={t("rides")}
            {...a11yProps(1)}
          />
          <Tab
            label={t("cars")}
            {...a11yProps(2)}
          />
          <Tab
            label={t("wallet")}
            {...a11yProps(3)}
          />
          <Tab
            label={t("bankDetails")}
            {...a11yProps(4)}
          />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <DriverInfo />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <UserRides
          data={data}
          tabid={1}
        />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <DriverCars data={data} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <UserWalletDetails data={data} id={1} />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <BankDetails data={data} />
      </TabPanel>

    </Box>
  );
}