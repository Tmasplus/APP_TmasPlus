import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    Platform,
    Alert,
    ScrollView,
    Animated,
    Linking,
    Share
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { colors } from '../common/theme';
var { height, width } = Dimensions.get('window');
import i18n from 'i18n-js';
import { api } from 'common';
import { CommonActions } from '@react-navigation/native';


const HomePage = (props) => {
    const insets = useSafeAreaInsets();
    const auth = useSelector(state => state.auth);
    const {
        fetchDrivers,
        updatSelPointType,
        getDistanceMatrix,
        clearEstimate,
        addBooking,
        clearBooking,
        clearTripPoints,
        GetDistance,
    } = api;
    const dispatch = useDispatch();
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const settings = useSelector(state => state.settingsdata.settings);
    const cars = useSelector(state => state.cartypes.cars);
    const tripdata = useSelector(state => state.tripdata);
    const usersdata = useSelector(state => state.usersdata);
    const estimatedata = useSelector(state => state.estimatedata);
    const providers = useSelector(state => state.paymentmethods.providers);
    const latitudeDelta = 0.0922;
    const longitudeDelta = 0.0421;

    const [allCarTypes, setAllCarTypes] = useState([]);
    const [freeCars, setFreeCars] = useState([]);

    const [region, setRegion] = useState(null);
    const [optionModalStatus, setOptionModalStatus] = useState(false);
    const [bookingModalStatus, setBookingModalStatus] = useState(false);
    const [bookLoading, setBookLoading] = useState(false);
    const [bookLaterLoading, setBookLaterLoading] = useState(false);

    const instructionInitData = {
        otherPerson: "",
        otherPersonPhone: "",
        pickUpInstructions: "",
        deliveryInstructions: "",
        parcelTypeIndex: 0,
        optionIndex: 0,
        parcelTypeSelected: null,
        optionSelected: null
    };
    const [instructionData, setInstructionData] = useState(instructionInitData);
    const bookingdata = useSelector(state => state.bookingdata);
    const [locationRejected, setLocationRejected] = useState(false);
    const mapRef = useRef();
    const [dragging, setDragging] = useState(0);

    const animation = useRef(new Animated.Value(4)).current;
    const [isEditing, setIsEditing] = useState(false);
    const [touchY, setTouchY] = useState();

    const intVal = useRef();

    const [profile, setProfile] = useState();
    const pageActive = useRef();
    const [drivers, setDrivers] = useState();
    const [roundTrip, setRoundTrip] = useState(false);
    const [tripInstructions, setTripInstructions] = useState('');
    const [radioProps, setRadioProps] = useState([]);
    const [checkTerm, setCheckTerm] = useState(false);
    const [bookModelLoading, setBookModelLoading] = useState(false);
    const [term, setTerm] = useState(false);
    const [deliveryWithBid, setDeliveryWithBid] = useState(false);


    useEffect(() => {
        if (settings && settings.bookingFlow) {
            setDeliveryWithBid(settings.bookingFlow == "2" ? true : false)
        }
    }, [settings])

    const profileInitData = {
        firstName: auth && auth.profile && auth.profile.firstName ? auth.profile.firstName : "",
        lastName: auth && auth.profile && auth.profile.lastName ? auth.profile.lastName : "",
        email: auth && auth.profile && auth.profile.email ? auth.profile.email : "",
    };
    const [bookingOnWait, setBookingOnWait] = useState();


    useEffect(() => {
        if (auth.profile) {
            setTimeout(() => {
                setTerm(true)
            }, 2000);
            setCheckTerm(auth.profile.term ? true : false)
            if (bookingOnWait) {
                finaliseBooking(bookingOnWait);
                setBookingOnWait(null);
                setBookModelLoading(false);
            }
        }
    }, [auth.profile, bookingOnWait])

    useEffect(() => {
        if (settings && providers) {
            let arr = [{ label: t('wallet'), value: 0, cat: 'wallet' }];
            let val = 0;
            if (!settings.disable_online && providers && providers.length > 0) {
                val++;
                arr.push({ label: t('card'), value: val, cat: 'card' });
            }
            if (!settings.disable_cash) {
                val++;
                arr.push({ label: t('cash'), value: val, cat: 'cash' });
            }
            setRadioProps(arr);
        }
    }, [settings, providers]);

    useEffect(() => {
        if (usersdata.drivers) {
            const freeDrivers = usersdata.drivers.filter(d => !d.queue)
            let arr = [];
            for (let i = 0; i < freeDrivers.length; i++) {
                let driver = freeDrivers[i];
                if (!driver.carType) {
                    let carTypes = allCarTypes;
                    for (let i = 0; i < carTypes.length; i++) {
                        let temp = { ...driver, carType: carTypes[i].name };
                        arr.push(temp);
                    }
                } else {
                    arr.push(driver);
                }
            }
            setDrivers(arr);
        }
    }, [usersdata.drivers]);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfile(auth.profile);
        } else {
            setProfile(null);
        }
    }, [auth.profile]);

    useEffect(() => {
        if (tripdata.drop && tripdata.drop.add) {
            setIsEditing(true);
        }
    }, [tripdata]);

    useEffect(() => easing => {
        Animated.timing(animation, {
            toValue: !isEditing ? 4 : 0,
            duration: 300,
            useNativeDriver: false,
            easing
        }).start();
    }, [isEditing]);

    useEffect(() => {
        if (cars) {
            resetCars();
        }
    }, [cars]);

    useEffect(() => {
        if (tripdata.pickup && drivers) {
            getDrivers();
        }
        if (tripdata.pickup && !drivers) {
            resetCars();
            setFreeCars([]);
        }
    }, [drivers, tripdata.pickup]);

    useEffect(() => {
        if (estimatedata.estimate) {
            if (!bookingdata.loading) {
                setBookingModalStatus(true);
            }
            setBookLoading(false);
            setBookLaterLoading(false);
        }
        if (estimatedata.error && estimatedata.error.flag) {
            setBookLoading(false);
            setBookLaterLoading(false);
            Alert.alert(estimatedata.error.msg);
            dispatch(clearEstimate());
        }
    }, [estimatedata.estimate, estimatedata.error, estimatedata.error.flag]);

    useEffect(() => {
        if (tripdata.selected && tripdata.selected == 'pickup' && tripdata.pickup && tripdata.pickup.source == 'search' && mapRef.current) {
            if (!locationRejected) {
                setTimeout(() => {
                    mapRef.current.animateToRegion({
                        latitude: tripdata.pickup.lat,
                        longitude: tripdata.pickup.lng,
                        latitudeDelta: latitudeDelta,
                        longitudeDelta: longitudeDelta
                    });
                }, 1000);
            } else {
                setRegion({
                    latitude: tripdata.pickup.lat,
                    longitude: tripdata.pickup.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
        }
        if (tripdata.selected && tripdata.selected == 'drop' && tripdata.drop && tripdata.drop.source == 'search' && mapRef.current) {
            if (!locationRejected) {
                setTimeout(() => {
                    mapRef.current.animateToRegion({
                        latitude: tripdata.drop.lat,
                        longitude: tripdata.drop.lng,
                        latitudeDelta: latitudeDelta,
                        longitudeDelta: longitudeDelta
                    });
                }, 1000)
            } else {
                setRegion({
                    latitude: tripdata.drop.lat,
                    longitude: tripdata.drop.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
        }
    }, [tripdata.selected, tripdata.pickup, tripdata.drop, mapRef.current]);

    useEffect(() => {
        if (bookingdata.booking) {
            const bookingStatus = bookingdata.booking.mainData.status;
            if (bookingStatus == 'PAYMENT_PENDING') {
                setTimeout(() => {
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'PaymentDetails',
                                    params: { booking: bookingdata.booking.mainData },
                                },
                            ],
                        })
                    );
                    dispatch(clearEstimate());
                    dispatch(clearBooking());
                    dispatch(clearTripPoints());
                }, 1000);
            } else {
                setTimeout(() => {
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'BookedCab',
                                    params: { bookingId: bookingdata.booking.booking_id },
                                },
                            ],
                        })
                    );
                    dispatch(clearEstimate());
                    dispatch(clearBooking());
                    dispatch(clearTripPoints());
                }, 1000);
            }
        }
        if (bookingdata.error && bookingdata.error.flag) {
            Alert.alert(bookingdata.error.msg);
            dispatch(clearBooking());
        }
        if (bookingdata.loading) {
            setBookLoading(true);
            setBookLaterLoading(true);
        }
    }, [bookingdata.booking, bookingdata.loading, bookingdata.error, bookingdata.error.flag]);
    /*
        useEffect(() => {
            if (gps.location) {
                if (gps.location.lat && gps.location.lng) {
                    setDragging(0);
                    if (region) {
                        mapRef.current.animateToRegion({
                            latitude: gps.location.lat,
                            longitude: gps.location.lng,
                            latitudeDelta: latitudeDelta,
                            longitudeDelta: longitudeDelta
                        });
                    }
                    else {
                        setRegion({
                            latitude: gps.location.lat,
                            longitude: gps.location.lng,
                            latitudeDelta: latitudeDelta,
                            longitudeDelta: longitudeDelta
                        });
                    }
                    updateAddresses({
                        latitude: gps.location.lat,
                        longitude: gps.location.lng
                    }, region ? 'gps' : 'init');
                } else {
                    setLocationRejected(true);
                }
            }
        }, [gps.location]);
    */

    useEffect(() => {
        if (region && mapRef.current) {
            if (Platform.OS == 'ios') {
                mapRef.current.animateToRegion({
                    latitude: region.latitude,
                    longitude: region.longitude,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
        }
    }, [region, mapRef.current]);

    const resetCars = () => {
        if (cars) {
            let carWiseArr = [];
            const sorted = cars.sort((a, b) => a.pos - b.pos);
            for (let i = 0; i < sorted.length; i++) {
                let temp = { ...sorted[i], minTime: '', available: false, active: false };
                carWiseArr.push(temp);
            }
            setAllCarTypes(carWiseArr);
        }
    }




    const getDrivers = async () => {
        if (tripdata.pickup) {
            let availableDrivers = [];
            let arr = {};
            let startLoc = tripdata.pickup.lat + ',' + tripdata.pickup.lng;

            let distArr = [];
            let allDrivers = [];
            for (let i = 0; i < drivers.length; i++) {
                let driver = { ...drivers[i] };
                let distance = GetDistance(tripdata.pickup.lat, tripdata.pickup.lng, driver.location.lat, driver.location.lng);
                if (settings.convert_to_mile) {
                    distance = distance / 1.609344;
                }
                if (distance < ((settings && settings.driverRadius) ? settings.driverRadius : 10)) {
                    driver["distance"] = distance;
                    allDrivers.push(driver);
                }
            }

            const sortedDrivers = settings.useDistanceMatrix ? allDrivers.slice(0, 25) : allDrivers;

            if (sortedDrivers.length > 0) {
                let driverDest = "";
                for (let i = 0; i < sortedDrivers.length; i++) {
                    let driver = { ...sortedDrivers[i] };
                    driverDest = driverDest + driver.location.lat + "," + driver.location.lng
                    if (i < (sortedDrivers.length - 1)) {
                        driverDest = driverDest + '|';
                    }
                }

                if (settings.useDistanceMatrix) {
                    distArr = await getDistanceMatrix(startLoc, driverDest);
                } else {
                    for (let i = 0; i < sortedDrivers.length; i++) {
                        distArr.push({ timein_text: ((sortedDrivers[i].distance * 2) + 1).toFixed(0) + ' min', found: true })
                    }
                }


                for (let i = 0; i < sortedDrivers.length; i++) {
                    let driver = { ...sortedDrivers[i] };
                    if (distArr[i].found && cars) {
                        driver.arriveTime = distArr[i];
                        for (let i = 0; i < cars.length; i++) {
                            if (cars[i].name == driver.carType) {
                                driver.carImage = cars[i].image;
                            }
                        }
                        let carType = driver.carType;
                        if (carType && carType.length > 0) {
                            if (arr[carType] && arr[carType].sortedDrivers) {
                                arr[carType].sortedDrivers.push(driver);
                                if (arr[carType].minDistance > driver.distance) {
                                    arr[carType].minDistance = driver.distance;
                                    arr[carType].minTime = driver.arriveTime.timein_text;
                                }
                            } else {
                                arr[carType] = {};
                                arr[carType].sortedDrivers = [];
                                arr[carType].sortedDrivers.push(driver);
                                arr[carType].minDistance = driver.distance;
                                arr[carType].minTime = driver.arriveTime.timein_text;
                            }
                        } else {
                            let carTypes = allCarTypes;
                            for (let i = 0; i < carTypes.length; i++) {
                                let carType = carTypes[i];
                                if (arr[carType]) {
                                    arr[carType].sortedDrivers.push(driver);
                                    if (arr[carType].minDistance > driver.distance) {
                                        arr[carType].minDistance = driver.distance;
                                        arr[carType].minTime = driver.arriveTime.timein_text;
                                    }
                                } else {
                                    arr[carType] = {};
                                    arr[carType].sortedDrivers = [];
                                    arr[carType].sortedDrivers.push(driver);
                                    arr[carType].minDistance = driver.distance;
                                    arr[carType].minTime = driver.arriveTime.timein_text;
                                }
                            }
                        }
                        availableDrivers.push(driver);
                    }
                }
            }

            let carWiseArr = [];
            if (cars) {
                for (let i = 0; i < cars.length; i++) {
                    let temp = { ...cars[i] };
                    if (arr[cars[i].name]) {
                        temp['nearbyData'] = arr[cars[i].name].drivers;
                        temp['minTime'] = arr[cars[i].name].minTime;
                        temp['available'] = true;
                    } else {
                        temp['minTime'] = '';
                        temp['available'] = false;
                    }
                    temp['active'] = (tripdata.carType && (tripdata.carType.name == cars[i].name)) ? true : false;
                    carWiseArr.push(temp);
                }
            }

            setFreeCars(availableDrivers);
            setAllCarTypes(carWiseArr);
        }
    }

    const tapAddress = (selection) => {
        if (selection === tripdata.selected) {
            let savedAddresses = [];
            let allAddresses = profile.savedAddresses;
            for (let key in allAddresses) {
                savedAddresses.push(allAddresses[key]);
            }
            if (selection == 'drop') {
                props.navigation.navigate('Search', { locationType: "drop", addParam: savedAddresses });
            } else {
                props.navigation.navigate('Search', { locationType: "pickup", addParam: savedAddresses });
            }
        } else {
            setDragging(0)
            if (selection == 'drop' && tripdata.selected && tripdata.selected == 'pickup' && mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: tripdata.drop.lat,
                    longitude: tripdata.drop.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
            if (selection == 'pickup' && tripdata.selected && tripdata.selected == 'drop' && mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: tripdata.pickup.lat,
                    longitude: tripdata.pickup.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta
                });
            }
            dispatch(updatSelPointType(selection));
        }

    };


    const finaliseBooking = (bookingData) => {
        dispatch(addBooking(bookingData));
        setInstructionData(instructionInitData);
        setBookingModalStatus(false);
        setOptionModalStatus(false);
        resetCars();
        setTripInstructions("");
        setRoundTrip(false);
        resetCars();
    }


    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            pageActive.current = true;
            dispatch(fetchDrivers('app'));
            if (intVal.current == 0) {
                intVal.current = setInterval(() => {
                    dispatch(fetchDrivers('app'));
                }, 30000);
            }
        });
        return unsubscribe;
    }, [props.navigation, intVal.current]);

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('blur', () => {
            pageActive.current = false;
            intVal.current ? clearInterval(intVal.current) : null;
            intVal.current = 0;
        });
        return unsubscribe;
    }, [props.navigation, intVal.current]);

    useEffect(() => {
        pageActive.current = true;
        const interval = setInterval(() => {
            dispatch(fetchDrivers('app'));
        }, 30000);
        intVal.current = interval;
        return () => {
            clearInterval(interval);
            intVal.current = 0;
        };
    }, []);



    const benefits = () => {
        const url = 'https://treasapp.com/beneficios';
        Linking.openURL(url).catch(err => console.error('Error al abrir el enlace:', err));
    }


    const handleChatPress = () => {

        Linking.openURL(`https://wa.me/message/BTQOY5GZC7REF1`);
    };


    const refer = () => {
        settings.bonus > 0 ?
            Share.share({
                message: auth.profile.firstName + t('share_msg') + ' Descarga, registrate y disfruta de este bono en tu próximo servicio. ' + settings.code + ' ' + settings.bonus + ".\n" + t('code_colon') + auth.profile.referralId + "\n" + t('app_link') + settings.DinamikLink
            })
            :
            Share.share({
                message: t('share_msg_no_bonus') + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
            })
    }

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
        <SafeAreaProvider>
            <View style={{ flex: 1, paddingTop: insets.top }}>
                <View style={styles.root}>
                    <Image source={auth.profile.profile_image ? { uri: auth.profile.profile_image } : require('../../assets/images/profilePic.png')} style={{ width: 78, height: 78, borderRadius: 43 }} resizeMode="cover" />
                    <TouchableOpacity onPress={() => { props.navigation.navigate('Profile') }} style={{ margin: 10, top: 10 }} >
                        <Text style={[styles.hola,  { width: 140 }]} >
                            {'¡Hola!' + ' ' + saludo}
                        </Text>
                        <Text style={styles.hola} >
                            {auth.profile.firstName}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { props.navigation.navigate('Notifications') }}  >
                        <View style={{ display: 'flex', flexDirection: 'column', left: 70, justifyContent: 'center' }} >
                            <View style={styles.rectangle23} >
                                <Ionicons name="notifications" size={34} color="#F20505" />
                            </View>
                            <Text style={styles.textStyle}>
                                {`Notificaciones`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>


                <View style={{ marginVertical: 10, width: '100%', alignItems: 'center' }}>
                    <View style={{ marginVertical: 10, width: '90%' }} >
                        <View style={[styles.rectangle21, isRTL ? { paddingRight: 10 } : { paddingLeft: 10 }]}>
                            <View style={styles.rectangle24}>
                                <Image source={require('../../assets/images/green_pin.png')} style={{ width: 27, height: 27, top: 8, left: 5 }} resizeMode="cover" />
                                <TouchableOpacity onPress={() => tapAddress('pickup')} style={styles.addressStyle1}>
                                    <Text numberOfLines={1} style={[styles.textStyle, tripdata.selected == 'pickup' ? { fontSize: 14 } : { fontSize: 12 }, { textAlign: isRTL ? "right" : "left" }]}>{tripdata.pickup && tripdata.pickup.add ? tripdata.pickup.add : t('map_screen_where_input_text')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.rectangle24} >
                                <Image source={require('../../assets/images/rsz_2red_pin.png')} style={{ width: 27, height: 27, top: 8, left: 5 }} resizeMode="cover" />
                                <TouchableOpacity onPress={() => tapAddress('drop')} style={styles.addressStyle2}>
                                    <Text numberOfLines={1} style={[styles.textStyle, tripdata.selected == 'drop' ? { fontSize: 14 } : { fontSize: 12 }, { textAlign: isRTL ? "right" : "left" }]}>{tripdata.drop && tripdata.drop.add ? tripdata.drop.add : t('map_screen_drop_input_text')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>



                <ScrollView showsVerticalScrollIndicator={false} vertical={true} >


                    <View style={{ marginVertical: 10, width: '100%' }}>
                        <View style={{ marginVertical: 10, width: '70%', borderBottomWidth: 1, borderBottomColor: '#F20505', left: 20, alignItems: 'flex-start' }}>
                            <Text style={[styles.hola, {width: 200}]} >  Tipos de servicio </Text>
                        </View>
                        <ScrollView horizontal={true} >
                            <View style={{ borderWidth: 1, height: 50, width: 150, marginHorizontal: 8, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',  }} >
                                <Image source={require('../../assets/images/TREAS-X.png')} style={{ height: 58, width: 58 }} />
                                <View style={{ display: 'flex', flexDirection: 'column', }} >
                                    <Text style={styles.hola} >  TREAS X</Text>
                                    <Text style={[styles.hola, { color: colors.RED_TREAS }]}>  Particular</Text>
                                </View>
                            </View>
                            <View style={{ borderWidth: 1, height: 50, width: 150, marginHorizontal: 8, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }} >
                                <Image source={require('../../assets/images/TREAS-E.png')} style={{ height: 58, width: 58 }} />
                                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                                    <Text style={styles.hola} >  TREAS E</Text>
                                    <Text style={[styles.hola, { color: colors.RED_TREAS }]}>  {t('confort')}</Text>
                                </View>
                            </View>
                            <View style={{ borderWidth: 1, height: 50, width: 150, marginHorizontal: 8, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }} >
                                <Image source={require('../../assets/images/TREAS-T.png')} style={{ height: 58, width: 58 }} />
                                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                                    <Text style={styles.hola} >  TREAS T</Text>
                                    <Text style={[styles.hola, { color: colors.RED_TREAS }]}> {' Taxi'}</Text>
                                </View>
                            </View>
                            <View style={{ borderWidth: 1, height: 50, width: 150, marginHorizontal: 8, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',  }} >
                                <Image source={require('../../assets/images/TREAS-Van.png')} style={{ height: 58, width: 58 }} />
                                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                                    <Text style={styles.hola} >  TREAS E</Text>
                                    <Text style={[styles.hola, { color: colors.RED_TREAS }]}>{' TREAS XL'}</Text>
                                </View>
                            </View>

                        </ScrollView>
                    </View>


                    <View style={{ marginVertical: 10, width: '100%', borderWidth: 0 }}>
                        <Text style={[styles.hola, isRTL ? { paddingRight: 10 } : { paddingLeft: 10 }]} >  Actualiza... </Text>

                        <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} >

                            <TouchableOpacity onPress={() => { props.navigation.navigate('MyCarnet') }} style={styles.rectangle20} >
                                <Ionicons name="person-add" size={32} color="black" />
                                <Text> {t('carnet_menu')} </Text>
                            </TouchableOpacity>


                            <TouchableOpacity onPress={() => { props.navigation.navigate('Myfamily') }} style={[styles.rectangle20, { backgroundColor: '#F20505' }]} >
                                <MaterialIcons name="family-restroom" size={32} color="white" />
                                <Text style={{ color: colors.WHITE }}  > {'Mi Familia'} </Text>
                            </TouchableOpacity>


                            <TouchableOpacity onPress={() => { refer() }} style={[styles.rectangle20,]} >
                                <AntDesign name="sharealt" size={32} color="#FF5B5B" />
                                <Text style={{ color: '#FF5B5B' }} > {t('Share')} </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { handleChatPress() }} style={[styles.rectangle20, { backgroundColor: '#F20505' }]} >
                                <AntDesign name="customerservice" size={32} color="white" />
                                <Text style={{ color: colors.WHITE, }} > {'Soporte'} </Text>
                            </TouchableOpacity>


                        </ScrollView>
                    </View>


                    <View style={{ marginVertical: 10, width: '100%', borderWidth: 0 }}>

                        <View style={{ marginVertical: 10, width: '70%', borderBottomWidth: 1, borderBottomColor: '#F20505', left: 20, alignItems: 'flex-start' }}>
                            <Text style={[styles.hola,]} >  Beneficios </Text>
                        </View>

                        <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{ margin: 10, height: 120 }}>
                            <TouchableOpacity onPress={() => { benefits() }} style={[styles.rectangle28, { marginHorizontal: 10 }]}>
                                <Image source={require('../../assets/images/Combuscol.png')} style={styles.rectangle28} resizeMode="cover" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { benefits() }} style={[styles.rectangle28, { marginHorizontal: 10 }]}>
                                <Image source={require('../../assets/images/Fitvision.png')} style={styles.rectangle28} resizeMode="cover" />
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    <View style={{ marginVertical: 10, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 0 }}>
                        <Text style={styles.programaTuServicio}>
                            {`Solicita tu servicio`}
                        </Text>

                        <TouchableOpacity style={styles.rectangle34} onPress={() => { props.navigation.navigate('MapScreen') }} >
                            <AntDesign name="calendar" size={32} color="white" />
                        </TouchableOpacity>

                    </View>


                </ScrollView>

            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    root: {
        width: 185,
        height: 78,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        margin: 10
    },
    customerName: {
        width: 97,
        color: 'rgba(0, 0, 0, 1)',
        fontFamily: 'Inter',
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '800',
    },
    hola: {
        width: 97,
        color: 'rgba(0, 0, 0, 1)',
        fontFamily: 'Inter',
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '800',
    },
    notificaciones: {
        width: 88,
        color: 'rgba(0, 0, 0, 1)',
        fontFamily: 'Inter',
        fontSize: 9,
        fontStyle: 'normal',
        fontWeight: '800',
    },
    rectangle23: {
        margin: 10,
        width: 52,
        height: 53,
        flexShrink: 0,
        borderRadius: 20,
        backgroundColor: '#D9D9D9',
        shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        shadowRadius: 4,
        shadowOffset: { "width": 0, "height": 4 },
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    rectangle21: {
        width: '100%',
        height: 112,
        flexShrink: 0,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 221, 221, 1)',
        shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        shadowRadius: 4,
        shadowOffset: { "width": 0, "height": 4 },
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,

    },
    wtcParkingCarrera8ABogotaColombia: {
        width: 257,
        height: 23,
        flexShrink: 0,
        color: 'rgba(0, 0, 0, 1)',
        fontFamily: 'Inter',
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '800',
    },
    rectangle24: {
        width: 333,
        height: 44,
        flexShrink: 0,
        borderRadius: 16,
        borderStyle: 'solid',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        margin: 5,
        display: 'flex',
        flexDirection: 'row',
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        right: 6
    },
    addressStyle1: {
        height: 48,
        width: width - 84,
        justifyContent: 'center',
        paddingTop: 2
    },
    textStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        color: '#000',
        fontWeight: '800'
    },
    addressStyle2: {
        height: 48,
        width: width - 84,
        justifyContent: 'center',
    },
    rectangle20: {
        margin: 10,
        width: 96,
        height: 92,
        flexShrink: 0,
        borderRadius: 22,
        borderWidth: 0,
        borderStyle: 'solid',
        backgroundColor: 'rgba(245, 245, 245, 1)',
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        borderRadius: 8,
        elevation: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    rectangle28: {
        width: 228,
        height: 98,
        flexShrink: 0,
        borderRadius: 17,
        backgroundColor: 'rgba(217, 217, 217, 1)',
        shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        shadowRadius: 4,
        shadowOffset: { "width": 0, "height": 4 },
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    programaTuServicio: {
        color: 'rgba(0, 0, 0, 1)',
        fontFamily: 'Inter',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '800',
        marginHorizontal: 10
    },
    rectangle34: {
        width: 153,
        height: 43,
        flexShrink: 0,
        borderRadius: 13,
        backgroundColor: 'rgba(242, 5, 5, 1)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#f20505',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    rectangle25: {
        margin: 10,
        width: 76,
        height: 82,
        flexShrink: 0,
        borderRadius: 22,
        borderWidth: 0,
        borderStyle: 'solid',
        backgroundColor: 'rgba(245, 245, 245, 1)',
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        borderRadius: 8,
        elevation: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
})

export default HomePage;
