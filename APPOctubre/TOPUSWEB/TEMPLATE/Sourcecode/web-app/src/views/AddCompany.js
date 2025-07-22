import React, { useState, useRef, useEffect } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Typography, TextField, Button, Grid, Card, Avatar, FormControl, useMediaQuery } from "@mui/material";
import { api } from "common";
import { useTranslation } from "react-i18next";
import CircularLoading from "components/CircularLoading";
import { makeStyles } from "@mui/styles";
import { MAIN_COLOR, SECONDORY_COLOR } from "../common/sharedFunctions";
import { useParams } from "react-router-dom";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AlertDialog from "../components/AlertDialog";

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
            right: 10,
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
    rootRtl_3: {
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
    rootRtl_2: {
        "& label": {
            right: 5,
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
            right: 10,
            left: "auto",
            paddingRight: 20
        },
        "& legend": {
            textAlign: "right",
            marginRight: 15
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

    selectField_rtl: {
        color: "black",
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: MAIN_COLOR,
        },
        "& label": {
            right: 0,
            left: "auto",

        },
        "& legend": {
            textAlign: "right",
            marginRight: 35,
        },
    },

    right: {
        textAlign: "right", right: 0, left: "auto", paddingRight: 40
    },
    right_1: {
        textAlign: "right", right: 0, left: "auto", paddingRight: 45
    },


    selectField: {
        color: "black",
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: MAIN_COLOR,
        },
    },
}));
 
