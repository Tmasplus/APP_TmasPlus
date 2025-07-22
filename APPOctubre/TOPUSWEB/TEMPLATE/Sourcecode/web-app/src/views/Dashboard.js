import React, { useState, useEffect, useRef } from 'react';
import {
    Box
} from '@mui/material';
import DashboardCard from '../components/DashboardCard';
import { format, differenceInCalendarDays } from 'date-fns';
import { useSelector } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { useTranslation } from "react-i18next";
import Chart from 'react-apexcharts';
import Grid from '@mui/material/Grid';
import {
    GoogleMap,
    Marker,
    InfoWindow
} from "@react-google-maps/api";
import MaterialTable from "material-table";
import { downloadCsv } from '../common/sharedFunctions';
import { useDispatch } from "react-redux";
import { api } from 'common';
import { colors } from '../components/Theme/WebTheme';
import { Button, Modal, Card, Typography, Collapse, Row, Col, Switch } from 'antd';
import moment from 'moment/min/moment-with-locales';
import { TextField } from '@material-ui/core';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';


const { Title } = Typography;
const { Panel } = Collapse;


const Dashboard = () => {

    const [mylocation, setMylocation] = useState(null);
    const [locations, setLocations] = useState([]);
    const [dailygross, setDailygross] = useState(0);
    const [monthlygross, setMonthlygross] = useState(0);
    const [totalgross, setTotalgross] = useState(0);
    const [role, setRole] = useState(null);
    const [settings, setSettings] = useState({});
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir();
    const usersdata = useSelector(state => state.usersdata);
    const bookinglistdata = useSelector(state => state.bookinglistdata);
    const settingsdata = useSelector(state => state.settingsdata);
    const auth = useSelector(state => state.auth);
    const cars = useSelector(state => state.cartypes.cars);
    const [activeCount, setActiveCount] = useState(0);
    const [driverBogota, setdriverBogota] = useState(0);
    const [driverMedellin, setdriverMedellin] = useState(0);
    const [driverCartagena, setdriverCartagena] = useState(0);
    const [driverCali, setdriverCali] = useState(0);
    const [alltreasXservices, setAlltreasXservices] = useState([]);
    const [alltreasTservices, setAlltreasTservices] = useState([]);
    const [alltreasEservices, setAlltreasEservices] = useState([]);
    const [alltreasVanservices, setAlltreasVanservices] = useState([]);
    const [driverCount, setDriverCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [customerCountByDay, setCustomerCountByDay] = useState([]);
    const [driverCountByDay, setDriverCountByDay] = useState([]);
    const [treasXcount, settreasXcount] = useState(0);
    const [treasTcount, settreasTcount] = useState(0);
    const [treasEcount, settreasEcount] = useState(0);
    const [treasVanCount, settreasVanCount] = useState(0);
    const [walletCount, setWalletCount] = useState(0);
    const [treasXBalance, setTreasXBalance] = useState(0);
    const [treasEBalance, setTreasEBalance] = useState(0);
    const [treasTBalance, setTreasTBalance] = useState(0);
    const [treasVanBalance, setTreasVanBalance] = useState(0);
    const [treasTBalanceMenor, setTreasTBalanceMenor] = useState(0);
    const [treasXBalanceMenor, setTreasXBalanceMenor] = useState(0);
    const [treasEBalanceMenor, setTreasEBalanceMenor] = useState(0);
    const [treasVanBalanceMenor, setTreasVanBalanceMenor] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [
        //totalSum
        , setTotalSum] = useState(0);
    const [totalSubtra, setTotalSubtra] = useState(0);
    const [
        //totalDriversUndefined
        , setTotalDriversUndefined] = useState(0);


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
    


    const handleSearchChange = event => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        if (settingsdata.settings) {
            setSettings(settingsdata.settings);
        }
    }, [settingsdata.settings]);

    useEffect(() => {
        if (usersdata.users) {
            const drivers = usersdata.users.filter(user => user.usertype === 'driver'
                && user.approved === true && user.driverActiveStatus === true && user.licenseImage && user.carApproved
                && ((user.fleetadmin === auth.profile.uid && auth.profile.usertype === 'fleetadmin') || auth.profile.usertype === 'admin'));
            let locs = [];
            for (let i = 0; i < drivers.length; i++) {
                if (drivers[i].approved && drivers[i].driverActiveStatus && drivers[i].location && cars) {
                    let carImage;
                    for (let j = 0; j < cars.length; j++) {
                        if (cars[j].name === drivers[i].carType) {
                            carImage = cars[j].image;
                        }
                    }
                    locs.push({
                        id: i,
                        lat: drivers[i].location.lat,
                        lng: drivers[i].location.lng,
                        drivername: drivers[i].firstName + ' ' + drivers[i].lastName,
                        carnumber: drivers[i].vehicleNumber,
                        cartype: drivers[i].carType,
                        carImage: carImage
                    });
                }
            }
            setLocations(locs);
        }
    }, [usersdata.users, auth.profile.usertype, auth.profile.uid, cars]);



    //---------------------------------------------------------------------------------------------------
    const barChartOptions = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Augosto', 'Septiembre', 'Octubre', 'November', 'December'],
        colors: ["#F20505", "#ffc93c", "#000", "#F27983"],
        //  colors: ["#E91E63", "#FF4081", "#FF80AB", "#FFCDD2", "#F50057", '#D50000'],
        options: {
            maintainAspectRatio: true,
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
            },
            chart: {
                height: 350,
                type: 'area'
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth'
            },
        },
        title: {
            text: t('RESERVA MES TIPO DE SERVICIO'),
            align: 'center',
            style: {
                fontSize: '18px',
            }
        }
    };

    const barChart = [
        {
            name: t('TREAS-X'),
            data: alltreasXservices
        },
        {
            name: t('TREAS-T'),
            data: alltreasTservices
        },
        {
            name: t('TREAS-E'),
            data: alltreasEservices
        },
        {
            name: t('TREAS-VAN'),
            data: alltreasVanservices
        }
    ];

    useEffect(() => {
        let allCompleteCount = [];
        let allCancelCount = [];
        let alltreasXservices = [];
        let alltreasTservices = [];
        let alltreasEservices = [];
        let alltreasVanservices = [];
        let months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Augosto', 'Septiembre', 'Octubre', 'November', 'December'];

        if (bookinglistdata.bookings) {
            for (let i = 0; i < months.length; i++) {
                let completeCount = 0;
                let cancelCount = 0;
                let treasXservices = 0;
                let treasTservices = 0;
                let treasEservices = 0;
                let treasVanservices = 0;

                for (let j = 0; j < bookinglistdata.bookings.length; j++) {
                    const { tripdate } = bookinglistdata.bookings[j];
                    let tDate = new Date(tripdate);

                    // Filtrar por año 2024
                    if (tDate.getFullYear() === 2024) {
                        if (months[i] === months[tDate.getMonth()] && (bookinglistdata.bookings[j].status === 'PAID' || bookinglistdata.bookings[j].status === 'COMPLETE')) {
                            completeCount = completeCount + 1;
                        }
                        if (months[i] === months[tDate.getMonth()] && bookinglistdata.bookings[j].status === 'CANCELLED') {
                            cancelCount = cancelCount + 1;
                        }
                        if (months[i] === months[tDate.getMonth()] && bookinglistdata.bookings[j].carType === 'TREAS-X') {
                            treasXservices = treasXservices + 1;
                        }
                        if (months[i] === months[tDate.getMonth()] && bookinglistdata.bookings[j].carType === 'TREAS-T') {
                            treasTservices = treasTservices + 1;
                        }
                        if (months[i] === months[tDate.getMonth()] && bookinglistdata.bookings[j].carType === 'TREAS-E') {
                            treasEservices = treasEservices + 1;
                        }
                        if (months[i] === months[tDate.getMonth()] && bookinglistdata.bookings[j].carType === 'TREAS-Van') {
                            treasVanservices = treasVanservices + 1;
                        }
                    }
                }
                allCompleteCount.push(completeCount);
                allCancelCount.push(cancelCount);
                alltreasXservices.push(treasXservices);
                alltreasTservices.push(treasTservices);
                alltreasEservices.push(treasEservices);
                alltreasVanservices.push(treasVanservices);
            }
        }
       
        setAlltreasXservices(alltreasXservices);
        setAlltreasTservices(alltreasTservices);
        setAlltreasEservices(alltreasEservices);
        setAlltreasVanservices(alltreasVanservices);
    }, [bookinglistdata.bookings]);

    // -------------------------------------------------------------------------- 

    useEffect(() => {
        if (usersdata.users) {
            const now = new Date();
            const daysAgo = differenceInCalendarDays(now, new Date(usersdata.users[0].createdAt));
            const dayCustomerData = Array.from({ length: daysAgo + 1 }, (_, i) => {
                const currentDate = new Date(now);
                currentDate.setDate(currentDate.getDate() - i);
                const dayStart = new Date(currentDate);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(currentDate);
                dayEnd.setHours(23, 59, 59, 999);
                const dayCustomerCount = usersdata.users.reduce((count, user) => {
                    if (
                        (user.usertype === 'customer') &&
                        (
                            (auth.profile.usertype === 'fleetadmin' && user.fleetadmin === auth.profile.uid) ||
                            auth.profile.usertype === 'admin'
                        ) &&
                        new Date(user.createdAt) >= dayStart && new Date(user.createdAt) <= dayEnd
                    ) {
                        return count + 1;
                    }
                    return count;
                }, 0);

                return dayCustomerCount;
            });
            setCustomerCountByDay(dayCustomerData);

            // Filtrar por día para conductores
            const dayDriverData = Array.from({ length: daysAgo + 1 }, (_, i) => {
                const currentDate = new Date(now);
                currentDate.setDate(currentDate.getDate() - i);
                const dayStart = new Date(currentDate);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(currentDate);
                dayEnd.setHours(23, 59, 59, 999);
                const dayDriverCount = usersdata.users.reduce((count, user) => {
                    if (
                        (user.usertype === 'driver') &&
                        (
                            (auth.profile.usertype === 'fleetadmin' && user.fleetadmin === auth.profile.uid) ||
                            auth.profile.usertype === 'admin'
                        ) &&
                        new Date(user.createdAt) >= dayStart && new Date(user.createdAt) <= dayEnd
                    ) {
                        return count + 1;
                    }
                    return count;
                }, 0);

                return dayDriverCount;
            });
            setDriverCountByDay(dayDriverData);




        } else {
            setDriverCountByDay([]);
        }
    }, [usersdata.users, auth.profile]);



    // Data para la gráfica
    const chartOptions = {
        chart: {
            id: 'customerChart',
            toolbar: {
                autoSelected: 'zoom',
                tools: {
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
        },
        xaxis: {
            type: 'category',
            categories: [
                ...customerCountByDay.map((_, i) => {
                    const currentDate = new Date();
                    currentDate.setDate(currentDate.getDate() - i);
                    return format(currentDate, 'MMM d,');
                }),
            ],
        },
        colors: ['#F20505'],
        yaxis: {
            title: {
                text: 'Clientes',
            },
        },
    };

    const chartSeries = [
        {
            name: 'Clientes',
            data: [...customerCountByDay],
        },
    ];


    // ------------------------------------------------------------------------


    // Data para la gráfica de conductores
    const driverChartOptions = {
        chart: {
            id: 'driverChart',
            toolbar: {
                autoSelected: 'zoom',
                tools: {
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
        },
        xaxis: {
            type: 'category',
            categories: [


                ...driverCountByDay.map((_, i) => {
                    const currentDate = new Date();
                    currentDate.setDate(currentDate.getDate() - i);
                    return format(currentDate, 'MMM d,aa');
                }),
            ],
        },
        colors: ['#a1a3a6'],
        yaxis: {
            title: {
                text: 'Conductores',
            },
        },
        title: {
            text: 'Gráfica de Conductores Nuevos', // Aquí puedes poner el título que desees
            align: 'center', // Alineación del título (left, center, right)
            style: {
                fontSize: '16px', // Tamaño de fuente del título
                fontWeight: 'bold', // Peso de la fuente del título
                color: '#333', // Color del título
            },
        },
    };

    // Data para la gráfica de conductores
    const driverChartSeries = [
        {
            name: 'Conductores',
            data: [...driverCountByDay],
        },
    ];




    // ----------------------------------------------------------------------------------


    useEffect(() => {
        if (usersdata.users) {

            let driverCount = 0;
            let activeCount = 0;
            let driverBogota = 0;
            let driverMedellin = 0;
            let driverCali = 0;
            let driverCartagena = 0;
            let customerCount = 0;
            let walletCount = 0;
            let walletSust = 0;
            let treasXcount = 0;
            let treasEcount = 0;
            let treasTcount = 0;
            let treasVanCount = 0;

            // Crear un objeto para almacenar la cantidad de usuarios que cumplen la condición para cada tipo de vehículo
            let vehicleTypeBalances = {
                'TREAS-X': 0,
                'TREAS-E': 0,
                'TREAS-T': 0,
                'TREAS-Van': 0,
            };

            let vehicleTypeBalancesMenor = {
                'TREAS-X': 0,
                'TREAS-E': 0,
                'TREAS-T': 0,
                'TREAS-Van': 0,
            };


            for (let i = 0; i < usersdata.users.length; i++) {

                if (usersdata.users[i].usertype === 'driver') {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        driverCount = driverCount + 1;
                    }
                }
                if (usersdata.users[i].driverActiveStatus === true) {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        activeCount = activeCount + 1;
                    }
                }

                if (usersdata.users[i].city === 'Bogota' && usersdata.users[i].usertype === 'driver') {
                    if ((auth.profile.usertype === 'fleetadmin' && usersdata.users[i].fleetadmin === auth.profile.uid) || auth.profile.usertype === 'admin') {
                        driverBogota = driverBogota + 1;
                    }
                }

                if (usersdata.users[i].city === 'Medellin' && usersdata.users[i].usertype === 'driver') {
                    if ((auth.profile.usertype === 'fleetadmin' && usersdata.users[i].fleetadmin === auth.profile.uid) || auth.profile.usertype === 'admin') {
                        driverMedellin = driverMedellin + 1;
                    }
                }


                if (usersdata.users[i].city === 'Cartagena' && usersdata.users[i].usertype === 'driver') {
                    if ((auth.profile.usertype === 'fleetadmin' && usersdata.users[i].fleetadmin === auth.profile.uid) || auth.profile.usertype === 'admin') {
                        driverCartagena = driverCartagena + 1;
                    }
                }

                if (usersdata.users[i].city === 'Cali' && usersdata.users[i].usertype === 'driver') {
                    if ((auth.profile.usertype === 'fleetadmin' && usersdata.users[i].fleetadmin === auth.profile.uid) || auth.profile.usertype === 'admin') {
                        driverCali = driverCali + 1;
                    }
                }



                if (usersdata.users[i].usertype === 'customer') {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        customerCount = customerCount + 1;
                    }
                }
                if (usersdata.users[i].walletBalance && usersdata.users[i].walletBalance >= 5000) {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        walletCount = walletCount + 1;
                    }
                } if (usersdata.users[i].usertype === 'driver' && usersdata.users[i].walletBalance <= 5000) {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        walletSust = walletSust + 1;
                    }
                }
                if (usersdata.users[i].carType === 'TREAS-X') {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        treasXcount = treasXcount + 1;
                    }
                    if (usersdata.users[i].walletBalance >= 5000) {
                        vehicleTypeBalances['TREAS-X'] = vehicleTypeBalances['TREAS-X'] + 1;
                    } else {
                        vehicleTypeBalancesMenor['TREAS-X'] = vehicleTypeBalancesMenor['TREAS-X'] + 1;
                    }
                }
                if (usersdata.users[i].carType === 'TREAS-E') {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        treasEcount = treasEcount + 1;
                    }
                    if (usersdata.users[i].walletBalance >= 5000) {
                        vehicleTypeBalances['TREAS-E'] = vehicleTypeBalances['TREAS-E'] + 1;
                    } else {
                        vehicleTypeBalancesMenor['TREAS-E'] = vehicleTypeBalancesMenor['TREAS-E'] + 1;
                    }
                }
                if (usersdata.users[i].carType === 'TREAS-T') {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        treasTcount = treasTcount + 1;
                    }
                    if (usersdata.users[i].walletBalance >= 5000) {
                        vehicleTypeBalances['TREAS-T'] = vehicleTypeBalances['TREAS-T'] + 1;
                    } else {
                        vehicleTypeBalancesMenor['TREAS-T'] = vehicleTypeBalancesMenor['TREAS-T'] + 1;
                    }
                }
                if (usersdata.users[i].carType === 'TREAS-Van') {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        treasVanCount = treasVanCount + 1;
                    }
                    if (usersdata.users[i].walletBalance >= 5000) {
                        vehicleTypeBalances['TREAS-Van'] = vehicleTypeBalances['TREAS-Van'] + 1;
                    } else {
                        vehicleTypeBalancesMenor['TREAS-Van'] = vehicleTypeBalancesMenor['TREAS-Van'] + 1;
                    }
                }
                if (usersdata.users[i].userType === 'driver') {
                    if (
                        (auth.profile.usertype === 'fleetadmin' &&
                            usersdata.users[i].fleetadmin === auth.profile.uid) ||
                        auth.profile.usertype === 'admin'
                    ) {
                        driverCount = driverCount + 1;
                    }
                }

            }

            // Obtener la suma total de todas las categorías
            const totalSum = treasXcount + treasEcount + treasTcount + treasVanCount;
            const totalSubtra = treasXcount - treasEcount - treasTcount - treasVanCount;
            const totalBalance = driverCount - walletCount;
            const totalDriversUndefined = driverCount - totalSum;



            // Actualizar los estados con las sumas
            setActiveCount(activeCount);
            setdriverMedellin(driverMedellin);
            setdriverCartagena(driverCartagena);
            setdriverCali(driverCali)
            setdriverBogota(driverBogota);
            setDriverCount(driverCount);
            setCustomerCount(customerCount);
            setWalletCount(walletCount);
            settreasXcount(treasXcount);
            settreasEcount(treasEcount);
            settreasTcount(treasTcount);
            settreasVanCount(treasVanCount);
            setTreasXBalance(vehicleTypeBalances['TREAS-X']);
            setTreasEBalance(vehicleTypeBalances['TREAS-E']);
            setTreasTBalance(vehicleTypeBalances['TREAS-T']);
            setTreasVanBalance(vehicleTypeBalances['TREAS-Van']);
            setTreasXBalanceMenor(vehicleTypeBalancesMenor['TREAS-X']);
            setTreasEBalanceMenor(vehicleTypeBalancesMenor['TREAS-E']);
            setTreasTBalanceMenor(vehicleTypeBalancesMenor['TREAS-T']);
            setTreasVanBalanceMenor(vehicleTypeBalancesMenor['TREAS-Van']);
            setTotalSum(totalSum);
            setTotalSubtra(totalSubtra);
            setTotalBalance(totalBalance);
            setTotalDriversUndefined(totalDriversUndefined);

        } else {
            // Si no hay datos de usuarios, establecer las sumas en 0
            setdriverMedellin(0);
            setdriverCartagena(0);
            setdriverCali(0);
            setActiveCount(0);
            setdriverBogota(0)
            setDriverCount(0);
            setCustomerCount(0);
            setWalletCount(0);
            settreasXcount(0);
            settreasEcount(0);
            settreasTcount(0);
            settreasVanCount(0);
            setTreasXBalance(0);
            setTreasEBalance(0);
            setTreasVanBalance(0);
            setTreasTBalance(0);
            setTreasTBalanceMenor(0);
            setTreasXBalanceMenor(0);
            setTreasEBalanceMenor(0);
            setTreasVanBalanceMenor(0);
            setTotalSum(0);
            setTotalSubtra(0);
            setTotalBalance(0);
            setTotalDriversUndefined(0);

        }
    }, [usersdata.users, auth.profile]);


    const [totalBalance, setTotalBalance] = useState(0);

    //---------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (auth.profile && auth.profile.usertype) {
            setRole(auth.profile.usertype);
        }
    }, [auth.profile]);

    // ------------------------------------------------------------------------------------------------------
    const [barChartOptionsClient, setBarChartOptionsClient] = useState({
        labels: [],
        colors: ["#E91E63"],
        options: {
            // Opciones de la gráfica
        },
        chart: {
            id: 'clientChart',
            toolbar: {
                autoSelected: 'zoom',
                tools: {
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
            events: {
                markerClick: function (event, chartContext, { seriesIndex, dataPointIndex }) {
                    const clientName = barChartClientes[seriesIndex].customerNames;
                    console.log("Client Names:", clientName); // Verifica en la consola
                    const tooltip = document.querySelector('.apexcharts-tooltip');

                    if (tooltip) {
                        tooltip.innerHTML = `Clientes: ${clientName}`;
                    }
                },
            },
        },
        title: {
            text: t('GRÁFICA DIARIA DE SERVICIOS'),
            align: 'center',
            style: {
                fontSize: '18px',
            }
        }
    });

    const [barChartClientes, setBarChartClientes] = useState([]);

    useEffect(() => {
        let customerNamesByDay = {};
    
        if (bookinglistdata.bookings) {
            for (let i = 0; i < bookinglistdata.bookings.length; i++) {
                const { customer_name, bookingDate } = bookinglistdata.bookings[i];
                let bookingDay = new Date(bookingDate).toLocaleDateString();
    
                if (!customerNamesByDay[bookingDay]) {
                    customerNamesByDay[bookingDay] = [];
                }
    
                if (!customerNamesByDay[bookingDay].includes(customer_name)) {
                    customerNamesByDay[bookingDay].push(customer_name);
                }
            }
    
            const today = new Date();
            const startDate = new Date('2024-01-01');
            const endDate = today;
    
            let datesInRange = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                datesInRange.push(new Date(d).toLocaleDateString());
            }
    
            const filteredData = datesInRange.map(date => ({
                name: date,
                data: customerNamesByDay[date] ? customerNamesByDay[date].length : 0,
                customerNames: customerNamesByDay[date] ? customerNamesByDay[date].join(', ') : '', // Agrega los nombres de los clientes como una cadena
            }));
    
            setBarChartClientes(filteredData);
            setBarChartOptionsClient(prevOptions => ({
                ...prevOptions,
                labels: datesInRange
            }));
        }
    }, [bookinglistdata.bookings]);
    
    const clientChartSeries = [
        {
            name: 'Clientes por servicio',
            data: barChartClientes.map(item => item.data), // Aquí usamos los datos de barChartClientes
        },
    ];

    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


    const [barChartOptionsDaily, setBarChartOptionsDaily] = useState({
        labels: [],
        colors: ["#F20505", "#000"], // Colores para app y web respectivamente
        options: {
            // Opciones de la gráfica
        },
        chart: {
            id: 'dailyChart',
            toolbar: {
                autoSelected: 'zoom',
                tools: {
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
            events: {
                markerClick: function (event, chartContext, { seriesIndex, dataPointIndex }) {
                    const chartData = barChartReservations[seriesIndex];
                    const date = chartData.name;
                    const appReservations = chartData.data[0];
                    const webReservations = chartData.data[1];
                    console.log(`Date: ${date}, App Reservations: ${appReservations}, Web Reservations: ${webReservations}`);
                },
            },
        },
        title: {
            text: 'Reservas Diarias por Web y App',
            align: 'center',
            style: {
                fontSize: '18px',
            }
        }
    });

    const [barChartReservations, setBarChartReservations] = useState([]);

    useEffect(() => {
        let reservationsByDay = {};
    
        if (bookinglistdata.bookings) {
            for (let i = 0; i < bookinglistdata.bookings.length; i++) {
                const { bookingDate, booking_from_web } = bookinglistdata.bookings[i];
                const day = new Date(bookingDate).toLocaleDateString();
    
                if (!reservationsByDay[day]) {
                    reservationsByDay[day] = {
                        app: 0,
                        web: 0
                    };
                }
    
                if (booking_from_web) {
                    reservationsByDay[day].web++;
                } else {
                    reservationsByDay[day].app++;
                }
            }
    
            const today = new Date();
            const startDate = new Date('2023-01-01');
            const endDate = today;
    
            let datesInRange = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                datesInRange.push(new Date(d).toLocaleDateString());
            }
    
            const filteredData = datesInRange.map(date => ({
                name: date,
                data: [reservationsByDay[date] ? reservationsByDay[date].app : 0, reservationsByDay[date] ? reservationsByDay[date].web : 0],
            }));
    
            setBarChartReservations(filteredData);
            setBarChartOptionsDaily(prevOptions => ({
                ...prevOptions,
                labels: datesInRange
            }));
        }
    }, [bookinglistdata.bookings]);
    
    const dailyChartSeries = [
        {
            name: 'App',
            data: barChartReservations.map(item => item.data[0]), // Datos de reservas de la aplicación
        },
        {
            name: 'Web',
            data: barChartReservations.map(item => item.data[1]), // Datos de reservas web
        }
    ];



    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------









    const [isModalOpen, setIsModalOpen] = useState(false);
    const [treasEModal, setTreasEModal] = useState(false);
    const [treasTModal, setTreasTModal] = useState(false);
    const [treasVModal, setTreasVModal] = useState(false);

    const [data, setData] = useState([]);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const TerasTModal = () => {
        setTreasTModal(true);
    };
    const handleTOk = () => {
        setTreasTModal(false);
    };
    const handleCancelT = () => {
        setTreasTModal(false);
    };


    const TerasEModal = () => {
        setTreasEModal(true);
    };
    const handleTEOk = () => {
        setTreasEModal(false);
    };
    const handleCancelTE = () => {
        setTreasEModal(false);
    };



    const TerasVModal = () => {
        setTreasVModal(true);
    };
    const handleTVOk = () => {
        setTreasVModal(false);
    };
    const handleCancelTV = () => {
        setTreasVModal(false);
    };



    // ------------------------------------------------------------------------------------------------------


    const {

        fetchUsersOnce
    } = api;
    const staticusers = useSelector(state => state.usersdata.staticusers);
    const dispatch = useDispatch();
    const loaded = useRef(false);

    useEffect(() => {
        dispatch(fetchUsersOnce());
    }, [dispatch, fetchUsersOnce]);


    useEffect(() => {
        if (staticusers) {
            setData(staticusers.filter(user => user.usertype === 'driver'));
        } else {
            setData([]);
        }
        loaded.current = true;
    }, [staticusers]);


    useEffect(() => {
        if (staticusers) {
            setData(staticusers.filter(user => user.usertype === 'driver'));
        } else {
            setData([]);
        }
        loaded.current = true;
    }, [staticusers]);



    const filteredData = data.filter(row => !row.carType || row.carType.trim() === 'TREAS-X');
    const filterTreasT = data.filter(row => !row.carType || row.carType.trim() === 'TREAS-T');
    const filterTreasE = data.filter(row => !row.carType || row.carType.trim() === 'TREAS-E');
    const filterTreasV = data.filter(row => !row.carType || row.carType.trim() === 'TREAS-Van');


    const columns = [
        { title: t('createdAt'), field: 'createdAt', editable: 'never', defaultSort: 'desc', render: rowData => rowData.createdAt ? moment(rowData.createdAt).format('lll') : null, cellStyle: { textAlign: isRTL === 'rtl' ? 'right' : 'left' } },

        { title: t('first_name'), field: 'firstName', cellStyle: { textAlign: isRTL === 'rtl' ? 'center' : 'left' } },
        { title: t('last_name'), field: 'lastName', cellStyle: { textAlign: isRTL === 'rtl' ? 'center' : 'left' } },
        { title: 'Tipo Doc', field: 'docType', lookup: { CC: 'CC', CE: 'CE', Pasaporte: 'Pasaporte' }, cellStyle: { textAlign: isRTL === 'rtl' ? 'right' : 'center' } },
        { title: 'No Documento', field: 'docNumber', cellStyle: { textAlign: isRTL === 'rtl' ? 'center' : 'left' } }, { title: t('mobile'), field: 'mobile', editable: 'onAdd', render: rowData => settings.AllowCriticalEditsAdmin ? rowData.mobile : "Hidden for Demo", cellStyle: { textAlign: isRTL === 'rtl' ? 'right' : 'center' } },
        { title: t('email'), field: 'email', editable: 'onAdd', render: rowData => settings.AllowCriticalEditsAdmin ? rowData.email : "Hidden for Demo", cellStyle: { textAlign: isRTL === 'rtl' ? 'right' : 'left' }, headerStyle: { textAlign: 'center' } },
        { title: t('car_type'), field: 'carType', },

    ];
    const [selectedRow, setSelectedRow] = useState(null);


    ///_______--------------__________------------___________-------------___________--------___________------________-----_________________------------------___________

    const [barChartOptionsMonthly, setBarChartOptionsMonthly] = useState({
        labels: [],
        options: {
            // Opciones de la gráfica
        },
        chart: {
            id: 'monthlyChart',
            toolbar: {
                autoSelected: 'zoom',
                tools: {
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
            events: {
                markerClick: function (event, chartContext, { seriesIndex, dataPointIndex }) {
                    const monthYear = barChartReservations[seriesIndex].name;
                    const reservationsCount = barChartReservations[seriesIndex].data;
                    console.log(`Mes-Año: ${monthYear}, Total de Reservas: ${reservationsCount}`);
                },
            },
        },
        title: {
            text: 'Reservas Mensuales',
            align: 'center',
            style: {
                fontSize: '18px',
            }
        }
    });

    const [barChartReservationsMont, setBarChartReservationsMont] = useState([]);

    useEffect(() => {
        let reservationsByMonth = {};

        if (bookinglistdata.bookings) {
            for (let i = 0; i < bookinglistdata.bookings.length; i++) {
                const { bookingDate } = bookinglistdata.bookings[i];
                const monthYearKey = new Date(bookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

                if (!reservationsByMonth[monthYearKey]) {
                    reservationsByMonth[monthYearKey] = 0;
                }

                reservationsByMonth[monthYearKey]++;
            }

            const today = new Date();
            const thisYear = today.getFullYear();
            const thisMonth = today.getMonth() + 1; // Se suma 1 porque los meses en JavaScript comienzan desde 0
            const startDate = new Date('2022-01-01');
            const endDate = new Date(thisYear, thisMonth - 1, 1); // El mes actual

            let datesInRange = [];
            let currentMonth = startDate;
            while (currentMonth <= endDate) {
                datesInRange.push(currentMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
                currentMonth.setMonth(currentMonth.getMonth() + 1);
            }

            const filteredData = datesInRange.map(monthYear => ({
                name: monthYear,
                data: reservationsByMonth[monthYear] || 0,
            }));

            setBarChartReservationsMont(filteredData);
            setBarChartOptionsMonthly(prevOptions => ({
                ...prevOptions,
                labels: datesInRange
            }));
        }
    }, [bookinglistdata.bookings]);

    const monthlyChartSeries = [{
        name: 'Reservas',
        data: barChartReservationsMont.map(item => item.data),
    }];

    //---------------------------------------------------------------------------------

    const [barChartOptionsMonthlyPayment,/* setBarChartOptionsMonthlyPaymet*/] = useState({
        labels: [],
        options: {
            // Opciones de la gráfica
        },
        chart: {
            id: 'monthlyChart',
            toolbar: {
                autoSelected: 'zoom',
                tools: {
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
            events: {
                markerClick: function (event, chartContext, { seriesIndex, dataPointIndex }) {
                    const monthYear = barChartReservations[seriesIndex].name;
                    const reservationsCount = barChartReservations[seriesIndex].data;
                    console.log(`Mes-Año: ${monthYear}, Total de Reservas: ${reservationsCount}`);
                },
            },
        },
        title: {
            text: 'Reservas Mensuales por Tipo de Pago',
            align: 'center',
            style: {
                fontSize: '18px',
            }
        }
    });

    const [barChartReservationsMontCorp, setBarChartReservationsMontCorp] = useState([]);
    const [barChartReservationsMontCash, setBarChartReservationsMontCash] = useState([]);
    const [barChartReservationsMontWallet, setBarChartReservationsMontWallet] = useState([]);
    const [barChartReservationsMontDaviplata, setBarChartReservationsMontDaviplata] = useState([]);

    useEffect(() => {
        let reservationsByMonthCorp = {};
        let reservationsByMonthCash = {};
        let reservationsByMonthWallet = {};
        let reservationsByMonthDaviplata = {};
        let datesInRange = [];
    
        if (bookinglistdata.bookings) {
            for (let i = 0; i < bookinglistdata.bookings.length; i++) {
                const { bookingDate, payment_mode, status } = bookinglistdata.bookings[i];
                const monthYearKey = new Date(bookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
                if (status === 'COMPLETE') {
                    if (payment_mode === 'corp') {
                        if (!reservationsByMonthCorp[monthYearKey]) {
                            reservationsByMonthCorp[monthYearKey] = 0;
                        }
                        reservationsByMonthCorp[monthYearKey]++;
                    } else if (payment_mode === 'cash') {
                        if (!reservationsByMonthCash[monthYearKey]) {
                            reservationsByMonthCash[monthYearKey] = 0;
                        }
                        reservationsByMonthCash[monthYearKey]++;
                    } else if (payment_mode === 'wallet') {
                        if (!reservationsByMonthWallet[monthYearKey]) {
                            reservationsByMonthWallet[monthYearKey] = 0;
                        }
                        reservationsByMonthWallet[monthYearKey]++;
                    } else if (payment_mode === 'Daviplata') {
                        if (!reservationsByMonthDaviplata[monthYearKey]) {
                            reservationsByMonthDaviplata[monthYearKey] = 0;
                        }
                        reservationsByMonthDaviplata[monthYearKey]++;
                    }
                }
    
                datesInRange.push(monthYearKey);
            }
    
            datesInRange = Array.from(new Set(datesInRange));
            datesInRange.sort((a, b) => new Date(a) - new Date(b));
    
            const formattedDataCorp = datesInRange.map(monthYear => ({
                name: monthYear,
                data: reservationsByMonthCorp[monthYear] || 0,
            }));
            const formattedDataCash = datesInRange.map(monthYear => ({
                name: monthYear,
                data: reservationsByMonthCash[monthYear] || 0,
            }));
            const formattedDataWallet = datesInRange.map(monthYear => ({
                name: monthYear,
                data: reservationsByMonthWallet[monthYear] || 0,
            }));
            const formattedDataDaviplata = datesInRange.map(monthYear => ({
                name: monthYear,
                data: reservationsByMonthDaviplata[monthYear] || 0,
            }));
    
            setBarChartReservationsMontCorp(formattedDataCorp);
            setBarChartReservationsMontCash(formattedDataCash);
            setBarChartReservationsMontWallet(formattedDataWallet);
            setBarChartReservationsMontDaviplata(formattedDataDaviplata);
    
            setBarChartOptionsMonthly(prevOptions => ({
                ...prevOptions,
                labels: datesInRange
            }));
        }
    }, [bookinglistdata.bookings]);

    const monthlyCorpChartSeries = [
        {
            name: 'Pago Empresarial',
            data: barChartReservationsMontCorp.map(item => item.data),
        },
        {
            name: 'Pago en Efectivo',
            data: barChartReservationsMontCash.map(item => item.data),
        },
        {
            name: 'Pago con Wallet',
            data: barChartReservationsMontWallet.map(item => item.data),
        },
        {
            name: 'Pago con Daviplata',
            data: barChartReservationsMontDaviplata.map(item => item.data),
        }
    ];


    //---------------------------------------------------------------------------------

    const [isModalOpenTotal, setIsModalOpenTotal] = useState(false);

    const showModalTotal = () => {
        setIsModalOpenTotal(true);
    };
    const handleOkTotal = () => {
        setIsModalOpenTotal(false);
    };
    const handleCancelTotal = () => {
        setIsModalOpenTotal(false);
    };


    useEffect(() => {
        if (bookinglistdata.bookings) {
            let today = new Date();
            let monthlyTotal = 0;
            let yearlyTotal = 0;
            let todayTotal = 0;
            for (let i = 0; i < bookinglistdata.bookings.length; i++) {
                if ((bookinglistdata.bookings[i].status === 'PAID' || bookinglistdata.bookings[i].status === 'COMPLETE') && ((bookinglistdata.bookings[i].fleetadmin === auth.profile.uid && auth.profile.usertype === 'fleetadmin') || auth.profile.usertype === 'admin')) {
                    const { tripdate, convenience_fees, fleetCommission, discount } = bookinglistdata.bookings[i];
                    let tDate = new Date(tripdate);
                    if (convenience_fees && parseFloat(convenience_fees) > 0 && auth.profile.usertype === 'admin') {
                        if (tDate.getDate() === today.getDate() && tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()) {
                            todayTotal = todayTotal + parseFloat(convenience_fees) - parseFloat(discount);
                        }
                        if (tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()) {
                            monthlyTotal = monthlyTotal + parseFloat(convenience_fees) - parseFloat(discount);
                        }
                        yearlyTotal = yearlyTotal + parseFloat(convenience_fees) - parseFloat(discount);
                    }
                    if (fleetCommission && parseFloat(fleetCommission) > 0 && auth.profile.usertype === 'fleetadmin') {
                        if (tDate.getDate() === today.getDate() && tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()) {
                            todayTotal = todayTotal + parseFloat(fleetCommission);
                        }
                        if (tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()) {
                            monthlyTotal = monthlyTotal + parseFloat(fleetCommission);
                        }
                        yearlyTotal = yearlyTotal + parseFloat(fleetCommission);
                    }
                }
            }
            setDailygross(parseFloat(todayTotal).toFixed(settings.decimal));
            setMonthlygross(parseFloat(monthlyTotal).toFixed(settings.decimal));
            setTotalgross(parseFloat(yearlyTotal).toFixed(settings.decimal));
        }
    }, [bookinglistdata.bookings, settings, auth.profile.uid, auth.profile.usertype]);





    const [isComponentVisible, setIsComponentVisible] = useState(false);

    const toggleComponentVisibility = () => {
        setIsComponentVisible(!isComponentVisible);
    };

    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    return (
        bookinglistdata.loading || usersdata.loading ? <CircularLoading /> :
            <div>
                {role === 'admin' || role === 'company' ?
                    <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyItems: 'center' }} >


                        <Card
                            style={{
                                width: 750,
                                borderRadius: 10,
                                display: 'flex',
                                alignItems: 'center', // Centra verticalmente el contenido
                                margin: 20
                            }}
                        >


                        </Card>

                        <Grid container direction="row" spacing={2}>
                            <Grid item xs style={{ textAlign: isRTL === 'rtl' ? 'right' : 'left', }}>
                                {settings.swipe_symbol === false ?
                                    <DashboardCard crdStyle={{ display: 'flex', borderRadius: "19px", backgroundColor: '#d3d6db', }} title={t('today_text')} image={require("../assets/img/money1.jpg").default}><Typography>{settings.symbol + ' ' + dailygross}</Typography></DashboardCard>
                                    :
                                    <DashboardCard crdStyle={{ display: 'flex', borderRadius: "19px", backgroundColor: '#d3d6db', }} title={t('today_text')} image={require("../assets/img/money1.jpg").default}><Typography>{dailygross + ' ' + settings.symbol}</Typography></DashboardCard>
                                }
                            </Grid>
                            <Grid item xs style={{ textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
                                {settings.swipe_symbol === false ?
                                    <DashboardCard crdStyle={{ display: 'flex', borderRadius: "19px", backgroundColor: '#d3d6db', }} title={t('this_month_text')} image={require("../assets/img/money2.jpg").default}><Typography>{settings.symbol + ' ' + monthlygross}</Typography></DashboardCard>
                                    :
                                    <DashboardCard crdStyle={{ display: 'flex', borderRadius: "19px", backgroundColor: '#d3d6db', }} title={t('this_month_text')} image={require("../assets/img/money2.jpg").default}><Typography>{monthlygross + ' ' + settings.symbol}</Typography></DashboardCard>
                                }
                            </Grid>
                            <Grid item xs style={{ textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
                                {settings.swipe_symbol === false ?
                                    <DashboardCard crdStyle={{ display: 'flex', borderRadius: "19px", backgroundColor: '#d3d6db', }} title={t('total')} image={require("../assets/img/money3.jpg").default}> <Typography>{settings.symbol + ' ' + totalgross}</Typography> </DashboardCard>
                                    :
                                    <DashboardCard crdStyle={{ display: 'flex', borderRadius: "19px", backgroundColor: '#d3d6db', }} title={t('total')} image={require("../assets/img/money3.jpg").default}> <Typography>{totalgross + ' ' + settings.symbol}</Typography> </DashboardCard>
                                }
                            </Grid>
                        </Grid>
                    </div>
                    : null}



                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example">
                                <Tab label="Informes" value="2" />
                                <Tab label="graficas" value="1" />
                                <Tab label="Estados" value="3" />
                                <Tab label='Mapa de conductores' value="4" />
                            </TabList>
                        </Box>
                        <TabPanel value="2">

                            {role === 'admin' && (
                                <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>

                                    <Box style={{ padding: 10, marginTop: 20, borderRadius: 20, backgroundColor: '#fff', width: '30%', margin: 10 }}>
                                        <Card
                                            title={<Title style={{ color: 'white', textAlign: 'center', fontSize: 20, marginTop: 20 }}>{'Total Clientes'}</Title>}
                                            bordered={false}
                                            style={{ borderRadius: "12px", backgroundColor: '#F24452', minHeight: 100, marginBottom: 20 }}
                                        >
                                            <Title style={{ color: 'white', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>{customerCount}</Title>
                                        </Card>
                                        <Card
                                            title={<Title style={{ color: 'white', textAlign: 'center', fontSize: 20, marginTop: 20 }}>{t('Total Conductores')}</Title>}
                                            style={{ borderRadius: "12px", backgroundColor: '#ea969d', minHeight: 100, marginBottom: 20 }}
                                        >
                                            <Button type="text" style={{ marginLeft: 200 }} onClick={showModalTotal}>
                                                <Title style={{ color: 'white', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>{driverCount}</Title>
                                            </Button>
                                        </Card>
                                        <Card
                                            title={<Title style={{ color: 'white', textAlign: 'center', fontSize: 20, marginTop: 20 }}>{t('Conductores Activos')}</Title>}
                                            style={{ borderRadius: "12px", backgroundColor: '#F20505', minHeight: 100 }}
                                        >
                                            <Title style={{ color: 'white', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>{activeCount}</Title>
                                        </Card>



                                    </Box>

                                    <Box style={{ padding: 10, marginTop: 20, borderRadius: 20, backgroundColor: '#fff', width: '30%', margin: 10 }}>
                                        <Card
                                            title={<Title style={{ color: 'white', textAlign: 'center', fontSize: 20, marginTop: 20 }}>{'Conductores Bogotá'}</Title>}
                                            bordered={false}
                                            style={{ borderRadius: "12px", backgroundColor: '#F24452', minHeight: 100, marginBottom: 20 }}
                                        >
                                            <Title style={{ color: 'white', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>{driverBogota}</Title>
                                        </Card>


                                        <Card
                                            title={<Title style={{ color: 'white', textAlign: 'center', fontSize: 20, marginTop: 20 }}>{'Conductores Medellin'}</Title>}
                                            bordered={false}
                                            style={{ borderRadius: "12px", backgroundColor: '#d3d6db', minHeight: 100, marginBottom: 20 }}
                                        >
                                            <Title style={{ color: 'white', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>{driverMedellin}</Title>
                                        </Card>

                                        <Card
                                            title={<Title style={{ color: 'white', textAlign: 'center', fontSize: 20, marginTop: 20 }}>{'Conductores Cartagena'}</Title>}
                                            bordered={false}
                                            style={{ borderRadius: "12px", backgroundColor: '#000', minHeight: 100, marginBottom: 20 }}
                                        >
                                            <Title style={{ color: 'white', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>{driverCartagena}</Title>
                                        </Card>
                                    </Box>

                                    <Box style={{ padding: 10, marginTop: 20, borderRadius: 20, backgroundColor: '#fff', width: '30%', margin: 10 }}>
                                      

                                        <Card
                                            title={<Title style={{ color: 'white', textAlign: 'center', fontSize: 20, marginTop: 20 }}>{'Conductores Cali'}</Title>}
                                            bordered={false}
                                            style={{ borderRadius: "12px", backgroundColor: '#000', minHeight: 100, marginBottom: 20 }}
                                        >
                                            <Title style={{ color: 'white', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>{driverCali}</Title>
                                        </Card>
                                    </Box>
                                </div>
                            )}
                        </TabPanel>
                        <TabPanel value="1">
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Box style={{ padding: 10, marginTop: 20, borderRadius: 20, backgroundColor: '#fff' }} >
                                    <Chart
                                        options={barChartOptionsMonthly}
                                        series={monthlyChartSeries}
                                        type="area"
                                        width="100%"
                                        height={360}
                                    />
                                </Box>

                                <Box style={{ padding: 10, marginTop: 20, borderRadius: 20, backgroundColor: '#fff' }} >
                                    <Chart
                                        options={barChartOptionsMonthlyPayment}
                                        series={monthlyCorpChartSeries}
                                        type="area"
                                        width="100%"
                                        height={360}
                                    />
                                </Box>

                                <Box style={{ padding: 10, marginTop: 20, borderRadius: 20, backgroundColor: '#fff' }} >
                                    <Chart
                                        options={barChartOptions}
                                        series={barChart}
                                        type="area"
                                        width="100%"
                                        height={360}
                                    />
                                </Box>

                                <Box style={{ padding: 10, marginTop: 20, borderRadius: 20, backgroundColor: '#fff' }} >
                                    <Chart
                                        options={barChartOptionsClient}
                                        series={clientChartSeries}
                                        type="area"
                                        width="100%"
                                        height={360}
                                    />
                                </Box>

                                <Box style={{ padding: 10, marginTop: 20, borderRadius: 20, backgroundColor: '#fff' }} >
                                    <Chart
                                        options={barChartOptionsDaily}
                                        series={dailyChartSeries}
                                        type="area"
                                        width="100%"
                                        height={360}
                                    />
                                </Box>

                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                    <Box style={chartBoxStyle}>
                                        <Title style={chartTitleStyle} variant="h5">
                                            {t('Clientes Nuevos')}
                                        </Title>
                                        <Chart options={chartOptions} series={chartSeries} type="area" height={350} />
                                    </Box>
                                    <Box style={chartBoxStyle}>
                                        <Title style={chartTitleStyle} variant="h5">
                                            {t('Gráfica de Conductores Nuevos')}
                                        </Title>
                                        <Chart options={driverChartOptions} series={driverChartSeries} type="area" height={350} />
                                    </Box>
                                </div>
                            </div>

                        </TabPanel>
                        <TabPanel value="3">

                            <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                                <div style={{ width: '50%', backgroundColor: 'white', flex: 1, padding: 10, margin: 20 }} >
                                    <Title style={{ color: 'black', textAlign: 'center', fontSize: 30, marginTop: 20 }}>{'Estado de los Conductores'}</Title>

                                    <Collapse defaultActiveKey={['1', '2', '3', '4', '5']} accordion>
                                        {/* Panel TREAS-X */}
                                        <Panel header={<Title style={{ color: 'black', textAlign: 'center', fontSize: 20 }}>{'TREAS-X'}</Title>} key="1">
                                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }} >
                                                <Row gutter={20}>
                                                    <Col flex="auto" span={12}>
                                                        <Card title="Total de Conductores" bordered={true}
                                                            extra={<Button type='primary' danger onClick={showModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}> {treasXcount} </Title>
                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↑ Saldo $5.000" bordered={true}
                                                            extra={<Button type='primary' danger onClick={showModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {treasXBalance} </Title>

                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↓ Saldo $5.000" bordered={true}
                                                            extra={<Button type='primary' danger onClick={showModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {treasXBalanceMenor} </Title>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Panel>

                                        {/* Panel TREAS-T */}
                                        <Panel header={<Title style={{ color: 'black', textAlign: 'center', fontSize: 20 }}>{'TREAS-T'}</Title>} key="2">
                                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }} >
                                                <Row gutter={20}>
                                                    <Col flex="auto" span={12}>
                                                        <Card title="Total de Conductores" bordered={true}
                                                            extra={<Button type='primary' danger onClick={TerasTModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}> {treasTcount} </Title>
                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↑ Saldo $5.000" bordered={true}
                                                            extra={<Button type='primary' danger onClick={TerasTModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {treasTBalance} </Title>

                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↓ Saldo $5.000" bordered={true}
                                                            extra={<Button type='primary' danger onClick={TerasTModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {treasTBalanceMenor} </Title>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Panel>

                                        {/* Panel TREAS-E */}
                                        <Panel header={<Title style={{ color: 'black', textAlign: 'center', fontSize: 20 }}>{'TREAS-E'}</Title>} key="3">
                                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }} >
                                                <Row gutter={20}>
                                                    <Col flex="auto" span={12}>
                                                        <Card title="Total de Conductores" bordered={true}
                                                            extra={<Button type='primary' danger onClick={TerasEModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}> {treasEcount} </Title>
                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↑ Saldo $5.000" bordered={true}
                                                            extra={<Button type='primary' danger onClick={TerasEModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {treasEBalance} </Title>

                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↓ Saldo $5.000" bordered={true}
                                                            extra={<Button type='primary' danger onClick={TerasEModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {treasEBalanceMenor} </Title>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Panel>

                                        {/* Panel TREAS-VAN */}
                                        <Panel header={<Title style={{ color: 'black', textAlign: 'center', fontSize: 20 }}>{'TREAS-VAN'}</Title>} key="4">
                                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }} >
                                                <Row gutter={20}>
                                                    <Col flex="auto" span={12}>
                                                        <Card title="Total de Conductores" bordered={true}
                                                            extra={<Button type='primary' danger onClick={TerasVModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}> {treasVanCount} </Title>
                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↑ Saldo $5.000" bordered={true}
                                                            extra={<Button type='primary' danger onClick={TerasVModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {treasVanBalance} </Title>

                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↓ Saldo $5.000" bordered={true}
                                                            extra={<Button type='primary' danger onClick={TerasVModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {treasVanBalanceMenor} </Title>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Panel>

                                        <Panel header={<Title style={{ color: 'black', textAlign: 'center', fontSize: 20 }}>{'RESULTADO DE CONDUCTORES'}</Title>} key="5">
                                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }} >
                                                <Row gutter={20}>
                                                    <Col flex="auto" span={12}>
                                                        <Card title="Conductores Aprobados" bordered={true}
                                                            extra={<Button type='primary' danger onClick={showModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}> {totalSubtra} </Title>
                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↑ Total $5.000" bordered={true}
                                                            extra={<Button type='primary' danger onClick={showModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {walletCount} </Title>

                                                        </Card>
                                                    </Col>
                                                    <Col flex="auto" span={8}>
                                                        <Card title="↓ Saldo Menor" bordered={true}
                                                            extra={<Button type='primary' danger onClick={showModal}>Descargar</Button>}
                                                            style={{
                                                                width: 300,
                                                                marginTop: 16,
                                                            }}
                                                        >
                                                            <Title style={{ color: 'black', textAlign: 'center', fontSize: 26, fontWeight: 'bold' }}>  {totalBalance} </Title>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Panel>

                                    </Collapse>
                                </div>



                            </div>
                        </TabPanel>
                        <TabPanel value="4">
                            <Switch
                                checked={isComponentVisible}
                                onChange={toggleComponentVisibility}
                                style={{ marginLeft: '10px' }}
                            />

                            {isComponentVisible && (
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
                            )}
                        </TabPanel>
                    </TabContext>
                </Box>



                <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={1000} >
                    <MaterialTable
                        title={'TREAS-X Afiliados a Treas'}
                        columns={columns}
                        style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr', borderRadius: "8px", boxShadow: "4px 4px 6px #9E9E9E" }}
                        data={filteredData}
                        onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                        options={{
                            exportCsv: (columns, data) => {
                                let hArray = [];
                                const headerRow = columns.map(col => {
                                    if (typeof col.title === 'object') {
                                        return col.title.props.text;
                                    }
                                    hArray.push(col.field);
                                    return col.title;
                                });
                                const dataRows = data.map(({ tableData, ...row }) => {
                                    row.createdAt = new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString()
                                    let dArr = [];
                                    for (let i = 0; i < hArray.length; i++) {
                                        dArr.push(row[hArray[i]]);
                                    }
                                    return Object.values(dArr);
                                })
                                const { exportDelimiter } = ",";
                                const delimiter = exportDelimiter ? exportDelimiter : ",";
                                const csvContent = [headerRow, ...dataRows].map(e => e.join(delimiter)).join("\n");
                                const csvFileName = 'download.csv';
                                downloadCsv(csvContent, csvFileName);
                            },
                            exportButton: {
                                csv: settings.AllowCriticalEditsAdmin,
                                pdf: false,
                            },
                            maxColumnSort: "all_columns",
                            rowStyle: rowData => ({
                                backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                            }),
                            editable: {
                                backgroundColor: colors.Header_Text,
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            },
                            headerStyle: {
                                position: "sticky",
                                top: "0px",
                                backgroundColor: colors.Header_Text_back,
                                color: '#fff',
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            }
                        }}
                        localization={{
                            body: {
                                addTooltip: (t('add')),
                                deleteTooltip: (t('delete')),
                                editTooltip: (t('edit')),
                                emptyDataSourceMessage: (
                                    (t('blank_message'))
                                ),
                                editRow: {
                                    deleteText: (t('delete_message')),
                                    cancelTooltip: (t('cancel')),
                                    saveTooltip: (t('save'))
                                },
                            },
                            toolbar: {
                                searchPlaceholder: (t('search')),
                                exportTitle: (t('export')),
                            },
                            header: {
                                actions: (t('actions'))
                            },
                            pagination: {
                                labelDisplayedRows: ('{from}-{to} ' + (t('of')) + ' {count}'),
                                firstTooltip: (t('first_page_tooltip')),
                                previousTooltip: (t('previous_page_tooltip')),
                                nextTooltip: (t('next_page_tooltip')),
                                lastTooltip: (t('last_page_tooltip'))
                            },
                        }}

                    />
                </Modal>


                <Modal open={treasTModal} onOk={handleTOk} onCancel={handleCancelT} width={1000} >
                    <MaterialTable
                        title={'TREAS-T Afiliados a Treas'}
                        columns={columns}
                        style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr', borderRadius: "8px", boxShadow: "4px 4px 6px #9E9E9E" }}
                        data={filterTreasT}
                        onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                        options={{
                            exportCsv: (columns, data) => {
                                let hArray = [];
                                const headerRow = columns.map(col => {
                                    if (typeof col.title === 'object') {
                                        return col.title.props.text;
                                    }
                                    hArray.push(col.field);
                                    return col.title;
                                });
                                const dataRows = data.map(({ tableData, ...row }) => {
                                    row.createdAt = new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString()
                                    let dArr = [];
                                    for (let i = 0; i < hArray.length; i++) {
                                        dArr.push(row[hArray[i]]);
                                    }
                                    return Object.values(dArr);
                                })
                                const { exportDelimiter } = ",";
                                const delimiter = exportDelimiter ? exportDelimiter : ",";
                                const csvContent = [headerRow, ...dataRows].map(e => e.join(delimiter)).join("\n");
                                const csvFileName = 'download.csv';
                                downloadCsv(csvContent, csvFileName);
                            },
                            exportButton: {
                                csv: settings.AllowCriticalEditsAdmin,
                                pdf: false,
                            },
                            maxColumnSort: "all_columns",
                            rowStyle: rowData => ({
                                backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                            }),
                            editable: {
                                backgroundColor: colors.Header_Text,
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            },
                            headerStyle: {
                                position: "sticky",
                                top: "0px",
                                backgroundColor: colors.Header_Text_back,
                                color: '#fff',
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            }
                        }}
                        localization={{
                            body: {
                                addTooltip: (t('add')),
                                deleteTooltip: (t('delete')),
                                editTooltip: (t('edit')),
                                emptyDataSourceMessage: (
                                    (t('blank_message'))
                                ),
                                editRow: {
                                    deleteText: (t('delete_message')),
                                    cancelTooltip: (t('cancel')),
                                    saveTooltip: (t('save'))
                                },
                            },
                            toolbar: {
                                searchPlaceholder: (t('search')),
                                exportTitle: (t('export')),
                            },
                            header: {
                                actions: (t('actions'))
                            },
                            pagination: {
                                labelDisplayedRows: ('{from}-{to} ' + (t('of')) + ' {count}'),
                                firstTooltip: (t('first_page_tooltip')),
                                previousTooltip: (t('previous_page_tooltip')),
                                nextTooltip: (t('next_page_tooltip')),
                                lastTooltip: (t('last_page_tooltip'))
                            },
                        }}

                    />
                </Modal>

                <Modal open={treasEModal} onOk={handleTEOk} onCancel={handleCancelTE} width={1000} >
                    <MaterialTable
                        title={'TREAS-E Afiliados a Treas'}
                        columns={columns}
                        style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr', borderRadius: "8px", boxShadow: "4px 4px 6px #9E9E9E" }}
                        data={filterTreasE}
                        onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                        options={{
                            exportCsv: (columns, data) => {
                                let hArray = [];
                                const headerRow = columns.map(col => {
                                    if (typeof col.title === 'object') {
                                        return col.title.props.text;
                                    }
                                    hArray.push(col.field);
                                    return col.title;
                                });
                                const dataRows = data.map(({ tableData, ...row }) => {
                                    row.createdAt = new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString()
                                    let dArr = [];
                                    for (let i = 0; i < hArray.length; i++) {
                                        dArr.push(row[hArray[i]]);
                                    }
                                    return Object.values(dArr);
                                })
                                const { exportDelimiter } = ",";
                                const delimiter = exportDelimiter ? exportDelimiter : ",";
                                const csvContent = [headerRow, ...dataRows].map(e => e.join(delimiter)).join("\n");
                                const csvFileName = 'download.csv';
                                downloadCsv(csvContent, csvFileName);
                            },
                            exportButton: {
                                csv: settings.AllowCriticalEditsAdmin,
                                pdf: false,
                            },
                            maxColumnSort: "all_columns",
                            rowStyle: rowData => ({
                                backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                            }),
                            editable: {
                                backgroundColor: colors.Header_Text,
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            },
                            headerStyle: {
                                position: "sticky",
                                top: "0px",
                                backgroundColor: colors.Header_Text_back,
                                color: '#fff',
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            }
                        }}
                        localization={{
                            body: {
                                addTooltip: (t('add')),
                                deleteTooltip: (t('delete')),
                                editTooltip: (t('edit')),
                                emptyDataSourceMessage: (
                                    (t('blank_message'))
                                ),
                                editRow: {
                                    deleteText: (t('delete_message')),
                                    cancelTooltip: (t('cancel')),
                                    saveTooltip: (t('save'))
                                },
                            },
                            toolbar: {
                                searchPlaceholder: (t('search')),
                                exportTitle: (t('export')),
                            },
                            header: {
                                actions: (t('actions'))
                            },
                            pagination: {
                                labelDisplayedRows: ('{from}-{to} ' + (t('of')) + ' {count}'),
                                firstTooltip: (t('first_page_tooltip')),
                                previousTooltip: (t('previous_page_tooltip')),
                                nextTooltip: (t('next_page_tooltip')),
                                lastTooltip: (t('last_page_tooltip'))
                            },
                        }}

                    />
                </Modal>

                <Modal open={treasVModal} onOk={handleTVOk} onCancel={handleCancelTV} width={1000} >
                    <MaterialTable
                        title={'TREAS-VAN Afiliados a Treas'}
                        columns={columns}
                        style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr', borderRadius: "8px", boxShadow: "4px 4px 6px #9E9E9E" }}
                        data={filterTreasV}
                        onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                        options={{
                            exportCsv: (columns, data) => {
                                let hArray = [];
                                const headerRow = columns.map(col => {
                                    if (typeof col.title === 'object') {
                                        return col.title.props.text;
                                    }
                                    hArray.push(col.field);
                                    return col.title;
                                });
                                const dataRows = data.map(({ tableData, ...row }) => {
                                    row.createdAt = new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString()
                                    let dArr = [];
                                    for (let i = 0; i < hArray.length; i++) {
                                        dArr.push(row[hArray[i]]);
                                    }
                                    return Object.values(dArr);
                                })
                                const { exportDelimiter } = ",";
                                const delimiter = exportDelimiter ? exportDelimiter : ",";
                                const csvContent = [headerRow, ...dataRows].map(e => e.join(delimiter)).join("\n");
                                const csvFileName = 'download.csv';
                                downloadCsv(csvContent, csvFileName);
                            },
                            exportButton: {
                                csv: settings.AllowCriticalEditsAdmin,
                                pdf: false,
                            },
                            maxColumnSort: "all_columns",
                            rowStyle: rowData => ({
                                backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                            }),
                            editable: {
                                backgroundColor: colors.Header_Text,
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            },
                            headerStyle: {
                                position: "sticky",
                                top: "0px",
                                backgroundColor: colors.Header_Text_back,
                                color: '#fff',
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            }
                        }}
                        localization={{
                            body: {
                                addTooltip: (t('add')),
                                deleteTooltip: (t('delete')),
                                editTooltip: (t('edit')),
                                emptyDataSourceMessage: (
                                    (t('blank_message'))
                                ),
                                editRow: {
                                    deleteText: (t('delete_message')),
                                    cancelTooltip: (t('cancel')),
                                    saveTooltip: (t('save'))
                                },
                            },
                            toolbar: {
                                searchPlaceholder: (t('search')),
                                exportTitle: (t('export')),
                            },
                            header: {
                                actions: (t('actions'))
                            },
                            pagination: {
                                labelDisplayedRows: ('{from}-{to} ' + (t('of')) + ' {count}'),
                                firstTooltip: (t('first_page_tooltip')),
                                previousTooltip: (t('previous_page_tooltip')),
                                nextTooltip: (t('next_page_tooltip')),
                                lastTooltip: (t('last_page_tooltip'))
                            },
                        }}

                    />
                </Modal>

                <Modal open={isModalOpenTotal} onOk={handleOkTotal} onCancel={handleCancelTotal}>
                    <MaterialTable
                        title={'Total de Afiliados a Treas'}
                        columns={columns}
                        style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr', borderRadius: "8px", boxShadow: "4px 4px 6px #9E9E9E" }}
                        data={data}
                        onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                        options={{
                            exportCsv: (columns, data) => {
                                let hArray = [];
                                const headerRow = columns.map(col => {
                                    if (typeof col.title === 'object') {
                                        return col.title.props.text;
                                    }
                                    hArray.push(col.field);
                                    return col.title;
                                });
                                const dataRows = data.map(({ tableData, ...row }) => {
                                    row.createdAt = new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString()
                                    let dArr = [];
                                    for (let i = 0; i < hArray.length; i++) {
                                        dArr.push(row[hArray[i]]);
                                    }
                                    return Object.values(dArr);
                                })
                                const { exportDelimiter } = ",";
                                const delimiter = exportDelimiter ? exportDelimiter : ",";
                                const csvContent = [headerRow, ...dataRows].map(e => e.join(delimiter)).join("\n");
                                const csvFileName = 'download.csv';
                                downloadCsv(csvContent, csvFileName);
                            },
                            exportButton: {
                                csv: settings.AllowCriticalEditsAdmin,
                                pdf: false,
                            },
                            maxColumnSort: "all_columns",
                            rowStyle: rowData => ({
                                backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                            }),
                            editable: {
                                backgroundColor: colors.Header_Text,
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            },
                            headerStyle: {
                                position: "sticky",
                                top: "0px",
                                backgroundColor: colors.Header_Text_back,
                                color: '#fff',
                                fontSize: "0.8em",
                                fontWeight: 'bold ',
                                fontFamily: 'Lucida Console", "Courier New", monospace'
                            }
                        }}
                        localization={{
                            body: {
                                addTooltip: (t('add')),
                                deleteTooltip: (t('delete')),
                                editTooltip: (t('edit')),
                                emptyDataSourceMessage: (
                                    (t('blank_message'))
                                ),
                                editRow: {
                                    deleteText: (t('delete_message')),
                                    cancelTooltip: (t('cancel')),
                                    saveTooltip: (t('save'))
                                },
                            },
                            toolbar: {
                                searchPlaceholder: (t('search')),
                                exportTitle: (t('export')),
                            },
                            header: {
                                actions: (t('actions'))
                            },
                            pagination: {
                                labelDisplayedRows: ('{from}-{to} ' + (t('of')) + ' {count}'),
                                firstTooltip: (t('first_page_tooltip')),
                                previousTooltip: (t('previous_page_tooltip')),
                                nextTooltip: (t('next_page_tooltip')),
                                lastTooltip: (t('last_page_tooltip'))
                            },
                        }}

                    />
                </Modal>

            </div >

    )
}

export default Dashboard;

const chartBoxStyle = {
    flex: '1 1 calc(50% - 20px)',
    padding: 20,
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: 20,
};

const chartTitleStyle = {
    margin: '5px 20px 0 15px',
    color: '#F14311',
};