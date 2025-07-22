import React, { useEffect, useState } from 'react';
import { api } from "common";
import { useDispatch, useSelector } from "react-redux";
import MaterialTable from "material-table";
import { downloadCsv, MAIN_COLOR, SECONDORY_COLOR } from "../common/sharedFunctions";
import { colors } from "../components/Theme/WebTheme";
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900,
    bgcolor: 'background.paper',
    boxShadow: 24,
    maxHeight: '80vh',
    overflow: 'auto',
    px: 4,
    pb: 4,
};
const Topus = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir();
    const [dataSecurity, setDataSecurity] = useState([]);
    const [openAntecedentsModal, setOpenAntecedentsModal] = useState(false);
    const {
        fetchUsersOnce,
    } = api;
    const dispatch = useDispatch();
    const staticusers = useSelector((state) => state.usersdata.staticusers);
    const settings = useSelector((state) => state.settingsdata.settings);
    const [antecedents, setAntecedents] = useState([]);

    useEffect(() => {
        dispatch(fetchUsersOnce());
    }, [dispatch, fetchUsersOnce]);

    useEffect(() => {
        if (staticusers) {
            setDataSecurity([])
            staticusers.forEach(user => {
                if (user.securityData && Array.isArray(user.securityData)) {
                    user.securityData.forEach(securityData => {
                        if (securityData?.antecedents) {
                            setDataSecurity(prevState => [...prevState, securityData])
                        }
                    })
                }
            })
        }
    }, [staticusers]);


    const handleOpenAntecedents = (antecedents) => {
        setAntecedents(antecedents)
        setOpenAntecedentsModal(true)
    }

    const columns = [
        {
            title: 'Fecha de solicitud',
            field: 'date',
            editable: 'never',
            defaultSort: 'desc',
            render: rowData => rowData.date ? moment(rowData.date).format('lll') : null
        },
        { title: 'Nombre', field: "firstName" },
        { title: 'Apellido', field: "lastName" },
        { title: 'Tipo de documento', field: "docType" },
        { title: 'Número de documento', field: "verifyId" },
        {
            title: 'Antecedentes',
            field: "antecedents",
            render: rowData => rowData.antecedents ? (
                <div style={{ display: "flex", justifyContent: 'center' }}>
                    <div onClick={() => handleOpenAntecedents(rowData.antecedents)} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: 'center',
                        width: "80%",
                        padding: 10,
                        textAlign: 'center',
                        backgroundColor: MAIN_COLOR,
                        borderRadius: 5,
                        boxShadow: "0px 3px 5px 0px #B4B4B3",
                        cursor: "pointer",
                    }}>
                        <Typography style={{ color: colors.LandingPage_Background }}>
                            Ver antecedentes
                        </Typography>
                    </div>
                </div>) : "No tiene antecedentes"
        },
    ]

    return (
        <div>
            <Modal
                open={openAntecedentsModal}
                onClose={() => {
                    setOpenAntecedentsModal(false)
                }}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
            >
                <Box sx={{ ...style }}>
                    <h2 id="parent-modal-title" style={{ color: colors.RED_TREAS, textDecoration: 'underline' }}>Antecedentes</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px 0px', }}>
                        {antecedents.filter(antecedent => ['policia', 'contraloria', 'interpol', 'simit', 'ofac'].includes(antecedent.entidad)).map((antecedent, index) => {
                            return <div style={{
                                boxShadow: '1px 3px 13px -2px rgba(0,0,0,0.75)',
                                padding: '1px 12px',
                                borderRadius: 10
                            }}>

                                <h3 style={{ textTransform: 'capitalize' }}><span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}><BusinessIcon />{antecedent?.entidad}</span></h3>
                                <div style={{ padding: '0 10px' }}>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ display: 'inline-block', width: '30%' }}>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>       <DescriptionRoundedIcon /><b>Descripción
                                                antecedente</b></span>
                                        </span>: <span
                                            style={{
                                                textTransform: 'capitalize',
                                                display: 'inline-block',
                                                width: '70%'
                                            }}>{!antecedent?.respuesta && !['ofac'].includes(antecedent.entidad) ? 'Debe validar ante la entidad manualmente' : (antecedent.archivo_respuesta?.toLowerCase().split('|')[antecedent?.archivo_respuesta.split('|').length - 1] || 'No presenta antecedentes')} </span>
                                    </p>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center' }}><AttachFileRoundedIcon /><b>Anexo
                                            evidencia</b></span>:
                                        <p>{antecedent?.archivo_evidencia ?
                                            <a style={{ color: colors.RED_TREAS }} href={antecedent?.archivo_evidencia} rel="noopener noreferrer" target="_blank">Ver evidencia</a>
                                            : 'No hay archivos de evidencia'}
                                        </p>


                                    </p>
                                </div>
                            </div>
                        })}
                    </div>
                </Box>
            </Modal>
            <MaterialTable
                title={'Historial de Seguridad'}
                columns={columns}
                style={{
                    direction: isRTL === "rtl" ? "rtl" : "ltr",
                    borderRadius: "8px",
                    boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
                    border: "1px solid rgba(224, 224, 224, 1)",
                    padding: "20px",
                }}
                data={dataSecurity}
                options={{
                    pageSize: 10,
                    pageSizeOptions: [10, 15, 20],
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
        </div>
    );
}

export default Topus;