function AddCompany() {
    const { id, usertype } = useParams();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir();
    const staticusers = useSelector((state) => state.usersdata.staticusers);
    const settings = useSelector((state) => state.settingsdata.settings);
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loaded = useRef(false);
    const fileInputRef = useRef();
    const { editUser, fetchUsersOnce, updateCustomerProfileImage, checkUserExists, addUser } = api;
    const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });
    const [data, setData] = useState(null);
    const [oldData, setOldData] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const classes = useStyles();
    const [approved, setApproved] = useState(false);
    const isMidScreen = useMediaQuery('(max-width:1199px)');

    useEffect(() => {
        dispatch(fetchUsersOnce());
    }, [dispatch, fetchUsersOnce]);

    useEffect(() => {
        if (id && usertype) {
            if (staticusers) {
                const user = staticusers.filter(
                    (user) => user.id === id.toString() && user.usertype === usertype.toString()
                )[0];
                if (!user) {
                    navigate("/404");
                }
                setData(user);
                setOldData(user);
            }
        } else {
            setData([]);
        }
        loaded.current = true;
    }, [staticusers, id, navigate, usertype]);



    const profileImageChange = async (e) => {
        setProfileImage(e.target.files[0]);
    };

    const handleCommonAlertClose = (e) => {
        e.preventDefault();
        setCommonAlert({ open: false, msg: "" });
    };

    const handleInputChange = (e) => {
        setData({ ...data, [e.target.id]: e.target.value });
    };

    const handleChangeApproved = (event) => {
        setApproved(event.target.value);
        setData({ ...data, approved: event.target.value });
    };


    
    const navigateToInfo = () => {
        setTimeout(() => {
            setProfileImage(null);
            if (usertype === "customer") {
                navigate(`/users/customerdetails/${data.id}`);
            } else if (usertype === "driver") {
                navigate(`/users/driverdetails/${data.id}`);
            } else if (usertype === "company") {
                navigate("/users/2");
            } else if (usertype === "admin") {
                navigate("/users/3");
            }
            setLoading(false);
        }, 1000);
    }
    const handleUpdate = () => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!(data.NIT && data.bussinesName)) {
            setCommonAlert({ open: true, msg: "Introduce los campos de NIT o Razón social correctamente" });
        } else if (!re.test(data.email)) {
            setCommonAlert({ open: true, msg: t("proper_email") });
        } else if (!data.mobile) {
            setCommonAlert({ open: true, msg: t("proper_mobile") });
        } else {
            if (settings.AllowCriticalEditsAdmin) {
                setLoading(true);

                if (profileImage) {
                    updateCustomerProfileImage(profileImage, data.id).then(() => {
                        dispatch(fetchUsersOnce());
                        navigateToInfo()
                    });
                }
                if (
                    JSON.stringify(oldData) !== JSON.stringify(data) &&
                    Object.keys(data).length !== 0
                ) {
                    dispatch(editUser(data.id, { ...data }));
                    dispatch(fetchUsersOnce());
                    navigateToInfo()
                }
                if (
                    JSON.stringify(oldData) === JSON.stringify(data) &&
                    (!profileImage && Object.keys(data).length === 0)
                ) {
                    setCommonAlert({ open: true, msg: t("make_changes_to_update") });
                    setLoading(false);
                }

            } else {
                setCommonAlert({ open: true, msg: t('demo_mode') });
            }
            loaded.current = true;
        }
    };


    const handleAdd = () => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!(data.NIT && data.bussinesName)) {
            setCommonAlert({ open: true, msg: t("proper_input_name") });
        } else if (!re.test(data.email)) {
            setCommonAlert({ open: true, msg: t("proper_email") });
        } else if (!data.mobile) {
            setCommonAlert({ open: true, msg: t("proper_mobile") });
        } else {
            new Promise((resolve, reject) => {
                setLoading(true);
                setTimeout(() => {
                    checkUserExists(data).then((res) => {
                        if (res.users && res.users.length > 0) {
                            setCommonAlert({ open: true, msg: t("user_exists") });
                            reject(new Error("User already exists"));
                        } else if (res.error) {
                            setCommonAlert({ open: true, msg: t("email_or_mobile_issue") });
                            reject(new Error("Email or Mobile issue"));
                        } else {
                            const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                            const reference = [...Array(5)]
                                .map((_) => c[~~(Math.random() * c.length)])
                                .join("");
                            data["createdAt"] = new Date().getTime();
                            let role = auth.profile.usertype;
                            data['approved'] = approved;
                            data['walletBalance'] = 0;
                            if (usertype === "customer") {
                                data["usertype"] = "customer";
                                data["referralId"] = reference;
                                if (role === "company") {
                                    data["company"] = auth.profile.uid;
                                }
                                resolve();
                            } else if (usertype === "driver") {
                                data["driverActiveStatus"] = false;
                                data["usertype"] = "driver";
                                data["referralId"] = reference;
                                data["queue"] = false;
                                if (role === "company") {
                                    data["company"] = auth.profile.uid;
                                }
                                if (approved === true) {
                                    data['adminApprovedTrue'] = true;
                                } else {
                                    data['adminApprovedTrue'] = false;
                                }
                                resolve();
                            } else if (usertype === "company") {
                                data["usertype"] = "company";
                                data["createdAt"] = new Date().getTime();
                                resolve();
                            } else if (usertype === "admin") {
                                data["usertype"] = usertype.toString();
                                data["createdAt"] = new Date().getTime();
                                data["approved"] = true;
                                resolve();
                            } else {
                                reject(new Error("Invalid usertype Add"));
                                setCommonAlert({ open: true, msg: t("invalid_userType_add") });
                            }
                            dispatch(addUser(data));
                            dispatch(fetchUsersOnce());
                            handleBackNavigation()

                        }
                    }, 600);
                });
            }).catch((e) => {
                console.error("caught an error:", e)
            }).finally(() => {
                setLoading(false);
            });
        }
    };

    const handleBackNavigation = () => {
        if (usertype === "customer") {
            navigate("/users/0");
        } else if (usertype === "driver") {
            navigate("/users/1");
        } else if (usertype === "company") {
            navigate("/users/4");
        } else if (usertype === "admin") {
            navigate("/users/3");
        }
    }

    const isDriverOrcompany = usertype === "driver" || usertype === "company";
    const isNotAdmin = auth.profile.usertype === 'company' || auth.profile.usertype === 'driver';

    return loading ? (
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
                    {id ?
                        (
                           (usertype === "company" && t("update_company_title"))
                        )
                        :
                        (
                             (usertype === "company" && t("add_company_title")) 
                        )
                    }
                </Typography>
                <div
                    dir={isRTL === "rtl" ? "rtl" : "ltr"}
                >
                    <Button
                        variant="text"
                        onClick={handleBackNavigation}
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
                    sx={{ direction: isRTL === "rtl" ? "rtl" : "ltr", }}
                    justifyContent={"center"}
                    alignItems={"center"}
                >
                    {id ?
                        <Grid item xs={12} sm={12} md={12} lg={3} xl={3} display={"flex"} justifyContent={"center"} >
                            <div style={{ width: 200, height: 250, marginBottom: ((usertype === 'customer' || usertype === 'driver') ? 70 : 0) }}>
                                {profileImage ? (
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <img
                                            src={URL.createObjectURL(profileImage)}
                                            alt="Profile"
                                            style={{
                                                width: 200,
                                                height: 250,
                                                borderRadius: "19px",
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 200,
                                                height: 250,
                                                display: "flex",
                                                flexDirection: "column",
                                                boxShadow: 3,
                                                border: "2px dashed #B5B5B0",
                                                fontSize: 16,
                                                background: "none",
                                                color: "inherit",
                                                fontWeight: "bold",
                                            }}
                                            variant="square"
                                        >
                                            <FileUploadIcon
                                                sx={{
                                                    fontSize: 100,
                                                    marginBottom: 3,
                                                    color: "grey",
                                                }}
                                            />
                                            {t("upload_profile_image")}
                                        </Avatar>
                                    </div>
                                )}
                                <input
                                    onChange={(event) => profileImageChange(event)}
                                    multiple={false}
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                />
                            </div>
                        </Grid>
                        : null}
                    <Grid item xs={12} sm={12} md={12} lg={9} xl={9}>
                        <Grid
                            container
                            spacing={2}
                            sx={{
                                display: "flex",
                                gridTemplateColumns: "50%",
                                rowGap: "20px",
                                marginY: 1,
                                direction: isRTL === "rtl" ? "rtl" : "ltr",
                            }}
                        >
                            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                                <TextField
                                    label={t("bussinesName")}
                                    id="bussinesName"
                                    value={data?.bussinesName || ""}
                                    fullWidth
                                    onChange={handleInputChange}
                                    className={isRTL === "rtl" ? classes.rootRtl_1 : classes.textField}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                                <TextField
                                    label={t("NIT")}
                                    id="NIT"
                                    value={data?.NIT || ""}
                                    fullWidth
                                    onChange={handleInputChange}
                                    className={isRTL === "rtl" ? classes.rootRtl_1 : classes.textField}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                                <TextField
                                    label={t("mobile")}
                                    id="mobile"
                                    value={id ? settings.AllowCriticalEditsAdmin ? data?.mobile || "" : t("hidden_demo") : data?.mobile || ""}
                                    fullWidth
                                    disabled={id ? true : false}
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
                                    value={id ? settings.AllowCriticalEditsAdmin ? data?.email || "" : t("hidden_demo") : data?.email || ""}
                                    fullWidth
                                    disabled={id ? true : false}
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
                                <FormControl
                                    fullWidth
                                    style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }} >
                                    <InputLabel
                                        id="status-select"
                                        sx={{ "&.Mui-focused": { color: MAIN_COLOR } }}
                                        className={isRTL === "rtl" ? classes.right : ""}
                                    >
                                        {t("approve_status")}
                                    </InputLabel>
                                    <Select
                                        labelId="status-select"
                                        id="status-select"
                                        value={approved}
                                        label={t("approve_status")}
                                        onChange={handleChangeApproved}
                                        className={
                                            isRTL === "rtl"
                                                ? classes.selectField_rtl
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
                            </Grid>


                            <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                                <TextField
                                    label={t("Comisión")}
                                    id="commission"
                                    value={data?.commission || ""}
                                    fullWidth
                                    onChange={handleInputChange}
                                    className={
                                        isRTL === "rtl" ? classes.rootRtl_1 : classes.textField
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={12} lg={(isDriverOrcompany && !isNotAdmin) ? 6 : 12} xl={(isDriverOrcompany && !isNotAdmin) ? 6 : 12}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Button
                                    style={{
                                        borderRadius: "19px",
                                        backgroundColor: MAIN_COLOR,
                                        minHeight: 50,
                                        textAlign: "center",
                                        width: (((isDriverOrcompany && !isNotAdmin) || isMidScreen) ? "100%" : "50%")
                                    }}
                                    onClick={id ? handleUpdate : handleAdd}
                                    variant="contained"
                                >
                                    <Typography
                                        style={{
                                            color: "white",
                                            textAlign: "center",
                                            fontSize: 16,
                                        }}
                                    >
                                        {id ? t("update") : t("add")}
                                    </Typography>
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
            <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>
                {commonAlert.msg}
            </AlertDialog>
        </div>
    );
}

export default AddCompany