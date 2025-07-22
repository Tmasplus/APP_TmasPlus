
import React, { useRef, useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { useSelector, useDispatch } from "react-redux";
import Grid from '@mui/material/Grid';
import Button from "@mui/material/Button";
import { Modal } from 'antd';
import { makeStyles } from '@mui/styles';
import FirmaGerente from './../assets/img/FirmaContrato.png'
import Typography from '@mui/material/Typography';
import { TextField } from '@mui/material';
import { api } from 'common';
import Container from '@mui/material/Container';
import { useTranslation } from "react-i18next";
import { colors } from '../components/Theme/WebTheme';
import {
    Autocomplete,
} from '@mui/material';
import AlertDialog from '../components/AlertDialog';
import Box from '@mui/material/Box';


const useStyles = makeStyles(theme => ({
    container: {
        width: 800,
        height: 500,
        backgroundColor: '#eee',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(2),
        borderRadius: '8px',
        marginTop: theme.spacing(10),
        boxShadow: theme.shadows[5],
        opacity: 2.9,
    },
    container1: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.Header_Text,
        borderRadius: "19px",
        padding: '30px',
        width: '100%',
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },

    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        borderRadius: '8px',
        padding: theme.spacing(2, 4, 3),
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
        backgroundColor: colors.Header,
        alignContent: 'center',
        borderRadius: "19px",
        padding: '10px'
    },
    title: {
        color: colors.Header_Text,
        textAlign: 'center',
        backgroundColor: colors.Header,
        width: "9rem",
        position: "absolute",
        top: 0,
        paddingBottom: 5,
        borderBottomRightRadius: "15px",
        borderBottomLeftRadius: "15px"
    },
    buttonStyle: {
        margin: 0,
        width: '100%',
        height: 40,
        borderRadius: "30px",
        backgroundColor: colors.RED_TREAS,
        marginTop: '25px',
        color: '#FFF',
        fontWeight: "bold",
        fontSize: "16px"
    },
}));

