import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Typography, Button } from "@mui/material";
import moment from "moment/min/moment-with-locales";
import { SECONDORY_COLOR } from "../common/sharedFunctions";
import { colors } from "../components/Theme/WebTheme";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import { api } from "common";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "react-i18next";
import CircularLoading from "../components/CircularLoading";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useSelector, useDispatch } from "react-redux";
import MaterialTable from "material-table";
import AlertDialog from "../components/AlertDialog";


const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const useStyles = makeStyles((theme) => ({
    modal: {
        display: "flex",
        padding: theme.spacing(1),
        alignItems: "center",
        justifyContent: "center",
    },
    paper: {
        width: 680,
        backgroundColor: theme.palette.background.paper,
        border: "2px solid #000",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    action: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        height: "40px",
        justifyContent: "center",
        borderRadius: "20px",
        paddingLeft: "10px",
        paddingRight: "10px",
        width: "10rem",
        backgroundColor: '#f20505'
    },
}));


export default function IdReferal() {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir();
    const {
        fetchUsersOnce,
    } = api;
    const settings = useSelector((state) => state.settingsdata.settings);
    const [data, setData] = useState([]);
    const [sortedData, SetSortedData] = useState([]);
    const staticusers = useSelector((state) => state.usersdata.staticusers);
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const loaded = useRef(false);
    const [role] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [searchUid, setSearchUid] = useState(''); // Nuevo estado para el UID de búsqueda

    useEffect(() => {
        dispatch(fetchUsersOnce());
    }, [dispatch, fetchUsersOnce]);

    useEffect(() => {
        if (staticusers) {
            setData(
                staticusers.filter(
                    (user) =>
                        user.usertype === "customer" &&
                        ((user.company === auth.profile.uid &&
                            auth.profile.usertype === "company") ||
                            auth.profile.usertype === "admin")
                )
            );
        } else {
            setData([]);
        }
        loaded.current = true;
    }, [staticusers, auth.profile]);

    const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });

    const handleCommonAlertClose = (e) => {
        e.preventDefault();
        setCommonAlert({ open: false, msg: "" });
    };

    useEffect(() => {
        if (data) {
            SetSortedData(data.sort((a, b) => (moment(b.createdAt) - moment(a.createdAt))))
        }
    }, [data])

    const handleSearch = () => {
        if (searchUid) {
            const filteredData = data.filter(user => user.id === searchUid);
            SetSortedData(filteredData);
        } else {
            SetSortedData(data);
        }
    };

    const columns = [
        { title: t('createdAt'), field: 'createdAt', editable: 'never', defaultSort: 'desc', render: rowData => rowData.createdAt ? moment(rowData.createdAt).format('lll') : null },
        {
            title: 'UID',
            field: 'id',
        },
        { title: t("first_name"), field: "firstName" },
        { title: t("last_name"), field: "lastName" },
        {
            title: t("mobile"),
            field: "mobile",
            editable: "onAdd",
            render: (rowData) =>
                settings.AllowCriticalEditsAdmin ? rowData.mobile : t("hidden_demo"),
        },
        {
            title: t("email"),
            field: "email",
            editable: "onAdd",
            render: (rowData) =>
                settings.AllowCriticalEditsAdmin ? rowData.email : t("hidden_demo"),
        },
        {
            title: t("profile_image"),
            field: "profile_image",
            render: (rowData) =>
                rowData.profile_image ? (
                    <img
                        alt="Profile"
                        src={rowData.profile_image}
                        style={{ width: 40, height: 40, borderRadius: "50%" }}
                    />
                ) : (
                    <AccountCircleIcon sx={{ fontSize: 40 }} />
                ),
            editable: "never",
        },
        {
            title: t('referralId'),
            field: 'referralId',
        },
    ];

    return !loaded.current ? (
        <CircularLoading />
    ) : (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center" sx={{ mb: 2 }}>
                       Buscador de Id Referido
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <TextField
                            label="UID"
                            value={searchUid}
                            onChange={(e) => setSearchUid(e.target.value)}
                            variant="outlined"
                            sx={{ mr: 2 }}
                        />
                        <Button variant="contained" color='error' onClick={handleSearch}>
                            Buscar
                        </Button>
                    </Box>
                </Paper>
            </Container>
            <div>
                <MaterialTable
                    title={t("riders_title")}
                    columns={columns}
                    style={{
                        direction: isRTL === "rtl" ? "rtl" : "ltr",
                        borderRadius: "8px",
                        boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
                        border: "1px solid rgba(224, 224, 224, 1)",
                        padding: "20px",
                    }}
                    data={sortedData}
                    onRowClick={(evt, selectedRow) =>
                        setSelectedRow(selectedRow.tableData.id)
                    }
                    options={{
                        pageSize: 10,
                        pageSizeOptions: [10, 15, 20],
                        exportButton: {
                            csv: settings.AllowCriticalEditsAdmin,
                            pdf: false,
                        },
                        maxColumnSort: "all_columns",
                        rowStyle: (rowData) => ({
                            backgroundColor: selectedRow === rowData.tableData.id ? "#F5F5F5" : "white",
                            border: "1px solid rgba(224, 224, 224, 1)",
                        }),
                        editable: {
                            backgroundColor: colors.Header_Text,
                            fontSize: "0.8em",
                            fontWeight: "bold ",
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        },
                        headerStyle: {
                            color: colors.Black,
                            position: "sticky",
                            top: "0px",
                            backgroundColor: SECONDORY_COLOR,
                            textAlign: "center",
                            fontSize: "0.8em",
                            fontWeight: "bold ",
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                            border: "1px solid rgba(224, 224, 224, 1)",
                        },
                        cellStyle: {
                            border: "1px solid rgba(224, 224, 224, 1)",
                            textAlign: "center",
                        },
                        actionsColumnIndex: -1,
                    }}
                    localization={{
                        body: {
                            addTooltip: t("add"),
                            deleteTooltip: t("delete"),
                            editTooltip: t("edit"),
                            emptyDataSourceMessage: t("blank_message"),
                            editRow: {
                                deleteText: t("delete_message"),
                                cancelTooltip: t("cancel"),
                                saveTooltip: t("save"),
                            },
                        },
                        toolbar: {
                            searchPlaceholder: t("search"),
                            exportTitle: t("export"),
                        },
                        header: {
                            actions: t("actions"),
                        },
                        pagination: {
                            labelDisplayedRows: "{from}-{to} " + t("of") + " {count}",
                            firstTooltip: t("first_page_tooltip"),
                            previousTooltip: t("previous_page_tooltip"),
                            nextTooltip: t("next_page_tooltip"),
                            lastTooltip: t("last_page_tooltip"),
                        },
                    }}
                />
                <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>
                    {commonAlert.msg}
                </AlertDialog>
            </div>
        </ThemeProvider>
    );
}
