import React, { useState, useEffect, useRef } from "react";
import { downloadCsv } from "../common/sharedFunctions";
import MaterialTable from "material-table";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { api } from "common";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import moment from 'moment/min/moment-with-locales';
import { colors } from "../components/Theme/WebTheme";
import AlertDialog from "../components/AlertDialog";
import { Typography, } from "@mui/material";
import { SECONDORY_COLOR } from "../common/sharedFunctions"
import Tooltip from '@material-ui/core/Tooltip';

export default function UsersUpdates() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir();
    const {
        editUser,
        fetchUsersOnce,
    } = api;
    const [data, setData] = useState([]);
    const staticusers = useSelector((state) => state.usersdata.staticusers);
    const auth = useSelector((state) => state.auth);
    const settings = useSelector((state) => state.settingsdata.settings);
    const dispatch = useDispatch();
    const loaded = useRef(false);
    const [role, setRole] = useState(null);
    const [fleetAdminsObj, setFleetAdminsObj] = useState();
    const [sortedData, SetSortedData] = useState([]);

    useEffect(() => {
        dispatch(fetchUsersOnce());
    }, [dispatch, fetchUsersOnce]);

    // ...

    useEffect(() => {
        if (staticusers) {
            if (role === "admin") {
                let arr = staticusers.filter(
                    (user) => user.reviewed === false
                );
                let obj = {};
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
                            (settings.AllowCriticalEditsAdmin
                                ? user.email
                                : t("hidden_demo")),
                    });
                    obj[user.id] =
                        user.firstName +
                        " " +
                        user.lastName +
                        " (" +
                        (settings.AllowCriticalEditsAdmin
                            ? user.mobile
                            : t("hidden_demo")) +
                        ") " +
                        (settings.AllowCriticalEditsAdmin ? user.email : t("hidden_demo"));
                }
                setFleetAdminsObj(obj);
            }
            setTimeout(() => {
                setData(
                    staticusers.filter(
                        (user) =>
                            user.usertype === "driver" &&
                            auth.profile.usertype === "admin" &&
                            (user.reviewed === false || user.reviewed === undefined) // Considera también el caso en que reviewed no exista
                    ).map((user) => ({ ...user, reviewed: false }))
                );
            }, 1000);
        } else {
            setData([]);
        }
        loaded.current = true;
    }, [
        staticusers,
        auth.profile.usertype,
        auth.profile.uid,
        settings.AllowCriticalEditsAdmin,
        role, t
    ]);

    // ...


    useEffect(() => {
        if (data) {
            const today = moment();
            // Filtrar los elementos que se actualizaron en los últimos 5 días
            const filteredData = data.filter(item => {
                const updatedAt = moment(item.updateAt);
                const daysDifference = today.diff(updatedAt, 'days');
                return daysDifference <= 5 && item.reviewed === false;
            });
            const sortedData = filteredData.sort((a, b) => moment(b.updateAt) - moment(a.updateAt));
            SetSortedData(sortedData);
        }
    }, [data]);



    useEffect(() => {
        if (auth.profile && auth.profile.usertype) {
            setRole(auth.profile.usertype);
        }
    }, [auth.profile]);

    const columns = [

        { title: 'Fecha de Actualizado', field: 'updateAt', editable: 'never', defaultSort: 'desc', render: rowData => rowData.updateAt ? moment(rowData.updateAt).format('lll') : null },

        { title: t("first_name"), field: "firstName", initialEditValue: "" },
        { title: t("last_name"), field: "lastName", initialEditValue: "" },
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
            headerStyle: { textAlign: "center" },
        },


        {
            title: "Placa",
            field: "vehicleNumber",
            editable: "onAdd",
            render: (rowData) =>
                settings.AllowCriticalEditsAdmin ? rowData.vehicleNumber : t("hidden_demo"),
            headerStyle: { textAlign: "center" },
        },
        {
            title: "Tipo de servicio",
            field: "carType",
            editable: "onAdd",
            render: (rowData) =>
                settings.AllowCriticalEditsAdmin ? rowData.carType : t("hidden_demo"),
            headerStyle: { textAlign: "center" },
        },

        {
            title: "Cantidad de documentos",
            field: "documentsCount",
            render: (rowData) => {
                const requiredFields = [
                    "licenseImage",
                    "licenseImageBack",
                    "SOATimage",
                    "cardPropImage",
                    "cardPropImageBK",
                    "verifyIdImage",
                    "verifyIdImageBk"
                ];

                let count = 0;
                for (const field of requiredFields) {
                    count += rowData[field] ? 1 : 0;
                }

                return (
                    <Tooltip title={`${count.toString()} de 7 documentos`}>
                        <span>{count.toString()}</span>
                    </Tooltip>
                );
            },
            editable: "never",
        },
    ];

    const [commonAlert, setCommonAlert] = useState({ open: false, msg: "" });

    const handleCommonAlertClose = (e) => {
        e.preventDefault();
        setCommonAlert({ open: false, msg: "" });
    };


    const [selectedRow, setSelectedRow] = useState(null);

    return !loaded.current ? (
        <CircularLoading />
    ) : (
        <div style={{ backgroundColor: colors.LandingPage_Background }}>
            <MaterialTable
                title={t("Conductores Actualizados en los últimos 5 días")}
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
                    pageSize: 15,
                    pageSizeOptions: [15, 50, 100],
                    exportCsv: (columns, data) => {
                        let hArray = [];
                        const headerRow = columns.map((col) => {
                            if (typeof col.title === "object") {
                                return col.title.props.text;
                            }
                            hArray.push(col.field);
                            return col.title;
                        });
                        const dataRows = data.map(({ tableData, ...row }) => {
                            row.createdAt =
                                new Date(row.createdAt).toLocaleDateString() +
                                " " +
                                new Date(row.createdAt).toLocaleTimeString();
                            row.fleetadmin = row.fleetadmin
                                ? fleetAdminsObj[row.fleetadmin]
                                : "";
                            let dArr = [];
                            for (let i = 0; i < hArray.length; i++) {
                                dArr.push(row[hArray[i]]);
                            }
                            return Object.values(dArr);
                        });
                        const { exportDelimiter } = ",";
                        const delimiter = exportDelimiter ? exportDelimiter : ",";
                        const csvContent = [headerRow, ...dataRows]
                            .map((e) => e.join(delimiter))
                            .join("\n");
                        const csvFileName = "download.csv";
                        downloadCsv(csvContent, csvFileName);
                    },
                    exportButton: {
                        csv: settings.AllowCriticalEditsAdmin,
                        pdf: false,
                    },
                    maxColumnSort: "all_columns",
                    rowStyle: (rowData) => ({
                        backgroundColor:
                            selectedRow === rowData.tableData.id ? "#F5F5F5" : "white",

                        border: "1px solid rgba(224, 224, 224, 1)",
                    }),
                    editable: {
                        backgroundColor: colors.Header_Text,
                        fontSize: "0.8em",
                        fontWeight: "bold ",
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    },
                    headerStyle: {
                        position: "sticky",
                        top: "0px",
                        fontSize: "0.8em",
                        fontWeight: "bold ",
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        color: colors.BLACK,
                        backgroundColor: SECONDORY_COLOR,
                        textAlign: "center",
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
                actions={[
                    (rowData) => (
                        {
                            icon: (rowData) => (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        padding: 10,
                                        backgroundColor: rowData.reviewed ? SECONDORY_COLOR : colors.RED_TREAS,
                                        borderRadius: 5,
                                        boxShadow: "0px 3px 5px 0px #B4B4B3",
                                    }}
                                >
                                    <Typography style={{ color: colors.LandingPage_Background }}>
                                        Revisado
                                    </Typography>
                                </div>
                            ),
                            tooltip: "Revisado",
                            onClick: async (event, rowData) => {
                                try {
                                    // Llamar a la acción de marcar como revisado en el backend
                                    await dispatch(editUser(rowData.id, { ...rowData, reviewed: true }));

                                    // Actualizar el estado local eliminando la fila marcada
                                    const updatedData = data.filter((user) => user.id !== rowData.id);

                                    // Actualizar el estado de la tabla
                                    setData(updatedData);
                                    SetSortedData(updatedData); // Puedes ajustar esto según tus necesidades, tal vez quieras ordenar de nuevo la tabla
                                } catch (error) {
                                    // Manejar cualquier error aquí
                                    console.error("Error al marcar como revisado:", error);
                                }
                            },
                        }

                    ),

                    {
                        icon: "info",
                        tooltip: t("profile_page_subtitle"),
                        onClick: (event, rowData) => {
                            navigate(`/users/driverdetails/${rowData.id}`);
                        },
                    },
                ]}



            />

            <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>
                {commonAlert.msg}
            </AlertDialog>
        </div>
    );
}
