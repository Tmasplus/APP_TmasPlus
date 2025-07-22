import AlertDialog from "../components/AlertDialog";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Typography, TextField, Button, Grid, Card, useMediaQuery } from "@mui/material";
import { api } from "common";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import CircularLoading from "components/CircularLoading";
import { colors } from "components/Theme/WebTheme";
import { MAIN_COLOR, SECONDORY_COLOR } from "../common/sharedFunctions";
import { makeStyles } from "@mui/styles";
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
  selectField: {
    color: "black",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: MAIN_COLOR,
    },
  },
  rootRtl: {
    "& label": {
      right: 0,
      left: "auto",
      paddingRight: 20,
    },
    "& legend": {
      textAlign: "right",
      marginRight: 37,
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
      paddingRight: 12,
    },
    "& legend": {
      textAlign: "right",
      marginRight: 25,
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
      marginRight: 15,
    },
  },

  right: {
    textAlign: "right",
    right: 0,
    left: "auto",
    paddingRight: 40,
  },
}));
const EditCar = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector((state) => state.settingsdata.settings);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { editCar, updateUserCar } = api;
  const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });
  const [driversObj, setDriversObj] = useState("");
  const [fleetMapObj, setFleetMapObj] = useState([]);
  const [role, setRole] = useState(null);
  const userdata = useSelector((state) => state.usersdata);
  const [drivers, setDrivers] = useState([]);
  const cartypes = useSelector((state) => state.cartypes);
  const carlistdata = useSelector((state) => state.carlistdata);
  const [driverData, setDriverData] = useState(null);
  const [data, setData] = useState(null);
  const [oldData, setOldData] = useState(null);
  const [carTypeAvailable, setCarTypeAvailable] = useState(null);
  const [carData, setCardata] = useState();
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const isMidScreen = useMediaQuery('(max-width:1199px)');

  useEffect(() => {
    if (id) {
      if (carlistdata && carlistdata.cars) {
        const carData = carlistdata.cars.filter(
          (item) => item.id === id.toString()
        )[0];
        if (!carData) {
          navigate("/404");
        }
        setData(carData);
        setOldData(carData);
      }
    } else {
      setData({
        createdAt: new Date().getTime(),
        car_image:
          "https://cdn.pixabay.com/photo/2012/04/13/20/37/car-33556__480.png",
        vehicleNumber: "",
        vehicleMake: "",
        carType: "",
        driver: auth && auth.profile.usertype === "driver" ? auth.profile.uid : "",
        vehicleModel: "",
        other_info: "",
        active: false,
      });
    }
  }, [carlistdata, id, navigate, auth]);

  useEffect(() => {
    if (carlistdata.cars) {
      setCardata(carlistdata.cars);
    } else {
      setCardata([]);
    }
  }, [carlistdata.cars]);

  useEffect(() => {
    const checkCar = cartypes?.cars.filter(
      (item) => item.name === oldData?.carType
    )[0];
    if (checkCar) {
      setCarTypeAvailable(true);
    } else {
      setCarTypeAvailable(false);
    }
  }, [cartypes, oldData]);

  useEffect(() => {
    if (role !== "driver" && userdata.users) {
      let arr = userdata.users.filter(
        (user) =>
          user.usertype === "driver" &&
          ((role === "fleetadmin" &&
            user.fleetadmin &&
            user.fleetadmin === auth.profile.uid) ||
            role === "admin")
      );
      let obj = {};
      let obj2 = {};
      let arr2 = [];
      for (let i = 0; i < arr.length; i++) {
        let user = arr[i];
        arr2.push({
          id: user.id,
          desc:
            user.firstName +
            " " +
            user.lastName +
            " (" +
            (settings.AllowCriticalEditsAdmin
              ? user.mobile
              : t("hidden_demo")) +
            ") " +
            (settings.AllowCriticalEditsAdmin ? user.email : t("hidden_demo")),
        });
        obj[user.id] =
          user.firstName +
          " " +
          user.lastName +
          " (" +
          (settings.AllowCriticalEditsAdmin ? user.mobile : t("hidden_demo")) +
          ") " +
          (settings.AllowCriticalEditsAdmin ? user.email : t("hidden_demo"));
        obj2[user.id] = user.fleetadmin ? user.fleetadmin : null;
      }
      setDrivers(arr2);
      setDriversObj(obj);
      setFleetMapObj(obj2);
    }
  }, [
    userdata.users,
    settings.AllowCriticalEditsAdmin,
    role,
    auth.profile.uid,
    t,
  ]);

  useEffect(() => {
    setDriverData(
      auth.profile.firstName +
      " " +
      auth.profile.lastName +
      " (" +
      (settings.AllowCriticalEditsAdmin
        ? auth.profile.mobile
        : t("hidden_demo")) +
      ") " +
      (settings.AllowCriticalEditsAdmin
        ? auth.profile.email
        : t("hidden_demo"))
    );
  }, [
    auth.profile.lastName,
    auth.profile.mobile,
    auth.profile.email,
    settings.AllowCriticalEditsAdmin,
    auth.profile.firstName,
    t,
  ]);

  useEffect(() => {
    if (auth.profile && auth.profile.usertype) {
      setRole(auth.profile.usertype);
    }
  }, [auth.profile]);

  const handleChangeApproved = (event) => {
    setData({ ...data, approved: event.target.value });
  };

  const handlevehicleMetalup = (event) => {
    setData({ ...data, vehicleMetalup: event.target.value });
  }

  const handlechanguevehicleNoMotor = (event) => {
    setData({ ...data, vehicleNoMotor: event.target.value });
  }


  const handleCilindraje = (event) => {
    setData({ ...data, vehicleCylinders: event.target.value });
  }

  const hndlevehicleFuel = (event) => {
    setData({ ...data, vehicleFuel: event.target.value });
  }

  const handlevehicleDoors = (event) => {
    setData({ ...data, vehicleDoors: event.target.value });
  }

  const handlevehicleLine = (event) => {
    setData({ ...data, vehicleLine: event.target.value });
  }

  const handleVehicleNoSerie = (event) => {
    setData({ ...data, vehicleNoSerie: event.target.value });
  }

  const handleColor = (event) => {
    setData({ ...data, vehicleColor: event.target.value });
  }

  const handlevehicleNoVin = (event) => {
    setData({ ...data, vehicleNoVin: event.target.value });
  }

  const handlevehicleNoChasis = (event) => {
    setData({ ...data, vehicleNoChasis: event.target.value });
  }

  const handlevehiclePassengers = (event) => {
    setData({ ...data, vehiclePassengers: event.target.value });
  }

  const handlevehicleForm = (event) => {
    setData({ ...data, vehicleForm: event.target.value });
  }

  const handleMarkeChangue = (event) => {
    setData({ ...data, vehicleMake: event.target.value });
  }

  const handleChangueModel = (event) => {
    setData({ ...data, vehicleModel: event.target.value });
  }


  const getKeyByValue = (object, value) => {
    return Object.keys(object).find((key) => object[key] === value);
  };
  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: "" });
  };

  const handelChangeDriver = (event) => {
    setData({ ...data, driver: getKeyByValue(driversObj, event.target.value) });
  };
  const handelChangeCarType = (event) => {
    setData({ ...data, carType: event.target.value });
  };
  const handleInputChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const updateCar = () => {
    settings.AllowCriticalEditsAdmin
      ? new Promise((resolve) => {
        setLoading(true);
        setTimeout(() => {
          resolve();
          if (data !== oldData) {
            data['fleetadmin'] = data['driver'] ? (fleetMapObj[data['driver']] ? fleetMapObj[data['driver']] : null) : null;
            delete data.tableData;
            dispatch(editCar(data, "Update"));
            if (data.driver !== oldData.driver && oldData.driver) {
              dispatch(updateUserCar(oldData.driver,
                {
                  carType: null,
                  vehicleNumber: null,
                  vehicleMake: null,
                  vehicleModel: null,
                  other_info: null,
                  car_image: null,
                  updateAt: new Date().getTime(),
                })
              );
            }
            setLoading(false);
            navigate("/cars");
          } else {
            setLoading(false);
            setCommonAlert({ open: true, msg: t("make_changes_to_update") });
          }
        }, 600);
      })
      : new Promise((resolve) => {
        setTimeout(() => {
          resolve();
          setLoading(false);
          setCommonAlert({ open: true, msg: t("demo_mode") });
        }, 600);
      });
  };

  const addCar = () => {
    if (settings.AllowCriticalEditsAdmin) {
      if (!data.vehicleNumber) {
        setCommonAlert({ open: true, msg: t("car_no_not_found") });
      } else if (!data.vehicleMake) {
        setCommonAlert({ open: true, msg: t("vehicleMake_required") });
      } else if (!data.vehicleModel) {
        setCommonAlert({ open: true, msg: t("vehicleModel_required") });
      } else if (!data.driver) {
        setCommonAlert({ open: true, msg: t("driver_required") });
      } else if (!data.carType) {
        setCommonAlert({ open: true, msg: t("carType_required") });
      } else {
        setLoading(true);
        new Promise(resolve => {
          setTimeout(() => {
            let activeCar = null;
            let updateData = {
              carType: data.carType,
              vehicleNumber: data.vehicleNumber,
              vehicleMake: data.vehicleMake,
              vehicleModel: data.vehicleModel,
              other_info: data.other_info,
              car_image: data.car_image,
              updateAt: new Date().getTime()
            }
            for (let i = 0; i < carData.length; i++) {
              if (carData[i].driver === data.driver && carData[i].active) {
                activeCar = carData[i];
                break;
              }
            }
            if (activeCar && data.active) {
              activeCar.active = false;
              dispatch(editCar(activeCar, "Update"));
              dispatch(updateUserCar(data.driver, updateData));
            } else if (activeCar && !data.active) {
              data.active = false;
            } else {
              data.active = true;
              dispatch(updateUserCar(data.driver, updateData));
            }
            data['createdAt'] = new Date().getTime();
            data['fleetadmin'] = data['driver'] ? (fleetMapObj[data['driver']] ? fleetMapObj[data['driver']] : null) : null;
            if (!settings.carApproval) {
              data['approved'] = true;
              if (data.active) {
                dispatch(updateUserCar(data.driver, { carApproved: true }));
              }
            } else {
              data['approved'] = false;
            }
            dispatch(editCar(data, "Add"));
            navigate("/cars");
            setLoading(false);
            resolve();
          }, 600);
        })

      }
    } else {
      setCommonAlert({ open: true, msg: t('demo_mode') });
      setLoading(false);
    }
  };

  return loading ? (
    <CircularLoading />
  ) : (
    <>
      <div>
        <Card
          style={{
            borderRadius: "19px",
            backgroundColor: colors.WHITE,
            minHeight: 100,
            maxWidth: "75vw",
            marginTop: 20,
            marginBottom: 20,
            padding: 20,
            boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
          }}
        >
          <Typography
            variant="h5"
            style={{
              margin: "10px 10px 0 5px",
              textAlign: isRTL === "rtl" ? "right" : "left",
            }}
          >
            {t("update_car_title")}
          </Typography>
          <div
            dir={isRTL === "rtl" ? "rtl" : "ltr"}
          >
            <Button
              variant="text"
              onClick={() => {
                navigate("/cars");
              }}
            >
              <Typography
                style={{
                  margin: "10px 10px 0 5px",
                  textAlign: isRTL === "rtl" ? "right" : "left",
                  fontWeight: "bold",
                  color: MAIN_COLOR,
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
              gridTemplateColumns: "50%",
              rowGap: "20px",
              marginY: 1,
              direction: isRTL === "rtl" ? "rtl" : "ltr",
            }}
          >
            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <TextField
                label={t("vehicle_reg_no")}
                id={"vehicleNumber"}
                value={data?.vehicleNumber || ""}
                fullWidth
                onChange={handleInputChange}
                className={
                  isRTL === "rtl" ? classes.rootRtl_2 : classes.textField
                }
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <FormControl fullWidth>
                <InputLabel>{"Marca del Vehículo"}</InputLabel>
                <Select
                  value={data?.vehicleMake || ""}
                  onChange={handleMarkeChangue}
                  label={t("vehicleMake")}
                  className={
                    isRTL === "rtl"
                      ? classes.selectField_rtl_2
                      : classes.selectField
                  }
                >
                  <MenuItem value='Brilliance'> 'Brilliance' </MenuItem>
                  <MenuItem value='Byd'> 'Byd' </MenuItem>
                  <MenuItem value='Chana'> 'Chana' </MenuItem>
                  <MenuItem value='Changan'> 'Changan' </MenuItem>
                  <MenuItem value='Chery'> 'Chery' </MenuItem>
                  <MenuItem value='Chery Tiggo'> 'Chery Tiggo' </MenuItem>
                  <MenuItem value='Chevrolet'> 'Chevrolet' </MenuItem >
                  <MenuItem value='Chevrolet Aveo'> 'Chevrolet Aveo' </MenuItem>
                  <MenuItem value='Chevrolet Beat'> 'Chevrolet Beat' </MenuItem>
                  <MenuItem value='Chevrolet Camaro'> 'Chevrolet Camaro' </MenuItem>
                  <MenuItem value='Chevrolet Captiva'> 'Chevrolet Captiva' </MenuItem>
                  <MenuItem value='Chevrolet Corsa'> 'Chevrolet Corsa' </MenuItem>
                  <MenuItem value='Chevrolet Cruze'> 'Chevrolet Cruze' </MenuItem>
                  <MenuItem value='Chevrolet Optra'> 'Chevrolet Optra' </MenuItem>
                  <MenuItem value='Chevrolet Sail'> 'Chevrolet Sail' </MenuItem>
                  <MenuItem value='Chevrolet Sonic'> 'Chevrolet Sonic' </MenuItem>
                  <MenuItem value='Chevrolet Spark'> 'Chevrolet Spark' </MenuItem>
                  <MenuItem value='Chevrolet Swift'> 'Chevrolet Swift' </MenuItem>
                  <MenuItem value='Chevrolet Tracker'> 'Chevrolet Tracker' </MenuItem>
                  <MenuItem value='Citroen'> 'Citroen' </MenuItem>
                  <MenuItem value='Dfsk'> 'Dfsk' </MenuItem>
                  <MenuItem value='Dodge'> 'Dodge' </MenuItem>
                  <MenuItem value='BYD ELÉCTRICO'> 'BYD ELÉCTRICO' </MenuItem>
                  <MenuItem value='FAW'> 'FAW' </MenuItem>
                  <MenuItem value='Fiat'> 'Fiat' </MenuItem>
                  <MenuItem value='Ford'> 'Ford' </MenuItem>
                  <MenuItem value='Ford Ecosport'> 'Ford Ecosport' </MenuItem>
                  <MenuItem value='Ford Fiesta'> 'Ford Fiesta' </MenuItem>
                  <MenuItem value='Fotton'> 'Fotton' </MenuItem>
                  <MenuItem value='Geely'> 'Geely' </MenuItem>
                  <MenuItem value='Great'> 'Great' </MenuItem>
                  <MenuItem value='Honda'> 'Honda' </MenuItem>
                  <MenuItem value='Honda Civic'> 'Honda Civic' </MenuItem>
                  <MenuItem value='Hyundai'> 'Hyundai' </MenuItem>
                  <MenuItem value='Hyundai Accent'> 'Hyundai Accent' </MenuItem>
                  <MenuItem value='Hyundai I10'> 'Hyundai I10' </MenuItem>
                  <MenuItem value='Hyundai I25'> 'Hyundai I25' </MenuItem>
                  <MenuItem value='Hyundai Tucson'> 'Hyundai Tucson' </MenuItem>
                  <MenuItem value='Iveco'> 'Inveco' </MenuItem>
                  <MenuItem value='Jac'> 'Jac' </MenuItem>
                  <MenuItem value='Jac S2'> 'Jac S2' </MenuItem>
                  <MenuItem value='Kia'> 'Kia' </MenuItem>
                  <MenuItem value='Kia '> 'Kia ' </MenuItem>
                  <MenuItem value='Kia Carens'> 'Kia Carens' </MenuItem>
                  <MenuItem value='Kia Cerato'> 'Kia Cerato' </MenuItem>
                  <MenuItem value='Kia Picanto'> 'Kia Picanto' </MenuItem>
                  <MenuItem value='Kia Rio'> 'Kia Rio' </MenuItem>
                  <MenuItem value='Kia Soul'> 'Kia Soul' </MenuItem>
                  <MenuItem value='Kia Sportage'> 'Kia Sportage' </MenuItem>
                  <MenuItem value='Lifan'> 'Lifan' </MenuItem>
                  <MenuItem value='Mahindra'> 'Mahindra' </MenuItem>
                  <MenuItem value='Mazda'> 'Mazda' </MenuItem>
                  <MenuItem value='Mazda 2'> 'Mazda 2' </MenuItem>
                  <MenuItem value='Mazda 3'> 'Mazda 3' </MenuItem>
                  <MenuItem value='Mazda 6'> 'Mazda 6' </MenuItem>
                  <MenuItem value='Mazda Bt 50'> 'Mazda Bt 50' </MenuItem>
                  <MenuItem value='Mg'> 'Mg' </MenuItem>
                  <MenuItem value='Mitsubishi'> 'Mitsubishi' </MenuItem>
                  <MenuItem value='Nissan'> 'Nissan' </MenuItem>
                  <MenuItem value='Nissan '> 'Nissan ' </MenuItem>
                  <MenuItem value='Nissan March'> 'Nissan March' </MenuItem>
                  <MenuItem value='Nissan Sentra'> 'Nissan Sentra' </MenuItem>
                  <MenuItem value='Nissan Tiida'> 'Nissan Tiida' </MenuItem>
                  <MenuItem value='Nissan Versa'> 'Nissan Versa' </MenuItem>
                  <MenuItem value='Nissan X Trail'> 'Nissan X Trail' </MenuItem>
                  <MenuItem value='Peugeot'> 'Peugeot' </MenuItem>
                  <MenuItem value='Renault'> 'Renault' </MenuItem>
                  <MenuItem value='Renault Clio'> 'Renault Clio' </MenuItem>
                  <MenuItem value='Renault Duster'> 'Renault Duster' </MenuItem>
                  <MenuItem value='Renault Koleos'> 'Renault Koleos' </MenuItem>
                  <MenuItem value='Renault Kwid'> 'Renault Kwid' </MenuItem>
                  <MenuItem value='Renault Logan'> 'Renault Logan' </MenuItem>
                  <MenuItem value='Renault Sandero'> 'Renault Sandero' </MenuItem>
                  <MenuItem value='Renault Stepway'> 'Renault Stepway' </MenuItem>
                  <MenuItem value='Renault Symbol'> 'Renault Symbol' </MenuItem>
                  <MenuItem value='Saic Wuling'> 'Saic Wuling' </MenuItem>
                  <MenuItem value='Sail'> 'Sail' </MenuItem>
                  <MenuItem value='Seat'> 'Seat' </MenuItem>
                  <MenuItem value='Skoda'> 'Skoda' </MenuItem>
                  <MenuItem value='Spark'> 'Spark' </MenuItem>
                  <MenuItem value='Ssang Yong'> 'Ssang Yong' </MenuItem>
                  <MenuItem value='Suzuki'> 'Suzuki' </MenuItem>
                  <MenuItem value='Suzuki Jimny'> 'Suzuki Jimny' </MenuItem>
                  <MenuItem value='Suzuki Swift'> 'Suzuki Swift' </MenuItem>
                  <MenuItem value='Suzuky'> 'Suzuky' </MenuItem>
                  <MenuItem value='Toyota'> 'Toyota' </MenuItem>
                  <MenuItem value='Toyota Corolla'> 'Toyota Corolla' </MenuItem>
                  <MenuItem value='Volkswagen'> 'Volkswagen' </MenuItem>
                  <MenuItem value='Volkswagen Gol'> 'Volkswagen Gol' </MenuItem>
                  <MenuItem value='Volkswagen Voyage'> 'Volkswagen Voyage' </MenuItem>
                  <MenuItem value='Zotye'> 'Zotye' </MenuItem>
                  <MenuItem value='Otra'> 'Otra' </MenuItem>
                </Select >
              </FormControl >









            </Grid >
            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>

              <FormControl fullWidth>
                <InputLabel>Modelo</InputLabel>
                <Select
                  value={data?.vehicleModel || ""}
                  onChange={handleChangueModel}
                  label={t("vehicle_model_no")}
                  className={
                    isRTL === "rtl"
                      ? classes.selectField_rtl_2
                      : classes.selectField
                  }
                >
                  <MenuItem value='2006'>  2006 </MenuItem>
                  <MenuItem value='2007'>  2007 </MenuItem>
                  <MenuItem value='2008'>  2008 </MenuItem>
                  <MenuItem value='2009'>  2009 </MenuItem>
                  <MenuItem value='2010'>  2010 </MenuItem>
                  <MenuItem value='2011'>  2011 </MenuItem>
                  <MenuItem value='2012'>  2012 </MenuItem>
                  <MenuItem value='2013'>  2013 </MenuItem>
                  <MenuItem value='2014'>  2014 </MenuItem>
                  <MenuItem value='2015'>  2015 </MenuItem>
                  <MenuItem value='2016'>  2016 </MenuItem>
                  <MenuItem value='2017'>  2017 </MenuItem>
                  <MenuItem value='2018'>  2018 </MenuItem>
                  <MenuItem value='2019'>  2019 </MenuItem>
                  <MenuItem value='2020'>  2020 </MenuItem>
                  <MenuItem value='2021'>  2021 </MenuItem>
                  <MenuItem value='2022'>  2022 </MenuItem>
                  <MenuItem value='2023'>  2023 </MenuItem>
                  <MenuItem value='2024'>  2024 </MenuItem>

                </Select>
              </FormControl>

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
              <FormControl
                fullWidth
                style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
              >
                <InputLabel
                  id="demo-simple-select-label"
                  className={isRTL === "rtl" ? classes.right : ""}
                  sx={{ "&.Mui-focused": { color: MAIN_COLOR } }}
                >
                  {t("driver")}
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={
                    role === "fleetadmin"
                      ? driversObj[data?.driver] || ""
                      : role === "driver"
                        ? auth.profile.id
                        : role === "admin"
                          ? driversObj[data?.driver] || ""
                          : ""
                  }
                  disabled={role === "driver" ? true : false}
                  label={t("driver")}
                  onChange={handelChangeDriver}
                  className={
                    isRTL === "rtl"
                      ? classes.selectField_rtl
                      : classes.selectField
                  }
                >
                  {role === "admin" ? (
                    drivers ? (
                      drivers
                        .sort((a, b) => a.desc.localeCompare(b.desc)) // Ordena alfabéticamente
                        .map((e) => (
                          <MenuItem
                            key={e.id}
                            style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
                            value={driversObj[e.id]}
                          >
                            {e.desc}
                          </MenuItem>
                        ))
                    ) : null
                  ) : role === "driver" ? (
                    <MenuItem
                      style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
                      value={auth.profile.id}
                    >
                      {driverData}
                    </MenuItem>
                  ) : role === "fleetadmin" ? (
                    drivers ? (
                      drivers
                        .sort((a, b) => a.desc.localeCompare(b.desc)) // Ordena alfabéticamente
                        .map((e) => (
                          <MenuItem
                            key={e.id}
                            style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
                            value={driversObj[e.id]}
                          >
                            {e.desc}
                          </MenuItem>
                        ))
                    ) : null
                  ) : null}
                </Select>
              </FormControl>
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
              <FormControl
                fullWidth
                style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
              >
                <InputLabel
                  id="demo-simple-select-label"
                  className={isRTL === "rtl" ? classes.right : ""}
                  sx={{ "&.Mui-focused": { color: MAIN_COLOR } }}
                >
                  {t("car_type")}
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={data?.carType || ""}
                  label={t("car_type")}
                  onChange={handelChangeCarType}
                  className={
                    isRTL === "rtl"
                      ? classes.selectField_rtl_1
                      : classes.selectField
                  }
                >
                  {!carTypeAvailable ? (
                    <MenuItem
                      value={oldData?.carType}
                      style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
                    >
                      {oldData?.carType}
                    </MenuItem>
                  ) : null}
                  {cartypes?.cars
                    ? cartypes.cars.map((e) => (
                      <MenuItem
                        key={e.id}
                        value={e.name}
                        style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
                      >
                        {e.name}
                      </MenuItem>
                    ))
                    : null}
                </Select>
              </FormControl>
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
              <FormControl
                fullWidth
                style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
              >
                <InputLabel
                  id="demo-simple-select-label"
                  className={isRTL === "rtl" ? classes.right : ""}
                  sx={{ "&.Mui-focused": { color: MAIN_COLOR } }}
                >
                  {t("approved")}
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={data?.approved || false}
                  label={t("approved")}
                  onChange={handleChangeApproved}
                  className={
                    isRTL === "rtl"
                      ? classes.selectField_rtl_2
                      : classes.selectField
                  }
                >
                  <MenuItem
                    value={true}
                    style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
                  >
                    {t("approved")}
                  </MenuItem>
                  <MenuItem
                    value={false}
                    style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
                  >
                    {t("not_approved")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>{" "}

            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>


              <FormControl fullWidth>
                <InputLabel>Tipo de Carrocería</InputLabel>
                <Select
                  value={data?.vehicleMetalup || ""}
                  onChange={handlevehicleMetalup}
                  label={t("vehicleMetalup")}
                  className={
                    isRTL === "rtl"
                      ? classes.selectField_rtl_2
                      : classes.selectField
                  }
                >
                  <MenuItem value="4x4">4x4</MenuItem>
                  <MenuItem value="Cerrada">Cerrada</MenuItem>
                  <MenuItem value="COUPÉ">COUPÉ</MenuItem>
                  <MenuItem value="Doble Cabina">Doble Cabina</MenuItem>
                  <MenuItem value="Hatch Back">Hatch Back</MenuItem>
                  <MenuItem value="MiniVan">MiniVan</MenuItem>
                  <MenuItem value="CROSSOVER">CROSSOVER</MenuItem>
                  <MenuItem value="Sedán">Sedán</MenuItem>
                  <MenuItem value="Station Wagon">Station Wagon</MenuItem>
                  <MenuItem value="VAN">VAN</MenuItem>
                  <MenuItem value="Wagon">Wagon</MenuItem>
                </Select>
              </FormControl>

            </Grid>


            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <TextField
                label={t("vehicleNoMotor")}
                id={"vehicleNoMotor"}
                value={data?.vehicleNoMotor || ""}
                fullWidth
                onChange={handlechanguevehicleNoMotor}
                className={
                  isRTL === "rtl" ? classes.rootRtl_2 : classes.textField
                }
              />
            </Grid>



            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <FormControl fullWidth>
                <InputLabel>Cilindraje</InputLabel>
                <Select
                  value={data?.vehicleCylinders || ""}
                  onChange={handleCilindraje}
                  label={t("Cilindraje")}
                  className={
                    isRTL === "rtl"
                      ? classes.selectField_rtl_2
                      : classes.selectField
                  }
                >
                  <MenuItem value='Menos de 1.0' > 'Menos de 1.0L' </MenuItem>
                  <MenuItem value='1.0L - 1.4L' > '1.0L - 1.4L' </MenuItem>
                  <MenuItem value='1.5L - 1.9L' > '1.5L - 1.9L' </MenuItem>
                  <MenuItem value='2.0L - 2.4L' > '2.0L - 2.4L' </MenuItem>
                  <MenuItem value='2.5L - 2.9L' > '2.5L - 2.9L' </MenuItem>
                  <MenuItem value='3.0L - 3.4L' > '3.0L - 3.4L' </MenuItem>
                  <MenuItem value='3.5L - 3.9L' > '3.5L - 3.9L' </MenuItem>
                  <MenuItem value='4.0L - 4.4L' > '4.0L - 4.4L' </MenuItem>
                  <MenuItem value='4.5L - 4.9L' > '4.5L - 4.9L' </MenuItem>
                  <MenuItem value='Más de 5.0L' > 'Más de 5.0L' </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Combustible</InputLabel>
                <Select
                  value={data?.vehicleFuel || ""}
                  onChange={hndlevehicleFuel}
                  label={t("vehicleFuel")}
                  className={
                    isRTL === "rtl"
                      ? classes.selectField_rtl_2
                      : classes.selectField
                  }
                >
                  <MenuItem value="Gasolina">GASOLINA</MenuItem>
                  <MenuItem value="Diesel">DIESEL</MenuItem>
                  <MenuItem value="Electrico">Electrico</MenuItem>
                  <MenuItem value="Gas">GAS</MenuItem>
                  <MenuItem value="GasolGas">Gas/Gasol</MenuItem>
                  <MenuItem value="GasolElect">Gasol/Elec</MenuItem>
                </Select>
              </FormControl>

            </Grid>


            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <TextField
                label={t("vehicleDoors")}
                id={"vehicleDoors"}
                value={data?.vehicleDoors || ""}
                fullWidth
                onChange={handlevehicleDoors}
                className={
                  isRTL === "rtl" ? classes.rootRtl_2 : classes.textField
                }
              />
            </Grid>


            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <TextField
                label={t("vehicleLine")}
                id={"vehicleLine"}
                value={data?.vehicleLine || ""}
                fullWidth
                onChange={handlevehicleLine}
                className={
                  isRTL === "rtl" ? classes.rootRtl_2 : classes.textField
                }
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <TextField
                label={t("Color del Vehículo")}
                id={"vehicleColor"}
                value={data?.vehicleColor || ""}
                fullWidth
                onChange={handleColor}
                className={
                  isRTL === "rtl" ? classes.rootRtl_2 : classes.textField
                }
              />
            </Grid>


            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <TextField
                label={t("N° Serie")}
                id={"vehicleNoSerie"}
                value={data?.vehicleNoSerie || ""}
                fullWidth
                onChange={handleVehicleNoSerie}
                className={
                  isRTL === "rtl" ? classes.rootRtl_2 : classes.textField
                }
              />
            </Grid>


            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <TextField
                label={t("Vin")}
                id={"vehicleNoVin"}
                value={data?.vehicleNoVin || ""}
                fullWidth
                onChange={handlevehicleNoVin}
                className={
                  isRTL === "rtl" ? classes.rootRtl_2 : classes.textField
                }
              />
            </Grid>


            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <TextField
                label={t("Chasis")}
                id={"vehicleNoChasis"}
                value={data?.vehicleNoChasis || ""}
                fullWidth
                onChange={handlevehicleNoChasis}
                className={
                  isRTL === "rtl" ? classes.rootRtl_2 : classes.textField
                }
              />
            </Grid>



            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <TextField
                label={t("vehiclePassengers")}
                id={"vehiclePassengers"}
                value={data?.vehiclePassengers || ""}
                fullWidth
                onChange={handlevehiclePassengers}
                className={
                  isRTL === "rtl" ? classes.rootRtl_2 : classes.textField
                }
              />
            </Grid>


            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
              <FormControl fullWidth>
                <InputLabel>Clase de vehículo</InputLabel>
                <Select
                  value={data?.vehicleForm || ""}
                  onChange={handlevehicleForm}
                  label="Clase de vehículo"
                  className={
                    isRTL === "rtl"
                      ? classes.selectField_rtl_2
                      : classes.selectField
                  }
                >
                  <MenuItem style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }} value="Automovil">Automovil</MenuItem>
                  <MenuItem style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }} value="Camioneta">Camioneta</MenuItem>
                  <MenuItem style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }} value="VAN">VAN</MenuItem>
                  <MenuItem style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }} value="Microbus">Microbus</MenuItem>
                  <MenuItem style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }} value="Campero">Campero</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}
              display="flex"
              justifyContent="center"
              alignItems="center">
              <Button
                style={{
                  borderRadius: "19px",
                  backgroundColor: MAIN_COLOR,
                  minHeight: 50,
                  width: (isMidScreen ? '100%' : '50%'),
                  textAlign: "center",
                }}
                onClick={() => {
                  if (id) {
                    updateCar();
                  } else {
                    addCar();
                  }
                }}
                variant="contained"
              >
                <Typography
                  style={{
                    color: colors.WHITE,
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {id ? t("update") : t("add")}
                </Typography>
              </Button>
            </Grid>
          </Grid >
        </Card >
        <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>
          {commonAlert.msg}
        </AlertDialog>
      </div >
    </>
  );
};

export default EditCar;
