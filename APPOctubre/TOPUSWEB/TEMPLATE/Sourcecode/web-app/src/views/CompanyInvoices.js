import React, { useState, useEffect, useRef } from "react";
import { downloadCsv } from "../common/sharedFunctions";
import MaterialTable from "material-table";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { useTranslation } from "react-i18next";
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
import CachedIcon from '@mui/icons-material/Cached';
import { makeStyles } from "@mui/styles";
import {  notification,  } from 'antd';


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

export default function CompanyInvoices() {
    const { id } = useParams();
    const { t } = useTranslation();
    const { updateBooking } = api;
    const bookinglistdata = useSelector((state) => state.bookinglistdata);
    const settings = useSelector((state) => state.settingsdata.settings);
    const loaded = useRef(false);
    const [bookingData, setBookingData] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [data, setData] = useState([]);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const classes = useStyles();
    // const auth = useSelector((state) => state.auth);
    const role = useSelector((state) => state.auth.profile.usertype);

    useEffect(() => {
        if (bookinglistdata.bookings) {
            setBookingData(
                bookinglistdata.bookings.filter((item) => item.bussinesName && item.payment_mode === 'corp')
            );
        } else {
            setBookingData([]);
        }
        loaded.current = true;
    }, [bookinglistdata.bookings, id]);
    
    const empresasCorp = {
        "COLOMBIA RURAL SAS 900.860.918-1finanzas@colombiarural.com.co": 0,
        "Hotel Porton Bogota 901523573-1reservas@hotelportonbogota.com.co": 0.15,
        "Hotel Estelar Calle 100 890304099-3ricardo.ochoa@hotelesestelar.com": 0.10,
        "Hotel Estelar Parque 93 890304099-3joseg.barajas@hotelesestelar.com": 0.10,
        "VIA TRIP SAS 900561898-8recepcionpicasso@hotmail.com": 0.10,
        "SUITES 101 PARK HOUSE S.A.S 830.052.004-3ejecutivacomercial@101ph.co": 0.15,
        "HYPE AGENCY S.A.S 901.728.476-6admin@feelhype.com.co": 0,
        "Pro Corp SAS 900248857-5tesoreria@pro-corp.net": 0,
        "NBC UNIVERSAL NETWORKS INTERNATIONAL COLOMBIA S.A.S 901135214-8facturacion.co@nbcuni.com": 0,
        "LPG AIRCRAFT PARTS COLOMBIA LTDA 830135311-7sales_lpg1@msn.com": 0,
        "ELEVEN GRP SAS 900.777.650-7administrativo@eleven.com.co": 0,
        "VIEWY SAS 901.046.103-7finanzasviewy@gmail.com": 0,
        "E'KABEL SAS 901.003.470-0administracion.co@ekabel.net": 0,
        "MARS COLOMBIA 1000987640mars.colombiatreas@gmail.com": 0,
        "Shirato Compnay 901.234.516-1itlead43@gmail.com": 0,
        "SNF INC 900850606-4facturacioncolombiaSNF@outlook.com": 0,
        "Corporación de Investigación y Acción Social y Economía C.I.A.S.E 900068433-3rosa.duque@ciase.org": 0,
        "ARTURO MARTINEZ SERRANO 79785532arturoarturo@aol.com": 0,
        "HEALICS S.A.S 901539806-2healic.gdlc@gmail.com": 0,
        "SANTA BARBARA FILMS S.A.S. 900.872.224 - 9facturacion@santabarbarafilms.com.co": 0,
        "PASTEURIZADORA SANTODOMINGO 830.018.198-1facturacionelectronica@santodomingo.net.co": 0,
        "BALL COLOMBIA LIMITADA 800.164.874-6ccifuentes@ballcolombia.com": 0,
        "DANZIGER COLOMBIA S.A.S 900.786.196-2invoice.colombia@danziger.com.co": 0,
        "TREAS CORP S.A.S 901.656.494-1gerencia@treascorp.co": 0.10
      };
      
      


      const handleBookingComplete = (rowData) => {
        // Convertir explícitamente trip_cost y estimate a números
        const tripCost = Number(rowData.trip_cost) || 0;
        const estimate = Number(rowData.estimate) || 0;
    
        if (estimate > tripCost) {
            rowData.trip_cost = estimate;
        }
        console.log("trip cost", rowData.trip_cost);
    
        // Convertir explícitamente settings.Increase a número
        const porcentajeIncrementoCorp = Number(settings.Increase) || 0.30; // 30% por defecto
        const comisionPercentage = empresasCorp[rowData.bussinesName] || 0; // Obtiene el porcentaje o cero si no se encuentra
        console.log(rowData.bussinesName);
        const incrementoCorp = tripCost * porcentajeIncrementoCorp;
    
        const comisioCompany = tripCost * comisionPercentage;
        
        const PolicyPackage = 800; // Valor estático
        const Base_de_IVA = tripCost * 0.08;
        const Iva = Base_de_IVA * 0.19;
        const ProfitsTreas = tripCost * 0.30;
        const Technological_Hosting = ProfitsTreas;
        const comicomisionCorpsion = tripCost * comisionPercentage;
    
        // Convertir explícitamente todos los componentes de cost_corp a números antes de sumar
        const cost_corp = tripCost + comisioCompany + PolicyPackage + Base_de_IVA + Iva + ProfitsTreas;
    
        const ChangueStatus = {
            ...rowData,
            ProfitsTreas,
            cost_corp,
            trip_cost: tripCost, // Usar tripCost numérico
            comisioCompany,
            PolicyPackage,
            Base_de_IVA,
            Iva,
            Technological_Hosting,
            comicomisionCorpsion
        };

    
    
    
     

         

        notification.success({
            message: 'Exito!',
            description: 'El servicio se ha tarificado nuevamente.',
        });
        notification.success({
            message: 'Exito!',
            description: 'El servicio se ha tarificado nuevamente.',
        });

        dispatch(updateBooking(ChangueStatus))
            .then(() => {
                // Actualiza el estado local con los nuevos datos
                setData(prevData =>
                    prevData.map(item =>
                        item.id === ChangueStatus.id ? ChangueStatus : item
                    )
                );
            });
    };



    const columns = [

        {
            title: t("booking_status"),
            field: "status",
            editable: false,
            render: (rowData) => (
                <div
                    style={{
                        backgroundColor:
                            rowData.status === "PAID"
                                ? colors.RED
                                : rowData.status === "COMPLETE"
                                    ? colors.GREEN
                                    : colors.YELLOW,
                        color: "white",
                        padding: 7,
                        borderRadius: "15px",
                        fontWeight: "bold",
                        width: "150px",
                        margin: "auto",
                    }}
                >
                    {t(rowData.status)}
                </div>
            ),
        },
        {
            title: t("booking_ref"),
            field: "reference",
            editable: false,
            cellStyle: {
                textAlign: "center",
                border: "1px solid rgba(224, 224, 224, 1)",
            },
        },
        {
            title: t("booking_date"),
            field: "bookingDate",
            editable: false,
            render: (rowData) =>
                rowData.bookingDate ? moment(rowData.bookingDate).format("lll") : null,
            cellStyle: {
                textAlign: "center",
                border: "1px solid rgba(224, 224, 224, 1)",
            },
        },
        {
            title: t("pickup_address"),
            field: "pickupAddress",
            editable: false,
            cellStyle: {
                textAlign: "center",
                border: "1px solid rgba(224, 224, 224, 1)",
            },
        },
        {
            title: t("drop_address"),
            field: "dropAddress",
            editable: false,
            cellStyle: {
                textAlign: "center",
                border: "1px solid rgba(224, 224, 224, 1)",
            },
        },
        {
            title: t('trip_cost'),
            field: 'trip_cost',
            render: (rowData) =>
                rowData.trip_cost
                    ? settings.swipe_symbol
                        ? rowData.trip_cost + " " + settings.symbol
                        : settings.symbol + " " + rowData.trip_cost
                    : settings.swipe_symbol
                        ? "0 " + settings.symbol
                        : settings.symbol + " 0",
        },
        {
            title: 'El cliente pago Empresarial', field: 'cost_corp',
            render: (rowData) =>
                rowData.cost_corp
                    ? settings.swipe_symbol
                        ? rowData.cost_corp + " " + settings.symbol
                        : settings.symbol + " " + rowData.cost_corp
                    : settings.swipe_symbol
                        ? "0 " + settings.symbol
                        : settings.symbol + " 0",
        },
        {
            title: 'Comision Hotel', field: 'comisionCorp',
            render: (rowData) =>
                rowData.comicomisionCorpsion
                    ? settings.swipe_symbol
                        ? rowData.comicomisionCorpsion + " " + settings.symbol
                        : settings.symbol + " " + rowData.comicomisionCorpsion
                    : settings.swipe_symbol
                        ? "0 " + settings.symbol
                        : settings.symbol + " 0",
        },
        {
            title: 'Hosting Tecnológico',
            field: 'Technological_Hosting',
            render: (rowData) =>
                rowData.Technological_Hosting
                    ? settings.swipe_symbol
                        ? rowData.Technological_Hosting + " " + settings.symbol
                        : settings.symbol + " " + rowData.Technological_Hosting
                    : settings.swipe_symbol
                        ? "0 " + settings.symbol
                        : settings.symbol + " 0",
        },
        {
            title: 'Base de impuestos', field: 'Base_de_IVA',
            render: (rowData) =>
                rowData.Base_de_IVA
                    ? settings.swipe_symbol
                        ? rowData.Base_de_IVA + " " + settings.symbol
                        : settings.symbol + " " + rowData.Base_de_IVA
                    : settings.swipe_symbol
                        ? "0 " + settings.symbol
                        : settings.symbol + " 0",
        },
        {
            title: 'Iva', field: 'Iva',
            render: (rowData) =>
                rowData.Iva
                    ? settings.swipe_symbol
                        ? rowData.Iva + " " + settings.symbol
                        : settings.symbol + " " + rowData.Iva
                    : settings.swipe_symbol
                        ? "0 " + settings.symbol
                        : settings.symbol + " 0",
        },
        {
            title: 'Ingreso total para conductor', field: 'trip_cost',
            render: (rowData) =>
                rowData.trip_cost
                    ? settings.swipe_symbol
                        ? rowData.trip_cost + " " + settings.symbol
                        : settings.symbol + " " + rowData.trip_cost
                    : settings.swipe_symbol
                        ? "0 " + settings.symbol
                        : settings.symbol + " 0",
        },
        {
            title: 'Ganancia Treas', field: 'ProfitsTreas',
            render: (rowData) =>
                rowData.ProfitsTreas
                    ? settings.swipe_symbol
                        ? rowData.ProfitsTreas + " " + settings.symbol
                        : settings.symbol + " " + rowData.ProfitsTreas
                    : settings.swipe_symbol
                        ? "0 " + settings.symbol
                        : settings.symbol + " 0",
        },
        {
            title: 'Paquetes de pólizas', field: 'PolicyPackage',
            hidden: true,
            render: (rowData) => {
                if (rowData.payment_mode === 'corp') {
                    return settings.swipe_symbol ? "800 " + settings.symbol : settings.symbol + " 800";
                } else {
                    return settings.swipe_symbol ? "0 " + settings.symbol : settings.symbol + " 0";
                }
            }
        },
        { title: 'Empresas', field: 'bussinesName', editable: false, },
        { title: 'Estado de Facturación', field: 'companyInvoices', lookup: { Facturado: 'Facturado', pendienteFactura: 'Pendiente por Facturar' } },
    ];


    const calculateValues = (rowData) => {
        const cost_corp = rowData.cost_corp || 0;
        const trip_cost = rowData.trip_cost || 0;
        const comisioCompany = trip_cost * 0.15;
        const PolicyPackage = 800
        const Base_de_IVA = trip_cost * 0.08;
        const Iva = Base_de_IVA * 0.19;
        const Technological_Hosting = cost_corp - Base_de_IVA - Iva - trip_cost - comisioCompany - PolicyPackage;
        const ProfitsTreas = Technological_Hosting

        const comicomisionCorpsion = trip_cost * 0.15;
        return {
            Base_de_IVA,
            Iva,
            Technological_Hosting,
            comisioCompany,
            ProfitsTreas,
            PolicyPackage,
            comicomisionCorpsion
        };
    };

    const handleSearch = () => {
        // Filtrar las reservas según la empresa seleccionada
        const filteredData = selectedCompany ? bookinglistdata.bookings.filter(booking => booking.bussinesName === selectedCompany && booking.payment_mode === 'corp' && booking.status === 'COMPLETE') : bookinglistdata.bookings;
        setData(filteredData);
    };

    const handleCompanySelect = (event) => {
        setSelectedCompany(event.target.value);
    };

    const empresas = [...new Set(bookingData.map(booking => booking.bussinesName))].filter(Boolean);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center" sx={{ mb: 2 }}>
                        Facturas Empresarial
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <TextField
                            select
                            label="Empresa"
                            value={selectedCompany}
                            onChange={handleCompanySelect}
                            variant="outlined"
                            sx={{ mr: 2 }}
                        >
                            {empresas.map((empresa) => (
                                <MenuItem key={empresa} value={empresa}>
                                    {empresa}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Button variant="contained" color='error' onClick={handleSearch}>
                            Buscar
                        </Button>
                    </Box>
                </Paper>
            </Container>
            {loading ? (
                <CircularLoading />
            ) : (
                <div
                    style={{
                        backgroundColor: colors.LandingPage_Background,
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                    }}
                >
                    <MaterialTable
                        title={t("booking_title")}
                        style={{

                            borderRadius: "8px",
                            boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
                        }}
                        columns={columns}
                        data={data}
                        onRowClick={(evt, selectedRow) =>
                            setSelectedRow(selectedRow.tableData.id)
                        }
                        options={{
                            pageSize: 10,
                            pageSizeOptions: [10, 15, 20],
                            toolbarbuttonalignment: "right",
                            exportAllData: true,
                            exportCsv: (columns, data) => {
                                let hArray = [];
                                // Filtrar las columnas visibles para el rol "company"
                                const visibleColumns = columns.filter(column => !column.hidden || (column.hidden));

                                const headerRow = visibleColumns.map(col => {
                                    if (typeof col.title === 'object') {
                                        return col.title.props.text;
                                    }
                                    hArray.push(col.field);
                                    return col.title;
                                });
                                const dataRows = data.map(({ tableData, ...row }) => {
                                    row.bookingDate = new Date(row.bookingDate).toLocaleDateString() + ' ' + new Date(row.bookingDate).toLocaleTimeString()
                                    row.tripdate = new Date(row.tripdate).toLocaleDateString() + ' ' + new Date(row.tripdate).toLocaleTimeString();
                                    row.pickupAddress = row.pickupAddress.replace(/,/g, "/");
                                    row.dropAddress = row.dropAddress.replace(/,/g, "/");
                                    let dArr = [];
                                    for (let i = 0; i < hArray.length; i++) {
                                        dArr.push(row[hArray[i]]);
                                    }
                                    return Object.values(dArr);
                                })
                                const { exportDelimiter } = ",";
                                const delimiter = exportDelimiter ? exportDelimiter : ",";
                                const csvContent = [headerRow, ...dataRows].map(e => e.join(delimiter)).join("\n");
                                const csvFileName = 'Historial.csv';
                                downloadCsv(csvContent, csvFileName);
                            },
                            exportButton: {
                                csv: settings.AllowCriticalEditsAdmin,
                                pdf: false,
                            },
                            maxColumnSort: "all_columns",
                            rowStyle: (rowData) => ({
                                backgroundColor:
                                    selectedRow === rowData.tableData.id ? "#EEE" : "#FFF",
                                border: "1px solid rgba(224, 224, 224, 1)",
                            }),
                            maxBodyHeight: "calc(100vh - 199.27px)",
                            headerStyle: {
                                position: "sticky",
                                top: "0px",
                                backgroundColor: SECONDORY_COLOR,
                                color: colors.Black,
                                fontWeight: "bold ",
                                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                                textAlign: "center",
                                zIndex: 1,
                                border: "1px solid rgba(224, 224, 224, 1)",

                            },
                            cellStyle: {
                                border: "1px solid rgba(224, 224, 224, 1)",
                                textAlign: "center",
                                margin: "auto",
                            },
                            actionsColumnIndex: -1,
                        }}

                        editable={{
                            onRowUpdate: (newData, oldData) =>
                                new Promise((resolve) => {
                                    setTimeout(() => {
                                        resolve();
                                        dispatch(updateBooking(newData))
                                            .then(() => {
                                                // Actualiza el estado local con los nuevos datos
                                                setData((prevData) =>
                                                    prevData.map((item) =>
                                                        item.id === newData.id ? newData : item
                                                    )
                                                );
                                            });
                                    }, 600);
                                }),
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
                                labelDisplayedRows: `{from}-{to} ${t("of")} {count}`,
                                labelRowsPerPage: t("rows_per_page"),
                                firstAriaLabel: t("first_page"),
                                firstTooltip: t("first_page"),
                                previousAriaLabel: t("previous_page"),
                                previousTooltip: t("previous_page"),
                                nextAriaLabel: t("next_page"),
                                nextTooltip: t("next_page"),
                                lastAriaLabel: t("last_page"),
                                lastTooltip: t("last_page"),
                            },
                        }}

                        actions={[
                            (rowData) =>
                                role === "admin"
                                    ? {
                                        icon: () => (
                                            <div
                                                className={classes.action}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    flexWrap: "wrap",
                                                    color: '#FFFF',
                                                    backgroundColor: '#FF5B5B'
                                                }}
                                            >
                                                <CachedIcon />
                                                <Typography variant="subtitle2">
                                                    {"Recalcular"}
                                                </Typography>
                                            </div>
                                        ),
                                        onClick: (event, rowData) => {
                                            handleBookingComplete(rowData)
                                        },
                                    }
                                    : null,
                        ]}
                    />
                </div>
            )}
        </ThemeProvider>
    );

}

