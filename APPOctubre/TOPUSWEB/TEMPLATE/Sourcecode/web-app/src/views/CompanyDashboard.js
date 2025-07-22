import React, { useState, useEffect, } from 'react';
import Box from '@mui/material/Box';
import { Button, Card, Typography, } from 'antd';
import Grid from '@mui/material/Grid';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import Section from "../components/Section";
import { colors } from '../components/Theme/WebTheme';
import Link from '@mui/material/Link';
import {
    GoogleMap,
    Marker,
    InfoWindow
} from "@react-google-maps/api";
import { TextField } from '@material-ui/core';

const { Title } = Typography;

const CompanyDashboard = () => {
    const { i18n, t } = useTranslation();
    const isRTL = i18n.dir();
    const [role, setRole] = useState();
    const auth = useSelector(state => state.auth);
    const [settings] = useState({});
    const [locations, /*setLocations*/] = useState([]);

    const navigate = useNavigate();
    const [customerCount, setCustomerCount] = useState(0);
    const [emailSubject] = useState('Invitación para TREASAPP');
    const [emailBody] = useState(auth.profile.firstName + 'ya hace parte de TREASAPP, te estamos invitando a que seas parte de TREASAPP.  link para Play Store : https://play.google.com/store/apps/details?id=com.treasapp.treas22  /    link para iOS: https://apps.apple.com/app/treasapp/id6456222848 ');
    const usersdata = useSelector(state => state.usersdata);
    const [mylocation, setMylocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLocations, setFilteredLocations] = useState([]);

    // const [data ,setData] = useState([]);

    //const bookinglistdata = useSelector((state) => state.bookinglistdata);
    const userdata = useSelector((state) => state.usersdata);

    const handleSearchChange = event => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        if (auth && auth.profile) {
            if (auth.profile.uid) {
                let role = auth.profile.usertype;
                setRole(role);
            }
        }
    }, [auth]);

    /* useEffect(() => {
         if (bookinglistdata.bookings) {
             setData(bookinglistdata.bookings);
         } else {
             setData([]);
         }
     }, [bookinglistdata.bookings]);
 */



    useEffect(() => {
        if (auth.profile && auth.profile.usertype) {
            setRole(auth.profile.usertype);
        }
    }, [auth.profile]);

    const navigateHome = () => {
        navigate('/addbookings')
    }

    const navigateUsers = () => {
        navigate('/users')
    }


    const handleOpenGmailClick = () => {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(gmailUrl, '_blank');
    };



    useEffect(() => {
        if (usersdata.users) {
            let customerCount = 0;
            for (let i = 0; i < usersdata.users.length; i++) {

                if (usersdata.users[i].usertype === 'customer') {
                    if ((auth.profile.usertype === 'company' && usersdata.users[i].company === auth.profile.uid)) {
                        customerCount = customerCount + 1;
                    }
                }
            }

            setCustomerCount(customerCount);
        } else {
            setCustomerCount(0)
        }
    }, [usersdata.users, auth.profile]);


    useEffect(() => {
        if (userdata.users) {
            let arr = [];
            for (let i = 0; i < userdata.users.length; i++) {
                let user = userdata.users[i];
                if (
                    user.usertype === "driver" &&
                    ((user.company === auth.profile.uid && role === "company"))
                ) {
                    arr.push({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        mobile: user.mobile,
                        email: user.email,
                        uid: user.id,
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
                        pushToken: user.pushToken ? user.pushToken : "",
                        carType: user.carType,
                    });
                } else if (user.usertype === "driver" && user.carType === "TREAS-X" && (role === 'insurer')) {
                    arr.push({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        mobile: user.mobile,
                        email: user.email,
                        uid: user.id,
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
                        pushToken: user.pushToken ? user.pushToken : "",
                        carType: user.carType,
                    });
                }
            }
            // setUsers(arr);
        }
    }, [
        userdata.users,
        settings.AllowCriticalEditsAdmin,
        auth.profile.uid,
        role,
        t,
    ]);

    useEffect(() => {
        if (mylocation == null) {
            navigator.geolocation.getCurrentPosition(
                position => setMylocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }),
                error => console.log(error)
            );
        }
    }, [mylocation]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredLocations(locations); // Si no hay término de búsqueda, mostrar todas las ubicaciones
        } else {
            const filtered = locations.filter(location =>
                (location.drivername && location.drivername.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (location.carnumber && location.carnumber.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredLocations(filtered);
        }
    }, [searchTerm, locations]); // Agregar locations a la lista de dependencias



    return (
        <Box>

            <Card
                style={{
                    width: 750,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center', // Centra verticalmente el contenido
                    justifyContent: 'space-arrow',
                    margin: 20
                }}
            >

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }}>
                    <div style={{ width: '80%', display: 'flex', flexDirection: 'column' }}>
                        <Grid item xs={12} sx={{ mb: -2.25 }}>
                            <Title
                                level={5}
                                style={{
                                    margin: '0 20px 0 0',
                                    textAlign: isRTL === 'rtl' ? 'right' : 'left',
                                    marginLeft: '15px'
                                }}
                            >
                                {'Hola,'} {role === 'company' ? auth.profile.bussinesName : auth.profile.firstName}
                            </Title>
                        </Grid>

                        <Button
                            type="primary"
                            danger
                            style={{ marginTop: '80px' }}
                            onClick={navigateUsers}
                        >
                            Añadir {auth.profile.organizations === 'Hotel' ? 'Huespedes' : 'Funcionarios'}
                        </Button>
                    </div>

                    <div style={{ marginLeft: 80, }} >
                        <img src={require("../assets/img/qrempresarial.jpg").default} alt="Pide un viaje" style={{ width: '60%', height: 'auto', objectFit: 'cover', borderRadius: 18 }} />
                    </div>
                </div>



            </Card>


            <div style={{ margin: 20 }} >
                <Title level={4} >MUEVE A TUS  {auth.profile.organizations === 'Hotel' ? 'HUÉSPEDES' : 'FUNCIONARIOS'} </Title>
            </div>


            <Grid container direction="row" spacing={2}>
                <Grid Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card
                        style={{
                            width: 550,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center', // Centra verticalmente el contenido
                            justifyContent: 'space-arrow',
                            margin: 20
                        }}
                    >

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ width: '80%', display: 'flex', flexDirection: 'column' }}>
                                <Grid item xs={12} sx={{ mb: -2.25 }}>
                                    <Title
                                        level={3}
                                        style={{
                                            margin: '0 20px 0 0',
                                            textAlign: isRTL === 'rtl' ? 'right' : 'left',
                                            marginLeft: '15px',
                                            width: '200%'
                                        }}
                                    >
                                        Pide un viaje

                                    </Title>
                                    <Title
                                        level={5}
                                        style={{
                                            margin: '0 10px 0 0',
                                            textAlign: isRTL === 'rtl' ? 'right' : 'left',
                                            marginLeft: '15px',
                                            width: '230%'
                                        }}
                                    >
                                        Para tus empleados o para invitados.
                                    </Title>
                                </Grid>




                                <Button
                                    type="primary"
                                    danger
                                    style={{ marginTop: '80px', width: '100%' }}
                                    onClick={navigateHome}
                                >
                                    Pedir Ahora treas
                                </Button>
                            </div>

                            <div style={{ marginLeft: 220, }} >

                                <img src={require("../assets/img/pedir.jpeg").default} alt="Pide un viaje" style={{ width: '80%', height: '50%', objectFit: 'cover', borderRadius: 18 }} />
                            </div>
                        </div>



                    </Card>

                </Grid>
                <Grid Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card
                        style={{
                            width: 550,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center', // Centra verticalmente el contenido
                            justifyContent: 'space-arrow',
                            margin: 20
                        }}
                    >

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ width: '80%', display: 'flex', flexDirection: 'column' }}>
                                <Grid item xs={12} sx={{ mb: -2.25 }}>
                                    <Title
                                        level={3}
                                        style={{
                                            margin: '0 20px 0 0',
                                            textAlign: isRTL === 'rtl' ? 'right' : 'left',
                                            marginLeft: '15px',
                                            width: '200%'
                                        }}
                                    >
                                        Comunicate con Soporte

                                    </Title>
                                    <Title
                                        level={5}
                                        style={{
                                            margin: '0 10px 0 0',
                                            textAlign: isRTL === 'rtl' ? 'right' : 'left',
                                            marginLeft: '15px',
                                            width: '230%',
                                            marginRight: '10px'

                                        }}
                                    >
                                        Tendras más información sobre tus preguntas frecuentes.
                                    </Title>
                                </Grid>

                                <Button
                                    type="primary"
                                    danger
                                    style={{ marginTop: '80px', width: '100%', background: 'black' }}
                                // onClick={navigateHome}
                                >
                                    <Link target='_blank' href="https://wa.me/message/BTQOY5GZC7REF1">Ir al Chat</Link>
                                </Button>
                            </div>

                            <div style={{ marginLeft: 220, }} >

                                <img src={require("../assets/img/reserva.jpeg").default} alt="Pide un viaje" style={{ width: '80%', height: '50%', objectFit: 'cover', borderRadius: 18 }} />
                            </div>
                        </div>



                    </Card>

                </Grid>
                <Grid Grid item xs={12} sm={6} md={4} lg={3}>
                    <Card
                        style={{
                            width: 550,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center', // Centra verticalmente el contenido
                            justifyContent: 'space-arrow',
                            margin: 20
                        }}
                    >

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ width: '80%', display: 'flex', flexDirection: 'column' }}>
                                <Grid item xs={12} sx={{ mb: -2.25 }}>
                                    <Title
                                        level={3}
                                        style={{
                                            margin: '0 20px 0 0',
                                            textAlign: isRTL === 'rtl' ? 'right' : 'left',
                                            marginLeft: '15px',
                                            width: '200%'
                                        }}
                                    >
                                        Compartir con amigos

                                    </Title>
                                    <Title
                                        level={5}
                                        style={{
                                            margin: '0 10px 0 0',
                                            textAlign: isRTL === 'rtl' ? 'right' : 'left',
                                            marginLeft: '15px',
                                            width: '230%'
                                        }}
                                    >
                                        Viaja seguro con nosotros.
                                    </Title>
                                </Grid>




                                <Button
                                    type="primary"
                                    danger
                                    style={{ marginTop: '80px', width: '100%' }}
                                    onClick={handleOpenGmailClick}
                                >
                                    Comparte TREASAPP
                                </Button>
                            </div>

                            <div style={{ marginLeft: 220, }} >

                                <img src={require("../assets/img/preguntas.jpeg").default} alt="Pide un viaje" style={{ width: '100%', height: '50%', objectFit: 'cover', borderRadius: 18 }} />
                            </div>
                        </div>



                    </Card>

                </Grid>
            </Grid>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} >

                {role === 'company' ?
                    <Grid container spacing={3} style={{ width: 1500, border: '1px solid #F20505', borderRadius: '8px', padding: '20px', boxSizing: 'border-box', margin: 20 }}>
                        <Grid Grid item xs={12} sm={6} md={4} lg={3}>
                            <Card style={{ width: 250, height: 150 }} title={auth.profile.organizations === 'Hotel' ? 'HUÉSPEDES' : 'FUNCIONARIOS'}>
                                <Typography.Title level={3} style={{ margin: '0 20px 0 0' }}>  {customerCount} </Typography.Title>
                            </Card>
                        </Grid>
                        <Grid Grid item xs={12} sm={6} md={4} lg={3}>
                            <Card style={{ width: 250, height: 150 }} title="PENDT DE REGISTRO">
                                <Typography.Title level={3} style={{ margin: '0 20px 0 0' }}>0</Typography.Title>
                            </Card>
                        </Grid>
                        <Grid Grid item xs={12} sm={6} md={4} lg={3}>
                            <Card style={{ width: 250, height: 150 }} title="RESERVAS">
                                <Typography.Title level={3} style={{ margin: '0 20px 0 0' }}></Typography.Title>
                            </Card>
                        </Grid>
                        <Grid Grid item xs={12} sm={6} md={4} lg={3}>
                            <Card style={{ width: 250, height: 150 }} title="ACTIVOS">
                                <Typography.Title level={3} style={{ margin: '0 20px 0 0' }}>  {customerCount} </Typography.Title>
                            </Card>
                        </Grid>
                    </Grid>
                    : null}
            </div>
            <div style={{ flex: 1, marginRight: 20 }}>
                <Grid container style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }} >
                    <Grid item xs={12} sm={12} md={9} lg={9} style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' }} boxShadow={3}>
                        <Typography variant="h4" style={{ margin: "20px 20px 0 15px", textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>{t('real_time_driver_section_text')}</Typography>
                        {/* Campo de búsqueda */}
                        <TextField
                            label="Buscar usuario"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{ margin: '20px 20px 0 15px' }}
                        />
                        {mylocation && mylocation.lat ?
                            <GoogleMap
                                zoom={10}
                                center={mylocation}
                                mapContainerStyle={{ height: `480px` }}
                            >
                                {/* Mostrar marcadores filtrados */}
                                {filteredLocations.map(marker => (
                                    <Marker
                                        position={{ lat: marker.lat, lng: marker.lng }}
                                        key={marker.id}
                                        icon={{
                                            url: marker.carImage,
                                            scaledSize: new window.google.maps.Size(35, 25)
                                        }}
                                    >
                                        <InfoWindow
                                            position={{ lat: marker.lat, lng: marker.lng }}
                                            options={{ pixelOffset: new window.google.maps.Size(0, -32) }}
                                        >
                                            <div>{marker.drivername}<br />{marker.carnumber}</div>
                                        </InfoWindow>
                                    </Marker>
                                ))}
                            </GoogleMap>
                            : null}
                    </Grid>

                </Grid>
            </div>

            <Section role={role} color={colors} />


        </Box >
    );
}

export default CompanyDashboard;