const Contracts = () => {
    const auth = useSelector(state => state.auth);
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir();
    const [, setRole] = useState(null);
    const classes = useStyles();
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const formattedDate = `(${day}) días del mes de ${month} del año ${year}`;
    const [openModal, setOpenModal] = useState(false);
    const [openModalTreasE, setOpenModalTreasE] = useState(false);
    const carlistdata = useSelector(state => state.carlistdata);
    const {
        updateProfile
    } = api;
    const dispatch = useDispatch();
    const [commonAlert, setCommonAlert] = useState({ open: false, msg: '' });
    const [data, setData] = useState({
        CompanyName: '',
        CClegalRepresentative: '',
        NITCompany: '',
        addresCompany: '',
        Full_Name_Legal_Representative: '',
        verifyIdRepresentativeLegal: '',
        cityCompany: '',
        docTypelegalrepresentative: '',
        vigencia: ''

    });
    const options = ['CC', 'PASAPORTE', 'CE'];
    const vigenciaOptions = ['30', '60', '90'];

    const [newData, setNewData] = useState({});
    const loaded = useRef(false);


    const completeSubmit = () => {
        const newDataToSend = {
            ...data,
            ...newData
        };
        dispatch(updateProfile(newDataToSend));
        loaded.current = true;
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        completeSubmit()
    }


    const handleCommonAlertClose = (e) => {
        e.preventDefault();
        setCommonAlert({ open: false, msg: '' })
    };

    useEffect(() => {
        if (auth.profile && auth.profile.usertype) {
            setRole(auth.profile.usertype);
        }
    }, [auth.profile]);

    useEffect(() => {
        if (carlistdata.cars) {
            setData(carlistdata.cars);
        } else {
            setData([]);
        }
    }, [carlistdata.cars]);

    const htmlContentRef = useRef(null);

    const handleConvertToPdf = () => {
        setOpenModalTreasE(false)
        const content = htmlContentRef.current;
        const options = {
            margin: [0, 10, 0, 10],
            filename: 'Contrato_TREAS_CORP_PSAS.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a2', orientation: 'portrait' },
        };

        html2pdf().set(options).from(content).save();
    };

    const handleOpenModal = () => {
        if (auth.profile && auth.profile.carType === 'TREAS-X') {
            setOpenModal(true);
        } else if (auth.profile && auth.profile.carType === 'TREAS-E' || auth.profile.carType === 'TREAS-VAN' || auth.profile.carType === 'TREAS-Van' ) {
            setOpenModalTreasE(true);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setOpenModalTreasE(false)
    };

    const handleCancelTREASE = () => {
        setOpenModalTreasE(false)
    }

    const handleAutocompleteChange = (event, value) => {
        setNewData({ ...data, ...newData, docTypelegalrepresentative: value });
    };

    const handleAutocompleteChangeVigencia = (event, value) => {
        setNewData({ ...data, ...newData, vigencia: value });
    };


    const handleInputChange = (e) => {
        setNewData({ ...data, ...newData, [e.target.id]: e.target.value });
    }

    const calculateEndDate = (vigencia) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Obtener la fecha de mañana

        const endDate = new Date(tomorrow);
        const vigenciaAsNumber = parseInt(vigencia); // Convertir vigencia a número entero
        endDate.setDate(endDate.getDate() + vigenciaAsNumber); // Agregar el número de días de vigencia

        // Obtener nombre del mes
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const monthName = months[endDate.getMonth()];

        // Obtener año
        const year = endDate.getFullYear();

        // Formatear la fecha de término de la vigencia
        const endDateFormatted = `${endDate.getDate()} de ${monthName} del ${year}`;

        // Formatear la fecha de mañana
        const tomorrowFormatted = `${tomorrow.getDate()} de ${months[tomorrow.getMonth()]} del ${tomorrow.getFullYear()}`;

        // Calcular la fecha de 30, 60 o 90 días después de mañana
        const futureDate = new Date(tomorrow);
        futureDate.setDate(futureDate.getDate() + vigenciaAsNumber); // Agregar el número de días de vigencia

        const futureDateFormatted = `${futureDate.getDate()} de ${months[futureDate.getMonth()]} del ${futureDate.getFullYear()}`;

        return {
            endDateFormatted: endDateFormatted,
            tomorrowFormatted: tomorrowFormatted,
            futureDateFormatted: futureDateFormatted
        };
    }



   
    return (
        <Grid container className={classes.root} justifyContent="center" alignItems="center" >

            {auth.profile.carType === 'TREAS-E'||auth.profile.carType =='TREAS-VAN'||auth.profile.carType =='TREAS-Van' && auth.profile.CompanyName ?
                <Container component="main" maxWidth="xs">
                    <form className={classes.form} onSubmit={handleSubmit} style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }}>
                        <div className={classes.container1}>
                            <Typography component="h1" variant="h5" className={classes.title}>
                                {'Contrato Disponible'}
                            </Typography>
                            <div style={{ height: 30 }} >
                            </div>
                            <Button onClick={handleOpenModal} type="submit" variant="contained" className={classes.buttonStyle} color="primary">
                                Abrir contrato
                            </Button>
                        </div>
                    </form>
                </Container>
                : auth.profile.carType === 'TREAS-E' || auth.profile.carType === 'TREAS-VAN' || auth.profile.carType === 'TREAS-Van' ?
                    <Container component="main" maxWidth="xs">
                        <form className={classes.form} onSubmit={handleSubmit} style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }}>
                            <div className={classes.container1}>
                                <Typography component="h1" variant="h5" className={classes.title}>
                                    {'Empresa transportadora'}
                                </Typography>

                                <div style={{ height: 30 }} >

                                </div>
                                <TextField
                                    className={isRTL === "rtl" ? classes.rootRtl_1 : classes.textField}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="CompanyName"
                                    label="Nombre de la empresa transportadora"
                                    name="CompanyName"
                                    autoComplete="CompanyName"
                                    onChange={handleInputChange}
                                    value={data.CompanyName}
                                />
                                <TextField
                                    className={isRTL === "rtl" ? classes.rootRtl_1 : classes.textField}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="NIT"
                                    label="Número de Identificación Tributaria"
                                    name="NIT"
                                    autoComplete="NIT"
                                    onChange={handleInputChange}
                                    value={data.NIT}
                                />

                                <TextField
                                    className={isRTL === "rtl" ? classes.rootRtl_1 : classes.textField}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="addresCompany"
                                    label="Dirección de la empresa"
                                    name="addresCompany"
                                    autoComplete="addresCompany"
                                    onChange={handleInputChange}
                                    value={data.addresCompany}
                                />

                                <TextField
                                    className={isRTL === "rtl" ? classes.rootRtl_1 : classes.textField}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="cityCompany"
                                    label="Ciudad de la empresa"
                                    name="cityCompany"
                                    autoComplete="cityCompany"
                                    onChange={handleInputChange}
                                    value={data.cityCompany}
                                />

                                <TextField
                                    className={isRTL === "rtl" ? classes.rootRtl3 : classes.textField}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="phoneNumber"
                                    label="Teléfono de empresa transportadora"
                                    name="phoneNumber"
                                    autoComplete="phoneNumber"
                                    onChange={handleInputChange}
                                    value={data.phoneNumber}
                                    sx={isRTL === "rtl" ? { "& .MuiInputBase-input": { textAlign: "end" } } : null}
                                    dir="ltr"
                                />

                                <TextField
                                    className={isRTL === "rtl" ? classes.rootRtl : classes.textField}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="Full_Name_Legal_Representative"
                                    label="Nombre del Representante legal"
                                    name="Full_Name_Legal_Representative"
                                    autoComplete="Full_Name_Legal_Representative"
                                    onChange={handleInputChange}
                                    value={data.Full_Name_Legal_Representative}
                                    autoFocus
                                />

                                <Autocomplete
                                    id="docTypelegalrepresentative"
                                    className={isRTL === "rtl" ? classes.rootRtl : classes.textField}
                                    style={{ width: 320 }}
                                    options={options}
                                    value={data?.docTypelegalrepresentative || null}
                                    onChange={(event, value) => handleAutocompleteChange(event, value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={t("Tipo de Documento")}
                                            variant="outlined"
                                            fullWidth
                                            className={isRTL === "rtl" ? classes.rootRtl : classes.textField}
                                        />
                                    )}
                                />

                                <TextField
                                    className={isRTL === "rtl" ? classes.rootRtl : classes.textField}
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    id="verifyIdRepresentativeLegal"
                                    label={t('verify_id')}
                                    name="verifyIdRepresentativeLegal"
                                    value={data.verifyIdRepresentativeLegal}
                                    onChange={handleInputChange}
                                />


                                <Autocomplete
                                    id="vigencia"
                                    className={isRTL === "rtl" ? classes.rootRtl : classes.textField}
                                    style={{ width: 320 }}
                                    options={vigenciaOptions}
                                    value={data?.vigencia || null}
                                    onChange={(event, value) => handleAutocompleteChangeVigencia(event, value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={t("Tipo de vigencia")}
                                            variant="outlined"
                                            fullWidth
                                            className={isRTL === "rtl" ? classes.rootRtl : classes.textField}
                                        />
                                    )}
                                />

                                <Button onClick={handleSubmit} type="submit" variant="contained" className={classes.buttonStyle} color="primary">
                                    Guardar Empresa
                                </Button>
                            </div>
                        </form>

                    </Container>
                    : auth.profile.carType === 'TREAS-X' ?
                        <div className={classes.container}>
                            <Typography variant="h4" component="h2" gutterBottom> Contrato Anual  </Typography>
                            <Button
                                size="small"
                                onClick={handleOpenModal}
                                variant="contained"
                                color="error"
                                className={classes.buttonStyle}
                            >
                                {'Abrir Contrato'}
                            </Button>
                        </div>
                        : null
            }

            <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>{commonAlert.msg}</AlertDialog>
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                className={classes.modal}
                onOk={handleConvertToPdf}
                onCancel={handleCloseModal}
                width={1000}
                footer={(handleCloseModal) => (
                    <>

                        <Button onClick={handleCloseModal}>Cancelar</Button>
                        <Button color="error" onClick={handleConvertToPdf}>Descargar</Button>
                    </>
                )}
            >
                <Container component="main" style={{ maxHeight: '80vh', overflow: 'auto' }}>
                    {data && data.length > 0 ?
                        data
                            .filter(c => c.carType === 'TREAS-X')
                            .map((c) => {
                                return (
                                    <Box
                                        height="100%"
                                        width={1100}
                                        my={4}
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="center"
                                        gap={4}
                                        p={2}
                                        sx={{ border: '2px solid grey', overflowY: 'auto' }}
                                        ref={htmlContentRef}
                                    >
                                        <Typography component="h4" variant="h7" textAlign="center" >CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</Typography>
                                        <Typography textAlign="center"  ><span style={{ fontWeight: 'bold' }} >  Contrato No:</span> {auth.profile.uid} </Typography>

                                        <Typography variant="body1" textAlign="justify" >
                                            Entre los suscritos, de una parte, <strong>TREAS CORP S.A.S</strong>, sociedad identificada con NIT. 901.565.494-9, domiciliada en la ciudad
                                            de Bogotá D.C. y quien actúa, en el <strong>CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</strong>, mediante su
                                            representante legal el señor JAVIER JARAMILLO SANMIGUEL, Identificado con cedula de ciudadanía No. 80.872.720 de
                                            Bogotá; y de la otra el señor <strong>{auth.profile.firstName}</strong>, mayor de edad, domiciliado y residente en Bogotá, identificado con la cédula de
                                            ciudadanía No. {auth.profile.docNumber}, hemos acordado la suscripción del presente <strong>CONTRATO ALQUILER DE HOSTING Y
                                                PROCESAMIENTO DE DATOS</strong>, que se regirá por las siguientes cláusulas:
                                        </Typography>
                                        <Typography variant="body1" textAlign="justify" >
                                            <strong>PRIMERA. Objeto: CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS entre TREAS CORP S.A.S</strong> y
                                            <strong>{auth.profile.firstName}</strong> para que la plataforma tecnológica propiedad de la primera, tenga en su base de datos el vehículo automotor del
                                            segundo, el cual podrá ser tomado en arrendamiento con o sin conductor por los posibles arrendatarios registrados en el
                                            sistema dispuesto por la Sociedad, vehículo automotor que se relaciona a continuación:
                                        </Typography>

                                        <Typography style={{ textAlign: 'initial' }}>PLACA:        {c.vehicleNumber} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>TIPO DE SERVICIO:    {c.carType} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>MARCA:    {c.vehicleMake} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>LÍNEA:    {c.vehicleLine} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>MODELO:    {c.vehicleModel} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>COLOR:    {c.vehicleColor} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>TIPO DE CARROCERÍA:    {c.vehicleMetalup} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>NUMERO DE SERIE:    {c.vehicleNoSerie} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>NUMERO DE MOTOR:    {c.vehicleNoMotor} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>NUMERO DE CHASIS:    {c.vehicleNoChasis} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>NUMERO DE VIN:    {c.vehicleNoVin} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>CILINDRAJE:    {c.vehicleCylinders} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>TIPO DE COMBUSTIBLE:    {c.vehicleFuel} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>NUMERO DE PUERTAS::    {c.vehicleDoors} </Typography>
                                        <Typography style={{ textAlign: 'initial' }}>CAPACIDAD:   4 Pax </Typography>



                                        <Typography variant="body1" textAlign="justify" >
                                            <strong>SEGUNDA. Contribuciones:</strong> Para el desarrollo del objeto del presente contrato <strong>TREAS CORP S.A.S</strong> contribuirá con la
                                            plataforma tecnológica de su propiedad.
                                        </Typography>



                                        <Typography variant="body1" textAlign="justify"  >
                                            <strong>Parágrafo.</strong> Con la suscripción de este <strong>CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS</strong>,
                                            {auth.profile.firstName}autoriza expresamente a <strong>TREAS CORP S.A.S</strong> para que suscriba en su nombre y representación de  {auth.profile.firstName},
                                            el contrato de arrendamiento del vehículo automotor con o sin conductor con el posible arrendatario registrado en la plataforma
                                            tecnológica que así lo solicite conforme a los términos y condiciones que defina <strong>TREAS CORP S.A.S</strong>.
                                        </Typography>

                                        <Typography variant="body1" textAlign="justify"  >
                                            <strong>TERCERA. Retorno de contribuciones:</strong> A la terminación del plazo de vigencia del contrato la contribución de TREAS CORP
                                            SAS retornará a su respectivo propietario.
                                        </Typography>

                                        <Typography variant="body1" textAlign="justify"  >
                                            <strong> CUARTA. Utilidades y pérdidas: TREAS CORP S.A.S</strong> no participará de posibles pérdidas o ganancias que arroje la
                                            ejecución del contrato de arrendamiento de vehículo automotor con o sin conductor.
                                        </Typography>

                                        <Typography variant="body1" textAlign="justify"  >
                                            En ese sentido, <strong> TREAS CORP S.A.S</strong>, dispondrá de un medio tecnológico para recibir el valor total del valor del Hosting que
                                            debe prepagar {auth.profile.firstName} y que adicionalmente deberá precargar su paquete obligatorio de seguros - de Responsabilidad
                                            Civil Contractual (RC) y Responsabilidad Civil Extracontractual (RCE) - para poder prestar sus servicio como proveedores.
                                            Por esta actividad <strong> TREAS CORP S.A.S</strong> cobrará, un % adicional del valor del canon del seguro pagado por  {auth.profile.firstName}, al
                                            momento de la terminación de cada contrato de arrendamiento de vehículo automotor con o sin conductor por la prestación
                                            de servicios en el tratamiento de datos, por arrendamiento del hosting y los demás servicios tecnológicos relacionados con
                                            estos.
                                        </Typography>

                                        <Typography variant="body1" textAlign="justify"  >
                                            <strong> Parágrafo primero.</strong> Los valores recaudados por TREAS CORP S.A.S a favor de {auth.profile.firstName} serán pagados a este según
                                            lo convenido, junto con el valor de la prima correspondiente al valor de la póliza de seguros, descontado del porcentaje
                                            respectivo según lo explicado en el párrafo anterior, cada día después de las 5:00 pm en días hábiles laborales siguiente a
                                            su recaudo, en las cuentas registradas por {auth.profile.firstName} por y los costos de dichas transferencias si los hay, deben ser
                                            asumidos por el arrendatario.
                                        </Typography>

                                        <Typography variant="body1" textAlign="justify"  >
                                            <strong>Parágrafo segundo.</strong> De acuerdo con la naturaleza de este contrato, contenida en el inciso segundo de presente artículo,
                                            TREAS CORP S.A.S debe incluir en su declaración de renta e IVA, solo los ingresos que obtenga por la comisión a que tienen
                                            derecho por la labor tecnológica que realiza. Por lo tanto, las partes reconocen que los otros ingresos, costos y gastos, aunque
                                            se encuentren facturados a nombre de TREAS CORP S.A.S, no le pertenecen.
                                            <br />
                                            <br />
                                            En consecuencia, {auth.profile.firstName} debe incluir en su declaración todos los impuestos sobre todos los ingresos, costos y
                                            deducciones que se deriven del contrato, soportándolos con la certificación y facturas emitidas por el TREAS CORP S.A.S
                                        </Typography>

                                        <Typography variant="body1" textAlign="justify"  >
                                            <strong>QUINTA.</strong> Responsabilidad frente a terceros: En caso de pérdidas u obligaciones de cualquier naturaleza frente a terceros,
                                            {auth.profile.firstName} responderá por las mismas.
                                            <br />
                                            <br />
                                            <strong>Parágrafo.</strong> {auth.profile.firstName}, deberá adquirir de manera anticipada las pólizas de responsabilidad civil contractual y
                                            extracontractual para cubrir la responsabilidad que se pueda causar frente al contratante y/o a terceros, para facilitar lo
                                            anterior, TREAS CORP S.A.S actuará como tomador de las pólizas de seguros de las mencionadas pólizas de responsabilidad
                                            civil contractual y extracontractual, fungiendo {auth.profile.firstName} como asegurado de las pólizas correspondientes, debiendo
                                            efectuar el pago de las primas correspondientes.
                                            <br />
                                            <br />
                                            <strong> SEXTA.</strong> Control de las operaciones: corresponde a {auth.profile.firstName} la gestión, administración y realización del negocio materia
                                            del presente contrato. En tal sentido, {auth.profile.firstName} deberá proceder con diligencia, prudencia, buena fe y lealtad. Para esto,
                                            {auth.profile.firstName} deberá mantener el vehículo en buen estado y con toda la documentación legalmente exigida para la operación
                                            del vehículo (SOAT, Revisión Técnico-Mecánica, cuando aplique y las pólizas aludidas en la cláusula quinta).
                                            <br />
                                            <br />
                                            Asimismo, las partes declaran expresamente que corresponde a {auth.profile.firstName} cualquier vinculación económica que en el
                                            desarrollo del negocio se acuerde con terceros, para lo cual {auth.profile.firstName} actuará en nombre propio al celebrar contratos, al
                                            asumir obligaciones o al adquirir créditos, sin perjuicio de la autorización de que trata el parágrafo de la cláusula segunda del
                                            presente Acuerdo.
                                            <br />
                                            <br />
                                            En consecuencia, queda convenido que no existirá relación jurídica alguna entre los terceros y TREAS CORP S.A.S y
                                            asimismo, los terceros no adquirirán derechos ni asumirán obligaciones frente a TREAS CORP S.A.S ni éste ante aquellos.
                                            SÉPTIMA. Deber de información: {auth.profile.firstName} está obligado a informar periódicamente a TREAS CORP S.A.S acerca de
                                            la marcha del negocio materia del presente contrato y a rendir cuentas sobre el mismo.
                                            <br />
                                            <br />
                                            <strong>SÉPTIMA. Deber de información:</strong> {auth.profile.firstName} está obligado a informar periódicamente a TREAS CORP S.A.S acerca de
                                            la marcha del negocio materia del presente contrato y a rendir cuentas sobre el mismo.
                                            <br />
                                            <br />
                                            <strong>OCTAVA. Inspección de las operaciones:</strong> TREAS CORP S.A.S tendrá la facultad de fiscalización y control de los actos de
                                            {auth.profile.firstName}.
                                            <br />
                                            <br />
                                            En consecuencia, TREAS CORP S.A.S tendrá derecho a exigir se le muestren los documentos que permitan conocer el
                                            estado real del desenvolvimiento económico del negocio.

                                            <br />
                                            <br />

                                            <strong> NOVENA. Participación de terceros:</strong> {auth.profile.firstName} no podrá atribuir a otras empresas o personas alguna participación en el
                                            presente CONTRATO ALQUILER DE HOSTING Y PROCESAMIENTO DE DATOS.

                                            <br />
                                            <br />

                                            <strong>  DÉCIMA. Exclusividad:</strong> {auth.profile.firstName} se obliga, dentro del periodo de duración del presente contrato y hasta por 5 años una
                                            vez terminado el mismo, a no realizar en forma individual o a través de terceros actividad idéntica o similar de la que es
                                            materia del presente Acuerdo, de lo contrario se aplicará una sanción financiera de 120 SMMLV
                                            <br />
                                            <br />

                                            <strong> DÉCIMA PRIMERA. Duración:</strong> El presente Acuerdo tiene una duración de un (01) año contado a partir de su celebración y
                                            se renovará automáticamente por periodos iguales salvo que se comunique a la otra parte la intención de no renovar el mismo
                                            por medio de correo certificado tres (3) meses antes del vencimiento del presente Acuerdo.

                                            <br />
                                            <br />
                                            <strong> DÉCIMA SEGUNDA.</strong> Uso de marcas comerciales: Las partes expresamente acuerdan que en la promoción del negocio se
                                            podrán utilizar las marcas comerciales propiedad de TREAS CORP S.A.S, siempre y cuando se observe lo previsto de la
                                            cláusula sexta del presente contrato.

                                            <br />
                                            <br />
                                            <strong> DÉCIMA TERCERA. Acuerdo de confidencialidad:</strong> Las partes acuerdan que mantendrán la confidencialidad de los datos
                                            e información intercambiados entre ellas, incluyendo información objeto de derechos de autor, patentes técnicas, modelos,
                                            invenciones, know-how, procesos, algoritmos, programas, ejecutables, investigaciones, detalles de diseño, información
                                            financiera, lista de clientes, proveedores, inversionistas, empleados, relaciones de negocios y contractuales; pronósticos de
                                            negocios, planes de mercadeo, metodologías de viabilización técnica y/o financiera propia, modelos de negocio, así como
                                            cualquier información revelada en el desarrollo del presente contrato de suministro sobre terceras personas. Las partes
                                            acuerdan que cualquier información intercambiada, facilitada o creada entre ellas en la ejecución del presente contrato, será
                                            mantenida en estricta confidencialidad, aún después de vencido o terminado el plazo definido en el mismo. La parte receptora
                                            correspondiente sólo podrá revelar información confidencial a quienes la necesiten y estén autorizados previamente por la
                                            parte de cuya información confidencial se trata.
                                            <br />
                                            <br />
                                            <strong>Parágrafo Primero. Sanciones por Violar el Acuerdo de Confidencialidad</strong>
                                            <br />
                                            <br />
                                            Si alguna de las partes viola alguna de las disposiciones antes mencionadas en relación con lo que se considera objeto de la
                                            Confidencialidad, ocasionará el pago de una multa de $ 100.000.000 COP, sin perjuicio de las demás acciones laborales,
                                            comerciales y penales a que haya lugar para la reclamación de indemnización de perjuicios ocasionados con la violación a la
                                            Confidencialidad aquí suscrita.
                                            <br />
                                            <br />
                                            <strong> Parágrafo Segundo.</strong> Esta misma sanción se aplicará en caso de que el {auth.profile.firstName} contacte al arrendatario de su vehículo
                                            a través de medios diferentes a la plataforma TREASAPP una vez terminado el contrato de Arrendamiento.
                                            <br />
                                            <br />
                                            <strong> DÉCIMA CUARTA.</strong> Solución de controversias: Las controversias o diferencias que surjan entre las partes con ocasión de
                                            la firma, ejecución, interpretación o terminación del Contrato, así como de cualquier otro asunto relacionado con el presente
                                            Contrato, serán sometidas a la revisión de las partes para buscar un arreglo directo, en un término no mayor a cinco (5) días
                                            hábiles a partir de la fecha en que cualquiera de las partes comunique por escrito a la otra la existencia de una diferencia.

                                            <br />
                                            <br />
                                            Las controversias que no puedan ser resueltas de forma directa entre las partes, se resolverán mediante un procedimiento
                                            conciliatorio que se surtirá ante la CÁMARA DE COMERCIO DE BOGOTÁ, previa solicitud de conciliación elevada individual
                                            o conjuntamente por las Partes. Si en el término de ocho (8) días hábiles a partir del inicio del trámite de la conciliación, el
                                            cual se entenderá a partir de la fecha de la primera citación a las Partes que haga CÁMARA DE COMERCIO, las Partes no
                                            llegan a un acuerdo para resolver sus diferencias deben acudir a la jurisdicción competente
                                            <br />
                                            <br />
                                            En señal de conformidad las partes suscriben el presente documento de manera digital a los {formattedDate}

                                        </Typography>

                                        <div style={{ height: 200, display: 'flex', flexDirection: 'row' }}>
                                            <div style={{ justifyContent: 'center', alignItems: 'center', height: 200, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                                <img src={FirmaGerente} alt="Firma del Gerente" style={{ width: 400, position: 'absolute', top: -150, left: '50%', transform: 'translateX(-50%)' }} />
                                                <div style={{ textAlign: 'justify' }}>
                                                    <h3 style={{ textAlign: 'justify' }}>
                                                        ________________________________________
                                                        <br />
                                                        TREAS CORP S.A.S
                                                        <br />
                                                        Nombre: Erixon Chaparro Martínez
                                                        <br />
                                                        Cargo: Gerente General
                                                    </h3>
                                                </div>
                                            </div>


                                            <div style={{ justifyContent: 'center', alignItems: 'center', height: 200, flex: 1, display: 'flex', flexDirection: 'column' }}>


                                                <h3 style={{ textAlign: 'justify' }}>
                                                    ________________________________________
                                                    <br />
                                                    {auth.profile.firstName}
                                                    <br />
                                                    Nombre: {auth.profile.firstName} {auth.profile.lastName}
                                                    <br />
                                                    No. de Cédula: {auth.profile.docNumber}
                                                </h3>
                                            </div>
                                        </div>
                                    </Box>
                                );
                            })
                        : null}
                </Container>

            </Modal>

            <Modal
                open={openModalTreasE}
                onClose={handleCloseModal}
                className={classes.modal}
                onOk={handleConvertToPdf}
                onCancel={handleCancelTREASE}
                footer={(closeModal) => (
                    <>

                        <Button onClick={handleCloseModal}>Cancelar</Button>
                        <Button color="error" onClick={handleConvertToPdf}>Descargar</Button>
                    </>
                )}
            >
                <Container component="main" style={{ maxHeight: '80vh', overflow: 'auto' }}>
                    {data && data.length > 0 ?
                        data
                            .filter(c => c.carType === 'TREAS-E'|| c.carType === 'TREAS-VAN' ||c.carType === 'TREAS-Van')
                            .map((c) => {
                                return (
                                    <Box
                                        height="100%"
                                        width={1100}
                                        my={4}
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="center"
                                        gap={4}
                                        p={2}
                                        sx={{ border: '2px solid grey', overflowY: 'auto' }}
                                        ref={htmlContentRef}
                                    >

                                        <Typography component="h4" variant="h7" textAlign="center"   >
                                            {'CONTRATO DE PRESTACIÓN DE SERVICIOS DE TRANSPORTE ESPECIAL DECRETO 1079 DE 2015 MODIFICADO POR EL 0431 DE 2017 (DECRETOS MINISTERIO DE TRANSPORTE) CONTRATO'} {auth.profile.uid}
                                        </Typography>

                                        <Typography variant="body1" textAlign="justify" >
                                            Entre los suscritos a saber  <span style={{ fontWeight: 'bold' }}>JAVIER JARAMILLO SANMIGUEL</span>, mayor de edad, identificado con Cédula de Ciudadanía <span style={{ fontWeight: 'bold' }}> No. 80.872.720</span> de Bogotá y domiciliado en Bogotá,
                                            actuando en nombre y representación de la empresa TREAS CORP SAS NIT. 901.656.494-9, con domicilio en la Av. Calle 100 # 8a – 55 World Trade Center Torre C en
                                            Bogotá y que para el presente contrato se denominará   <span style={{ fontWeight: 'bold' }}>EL CONTRATANTE </span> y por otra parte {auth.profile.Full_Name_Legal_Representative} mayor de edad, identificado con Cédula
                                            de Ciudadanía No. {auth.profile.CClegalRepresentative}, quien actúa como Representante Legal de la Empresa {auth.profile.CompanyName}. Identificado(a) con Nit. {auth.profile.NIT} domiciliado en
                                            la {auth.profile.addresCompany} en {auth.profile.cityCompany} quien para efectos del presente contrato se denominará  <span style={{ fontWeight: 'bold' }}>EL CONTRATISTA </span>, hemos acordado celebrar el Presente contrato de Prestación de Servicios
                                            para desarrollar actividades relacionadas con el Servicio Público de Transporte Especial de Pasajeros y Mensajería, regulado por las normas y disposiciones vigentes en la República de Colombia para este tipo
                                            de contrataciones y en especial las contenidas en el Código Civil y enmarcado dentro de las siguientes cláusulas:
                                        </Typography>

                                        <Typography variant='body1' gutterBottom textAlign='justify'>
                                            <span style={{ fontWeight: 'bold' }}>PRIMERA: OBJETO.</span> - El contratista se compromete a prestar al Grupo Especifico de Usuarios del contratante el servicio de transporte, la vigilancia y control de la normatividad del servicio de transporte especial de pasajeros así, lo anterior como beneficio a nuestro grupo de Miembros de la empresa.

                                            " TRANSPORTE DE PERSONAL, FUNCIONARIOS, CONTRATISTAS, EMPRESARIOS, MIEMBROS Y CLIENTES ASIGNADOS PREVIAMENTE POR LA EMPRESA TREAS CORP SAS Y CUYOS OCUPANTES AL MENOS UNO DEBE ESTAR DEBIDAMENTE CARNETIZADO CON NUESTRA EMPRESA TREASCORP SAS CON NOMBRE Y NÚMERO DE CÉDULA.
                                        </Typography>

                                        <Typography variant='body1' gutterBottom textAlign='justify'>
                                            POR EL PERÍMETRO URBANO EN BOGOTÁ D.C, SUS 20 LOCALIDADES Y AEROPUERTO EL DORADO" SALIENDO DE BOGOTÁ A LOS SIGUIENTES MUNICIPIOS DEL DEPARTAMENTO DE CUNDINAMARCA Y AEROPUERTO ELDORADO, TERMINALES DE TRANSPORTE TERRESTRE: CHÍA, CAJICA, COTA, SIBERIA, FUNZA, MOSQUERA, MADRID, FACATATIVÁ, ALBÁN, SASAIMA, MELGAR, FLANDES, ESPINAL, GUALANDAY, IBAGUÉ, VILLETA, GUADUAS, PUERTO BOYACÁ, SOACHA, GRANADA, SILVANIA, FUSAGASUGÁ, CHINAUTA, MELGAR, BOQUERÓN, LA MESA, MESITAS, RICAURTE, GIRARDOT, ANAPOIMA, APULO, TOCAIMA, TABIO, TENJO, BRICEÑO, TOCANCIPÁ, GACHANCIPÁ, SESQUILÉ, CHOCONTÁ, VILLA PINZÓN, GUATEQUE, PUENTE PIEDRA, EL ROSAL, EL VINO, SAN FRANCISCO, LA VEGA, NOCAIMA, VILLETA, GUADUAS, ZIPAQUIRÁ, SOPÓ, GUATAVITA, LA CALERA, QUEBRADANERGA, UTICA, YACOPI, LA AGUADA, EL PEÑÓN, CARAPEGUA, SUSATAUSA, UBATÉ, FUQUENE, SIMIJACA, Y SUSA.
                                        </Typography>

                                        <Typography variant='body1' gutterBottom textAlign='justify'>
                                            Del vehículo:
                                        </Typography>

                                        <Typography variant='body1' gutterBottom textAlign='justify'>
                                            <span style={{ fontWeight: 'bold' }}>Tipo:</span> {c.vehicleForm}
                                        </Typography>

                                        <Typography variant='body1' gutterBottom textAlign='justify'>
                                            <span style={{ fontWeight: 'bold' }}>Placa:</span> {c.vehicleNumber}

                                        </Typography>

                                        <Typography variant='body1' gutterBottom textAlign='justify'>
                                            <span style={{ fontWeight: 'bold' }}>Marca:</span> {c.vehicleMake}

                                        </Typography>
                                        <Typography variant='body1' gutterBottom textAlign='justify'>
                                            <span style={{ fontWeight: 'bold' }}>Nombre del Conductor:</span> {auth.profile.firstName} {auth.profile.lastName}

                                        </Typography>
                                        <Typography variant='body1' gutterBottom textAlign='justify'>
                                            <span style={{ fontWeight: 'bold' }}>Cédula Conductor:</span> {auth.profile.verifyId}
                                        </Typography>
                                        <Typography>
                                            <span style={{ fontWeight: 'bold' }}>SEGUNDA: OBLIGACIONES DEL CONTRATISTA:</span> Son obligaciones las siguientes:
                                        </Typography>

                                        <Typography>
                                            1) Contar con personal idóneo y calificado, que cumpla con los requisitos de movilidad.
                                        </Typography>

                                        <Typography>
                                            2) Realizar las actividades teniendo en cuenta las disposiciones legales dictadas por el Ministerio de Transporte y Medio Ambiente, vigentes.
                                        </Typography>

                                        <Typography>
                                            3) Deberá cumplir con todos los requisitos para la libre circulación y prestación de servicio de

                                            transportes exigidos por el Ministerio de Transporte y demás entidades que regulan esta clase de transporte. Este requisito es aplicable tanto para los vehículos como para los conductores.
                                        </Typography>

                                        <Typography>
                                            4) El vehículo debe tener vigentes durante la ejecución del contrato los siguientes documentos:
                                            Tarjeta de operación, Soat, Tarjeta de Propiedad Revisión Técnico-mecánica y los demás documentos exigidos por las autoridades de tránsito para la prestación de este servicio.
                                        </Typography>

                                        <Typography>
                                            5) Se obliga al cumplimiento de todas las leyes laborales vigentes y al pago por su cuenta de
                                            todos los salarios, prestaciones sociales de Ley y deberá afiliar a los conductores al sistema de
                                            seguridad social en salud, pensión, ARL y cajas de compensación.
                                        </Typography>


                                        <Typography>
                                            <span style={{ fontWeight: 'bold' }} > TERCERA: CONDICIONES DEL VEHICULO.</span>  -Para el óptimo servicio EL CONTRATISTA se obliga a emplear los vehículos que cumplan con las siguientes características:
                                        </Typography>

                                        <Typography>
                                            1- Vehículo tipo ({c.vehicleMetalup}) con aire acondicionado, con equipo de sonido, con capacidad máxima de ({c.vehiclePassengers}) personas INCLUIDO EL CONDUCTOR sentadas cómodamente, teléfono celular, dotado con el botiquín de primeros auxilios y equipo de carretera.
                                        </Typography>


                                        <Typography>
                                            2- El vehículo deberá mantenerse en perfectas condiciones mecánicas, de mantenimiento, pintura, tapizado, aseo, higiene y presentación general.
                                        </Typography>


                                        <Typography>
                                            <span style={{ fontWeight: 'bold' }}>CUARTA: VIGENCIA DE CONTRATO:</span> el contrato empresarial de prestación de servicios tendrá
                                            vigencia desde ({auth.profile.vigencia} días, {calculateEndDate(auth.profile.vigencia).tomorrowFormatted}, es decir, hasta el día {calculateEndDate(auth.profile.vigencia).endDateFormatted})
                                        </Typography>





                                        <Typography>
                                            <span style={{ fontWeight: 'bold' }}>QUINTA: TERMINACIÓN DEL CONTRATO:</span> El presente contrato termina por voluntad de las partes de común acuerdo. En forma unilateral cuando alguna de las partes incumpla con alguna de las condiciones y obligaciones establecidas en este contrato. Por incumplimiento del conductor a los Términos y Condiciones previamente aceptados al ser proveedor independiente del CONTRATISTA que podrá encontrarse en https://treasapp.com/t%C3%A9rminos-y-condiciones .La terminación anticipada no genera ninguna sanción o Indemnización para ninguna de las partes.

                                        </Typography>


                                        <Typography>
                                            Para constancia se firma por las partes en dos ejemplares del mismo tenor, en la ciudad de Bogotá a los {formattedDate}.
                                        </Typography>


                                        <div style={{ height: 200, display: 'flex', flexDirection: 'row' }}>
                                            <div style={{ justifyContent: 'center', alignItems: 'center', height: 200, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <h3 style={{ textAlign: 'justify' }}>
                                                    ___________________________
                                                    <br />
                                                    {auth.profile.Full_Name_Legal_Representative} <br />
                                                    {auth.profile.docTypelegalrepresentative} {auth.profile.verifyIdRepresentativeLegal} REPRESENTANTE LEGAL.
                                                    <br />
                                                    {auth.profile.CompanyName}
                                                    <br />
                                                    {auth.profile.NIT}
                                                </h3>
                                            </div>
                                            <div style={{ justifyContent: 'center', alignItems: 'center', height: 200, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                                <img src={FirmaGerente} alt="Firma del Gerente" style={{ width: 400, position: 'absolute', top: -150, left: '50%', transform: 'translateX(-50%)' }} />
                                                <div style={{ textAlign: 'justify' }}>
                                                    <h3 style={{ textAlign: 'justify' }}>
                                                        ________________________________________
                                                        <br />
                                                        TREAS CORP S.A.S
                                                        <br />
                                                        Nombre: Erixon Chaparro Martínez
                                                        <br />
                                                        Cargo: Gerente General
                                                    </h3>
                                                </div>
                                            </div>

                                        </div>




                                    </Box>
                                )
                            }) : null}
                </Container>
            </Modal>








        </Grid>
    );
};



export default Contracts