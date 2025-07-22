import AlertDialog from "../components/AlertDialog";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Typography, TextField, Button, Grid, Card } from "@mui/material";
import { api } from "common";
import { useTranslation } from "react-i18next";
import CircularLoading from "components/CircularLoading";
import { makeStyles } from "@mui/styles";
import { MAIN_COLOR, SECONDORY_COLOR } from "../common/sharedFunctions";

const useStyles = makeStyles((theme) => ({
  textField: {
    "& label.Mui-focused": {
      color: MAIN_COLOR,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
  },
  rootRtl: {
    "& label": {
      right: 0,
      left: "auto",
      paddingRight: 20
    },
    "& legend": {
      textAlign: "right",
      marginRight: 20
    },
    "& label.Mui-focused": {
      color: MAIN_COLOR,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
  },
  rootRtl_1: {
    "& label": {
      right: 0,
      left: "auto",
      paddingRight: 20
    },
    "& legend": {
      textAlign: "right",
      marginRight: 8
    },
    "& label.Mui-focused": {
      color: MAIN_COLOR,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
  },
  rootRtl_3: {
    "& label": {
      right: 0,
      left: "auto",
      paddingRight: 20
    },
    "& legend": {
      textAlign: "right",
      marginRight: 5
    },
    "& label.Mui-focused": {
      color: MAIN_COLOR,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
  },
  rootRtl_2: {
    "& label": {
      right: 17,
      left: "auto",
      paddingRight: 12
    },
    "& legend": {
      textAlign: "right",
      marginRight: 25
    },
    "& label.Mui-focused": {
      color: MAIN_COLOR,
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiFilledInput-underline:after": {
      borderBottomColor: MAIN_COLOR,
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: MAIN_COLOR,
      },
    },
  },
  selectField_rtl_2: {
    color: "black",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: MAIN_COLOR,
    },
    "& label": {
      right: 50,
      left: "auto",
      paddingRight: 12,
    },
    "& legend": {
      textAlign: "right",
      marginRight: 20,
    },
  },
  selectField_rtl_1: {
    color: "black",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: MAIN_COLOR,
    },
    "& label": {
      right: 50,
      left: "auto",
      paddingRight: 12,
    },
    "& legend": {
      textAlign: "right",
      marginRight: 25,
    },
  },

  selectField_rtl: {
    color: "black",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: MAIN_COLOR,
    },
    "& label": {
      right: 50,
      left: "auto",
      paddingRight: 12,
    },
    "& legend": {
      textAlign: "right",
      marginRight: 35,
    },
  },

  right: {
    textAlign: "right", right: 0, left: "auto", paddingRight: 40
  },
  selectField: {
    color: "black",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: MAIN_COLOR,
    },
  },
}));

