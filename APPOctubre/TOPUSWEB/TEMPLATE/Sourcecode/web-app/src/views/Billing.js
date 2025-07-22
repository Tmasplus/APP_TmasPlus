import React, { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import html2pdf from 'html2pdf.js'; // Importa html2pdf.js
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment/min/moment-with-locales";
import Link from '@mui/material/Link';

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

export default function Checkout() {
    const [bookingReference, setBookingReference] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const bookinglistdata = useSelector(state => state.bookinglistdata);
    const [data, setData] = useState([]);
    const { t } = useTranslation();
    const [role, setRole] = useState(null);
    const auth = useSelector(state => state.auth);


    useEffect(() => {
        if (auth.profile && auth.profile.usertype) {
            setRole(auth.profile.usertype);
        }
    }, [auth.profile]);

    useEffect(() => {
        if (bookinglistdata.bookings) {
            setData(bookinglistdata.bookings);
        } else {
            setData([]);
        }
    }, [bookinglistdata.bookings]);

    const handleSearch = () => {
        const foundBooking = data.find(booking => booking.reference === bookingReference);
        setSelectedBooking(foundBooking);
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('summary'); // Elemento que se convertirá a PDF
        const opt = {
            margin: 1,
            filename: 'Resumen de Servicio.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'legal', orientation: 'portrait' } // Cambiamos el formato a 'legal'
        };
        html2pdf().set(opt).from(element).save(); // Convierte el elemento a PDF y lo descarga
    };


    const handleCopyToClipboard = () => {
        const element = document.getElementById('copyBooking');
        navigator.clipboard.writeText(element.innerText);

    };

    const handleEmail = () => {
        sendEmail();
    }

    const sendEmail = () => {
        const email = `${selectedBooking.customer_email}`;
        const subject = `Confirmación de servicio ${selectedBooking.reference}`;
        const copiedText = document.getElementById('copyBooking').innerText;
        const body = `El texto copiado es: ${copiedText}`;

        const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Abre el cliente de correo electrónico predeterminado con el mensaje ya predefinido
        window.open(emailUrl);
    };


    const horaActual = new Date().getHours();
    let saludo;


    if (horaActual >= 5 && horaActual < 12) {
        saludo = 'Buenos Días';
    } else if (horaActual >= 12 && horaActual < 18) {
        saludo = 'Buenas Tardes';
    } else {
        saludo = 'Buenas Noches';
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar
                position="absolute"
                color="default"
                elevation={0}
                sx={{
                    position: 'relative',
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                }}
            >
                <Toolbar>
                    <Typography variant="h6" color="inherit" noWrap>
                        Resumen del Servicio  {selectedBooking && (<Typography>/{selectedBooking.reference}</Typography>)}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center" sx={{ mb: 2 }}>
                        Resumen del Servicio
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <TextField
                            label="Referencia de reserva"
                            variant="outlined"
                            value={bookingReference}
                            onChange={(e) => setBookingReference(e.target.value)}
                            sx={{ mr: 2 }}
                        />
                        <Button variant="contained" color='error' onClick={handleSearch}>
                            Buscar
                        </Button>
                    </Box>

                    {role === 'admin' ?
                        <>
                            {selectedBooking && (
                                <Box id="summary" >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }} >
                                        <img src={require("../assets/img/LogoNegroRojo1024x1024.png").default} alt='logo' style={{ height: 150, maxHeight: '80vh', overflow: 'auto' }} />

                                        <Typography variant="h4">Gracias por usar nuestros Servicios</Typography>
                                        <Typography variant="body1" textAlign="justify" > Usuario:  {selectedBooking.customer_name} {selectedBooking.payment_mode === 'corp' ? 'Empresa:' + selectedBooking.company : null} </Typography>

                                        <div style={{ display: 'flex', flexDirection: 'row', marginTop: 10 }} >
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <img src={require("../assets/img/rsmR3.png").default} alt='logo' style={{ height: 240, maxHeight: '80vh', overflow: 'auto' }} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography style={{ color: '#F20505', }} variant='title' >Datos del Recorrido </Typography>
                                                    <Typography> <strong>Fecha del Servicio:</strong> <span>{moment(selectedBooking.tripdate).format("lll")} </span> </Typography>
                                                    <Typography><strong>{t('pickup_address')}</strong>: {selectedBooking.pickupAddress}</Typography>
                                                    <Typography><strong>{t('drop_address')}</strong>: {selectedBooking.dropAddress}</Typography>
                                                    <Typography><strong>{t('car_type')}</strong>: {selectedBooking.carType}</Typography>
                                                    <Typography><strong>{t('Servicio prestado')}</strong>: {t(selectedBooking.tripType)}</Typography>
                                                    <Typography><strong>{t('trip_start_time')}</strong>: {(selectedBooking.trip_start_time)}</Typography>
                                                    <Typography><strong>{t('trip_end_time')}</strong>: {(selectedBooking.trip_end_time)}</Typography>
                                                </Grid>


                                            </Grid>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'row-reverse' }} >
                                            <Grid container spacing={2}>

                                                <Grid item xs={12} md={6}>
                                                    <Typography> <strong> Cod. de Servicio</strong>:{selectedBooking.id} </Typography>
                                                    <Typography><strong>{t('Kilómetros')}</strong>: {selectedBooking.distance}</Typography>
                                                    <Typography><strong>{t('Tiempo total en segundos')}</strong>: {selectedBooking.total_trip_time}</Typography>
                                                    {selectedBooking.payment_mode === 'corp' ?
                                                        <>
                                                            <Typography variant="h6" style={{ color: '#ea969d', fontWeight: 'bold' }}  >Detalle de Cobro Tecnológico</Typography>
                                                            <Typography>
                                                                <strong style={{ color: '#ea969d' }}>{t('Hosting Tecnológico')}</strong>:&nbsp;
                                                                <span style={{ color: 'black' }}>{selectedBooking.Technological_Hosting} </span>
                                                            </Typography>
                                                            <Typography><strong>{'Base de impuestos'}</strong>: ${t(selectedBooking.Base_de_IVA)}</Typography>
                                                            <Typography><strong>{t('Iva')}</strong>: {t(selectedBooking.Iva)} COP </Typography>
                                                            <Typography style={{ color: '#F20505' }} variant="h6" ><strong>{t('Total a pagar')}</strong>:<span style={{ color: 'black' }} > ${selectedBooking.payment_mode === 'corp' ? selectedBooking.cost_corp : selectedBooking.trip_cost}</span> </Typography>
                                                        </>
                                                        : null}
                                                    <Typography><strong>{t('Ingreso total para conductor')}</strong>: ${selectedBooking.trip_cost} </Typography>
                                                </Grid>

                                                <Grid item xs={12} md={6}>
                                                    <img src={require("../assets/img/rsmR2.png").default} alt='logo' style={{ height: 280, maxHeight: '80vh', overflow: 'auto' }} />
                                                </Grid>
                                            </Grid>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'row', marginTop: 10, alignItems: 'center' }} >
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <img src={require("../assets/img/rsmR1.png").default} alt='logo' style={{ height: 240, maxHeight: '80vh', overflow: 'auto' }} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="h6" style={{ color: '#F20505', fontWeight: 'bold' }}  >Datos del Conductor</Typography>

                                                    <Typography><strong>{t('Conductor')}</strong>: {selectedBooking.driver_name}</Typography>
                                                    <Typography><strong>{t('Marca Vehículo')}</strong>: {selectedBooking.vehicleMake}</Typography>
                                                    <Typography><strong>{t('Placas')}</strong>: {selectedBooking.vehicle_number}</Typography>
                                                    <Typography><strong>{t('car_type')}</strong>: {selectedBooking.carType}</Typography>
                                                </Grid>
                                            </Grid>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'row', margin: 10, alignItems: 'center', width: '80%' }} >
                                            <Typography textAlign="center" style={{ color: '#000', fontWeight: 'bold' }}  >Invita a tus amigos y familiares, descarga nuestra aplicación en la tiene da oficial de tu dispositivo TREASAPP movilízate sin recargos adicionales por Demanda ni recargos al aeropuerto.  </Typography>
                                        </div>
                                    </div>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Button variant="contained" color="error" onClick={handleDownloadPDF}>
                                    Descargar Resumen
                                </Button>
                            </Box>
                        </>
                        : null}



                </Paper>

                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center" sx={{ mb: 2 }}>
                        Confirmación del Servicio
                    </Typography>

                    {selectedBooking && (
                        <Box >
                            <Grid container spacing={2} id="copyBooking" >
                                <Typography>
                                    {saludo}, {'Sr(a)'}. {selectedBooking.customer_name}
                                    <br />
                                    Te confirmo, estos son los datos del conductor y vehículo que te recogerá el día {moment(selectedBooking.tripdate).format("lll")} ya confirmado:
                                </Typography>
                                <Grid item xs={6}>
                                    <Typography> <strong>Fecha del Servicio:</strong> <span>{moment(selectedBooking.tripdate).format("lll")} </span> </Typography>
                                    <Typography><strong>{t('pickup_address')}:</strong> {selectedBooking.pickupAddress}</Typography>
                                    <Typography><strong>{t('Dirección de Destino')}:</strong> {selectedBooking.dropAddress}</Typography>
                                    <Typography><strong>{t('customer_name')}:</strong> {selectedBooking.customer_name}</Typography>
                                    <Typography><strong>{t('assign_driver')}:</strong> {selectedBooking.driver_name}</Typography>
                                    <Typography><strong>{t('Contacto del conductor')}:</strong> {selectedBooking.driver_contact}</Typography>
                                    <Typography><strong>{t('Color del Vehículo')}:</strong> {selectedBooking.vehicleColor}</Typography>
                                    <Typography><strong>{t('vehicle_make')}:</strong> {selectedBooking.vehicleMake}</Typography>
                                    <Typography><strong>{t('car_type')}:</strong> {selectedBooking.carType}</Typography>
                                    <Typography>*<strong>{t('otp')} {selectedBooking.otp}</strong>*</Typography>
                                    {auth.profile.uid === '-NxIv7kjqdrD9fFel_zH' ? null : <Typography><strong>{t('Valor Estimado')}:</strong>${selectedBooking.estimate} - ${parseInt(selectedBooking.estimate) + 7000}</Typography>}
                                    <Typography><strong>{t('Distancia Estimada')}:</strong> {selectedBooking.distance} Km</Typography>
                                    <Typography><strong>{t('vehicle_no')}:</strong> {selectedBooking.vehicle_number}</Typography>
                                    <Typography><strong>{t('payment_mode')}:</strong> {t(selectedBooking.payment_mode)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography>
                                        Recuerda que tu conductor estará <strong> el día {moment(selectedBooking.tripdate).format("lll")}</strong> más o menos listo para atender tu servicio, por favor si requieres espera alguna, por favor ponerte en contacto con tu conductor Indicarle de dicha espera y por favor compartir tu código de seguridad y así que nuestra TREASAPP contabilice la espera y el recorrido de tu servicio.
                                        Si quieres seguir tu servicio en nuestra TREASAPP solo debes descargarla según tu sistema operativo e ingresar con tu Email registrado y solicita *"Olvide mi contraseña"*:
                                        <br />
                                        <Link herf='https://play.google.com/store/apps/details?id=com.treasapp.treas22' >Android: https://play.google.com/store/apps/details?id=com.treasapp.treas22  </Link>
                                        <br />
                                        <Link herf='https://apps.apple.com/app/treasapp/id6456222848' >IOS: https://apps.apple.com/app/treasapp/id6456222848</Link>
                                    </Typography>
                                </Grid>

                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Button variant="contained" color="error" onClick={handleCopyToClipboard} sx={{ mr: 2 }} >
                                    Copiar Confirmación
                                </Button>

                                <Button variant="contained" color="error" onClick={handleEmail}>
                                    Enviar por email Confirmación
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>
        </ThemeProvider >
    );
}