const AddRiders = () => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addUser, checkUserExists, fetchUsersOnce } = api;
  const [approved, setApproved] = useState("");
  const [officialGuest, setofficialGuest] = useState("")
  const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });
  const [loding, setLoding] = useState(false);
  const [data, setData] = useState({
    email: "",
    mobile: "",
    verifyId: "",
    firstName: "",
    lastName: "",
    approved: "",
    walletBalance: 0,
  });

  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: "" });
  };
  const handleChangeApproved = (event) => {
    setApproved(event.target.value);
    setData({ ...data, approved: event.target.value });
  };

  const handleChangeofficialGuest = (event) => {
    setofficialGuest(event.target.value);
    setData({ ...data, officialGuest: event.target.value });
  }

  const handleInputChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const handelSubmit = () => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!(data.lastName && data.firstName)) {
      setCommonAlert({ open: true, msg: t("proper_input_name") });
    } else if (!re.test(data.email)) {
      setCommonAlert({ open: true, msg: t("proper_email") });
    } else if (!data.mobile) {
      setCommonAlert({ open: true, msg: t("proper_mobile") });
    } else if (!data.verifyId) {
      setCommonAlert({ open: true, msg: t("verifyid_error") });
    } else if (data.approved === "") {
      setCommonAlert({ open: true, msg: t("check approve status") });
    } else {
      new Promise((resolve, reject) => {
        setLoding(true);
        setTimeout(() => {
          checkUserExists(data).then((res) => {
            if (res.users && res.users.length > 0) {
              setCommonAlert({ open: true, msg: t("user_exists") });
              reject(new Error("User already exists"));
            } else if (!(data && data.firstName)) {
              setCommonAlert({ open: true, msg: t("proper_input_name") });
              reject(new Error("Enter proper name"));
            } else if (res.error) {
              setCommonAlert({ open: true, msg: t("email_or_mobile_issue") });
              reject(new Error("Please fill up all the details properly."));
            } else {
              data["usertype"] = "customer";
              data["createdAt"] = new Date().getTime();
              const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
              const reference = [...Array(5)]
                .map((_) => c[~~(Math.random() * c.length)])
                .join("");
              data["referralId"] = reference;
              let role = auth.profile.usertype;
              if (role === "fleetadmin") {
                data["fleetadmin"] = auth.profile.uid;
              } if (role === "company") {
                data["company"] = auth.profile.uid;
                data["bussinesName"] = auth.profile.bussinesName;
              }
              dispatch(addUser(data));
              dispatch(fetchUsersOnce());
              navigate("/users/0");
              resolve();
            }
          }, 600);
        });
      }).catch((e) => {
        // console.error("caught an error:",e)
      }).finally(() => {
        setLoding(false);
      });
    }
  };


  // -------------------- ------------------------------ -------------------------------------------------
  const [role, setRole] = useState(null);
  const staticusers = useSelector((state) => state.usersdata.staticusers);
  const settings = useSelector((state) => state.settingsdata.settings);
  const [companys, setcompanys] = useState([]);
  const [companysObj, setcompanysObj] = useState("");

  useEffect(() => {
    if (auth.profile && auth.profile.usertype) {
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);


  useEffect(() => {
    if (staticusers) {
      if (role === "admin") {
        let arr = staticusers.filter((user) => user.usertype === "company");
        let obj = {};
        let arr2 = [];
        for (let i = 0; i < arr.length; i++) {
          let user = arr[i];
          arr2.push({
            id: user.id,
            desc:
              user.bussinesName +
              " " +
              user.NIT +
              " (" +
              (settings.AllowCriticalEditsAdmin
                ? user.mobile
                : t("hidden_demo")) +
              ") " +
              (settings.AllowCriticalEditsAdmin
                ? user.email
                : t("hidden_demo")),
          });
          obj[user.id] =
            user.bussinesName +
            " " +
            user.NIT +
            " (" +
            (settings.AllowCriticalEditsAdmin
              ? user.mobile
              : t("hidden_demo")) +
            ") " +
            (settings.AllowCriticalEditsAdmin ? user.email : t("hidden_demo"));
        }
        setcompanys(arr2);
        setcompanysObj(obj);
      }
    }
  }, [
    staticusers,
    auth.profile.usertype,
    auth.profile.uid,
    settings.AllowCriticalEditsAdmin,
    role, t
  ]);

  const getKeyByValue = (object, value) => {
    return Object.keys(object).find((key) => object[key] === value);
  };


  const handleChangecompany = (event) => {
    const selectedBussinesName = event.target.value;
    const companyId = getKeyByValue(companysObj, selectedBussinesName);


    setData({
      ...data,
      company: companyId,
      bussinesName: selectedBussinesName
    });
  };



  // -------------------- ------------------------------ -------------------------------------------------





  return loding ? (
    <CircularLoading />
  ) : (
    <div>
      <Card
        style={{
          borderRadius: "19px",
          backgroundColor: "#fff",
          minHeight: 100,
          maxWidth: "75vw",
          marginTop: 20,
          marginBottom: 20,
          padding: 25,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
        }}
      >
        <Typography
          variant="h5"
          style={{
            marginTop: -15,
            textAlign: isRTL === "rtl" ? "right" : "left",
          }}
        >
          {t("add_customer_title")}
        </Typography>
        <div
          dir={isRTL === "rtl" ? "rtl" : "ltr"}
        >
          <Button
            variant="text"
            onClick={() => {
              navigate("/users/0");
            }}
          >
            <Typography
              style={{
                marginBottom: 10,
                textAlign: isRTL === "rtl" ? "right" : "left",
                fontWeight: "bold",
                color: MAIN_COLOR
              }}
            >
              {`<<- ${t("go_back")}`}
            </Typography>
          </Button>
        </div>
        <Grid
          container
          spacing={2}
          sx={{
            direction: isRTL === "rtl" ? "rtl" : "ltr",
            gridTemplateColumns: "50%",
          }}
        >
          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <TextField
              label={t("firstname")}
              id="firstName"
              value={data.firstName}
              fullWidth
              onChange={handleInputChange}
              className={isRTL === "rtl" ? classes.rootRtl_3 : classes.textField}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <TextField
              label={t("last_name")}
              id="lastName"
              value={data.lastName}
              fullWidth
              onChange={handleInputChange}
              className={isRTL === "rtl" ? classes.rootRtl_3 : classes.textField}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <TextField
              label={t("mobile")}
              id="mobile"
              value={data.mobile}
              fullWidth
              onChange={handleInputChange}
              className={isRTL === "rtl" ? classes.rootRtl_2 : classes.textField}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={6}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextField
              label={t("email")}
              id="email"
              value={data.email}
              fullWidth
              onChange={handleInputChange}
              className={isRTL === "rtl" ? classes.rootRtl_1 : classes.textField}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={6}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextField
              label={t("verify_id")}
              id="verifyId"
              value={data?.verifyId}
              fullWidth
              onChange={handleInputChange}
              className={isRTL === "rtl" ? classes.rootRtl : classes.textField}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={6}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FormControl fullWidth style={{ direction: isRTL === "rtl" ? "rtl" : 'ltr' }}>
              <InputLabel
                id="demo-simple-select-label"
                className={isRTL === "rtl" ? classes.right : ""}
                sx={{ "&.Mui-focused": { color: MAIN_COLOR } }}
              >
                {t("approve_status")}
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={approved}
                label={t("approve_status")}
                onChange={handleChangeApproved}
                className={isRTL === "rtl" ? classes.selectField_rtl : classes.selectField}
              >
                <MenuItem style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }} value={true}>{t("approved")}</MenuItem>
                <MenuItem style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }} value={false}>{t("not_approved")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {role !== "company" ? (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={6}
              xl={6}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FormControl fullWidth style={{ direction: isRTL === "rtl" ? "rtl" : 'ltr' }}>
                <InputLabel id="companys" className={isRTL === "rtl" ? classes.right_1 : ""} sx={{ "&.Mui-focused": { color: MAIN_COLOR } }}>{t("companys")}</InputLabel>
                <Select
                  labelId="companys"
                  id="select"
                  value={companysObj[data.company] || ""}
                  label={t("companys")}
                  onChange={handleChangecompany}
                  className={isRTL === "rtl" ? classes.selectField_rtl : classes.selectField}
                >
                  {companys
                    ? companys.map((e) => (
                      <MenuItem style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }} key={e.id} value={companysObj[e.id]}>
                        {e.desc}
                      </MenuItem>
                    ))
                    : null}
                </Select>
              </FormControl>
            </Grid>
          ) : null}


          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={6}
            xl={6}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FormControl fullWidth style={{ direction: isRTL === "rtl" ? "rtl" : 'ltr' }}>
  <InputLabel
    id="demo-simple-select-label"
    className={isRTL === "rtl" ? classes.right : ""}
    sx={{ "&.Mui-focused": { color: MAIN_COLOR } }}
  >
    {t("Funcionario / Huesped")}
  </InputLabel>
  <Select
    labelId="demo-simple-select-label"
    id="demo-simple-select"
    value={officialGuest}
    label={t("Funcionario / Huesped")}
    onChange={handleChangeofficialGuest}
    className={isRTL === "rtl" ? classes.selectField_rtl : classes.selectField}
  >
    <MenuItem style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }} value={false}>{t("Huesped")}</MenuItem>
    <MenuItem style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }} value={true}>{t("Funcionario")}</MenuItem>
  </Select>
</FormControl>

          </Grid>



         {auth.profile.organizations === 'Hotel' ?
          <Grid
          item
          xs={12}
          sm={12}
          md={12}
          lg={6}
          xl={6}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextField
            label={t("habitación")}
            id="rooms"
            value={data?.rooms}
            fullWidth
            onChange={handleInputChange}
            className={isRTL === "rtl" ? classes.rootRtl : classes.textField}
          />
        </Grid>
         :null}

          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginTop={5}
          >
            <Button
              style={{
                borderRadius: "19px",
                backgroundColor: MAIN_COLOR,
                minHeight: 50,
                marginBottom: 20,
                textAlign: "center",
                width: "50%"
              }}
              onClick={handelSubmit}
              variant="contained"
            >
              <Typography
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                {t("submit")}
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Card>
      <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>
        {commonAlert.msg}
      </AlertDialog>
    </div>
  );
};

export default AddRiders;