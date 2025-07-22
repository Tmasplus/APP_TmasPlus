import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
    Modal,
    Linking,
    Alert,
    Share,
    ScrollView,
    Pressable
} from 'react-native';
import { TouchableOpacity as OldTouch } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import MapView, { Polyline, PROVIDER_GOOGLE, Marker, AnimatedRegion } from 'react-native-maps';
import { OtpModal } from '../components';
import StarRating from 'react-native-star-rating-widget';
import RadioForm from 'react-native-simple-radio-button';
import { colors } from '../common/theme';
var { width, height } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useSelector, useDispatch } from 'react-redux';
import * as DecodePolyLine from '@mapbox/polyline';
import carImageIcon from '../../assets/images/track_Car.png';
import { api } from 'common';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment/min/moment-with-locales';
import { CommonActions } from '@react-navigation/native';
import { appConsts, MAIN_COLOR } from '../common/sharedFunctions';
import { Ionicons, FontAwesome5, AntDesign } from '@expo/vector-icons';
const hasNotch = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && ((height === 780 || width === 780) || (height === 812 || width === 812) || (height === 844 || width === 844) || (height === 896 || width === 896) || (height === 926 || width === 926))
import { Audio } from 'expo-av'
import SwipeButton from 'rn-swipe-button';


export default function BookedCabScreen(props) {
    const {
        fetchBookingLocations,
        stopLocationFetch,
        updateBookingImage,
        cancelBooking,
        updateBooking,
        getDirectionsApi,
        editSos,
        reportIncidence
    } = api;
    const dispatch = useDispatch();
    const { bookingId } = props.route.params;
    const latitudeDelta = 0.0922;
    const longitudeDelta = 0.0421;
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const activeBookings = useSelector(state => state.bookinglistdata.active);
    const [curBooking, setCurBooking] = useState(null);
    const cancelReasons = useSelector(state => state.cancelreasondata.complex);
    const reportIncidents = useSelector(state => state.reportIncidencedata.complex);

    const auth = useSelector(state => state.auth);
    const [cancelReasonSelected, setCancelReasonSelected] = useState(0);
    const [reportIncidentselected, setreportIncidentselected] = useState(0);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const lastLocation = useSelector(state => state.locationdata.coords);
    const [liveRouteCoords, setLiveRouteCoords] = useState(null);
    const mapRef = useRef();
    const pageActive = useRef();
    const [lastCoords, setlastCoords] = useState();
    const [arrivalTime, setArrivalTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [purchaseInfoModalStatus, setPurchaseInfoModalStatus] = useState(false);
    const [userInfoModalStatus, setUserInfoModalStatus] = useState(false);
    const [modalMapaVisible, setModalMapaVisible] = useState(false);
    const [modalArrived, setModalArrived] = useState(false);
    const [modalTimeUp, setModalTimeUP] = useState(false);
    const [modalInsident, incidentModalIncident] = useState(false);
    const [modalConfirmClose, setModalConfirmClose] = useState(false)

    const MINUTES_EXPIRATION_CODE = 3;
    const SECONDS_EXPIRATION_CODE = 0;
    const [timeLeft, setTimeLeft] = useState({
        minutes: MINUTES_EXPIRATION_CODE,
        seconds: SECONDS_EXPIRATION_CODE,
    });
    const settings = useSelector(state => state.settingsdata.settings);

    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const [role, setRole] = useState();

    useEffect(() => {
        if (auth.profile && auth.profile.usertype) {
            setRole(auth.profile.usertype);
        } else {
            setRole(null);
        }
    }, [auth.profile]);

    useEffect(() => {
        setInterval(() => {
            if (pageActive.current && curBooking && lastLocation && (curBooking.status == 'ACCEPTED' || curBooking.status == 'STARTED')) {
                if (lastCoords && lastCoords.lat != lastLocation.lat && lastCoords.lat != lastLocation.lng) {
                    if (curBooking.status == 'ACCEPTED') {
                        let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
                        let point2 = { lat: curBooking.pickup.lat, lng: curBooking.pickup.lng };
                        fitMap(point1, point2);
                    } else {
                        let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
                        let point2 = { lat: curBooking.drop.lat, lng: curBooking.drop.lng };
                        fitMap(point1, point2);
                    }
                    setlastCoords(lastLocation);
                }
            }
        }, 20000);
    }, []);


    useEffect(() => {
        if (lastLocation && curBooking && curBooking.status == 'ACCEPTED' && pageActive.current) {
            let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
            let point2 = { lat: curBooking.pickup.lat, lng: curBooking.pickup.lng };
            fitMap(point1, point2);
            setlastCoords(lastLocation);
        }

        if (curBooking && curBooking.status == 'ARRIVED' && pageActive.current) {
            setlastCoords(null);
            setTimeout(() => {
                mapRef.current.fitToCoordinates([{ latitude: curBooking.pickup.lat, longitude: curBooking.pickup.lng }, { latitude: curBooking.drop.lat, longitude: curBooking.drop.lng }], {
                    edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                    animated: true,
                })
            }, 1000);
        }
        if (lastLocation && curBooking && curBooking.status == 'STARTED' && pageActive.current) {
            let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
            let point2 = { lat: curBooking.drop.lat, lng: curBooking.drop.lng };
            fitMap(point1, point2);
            setlastCoords(lastLocation);
        }
        if (lastLocation && curBooking && curBooking.status == 'REACHED' && role == 'customer' && pageActive.current) {
            setTimeout(() => {
                mapRef.current.fitToCoordinates([{ latitude: curBooking.pickup.lat, longitude: curBooking.pickup.lng }, { latitude: lastLocation.lat, longitude: lastLocation.lng }], {
                    edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                    animated: true,
                })
            }, 1000);
        }
    }, [lastLocation, curBooking, pageActive.current])

    const fitMap = (point1, point2) => {
        let startLoc = point1.lat + ',' + point1.lng;
        let destLoc = point2.lat + ',' + point2.lng;
        if (settings.showLiveRoute) {
            let waypoints = "";
            if (curBooking.waypoints && curBooking.waypoints.length > 0) {
                const arr = curBooking.waypoints;
                for (let i = 0; i < arr.length; i++) {
                    waypoints = waypoints + arr[i].lat + "," + arr[i].lng;
                    if (i < arr.length - 1) {
                        waypoints = waypoints + "|";
                    }
                }
            }
            getDirectionsApi(startLoc, destLoc, waypoints).then((details) => {
                setArrivalTime(details.time_in_secs ? parseFloat(details.time_in_secs / 60).toFixed(0) : 0);
                let points = DecodePolyLine.decode(details.polylinePoints);
                let coords = points.map((point, index) => {
                    return {
                        latitude: point[0],
                        longitude: point[1]
                    }
                })
                setLiveRouteCoords(coords);
                if (mapRef.current) {
                    mapRef.current.fitToCoordinates([{ latitude: point1.lat, longitude: point1.lng }, { latitude: point2.lat, longitude: point2.lng }], {
                        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                        animated: true,
                    })
                }
            }).catch(() => {

            });
        } else {
            mapRef.current.fitToCoordinates([{ latitude: point1.lat, longitude: point1.lng }, { latitude: point2.lat, longitude: point2.lng }], {
                edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                animated: true,
            })
        }
    }


    useEffect(() => {
        if (activeBookings && activeBookings.length >= 1) {
            let booking = activeBookings.filter(booking => booking.id == bookingId)[0];
            if (booking) {
                setCurBooking(booking);
                
                let diffMins = ((new Date(booking.tripdate)) - (new Date())) / (1000 * 60);
                if (booking.status == 'NEW' && (booking.bookLater == false || (booking.bookLater && diffMins <= 15))) {
                    if (role == 'customer' && !booking.hasOwnProperty('confirmModal')) setTimeout(() => setConfirmModalVisible(true), Platform.OS === "ios" ? 200 : 0);
                    if (role == 'customer' && booking.driverOffers) setTimeout(() => setSearchModalVisible(true), Platform.OS === "ios" ? 200 : 0);
                    if (role == 'customer' && booking.selectedBid && !booking.customer_paid) {
                        setTimeout(() => {
                            setConfirmModalVisible(false);
                            setSearchModalVisible(false);
                            props.navigation.navigate('PaymentDetails', { booking: { ...booking, ...booking.selectedBid } });
                        }, 2000)
                    }
                }
                if (booking.status == 'ACCEPTED') {
                    if (role == 'customer') setConfirmModalVisible(false);
                    if (role == 'customer') setSearchModalVisible(false);
                    if (role == 'customer') dispatch(fetchBookingLocations(bookingId));
                }
                if (booking.status == 'ARRIVED') {
                    if (role == 'customer') dispatch(fetchBookingLocations(bookingId));
                }
                if (booking.status == 'STARTED') {
                    if (role == 'customer') dispatch(fetchBookingLocations(bookingId));
                }
                if (booking.status == 'REACHED') {
                    if (role == 'driver') {
                        setTimeout(() => {
                            props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'PaymentDetails', params: { booking: booking } }] }));
                        }, 1000);
                    }
                }
                if (booking.status == 'PENDING') {
                    if (role == 'customer') {
                        setTimeout(() => {
                            props.navigation.navigate('PaymentDetails', { booking: booking });
                        }, 1000);
                    }
                }
                if (booking.status == 'PAID' & pageActive.current) {
                    if (role == 'customer') {
                        setTimeout(() => {
                            props.navigation.navigate('DriverRating', { bookingId: booking });
                        }, 1000);
                    }
                    if (role == 'driver') {
                        props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'TabRoot' }] }));
                    }
                }
                if ((booking.status == 'ACCEPTED' || booking.status == 'ARRIVED') && booking.pickup_image) {
                    setLoading(false);
                }
                if (booking.status == 'STARTED' && booking.deliver_image) {
                    setLoading(false);
                }
            }
            else {
                setModalVisible(false);
                setSearchModalVisible(false);
                props.navigation.navigate('TabRoot', { screen: 'RideList', params: { fromBooking: true } });
            }
        }
        else {
            setModalVisible(false);
            setSearchModalVisible(false);
            if (role == 'driver') {
                props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'TabRoot' }] }));
            } else {
                props.navigation.navigate('TabRoot', { screen: 'RideList', params: { fromBooking: true } });
            }
        }
    }, [activeBookings, role, pageActive.current]);
    const renderButtons = () => {
        return (
            (curBooking && role == 'customer' && (curBooking.status == 'NEW' || curBooking.status == 'ACCEPTED')) ||
                (curBooking && role == 'driver' && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED' || curBooking.status == 'STARTED')) ?
                <View style={{ height: 50, flexDirection: isRTL ? 'row-reverse' : 'row', width: '98%', alignSelf: 'center', marginVertical: 5, marginBottom: 15 }}>
                    {(role == 'customer' && !curBooking.pickup_image && (curBooking.status == 'NEW' || curBooking.status == 'ACCEPTED')) ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('cancel_ride')}
                                loading={false}
                                loadingProps={{ size: "large" }}
                                titleStyle={{ fontWeight: 'bold' }}
                                onPress={() => {
                                    role == 'customer' ?
                                        setModalVisible(true) :
                                        Alert.alert(
                                            t('alert'),
                                            t('cancel_confirm'),
                                            [
                                                { text: t('cancel'), onPress: () => { }, style: 'cancel' },
                                                { text: t('ok'), onPress: () => dispatch(cancelBooking({ booking: curBooking, reason: t('driver_cancelled_booking'), cancelledBy: role })) },
                                            ]
                                        );
                                }
                                }
                                buttonStyle={{ height: '100%', backgroundColor: colors.RED, borderRadius: 10, width: curBooking && role == 'customer' ? '100%' : '95%', alignSelf: curBooking && role == 'customer' ? 'center' : isRTL ? 'flex-end' : 'flex-start', }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}
                    {appConsts.captureBookingImage && settings && settings.AllowDeliveryPickupImageCapture && role == 'driver' && !curBooking.pickup_image && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED') ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('take_pickup_image')}
                                loading={loading}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold', fontSize: 16 }}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                onPress={() => _pickImage(ImagePicker.launchCameraAsync)}
                                buttonStyle={{ height: '100%', backgroundColor: MAIN_COLOR, width: '95%', borderRadius: 10, alignSelf: isRTL ? 'flex-start' : 'flex-end' }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}

                    {(role == 'driver' && !curBooking.pickup_image && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED')) ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={'REPORTAR INCIDENCIA'}
                                loading={false}
                                loadingProps={{ size: "large" }}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold', fontSize: 12 }}
                                onPress={() => {
                                    incidentModalIncident(true)
                                }
                                }
                                buttonStyle={{ height: '100%', backgroundColor: colors.new2, width: '80%', borderRadius: 10, alignSelf: 'center' }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}



                    {role == 'driver' && (!appConsts.captureBookingImage || (curBooking.pickup_image && appConsts.captureBookingImage) || (settings && !settings.AllowDeliveryPickupImageCapture && appConsts.captureBookingImage)) && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED') ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={'REPORTAR LLEGADA'}
                                loading={false}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold', fontSize: 12 }}
                                onPress={() => {
                                    arrivedBooking();
                                }}
                                buttonStyle={{ height: '100%', backgroundColor: colors.RED_TREAS, width: '80%', borderRadius: 10, alignSelf: 'center' }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}

                    {role == 'driver' && (!appConsts.captureBookingImage || (curBooking.pickup_image && appConsts.captureBookingImage) || (settings && !settings.AllowDeliveryPickupImageCapture && appConsts.captureBookingImage)) && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED') ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('start_trip')}
                                loading={false}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold', fontSize: 16 }}
                                onPress={() => {
                                    if (curBooking.otp && appConsts.hasStartOtp) {
                                        setOtpModalVisible(true);
                                    } else {
                                        startBooking();
                                    }
                                }}
                                buttonStyle={{ height: '100%', backgroundColor: MAIN_COLOR, width: '100%', borderRadius: 10, alignSelf: 'center' }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}





                    {appConsts.captureBookingImage && settings && settings.AllowFinalDeliveryImageCapture && role == 'driver' && !curBooking.deliver_image && curBooking.status == 'STARTED' ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('take_deliver_image')}
                                loading={loading}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold', fontSize: 16 }}
                                onPress={() => _pickImage(ImagePicker.launchCameraAsync)}
                                buttonStyle={{ height: '100%', backgroundColor: MAIN_COLOR, borderRadius: 10, alignSelf: 'center', width: '100%' }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}
                    {role == 'driver' && (!appConsts.captureBookingImage || (curBooking.deliver_image && appConsts.captureBookingImage) || (settings && !settings.AllowFinalDeliveryImageCapture && appConsts.captureBookingImage)) && curBooking.status == 'STARTED' ?
                        <View style={{ flex: 1 }} >
                            <SwipeButton
                                title={t('complete_ride')}
                                loading={loading}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold', fontSize: 16 }}
                                onSwipeSuccess={() => {
                                    if (curBooking.otp && !appConsts.hasStartOtp) {
                                        setOtpModalVisible(true);
                                    } else {
                                        endBooking();
                                        playSound()
                                    }
                                }}
                                swipeSuccessThreshold={70}
                                railBackgroundColor="#F20505"

                                thumbIconBackgroundColor={colors.WHITE}
                                thumbIconComponent={CheckoutButton}
                            />

                        </View>
                        : null}
                </View>
                : null
        );
    }

    const CheckoutButton = () => {
        return (
            <View style={{ width: 100, height: 30, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#ffffff' }}><AntDesign name="doubleright" size={24} color="black" /></Text>
            </View>
        );
    }


    const [sound, setSound] = useState();

    async function playSound() {
        const { sound } = await Audio.Sound.createAsync(require('./../../assets/sounds/success-1-6297.mp3'));
        setSound(sound);
        await sound.playAsync();
    }



    useEffect(() => {
        if (curBooking && curBooking.status !== 'STARTED') {
            const intervalId = setInterval(() => {
                if (timeLeft.seconds > 0) {
                    setTimeLeft({
                        minutes: timeLeft.minutes,
                        seconds: timeLeft.seconds - 1,
                    });
                } else if (timeLeft.minutes > 0) {
                    setTimeLeft({
                        minutes: timeLeft.minutes - 1,
                        seconds: 59,
                    });
                }
            }, 1000);
            if (timeLeft.minutes === 0 && timeLeft.seconds === 0) {
                { curBooking.otp }
                clearInterval(intervalId);
            }
            return () => clearInterval(intervalId);
        }

        if (curBooking && curBooking.status == 'STARTED') {
            setModalArrived(false);
        }


    }, [timeLeft, curBooking]);

    const startBooking = () => {
        setOtpModalVisible(false);
        let booking = { ...curBooking };
        booking.status = 'STARTED';
        dispatch(updateBooking(booking));
    }/*
    const endBooking = () => {
        
        let booking = { ...curBooking };
       

        if(booking.payment_mode === 'corp'){
            setLoading(true);
           // modalConfirmClose(true)
            booking.status = 'REACHED';
            dispatch(updateBooking(booking));
            setOtpModalVisible(false);
        } else {
            setLoading(true);
            booking.status = 'REACHED';
            dispatch(updateBooking(booking));
            setOtpModalVisible(false);
        }
    }
*/



    const endBooking = () => {
        // Verificar si el valor de estimate es mayor que el de trip_cost
        if (parseFloat(curBooking.estimate) > parseFloat(curBooking.trip_cost)) {
            curBooking.trip_cost = curBooking.estimate;
            console.log(curBooking.estimate + ' el valor del estimado');
            console.log(curBooking.trip_cost + ' el valor del costo');

            // Dispatch para actualizar el booking con el nuevo trip_cost
            dispatch(updateBooking(curBooking));
        }

        Alert.alert(
            "Confirmación",
            "¿Estás seguro de finalizar el viaje?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "Aceptar",
                    onPress: () => {
                        let booking = { ...curBooking };

                        setLoading(true);
                        booking.status = 'REACHED';
                        console.log("se esta intentado cancelar")
                        dispatch(updateBooking(booking));
                        setOtpModalVisible(false);
                    }
                }
            ],
            { cancelable: false }
        );
    };

    const arrivedBooking = () => {
        let booking = { ...curBooking };
        booking.arrived = true;
        dispatch(updateBooking(booking));

        Alert.alert(
            'Notificación de Legada',
            'El usuario ha sido notifiado',
        );
    }

    const startEspera = () => {
        handleSuspendMap()

    }

    const handleSuspendMap = () => {
        setMapBoundaries({
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0,
            longitudeDelta: 0,
        });
        setShowButton(!showButton);
        setModalMapaVisible(!modalMapaVisible);
    };


    const handleResumeMap = () => {
        setMapBoundaries({
            latitude: lastLocation.lat,
            longitude: lastLocation.lng,
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
        });
        setShowButton(!showButton);
    };

    useEffect(() => {
        if (curBooking && curBooking.arrived === true && curBooking.status !== 'STARTED') {
            setModalArrived(true)
        } else {
            setModalArrived(false)
        }
    }, [curBooking]);


    const acceptBid = (item) => {
        let bookingObj = { ...curBooking };
        if ((bookingObj.payment_mode === 'wallet' && parseFloat(auth.profile.walletBalance) >= item.trip_cost) || bookingObj.payment_mode === 'cash' || bookingObj.payment_mode === 'card') {
            bookingObj.selectedBid = item;
            for (let key in bookingObj.driverOffers) {
                if (key !== item.driver) {
                    delete bookingObj.driverOffers[key];
                }
            }
            for (let key in bookingObj.requestedDrivers) {
                if (key !== item.driver) {
                    delete bookingObj.requestedDrivers[key];
                }
            }
            dispatch(updateBooking(bookingObj));
        } else {
            Alert.alert(t('alert'), t('wallet_balance_low'));
        }
    }

    const startNavigation = () => {
        let url = 'https://www.google.com/maps/dir/?api=1&travelmode=driving';
        if (curBooking.status == 'ACCEPTED') {
            url = url + '&destination=' + curBooking.pickup.lat + "," + curBooking.pickup.lng;
            Linking.openURL(url);
        }
        else if (curBooking.status == 'STARTED') {
            if (curBooking.waypoints && curBooking.waypoints.length && curBooking.waypoints.length > 0) {
                let abc = url + '&destination=' + curBooking.drop.lat + "," + curBooking.drop.lng + '&waypoints=';
                if (curBooking.waypoints.length > 1) {
                    for (let i = 0; i < curBooking.waypoints.length; i++) {
                        let obj = curBooking.waypoints[i];
                        if (i < curBooking.waypoints.length - 1) {
                            abc = abc + obj.lat + ',' + obj.lng + '%7C'
                        } else {
                            abc = abc + obj.lat + ',' + obj.lng

                        }
                    }
                    Linking.openURL(abc);
                } else {
                    url = url + '&destination=' + curBooking.drop.lat + "," + curBooking.drop.lng + '&waypoints=' + curBooking.waypoints[0].lat + "," + curBooking.waypoints[0].lng;
                    Linking.openURL(url);
                }
            } else {
                url = url + '&destination=' + curBooking.drop.lat + "," + curBooking.drop.lng;
                Linking.openURL(url);
            }
        } else {
            Alert.alert(t('alert'), t('navigation_available'));
        }
    }


    const startNavigationWaze = () => {
        if (curBooking.status === 'ACCEPTED') {
            const destinationName = 'ubicación de recogida'; // Cambia esto al nombre adecuado
            const url = `https://www.waze.com/ul?ll=${curBooking.pickup.lat},${curBooking.pickup.lng}&navigate=yes&zoom=17&place=${destinationName}`;
            Linking.openURL(url);
        } else if (curBooking.status === 'STARTED') {
            const destinationName = 'Ubicacion de destino'; // Cambia esto al nombre adecuado
            const url = `https://www.waze.com/ul?ll=${curBooking.drop.lat},${curBooking.drop.lng}&navigate=yes&zoom=17&place=${destinationName}`;
            Linking.openURL(url);
        } else {
            Alert.alert(t('alert'), t('navigation_available'));
        }
    }


    const alertModal = () => {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={alertModalVisible}
                onRequestClose={() => {
                    setAlertModalVisible(false);
                }}>
                <View style={styles.alertModalContainer}>
                    <View style={styles.alertModalInnerContainer}>

                        <View style={styles.alertContainer}>

                            <Text style={styles.rideCancelText}>{t('rider_cancel_text')}</Text>

                            <View style={styles.horizontalLLine} />

                            <View style={styles.msgContainer}>
                                <Text style={styles.cancelMsgText}>{t('cancel_messege1')}  {bookingId} {t('cancel_messege2')} </Text>
                            </View>
                            <View style={styles.okButtonContainer}>
                                <Button
                                    title={t('no_driver_found_alert_OK_button')}
                                    titleStyle={{ fontFamily: 'Roboto-Bold' }}
                                    onPress={() => {
                                        setAlertModalVisible(false);
                                        props.navigation.popToTop();
                                    }}
                                    buttonStyle={styles.okButtonStyle}
                                    containerStyle={styles.okButtonContainerStyle}
                                />
                            </View>

                        </View>

                    </View>
                </View>

            </Modal>
        )
    }

    const goBack = () => {
        props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'TabRoot' }] }));
    }

    const cancelModal = () => {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                <View style={styles.cancelModalContainer}>
                    <View style={styles.cancelModalInnerContainer}>

                        <View style={styles.cancelContainer}>
                            <View style={styles.cancelReasonContainer}>
                                <Text style={styles.cancelReasonText}>{t('cancel_reason_modal_title')}</Text>
                            </View>

                            <View style={styles.radioContainer}>
                                <RadioForm
                                    radio_props={cancelReasons}
                                    initial={0}
                                    animation={false}
                                    buttonColor={MAIN_COLOR}
                                    selectedButtonColor={MAIN_COLOR}
                                    buttonSize={10}
                                    buttonOuterSize={20}
                                    style={styles.radioContainerStyle}
                                    labelStyle={styles.radioText}
                                    radioStyle={[styles.radioStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                                    onPress={(value) => { setCancelReasonSelected(value) }}
                                />
                            </View>
                            <View style={[styles.cancelModalButtosContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <Button
                                    title={t('close')}
                                    titleStyle={{ fontFamily: 'Roboto-Bold' }}
                                    onPress={() => { setModalVisible(false) }}
                                    buttonStyle={styles.cancelModalButttonStyle}
                                    containerStyle={styles.cancelModalButtonContainerStyle}
                                />

                                <View style={styles.buttonSeparataor} />

                                <Button
                                    title={t('no_driver_found_alert_OK_button')}
                                    titleStyle={{ fontFamily: 'Roboto-Bold' }}
                                    onPress={() => {
                                        if (cancelReasonSelected >= 0) {
                                            dispatch(cancelBooking({ booking: curBooking, reason: cancelReasons[cancelReasonSelected].label, cancelledBy: role }));
                                            props.navigation.replace('TabRoot', { screen: 'RideList', params: { fromBooking: true } });
                                        } else {
                                            Alert.alert(t('alert'), t('select_reason'));
                                        }
                                    }}
                                    buttonStyle={[styles.cancelModalButttonStyle, { backgroundColor: colors.GREEN }]}
                                    containerStyle={styles.cancelModalButtonContainerStyle}
                                />
                            </View>

                        </View>


                    </View>
                </View>

            </Modal>
        )
    }


    const incidentModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalInsident}
                onRequestClose={() => {
                    incidentModalIncident(false);
                }}>
                <View style={styles.incidentModalContainer}>
                    <View style={styles.incidentModalInnerContainer}>

                        <View style={styles.cancelContainer}>
                            <View style={styles.cancelReasonContainer}>
                                <Text style={styles.cancelReasonText}>{t('incident_reason_modal_title')}</Text>
                            </View>

                            <View style={styles.radioContainer}>
                                <RadioForm
                                    radio_props={reportIncidents}
                                    initial={0}
                                    animation={false}
                                    buttonColor={MAIN_COLOR}
                                    selectedButtonColor={MAIN_COLOR}
                                    buttonSize={10}
                                    buttonOuterSize={20}
                                    style={styles.radioContainerStyle}
                                    labelStyle={styles.radioText}
                                    radioStyle={[styles.radioStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                                    onPress={(value) => { setreportIncidentselected(value) }}
                                />
                            </View>


                            <View style={{ marginBottom: 10, borderRadius: 23 }}>
                                <TouchableOpacity style={{ margin: 1, bottom: 10 }} >
                                    <OpenURLButton url={supportedURL} >{t('politycs')}</OpenURLButton>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.incidentModalButtosContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <Button
                                    title={t('close')}
                                    titleStyle={{ fontFamily: 'Roboto-Bold' }}
                                    onPress={() => { incidentModalIncident(false) }}
                                    buttonStyle={styles.incidentModalButttonStyle}
                                    containerStyle={styles.incidentModalButtonContainerStyle}
                                />

                                <View style={styles.buttonSeparataor} />

                                <Button
                                    title={t('no_driver_found_alert_OK_button')}
                                    titleStyle={{ fontFamily: 'Roboto-Bold' }}
                                    onPress={() => {
                                        if (reportIncidentselected >= 0) {
                                            dispatch(reportIncidence({ booking: curBooking, reason: reportIncidents[reportIncidentselected].label, }));
                                            goBack()
                                        } else {
                                            Alert.alert(t('alert'), t('select_reason'));
                                        }
                                    }}
                                    buttonStyle={[styles.incidentModalButttonStyle, { backgroundColor: colors.GREEN }]}
                                    containerStyle={styles.incidentModalButtonContainerStyle}
                                />
                            </View>

                        </View>


                    </View>
                </View>

            </Modal>
        )
    }



    const modaltime = () => {
        return (
            <Modal
                animationType='slide'
                transparent={true}
                visible={modalTimeUp}
                onRequestClose={() => {
                    setModalTimeUP(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', marginVertical: 10, color: colors.RED_TREAS, fontSize: 20 }} > Atención </Text>

                            {curBooking && role === 'customer' ?
                                <Text style={{ textAlign: 'justify' }} > Recuerda que el valor estimado de tu servicio estaba estimado en  {curBooking.estimateDistance} KM y {curBooking.estimateTime ? parseFloat(curBooking.estimateTime / 60).toFixed(0) : 0} {t('mins')} por lo anterior a partir de este  momento tu tarifa subirá proporcionalmente al servicio prestado por tu conductor {curBooking.driver_name}   </Text>
                                : null}

                            <TouchableOpacity style={{ margin: 10, backgroundColor: colors.RED_TREAS, borderRadius: 23, alignItems: 'center' }} onPress={() => { setModalTimeUP(false) }}  >
                                <Text style={{ color: colors.WHITE, fontWeight: 'bold', margin: 10 }} > Aceptar </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </Modal>
        )
    }


    const confirmModalClose = () => {
        setSearchModalVisible(true);
        setConfirmModalVisible(false);
        let booking = { ...curBooking };
        booking.confirmModal = true;
        dispatch(updateBooking(booking));
    }

    const confirmModal = () => {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={confirmModalVisible}
                onRequestClose={() => {
                    setConfirmModalVisible(false);
                }}>
                <View style={{ flex: 1, backgroundColor: colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: width - 70, borderRadius: 10, flex: 1, maxHeight: 280, marginTop: 15, backgroundColor: colors.WHITE, alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={130} color={colors.GREEN} style={{ marginTop: 10, }} />
                        <Text style={{ fontSize: 25, fontWeight: 'bold', marginTop: -10 }}>{t('booking_successful')}</Text>
                        <Text style={{ fontSize: 16, marginTop: 10 }}>{t('booking_confirm')}</Text>
                        <View style={{ position: 'absolute', bottom: 20, alignSelf: 'center' }}>
                            <Button
                                title={t('done')}
                                loading={false}
                                loadingProps={{ size: "large", }}
                                titleStyle={{ fontFamily: 'Roboto-Bold' }}
                                onPress={() => confirmModalClose()}
                                buttonStyle={{ width: 100, backgroundColor: colors.GREEN }}
                                containerStyle={{ marginTop: 15 }}
                            />
                        </View>

                    </View>


                </View>
            </Modal>
        )
    }


    const modalCloseBookin = () => {
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalConfirmClose}
            onRequestClose={() => {
                setModalConfirmClose(false)
            }}
        >
            <View style={{ flex: 1, backgroundColor: colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>

            </View>
        </Modal>
    }

    const searchModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={searchModalVisible}
                onRequestClose={() => {
                    setSearchModalVisible(false)
                }}
            >
                <View style={{ flex: 1, backgroundColor: colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
                    {settings && curBooking && curBooking.driverOffers && !curBooking.selectedBid ?
                        <View style={{ width: width - 40, backgroundColor: colors.WHITE, borderRadius: 10, flex: 1, maxHeight: height - 200, marginTop: 15 }}>
                            <View style={{ color: colors.BLACK, position: 'absolute', top: 20, alignSelf: 'center' }}>
                                <Text style={{ color: colors.BLACK, fontSize: 20 }}>{t('drivers')}</Text>
                            </View>
                            <View style={{ marginTop: 60, width: width - 60, height: height - 340, marginRight: 10, marginLeft: 10, alignSelf: 'center', maxWidth: 350, }}>
                                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                                    {Object.keys(curBooking.driverOffers).map(key =>
                                        <View key={key} style={styles.vew}>
                                            <View style={{ height: '70%', width: '100%', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                                <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Image source={curBooking && curBooking.driverOffers[key].driver_image ? { uri: curBooking.driverOffers[key].driver_image } : require('../../assets/images/profilePic.png')} style={{ borderRadius: 33, width: 65, height: 65 }} />
                                                </View>
                                                <View style={{ width: '75%', alignItems: 'center' }}>
                                                    <Text style={{ color: colors.BLACK, fontSize: 16, marginTop: 4, textAlign: 'center', }}>{curBooking.driverOffers[key].driver_name}</Text>
                                                    <StarRating
                                                        maxStars={5}
                                                        starSize={20}
                                                        enableHalfStar={true}
                                                        color={colors.STAR}
                                                        emptyColor={colors.STAR}
                                                        rating={curBooking && curBooking.driverOffers[key] && curBooking.driverOffers[key].driverRating ? parseFloat(curBooking.driverOffers[key].driverRating) : 0}
                                                        onChange={() => {
                                                            //console.log('hello')
                                                        }}
                                                        style={[isRTL ? { transform: [{ scaleX: -1 }] } : null]}
                                                    />
                                                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
                                                        {settings.swipe_symbol === false ?
                                                            <Text style={{ color: colors.BLACK, fontSize: 22, fontWeight: '700' }}>{settings.symbol} {parseFloat(curBooking.driverOffers[key].trip_cost).toFixed(2)}</Text>
                                                            :
                                                            <Text style={{ color: colors.BLACK, fontSize: 22, fontWeight: '700' }}>{parseFloat(curBooking.driverOffers[key].trip_cost).toFixed(2)} {settings.symbol}</Text>
                                                        }
                                                        <Button
                                                            title={t('accept')}
                                                            titleStyle={[styles.buttonTitleText, { fontWeight: 'bold' }]}
                                                            onPress={() => acceptBid(curBooking.driverOffers[key])}
                                                            buttonStyle={styles.accpt}
                                                        />
                                                    </View>
                                                    <Text style={{ color: colors.BLACK, fontSize: 16, fontWeight: '600', alignSelf: 'center' }}>{moment(curBooking.driverOffers[key].deliveryDate).format('lll')}</Text>
                                                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignSelf: 'center' }}>
                                                        <Text style={{ color: colors.BLACK, fontSize: 12, marginTop: 3 }}>{t('driver_distance')} - </Text>
                                                        <Text style={{ color: colors.BLACK, fontSize: 16, fontWeight: '600', }}>{curBooking && curBooking.driverEstimates && curBooking.driverEstimates[key].timein_text ? curBooking.driverEstimates[key].timein_text : t('within_min')}</Text>
                                                    </View>
                                                </View>

                                            </View>

                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                            <View style={{ position: 'absolute', bottom: 20, alignSelf: 'center' }}>
                                <Button
                                    title={t('close')}
                                    loading={false}
                                    loadingProps={{ size: "large", }}
                                    titleStyle={{ fontFamily: 'Roboto-Bold' }}
                                    onPress={() => { setSearchModalVisible(false) }}
                                    buttonStyle={{ width: 100, borderRadius: 10, backgroundColor: colors.RED }}
                                    containerStyle={{ marginTop: 20 }}
                                />
                            </View>
                        </View>
                        :
                        <View style={{ width: width - 70, borderRadius: 10, flex: 1, maxHeight: 310, marginTop: 15, backgroundColor: colors.WHITE }}>
                            <Image source={require('../../assets/images/g4.gif')} resizeMode={'contain'} style={{ width: '100%', height: 220, alignSelf: 'center' }} />
                            <View style={{ color: colors.BLACK, alignSelf: 'center' }}>
                                <Text style={{ color: colors.HEADER, fontSize: 16, }}>{t('driver_assign_messege')}</Text>
                            </View>
                            <View style={{ position: 'absolute', bottom: 20, alignSelf: 'center' }}>
                                <Button
                                    title={t('close')}
                                    loading={false}
                                    loadingProps={{ size: "large", }}
                                    titleStyle={{ fontFamily: 'Roboto-Bold' }}
                                    onPress={() => { setSearchModalVisible(false) }}
                                    buttonStyle={{ width: 100, backgroundColor: colors.RED }}
                                    containerStyle={{ marginTop: 20, }}
                                />
                            </View>
                        </View>
                    }
                </View>
            </Modal>
        );
    }

    const chat = () => {
        props.navigation.navigate("onlineChat", { bookingId: bookingId })
    }
    const openWhatsApp = () => {
        const message = 'Hi';

        if (role === 'customer') {

            const whatsappLink = `whatsapp://send?phone=${curBooking.driver_contact}&text=${encodeURIComponent(message)}`;
            Linking.openURL(whatsappLink)
        }
        else if (role === 'driver') {

            const whatsappLink = `whatsapp://send?phone=${curBooking.customer_contact}&text=${encodeURIComponent(message)}`;
            Linking.openURL(whatsappLink)
        }


    };


    const onPressCall = (phoneNumber) => {
        let call_link = Platform.OS == 'android' ? 'tel:' + phoneNumber : 'telprompt:' + phoneNumber;
        Linking.openURL(call_link);
    }

    const _pickImage = async (res) => {
        var pickFrom = res;

        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status == 'granted') {
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [3, 3]
            });

            if (!result.canceled) {
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        Alert.alert(t('alert'), t('image_upload_error'));
                        setLoader(false);
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', result.assets[0].uri, true);
                    xhr.send(null);
                });
                if (blob) {
                    setLoading(true);
                    dispatch(updateBookingImage(curBooking,
                        curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED' ? 'pickup_image' : 'deliver_image',
                        blob));
                }
            }
        }
    };

    const PurchaseInfoModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={purchaseInfoModalStatus}
                onRequestClose={() => {
                    setPurchaseInfoModalStatus(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ width: '100%' }}>

                            <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>

                                <View style={{ left: -10, button: 10, display: 'flex', flexDirection: 'row', margin: 6 }}>

                                    {curBooking && curBooking.status == 'ACCEPTED' && role == 'customer' ?
                                        <View style={styles.driverPhotoContainer3}>
                                            <Image source={curBooking && curBooking.car_image ? { uri: curBooking.car_image } : null} style={styles.driverPhoto3} />
                                        </View> : null}
                                </View>
                            </View>


                            {curBooking && role == 'customer' ?

                                <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                    <Text style={styles.textHeading}>{'Nombre del Conductor'}</Text>
                                    <Text style={styles.textContent}>
                                        <Text style={styles.driverNameText}>{curBooking && curBooking.driver_name}</Text>
                                    </Text>
                                </View>
                                :
                                <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                    <Text style={styles.textHeading}>{'Nombre del Cliente'}</Text>
                                    <Text style={styles.textContent}>
                                        <Text style={styles.driverNameText}>{curBooking && curBooking.customer_name}</Text>
                                    </Text>
                                </View>
                            }


                            {curBooking ?

                                <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                    <Text style={styles.textHeading}>{'Usuario verificado'}</Text>
                                    <Text style={styles.textContent}>
                                        <AntDesign name="checkcircle" size={24} color="green" />
                                    </Text>
                                </View>
                                :
                                null
                            }


                            {curBooking ?
                                <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                    <Text style={styles.textHeading}>{'Tipo de pago'}</Text>
                                    <Text style={styles.textContent}>
                                        <Text style={styles.driverNameText}>{t(curBooking && curBooking.payment_mode)}</Text>
                                    </Text>
                                </View>
                                : null}



                            {curBooking && role == 'customer' ?
                                <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                    <Text style={styles.textHeading}>{'Placa del vehículo'}</Text>
                                    <Text style={styles.textContent}>
                                        {//curBooking && curBooking.parcelTypeSelected ? curBooking.parcelTypeSelected.description : ''
                                            curBooking && curBooking.vehicle_number
                                        }
                                    </Text>
                                </View>
                                :
                                null
                            }

                            {curBooking && role == 'customer' ?
                                <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                    <Text style={styles.textHeading}>{'Color del Vehículo'}</Text>
                                    <Text style={styles.textContent}>
                                        {curBooking ? curBooking.vehicleColor : ''}
                                    </Text>
                                </View>

                                : null}

                            {curBooking && role == 'customer' ?
                                <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                    <Text style={styles.textHeading}>{'Marca del Vehículo'}</Text>
                                    <Text style={styles.textContent}>
                                        {curBooking ? curBooking.vehicleMake : ''}
                                    </Text>
                                </View>
                                : null}

                            {curBooking && role == 'driver' ?
                                <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                    <Text style={styles.textHeading}>{'Teléfono del Cliente'}</Text>
                                    <Text style={styles.textContent}>
                                        {curBooking ? curBooking.customer_contact : ''}
                                    </Text>
                                </View>
                                : null}

                            {curBooking && role == 'customer' ?
                                <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                    <Text style={styles.textHeading}>{'Tipo de Servicio'}</Text>
                                    {//   <Image source={{ uri: curBooking.carImage }} resizeMode={'contain'} style={styles.cabImage} />
                                    }
                                    <Text style={styles.textContent}>

                                        {curBooking.carType}
                                    </Text>

                                </View>
                                :
                                null
                            }

                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'center', height: 40 }}>
                            <OldTouch
                                loading={false}
                                onPress={() => setPurchaseInfoModalStatus(false)}
                                style={styles.modalButtonStyle}
                            >
                                <Text style={styles.modalButtonTextStyle}>{t('ok')}</Text>
                            </OldTouch>
                        </View>
                    </View>
                </View>
            </Modal>

        )
    }




    const UserInfoModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={userInfoModalStatus}
                onRequestClose={() => {
                    setUserInfoModalStatus(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ width: '100%' }}>
                            <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                <Text style={styles.textHeading1}>{t('otherPersonPhone')}</Text>
                                <Text style={styles.textContent1} onPress={() => onPressCall(curBooking.otherPersonPhone)}>
                                    <Icon
                                        name="call"
                                        type="ionicon"
                                        size={15}
                                        color={colors.INDICATOR_BLUE}
                                    />
                                    {curBooking ? curBooking.otherPersonPhone : ''}
                                </Text>
                            </View>
                            <View style={[styles.textContainerStyle, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                                <Text style={styles.textHeading1}>{t('senderPersonPhone')}</Text>

                                <Text style={styles.textContent1} onPress={() => onPressCall(curBooking.customer_contact)}>
                                    <Icon
                                        name="call"
                                        type="ionicon"
                                        size={15}
                                        color={colors.INDICATOR_BLUE}
                                    />
                                    {curBooking ? curBooking.customer_contact : ''}
                                </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'center', height: 40 }}>
                            <OldTouch
                                loading={false}
                                onPress={() => setUserInfoModalStatus(false)}
                                style={styles.modalButtonStyle}
                            >
                                <Text style={styles.modalButtonTextStyle}>{t('ok')}</Text>
                            </OldTouch>
                        </View>
                    </View>
                </View>
            </Modal>

        )
    }

    const onShare = async (curBooking) => {
        try {
            const result = await Share.share({
                message: curBooking.otp + t('otp_sms')
            });
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            pageActive.current = true;
        });
        return unsubscribe;
    }, [props.navigation, pageActive.current]);

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('blur', () => {
            pageActive.current = false;
            if (role == 'customer') {
                dispatch(stopLocationFetch(bookingId));
            }
        });
        return unsubscribe;
    }, [props.navigation, pageActive.current]);

    useEffect(() => {
        pageActive.current = true;
        return () => {
            pageActive.current = false;
        };
    }, []);

    const submitComplain = (curBooking) => {
        Alert.alert(
            t('panic_text'),
            t('panic_question'),
            [
                {
                    text: t('cancel'),
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: t('ok'), onPress: async () => {
                        let call_link = Platform.OS == 'android' ? 'tel:' + settings.panic : 'telprompt:' + settings.panic;
                        Linking.openURL(call_link);

                        let obj = {};
                        obj.bookingId = curBooking.id,
                            obj.complainDate = new Date().getTime();

                        if (auth.profile && auth.profile && auth.profile.usertype && auth.profile.usertype == 'driver') {
                            obj.user_name = curBooking.driver_name;
                            obj.contact = curBooking.driver_contact;
                        }
                        if (auth.profile && auth.profile && auth.profile.usertype && auth.profile.usertype == 'customer') {
                            obj.user_name = curBooking.customer_name;
                            obj.contact = curBooking.customer_contact;
                        }
                        obj.user_type = auth.profile && auth.profile && auth.profile.usertype ? auth.profile.usertype : null;
                        dispatch(editSos(obj, "Add"));
                    }
                }
            ],
            { cancelable: false }
        )
    }

    
    const supportedURL = 'https://treasapp.com/bloqueos-y-cancelaciones';

    const OpenURLButton = ({ url, children }) => {
        const handlePress = useCallback(async () => {
            // Checking if the link is supported for links with custom URL scheme.
            const supported = await Linking.canOpenURL(url);

            if (supported) {
                // Opening the link with some app, if the URL scheme is "http" the web link should be opened
                // by some browser in the mobile
                await Linking.openURL(url);
            } else {
                Alert.alert(`Don't know how to open this URL: ${url}`);
            }
        }, [url]);

        return <Button
            buttonStyle={[styles.incidentModalButttonStyle, { backgroundColor: '#4f0000', borderRadius: 23, width: '90%', left: 20 }]}
            title={children} onPress={handlePress} />;
    };


    return (
        <View style={styles.mainContainer}>
            <View style={styles.mapcontainer}>
                {curBooking ?
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                            latitude: curBooking.pickup.lat,
                            longitude: curBooking.pickup.lng,
                            latitudeDelta: latitudeDelta,
                            longitudeDelta: longitudeDelta
                        }}
                        minZoomLevel={3}
                    >

                        {(curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED' || curBooking.status == 'STARTED') && lastLocation ?
                            <Marker.Animated
                                coordinate={new AnimatedRegion({
                                    latitude: lastLocation.lat,
                                    longitude: lastLocation.lng,
                                    latitudeDelta: latitudeDelta,
                                    longitudeDelta: longitudeDelta
                                })}
                            >
                                <Image
                                    source={carImageIcon}
                                    style={{ height: 40, width: 40 }}
                                />
                            </Marker.Animated>
                            : null}

                        <Marker
                            coordinate={{ latitude: (curBooking.pickup.lat), longitude: (curBooking.pickup.lng) }}
                            title={curBooking.pickup.add}>
                            <Image source={require("../../assets/images/green_pin.png")} style={{ height: 35, width: 35 }} />
                        </Marker>
                        {curBooking != null && curBooking.waypoints && curBooking.waypoints.length > 0 ? curBooking.waypoints.map((point, index) => {
                            return (
                                <Marker
                                    coordinate={{ latitude: point.lat, longitude: point.lng }}
                                    pinColor={colors.GREEN}
                                    title={point.add}
                                    key={point.add}
                                >
                                    <Image source={require("../../assets/images/rsz_2red_pin.png")} style={{ height: 35, width: 35 }} />
                                </Marker>
                            )
                        })
                            : null}
                        <Marker
                            coordinate={{ latitude: (curBooking.drop.lat), longitude: (curBooking.drop.lng) }}
                            title={curBooking.drop.add}>
                            <Image source={require("../../assets/images/rsz_2red_pin.png")} style={{ height: 35, width: 35 }} />
                        </Marker>

                        {liveRouteCoords && (curBooking.status == 'ACCEPTED' || curBooking.status == 'STARTED') ?
                            <Polyline
                                coordinates={liveRouteCoords}
                                strokeWidth={5}
                                strokeColor={colors.INDICATOR_BLUE}
                            />
                            : null}

                        {(curBooking.status == 'NEW' || curBooking.status == 'ARRIVED' || curBooking.status == 'REACHED') && curBooking.coords ?
                            <Polyline
                                coordinates={curBooking.coords}
                                strokeWidth={4}
                                strokeColor={colors.INDICATOR_BLUE}
                            />
                            : null}
                    </MapView>
                    : null}
                <View style={[styles.menuIcon, isRTL ? { right: 15 } : { left: 15 }]}>
                    <TouchableOpacity onPress={() => { goBack() }} style={styles.menuIconButton} >
                        <Icon
                            name={isRTL ? 'arrow-right' : 'arrow-left'}
                            type='font-awesome'
                            color='#517fa4'
                            size={26}
                        />
                    </TouchableOpacity>
                </View>
                <View style={[isRTL ? styles.topTitle1 : styles.topTitle, { height: settings && settings.otp_secure ? 60 : 45 }]}>
                    <Text style={styles.cabText}>{t('booking_status')}: <Text style={styles.cabBoldText}>{curBooking && curBooking.status ? t(curBooking.status) : null} </Text></Text>
                    {curBooking && curBooking.status == 'ACCEPTED' ?
                        <Text style={styles.cabText}>{curBooking && curBooking.status == 'ACCEPTED' || settings && settings.showLiveRoute ? '( ' + arrivalTime + ' ' + t('mins') + ' )' : ''}</Text>
                        : null}
                    {role == 'customer' && settings && settings.otp_secure ?
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', padding: 1, alignSelf: 'center' }}>
                            <Text style={styles.otpText}>{curBooking ? t('otp') + curBooking.otp : null}</Text>
                            <View>
                                <TouchableOpacity onPress={() => onShare(curBooking)}>
                                    <Icon
                                        name="share-social"
                                        type="ionicon"
                                        size={22}
                                        color={colors.INDICATOR_BLUE} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        : null}
                </View>

                {(curBooking && curBooking.status && auth.profile && auth.profile.uid && ((['ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED'].indexOf(curBooking.status) != -1))) && (settings && settings.panic && settings.panic.length > 0) && (role === 'driver' || appConsts.canCall) ?
                    <TouchableOpacity style={[styles.floatButton, isRTL ? { right: 10, bottom: (role == 'customer' && ((curBooking && curBooking.status == 'ARRIVED') || curBooking.status == 'REACHED' || curBooking.status == 'PAID' || (curBooking && curBooking.status == 'STARTED'))) ? 285 : 330 } : { left: 10, bottom: (role == 'customer' && ((curBooking && curBooking.status == 'ARRIVED') || curBooking.status == 'REACHED' || curBooking.status == 'PAID' || (curBooking && curBooking.status == 'STARTED'))) ? 300 : (role == 'customer' && (curBooking && curBooking.status == 'ACCEPTED')) ? 350 : 330 }]}
                        onPress={() => submitComplain(curBooking)} >
                        <Text style={[styles.driverNameText, { color: colors.WHITE }]}>{t('sos').toUpperCase()}</Text>
                    </TouchableOpacity>
                    : null}

                {curBooking && !(curBooking.status == 'NEW') ?
                    <TouchableOpacity
                        style={[styles.floatButton, isRTL ? { left: 10, bottom: (role == 'customer' && ((curBooking && curBooking.status == 'ARRIVED') || curBooking.status == 'REACHED' || curBooking.status == 'PAID' || (curBooking && curBooking.status == 'STARTED'))) ? 345 : 388 } : { right: 10, bottom: (role == 'customer' && ((curBooking && curBooking.status == 'ARRIVED') || curBooking.status == 'REACHED' || curBooking.status == 'PAID' || (curBooking && curBooking.status == 'STARTED'))) ? 360 : (role == 'customer' && (curBooking && curBooking.status == 'ACCEPTED')) ? 408 : 388 }]}
                        // onPress={() => openWhatsApp()}
                        onPress={settings && settings.chatViaWhatsApp === true ? () => openWhatsApp() : () => chat()}
                    >
                        <Icon
                            name="chatbubbles"
                            type="ionicon"
                            size={30}
                            color={colors.WHITE}
                        />
                    </TouchableOpacity>
                    : null}
                {curBooking && !(curBooking.status == 'NEW') ?
                    <TouchableOpacity
                        style={[styles.floatButton, isRTL ? { left: 10, bottom: (role == 'customer' && ((curBooking && curBooking.status == 'ARRIVED') || curBooking.status == 'REACHED' || curBooking.status == 'PAID' || (curBooking && curBooking.status == 'STARTED'))) ? 285 : 330 } : { right: 10, bottom: (role == 'customer' && ((curBooking && curBooking.status == 'ARRIVED') || curBooking.status == 'REACHED' || curBooking.status == 'PAID' || (curBooking && curBooking.status == 'STARTED'))) ? 300 : (role == 'customer' && (curBooking && curBooking.status == 'ACCEPTED')) ? 350 : 330 }]}
                        onPress={() => role == 'customer' ? onPressCall(curBooking.driver_contact) : (curBooking.otherPersonPhone && curBooking.otherPersonPhone.length > 0 ? onPressCall(curBooking.otherPersonPhone) : onPressCall(curBooking.customer_contact))}
                    >
                        <Icon
                            name="call"
                            type="ionicon"
                            size={30}
                            color={colors.WHITE}
                        />
                    </TouchableOpacity>
                    : null}

            </View>
            <View style={[styles.vew1,
            { minHeight: (role == 'customer' && (curBooking && curBooking.status == 'NEW')) ? 220 : (role == 'customer' && ((curBooking && curBooking.status == 'ARRIVED') || curBooking.status == 'REACHED' || curBooking.status == 'PAID' || (curBooking && curBooking.status == 'STARTED'))) ? 240 : 285 }]}>
                {curBooking && curBooking.status != "NEW" ?
                    <View style={{ minHeight: (role == 'customer' && ((curBooking && curBooking.status == 'ARRIVED') || curBooking.status == 'PAID' || curBooking.status == 'REACHED' || (curBooking && curBooking.status == 'STARTED'))) ? '30%' : '22%', justifyContent: 'center', }}>
                        {role == 'customer' ?
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', padding: 3, alignSelf: 'flex-start', width: '100%', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                                <Image source={curBooking.driver_image ? { uri: curBooking.driver_image } : require('../../assets/images/profilePic.png')} style={{ height: 55, width: 55, borderRadius: 30, marginLeft: isRTL ? 0 : 1 }} />
                                <View style={{ width: '85%', flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
                                    <View style={{ width: '60%', justifyContent: 'center' }}>
                                        <Text style={[styles.driverNameText, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>{curBooking.driver_name}</Text>
                                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                                            <StarRating
                                                maxStars={1}
                                                starSize={20}
                                                enableHalfStar={true}
                                                color={MAIN_COLOR}
                                                emptyColor={MAIN_COLOR}
                                                rating={parseFloat(curBooking.driverRating)}
                                                style={[styles.ratingContainerStyle, isRTL ? { marginRight: 0, transform: [{ scaleX: -1 }] } : { scaleX: 1 }]}
                                                onChange={() => {
                                                    //console.log('hello')
                                                }}
                                            />
                                            <Text style={[styles.driverNameText, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>{curBooking.driverRating}</Text>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 2, alignItems: 'center', marginLeft: isRTL ? 10 : 0, marginRight: isRTL ? 0 : 10, width: '40%' }}>
                                        <Image source={{ uri: curBooking.carImage }} resizeMode={'contain'} style={{ height: 40, width: 60, }} />
                                        <View style={{ marginTop: 2, alignItems: 'center', width: '100%' }}>
                                            <Text numberOfLines={2} style={styles.cabNameText}>{curBooking.carType}</Text>
                                        </View>
                                        <View style={{ marginTop: 2, alignItems: 'center', width: '100%' }}>
                                            <Text numberOfLines={2} style={styles.cabNameText}>{curBooking.vehicle_number}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            :
                            <TouchableOpacity onPress={() => setPurchaseInfoModalStatus(true)} >
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', padding: 3, alignSelf: 'flex-start', width: '100%', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                                    <Image source={curBooking.customer_image ? { uri: curBooking.customer_image } : require('../../assets/images/profilePic.png')} style={{ height: 55, width: 55, borderRadius: 25, marginLeft: isRTL ? 0 : 5 }} />
                                    <View style={{ flex: 1, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <Text style={[styles.driverNameText, { textAlign: isRTL ? 'right' : 'left' }]} >{curBooking.customer_name}</Text>
                                        </View>
                                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginLeft: isRTL ? 5 : 0, marginRight: isRTL ? 0 : 5 }}>



                                            {role == 'driver' ?
                                                <TouchableOpacity
                                                    style={styles.floatButton2}
                                                    onPress={() =>
                                                        startNavigationWaze()
                                                    }
                                                >
                                                    <FontAwesome5 name="waze"
                                                        size={30}
                                                        color={colors.WHITE}
                                                    />
                                                </TouchableOpacity>
                                                : null}


                                            {role == 'driver' && appConsts.showBookingOptions ?
                                                <TouchableOpacity
                                                    style={[styles.floatButton1, { marginHorizontal: 3 }]}
                                                    onPress={() => setPurchaseInfoModalStatus(true)}
                                                >
                                                    <Icon
                                                        name="cube"
                                                        type="ionicon"
                                                        size={30}
                                                        color={colors.WHITE}
                                                    />
                                                </TouchableOpacity>
                                                : null}
                                            {role == 'driver' ?
                                                <TouchableOpacity
                                                    style={styles.floatButton1}
                                                    onPress={() =>
                                                        startNavigation()
                                                    }
                                                >
                                                    <Icon
                                                        name="navigate-circle"
                                                        type="ionicon"
                                                        size={30}
                                                        color={colors.WHITE}
                                                    />
                                                </TouchableOpacity>
                                                : null}
                                        </View>
                                    </View>

                                </View>
                            </TouchableOpacity>
                        }
                    </View>
                    : null}
                <View style={{
                    backgroundColor: colors.WHITE, alignSelf: 'center', borderWidth: 1, color: colors.FOOTERTOP, borderRadius: 10, height: 100
                }}>
                    <ScrollView style={{ flex: 1 }}>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 5, marginBottom: 8 }}>
                            <View style={styles.locationStyle}>
                                <Ionicons name="location-sharp" size={22} color="white" />
                            </View>
                            <Text numberOfLines={1} style={[styles.textStyle, { textAlign: isRTL ? 'right' : 'left', width: '85%' }]}>{curBooking ? curBooking.pickup.add : ""}</Text>
                        </View>
                        {curBooking != null && curBooking.waypoints && curBooking.waypoints.length > 0 ? curBooking.waypoints.map((point, index) => {
                            return (
                                <View key={"key" + index} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={styles.locationStyle}>
                                        <Ionicons name="location-sharp" size={24} color="white" />
                                    </View>
                                    <Text numberOfLines={1} style={[styles.textStyle, { textAlign: isRTL ? 'right' : 'left', width: '85%' }]}>{curBooking ? point.add : ""}</Text>
                                </View>
                            )
                        })
                            : null}
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 2 }}>
                            <View style={styles.locationStyle}>
                                <Ionicons name="location-sharp" size={24} color="white" />
                            </View>
                            <Text numberOfLines={1} style={[styles.textStyle, { textAlign: isRTL ? 'right' : 'left', width: '85%' }]}>{curBooking ? curBooking.drop.add : ""}</Text>
                        </View>
                    </ScrollView>
                </View>
                {(curBooking && curBooking.status == 'ARRIVED' || curBooking && curBooking.status == 'ACCEPTED' || curBooking && curBooking.status == 'REACHED' || curBooking && curBooking.status == 'PAID' || curBooking && curBooking.status == 'STARTED') ?
                    <View style={{ justifyContent: 'space-around', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row', height: 55 }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text>{t('distance')}</Text>
                            <Text style={{ fontWeight: 'bold' }}>{curBooking ? parseFloat(curBooking.estimateDistance).toFixed(settings.decimal) : 0} {settings.convert_to_mile ? t('mile') : t('km')}</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text>{t('time')}</Text>
                            <Text style={{ fontWeight: 'bold' }}>{curBooking.estimateTime ? parseFloat(curBooking.estimateTime / 60).toFixed(0) : 0} {t('mins')}</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text>{t('cost')}</Text>
                            {/* <Text style={{fontWeight:'bold'}}>{curBooking? curBooking.distance:null}</Text> */}
                            {settings && settings.swipe_symbol === false ?
                                <Text style={{ fontWeight: 'bold' }}>{settings.symbol} {curBooking && curBooking.trip_cost > 0 ? parseFloat(curBooking.trip_cost).toFixed(settings.decimal) : curBooking && curBooking.estimate ? parseFloat(curBooking.estimate).toFixed(settings.decimal) : 0}</Text>
                                :
                                <Text style={{ fontWeight: 'bold' }}>{curBooking && curBooking.trip_cost > 0 ? parseFloat(curBooking.trip_cost).toFixed(settings.decimal) : curBooking && curBooking.estimate ? parseFloat(curBooking.estimate).toFixed(settings.decimal) : 0} {settings.symbol}    </Text>
                            }
                       

                        </View>
                    </View>
                    : null}
                {curBooking && curBooking.status == "NEW" && (curBooking.bookLater == false || (curBooking.bookLater && (((new Date(curBooking.tripdate)) - (new Date())) / (1000 * 60)) <= 15)) ?
                    <View style={{ width: width, height: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Image style={{ width: 40, height: 40 }} source={require('../../assets/images/loader.gif')} />
                        <TouchableOpacity onPress={() => { setSearchModalVisible(!searchModalVisible) }}>
                            <Text style={{ fontSize: 22 }}>{curBooking.driverOffers ? t('selectBid') : t('searching')}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
                {curBooking && curBooking.status == "NEW" && curBooking.bookLater && (((new Date(curBooking.tripdate)) - (new Date())) / (1000 * 60)) > 15 ?
                    <View style={{ flex: 1, width: width, height: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16 }}>{t('trip_start_time') + ":  "}</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{moment(curBooking.tripdate).format('lll')}</Text>
                    </View>
                    : null}
                {
                    renderButtons()
                }
            </View>
            {
                PurchaseInfoModal()
            }
            {
                UserInfoModal()
            }
            {
                cancelModal()
            }
            {
                alertModal()
            }
            {
                searchModal()
            }
            {
                confirmModal()
            }
            {
                modalCloseBookin()
            }
            {
                incidentModal()
            }

            <OtpModal
                modalvisable={otpModalVisible}
                requestmodalclose={() => { setOtpModalVisible(false) }}
                otp={curBooking ? curBooking.otp : ''}
                onMatch={(value) => value ? appConsts.hasStartOtp ? startBooking() : endBooking() : null}
            />




            <Modal
                animationType="slide"
                transparent={true}
                visible={modalArrived}
                onRequestClose={
                    () => {
                        Alert.alert("Modal has been closed.");
                        setModalArrived(!modalArrived);
                    }
                }
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ justifyContent: 'center' }}>

                            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                                {timeLeft.minutes === 0 && timeLeft.seconds === 0 ? (
                                    <Text style={{ marginTop: 10, fontSize: 35, fontWeight: 'bold', color: colors.RED_TREAS, margin: 10 }}>{curBooking.otp}</Text>
                                ) : (
                                    <Text style={{ marginTop: 10, fontSize: 30, fontWeight: 'bold', color: colors.RED_TREAS, margin: 10 }}>
                                        {`${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`}
                                    </Text>
                                )}
                            </View>

                            {curBooking && role === 'driver' ?
                                <Text style={{ textAlign: 'justify' }}>Ya informamos al usuario  sobre tu llegada, una vez termine el tiempo del contador, recibirás el código para que puedas iniciar el servicio y contabilizar la espera en caso de ser necesario.</Text>

                                :
                                <Text style={{ textAlign: 'justify' }}>Tu conductor te esta esperando en 3 minutos se le enviara el código de seguridad para que inicie el servicio o la espera  </Text>
                            }

                            <Pressable
                                style={[styles.button, styles.buttonClose, { marginTop: 20, justifyContent: 'center', alignItems: 'center' }]}
                                onPress={() => {
                                    setModalArrived(!modalArrived);
                                }}
                            >
                                <Text style={{ color: colors.WHITE, fontSize: 17, }}>
                                    Cerrar
                                </Text>
                            </Pressable>
                        </View>

                    </View>

                </View>

            </Modal>


        </View>
    );

}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: colors.WHITE, },
    headerStyle: {
        backgroundColor: colors.HEADER,
        borderBottomWidth: 0,
    },
    headerInnerStyle: {
        marginLeft: 10,
        marginRight: 10
    },
    accpt: {
        width: 90,
        backgroundColor: colors.GREEN,
        height: 40,
        borderRadius: 10,
        marginLeft: 10
    },
    vew1: {
        width: '96%',
        backgroundColor: colors.WHITE,
        marginTop: -8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: Platform.OS == 'ios' ? 0.1 : 0.8,
        shadowRadius: 3,
        elevation: Platform.OS == 'ios' ? 2 : 9,
        position: 'absolute',
        bottom: 25,
        alignSelf: 'center',
        borderRadius: 10
    },
    vew: {
        height: 150,
        marginBottom: 20,
        borderColor: 'black',
        borderRadius: 10,
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    topContainer: { flex: 1.5, borderTopWidth: 0, alignItems: 'center', backgroundColor: colors.HEADER, paddingEnd: 20 },
    topLeftContainer: {
        flex: 1.5,
        alignItems: 'center'
    },
    topRightContainer: {
        flex: 9.5,
        justifyContent: 'space-between',
    },
    circle: {
        height: 15,
        width: 15,
        borderRadius: 15 / 2,
        backgroundColor: colors.LIGHT_YELLOW
    },
    staightLine: {
        height: height / 25,
        width: 1,
        backgroundColor: colors.LIGHT_YELLOW
    },
    square: {
        height: 17,
        width: 17,
        backgroundColor: colors.MAP_SQUARE
    },
    whereButton: { flex: 1, justifyContent: 'center', borderBottomColor: colors.WHITE, borderBottomWidth: 1 },
    whereContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    whereText: { flex: 9, fontFamily: 'Roboto-Regular', fontSize: 14, fontWeight: '400', color: colors.WHITE },
    iconContainer: { flex: 1, },
    dropButton: { flex: 1, justifyContent: 'center' },
    mapcontainer: {
        flex: 7,
        width: width,
    },
    bottomContainer: { alignItems: 'center' },
    map: {
        flex: 1,
        minHeight: 400,
        ...StyleSheet.absoluteFillObject,
    },
    locationStyle: {
        height: 35,
        width: 35,
        backgroundColor: MAIN_COLOR,
        justifyContent: 'center',
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 2,
        marginHorizontal: 5
    },
    otpContainer: { flex: 0.8, backgroundColor: colors.BOX_BG, width: width, flexDirection: 'row', justifyContent: 'space-between' },
    cabText: { paddingLeft: 10, alignSelf: 'center', color: colors.BLACK, fontFamily: 'Roboto-Regular' },
    cabBoldText: { fontFamily: 'Roboto-Bold' },
    otpText: { color: colors.BLACK, fontFamily: 'Roboto-Bold', },
    cabDetailsContainer: { flex: 2.5, backgroundColor: colors.WHITE, flexDirection: 'row', position: 'relative', zIndex: 1 },
    cabDetails: { flex: 19 },
    cabName: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    cabNameText: { color: colors.BLACK, fontFamily: 'Roboto-Bold', fontSize: 14 },
    cabPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cabImage: { width: 100, height: height / 20, marginBottom: 5, marginTop: 5 },
    cabNumber: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cabNumberText: { color: colors.BUTTON, fontFamily: 'Roboto-Bold', fontSize: 13 },
    verticalDesign: { flex: 2, height: 50, width: 1, alignItems: 'center' },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: colors.TRANSPARENT,
        borderStyle: 'solid',
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderBottomWidth: 10,
        borderLeftColor: colors.TRANSPARENT,
        borderRightColor: colors.TRANSPARENT,
        borderBottomColor: colors.BOX_BG,
        transform: [
            { rotate: '180deg' }
        ],

        marginTop: -1,
        overflow: 'visible'
    },
    verticalLine: { height: height / 18, width: 0.5, backgroundColor: colors.BLACK, alignItems: 'center', marginTop: 10 },
    driverDetails: { flex: 19, alignItems: 'center', justifyContent: 'center', },
    driverPhotoContainer: { alignItems: 'center', marginTop: 10 },
    driverPhoto: { borderRadius: height / 20 / 2, width: height / 20, height: height / 20, },
    driverNameContainer: { flex: 2.2, alignItems: 'center', justifyContent: 'center' },
    driverNameText: { color: colors.BLACK, fontFamily: 'Roboto-Bold', fontSize: 16, marginHorizontal: 5 },
    ratingContainer: { flex: 2.4, alignItems: 'center', justifyContent: 'center' },
    alertModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: colors.BACKGROUND },
    alertModalInnerContainer: { height: 200, width: (width * 0.85), backgroundColor: colors.WHITE, alignItems: 'center', alignSelf: 'center', borderRadius: 7 },
    alertContainer: { flex: 2, justifyContent: 'space-between', width: (width - 100) },
    rideCancelText: { flex: 1, top: 15, color: colors.BLACK, fontFamily: 'Roboto-Bold', fontSize: 20, alignSelf: 'center' },
    horizontalLLine: { width: (width - 110), height: 0.5, backgroundColor: colors.BLACK, alignSelf: 'center', },
    msgContainer: { flex: 2.5, alignItems: 'center', justifyContent: 'center' },
    cancelMsgText: { color: colors.BLACK, fontFamily: 'Roboto-Regular', fontSize: 15, alignSelf: 'center', textAlign: 'center' },
    okButtonContainer: { flex: 1, width: (width * 0.85), flexDirection: 'row', backgroundColor: colors.BUTTON, alignSelf: 'center' },
    okButtonStyle: { flexDirection: 'row', backgroundColor: colors.BUTTON, alignItems: 'center', justifyContent: 'center' },
    okButtonContainerStyle: { flex: 1, width: (width * 0.85), backgroundColor: colors.BUTTON, },

    cancelModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: colors.BACKGROUND },
    cancelModalInnerContainer: { height: 400, width: width * 0.85, padding: 0, backgroundColor: colors.WHITE, alignItems: 'center', alignSelf: 'center', borderRadius: 7 },
    cancelContainer: { flex: 1, justifyContent: 'space-between', width: (width * 0.85) },
    cancelReasonContainer: { flex: 1 },
    cancelReasonText: { top: 10, color: colors.BLACK, fontFamily: 'Roboto-Bold', fontSize: 20, alignSelf: 'center' },
    radioContainer: { flex: 8, alignItems: 'center' },
    radioText: { fontSize: 16, fontFamily: 'Roboto-Medium', color: colors.BLACK, },
    radioContainerStyle: { paddingTop: 30, marginLeft: 10 },
    radioStyle: { paddingBottom: 25 },
    cancelModalButtosContainer: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', marginBottom: 10 },
    buttonSeparataor: { height: height / 35, width: 0.8, backgroundColor: colors.WHITE, alignItems: 'center', marginTop: 3 },
    cancelModalButttonStyle: { backgroundColor: colors.RED, borderRadius: 0 },
    cancelModalButtonContainerStyle: { minWidth: 140, alignSelf: 'center', borderRadius: 10 },
    incidentModalButtonContainerStyle: { minWidth: 140, alignSelf: 'center', borderRadius: 10 },
    incidentModalButttonStyle: { backgroundColor: colors.RED, borderRadius: 0 },
    incidentModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: colors.BACKGROUND },
    incidentModalInnerContainer: { height: 450, width: width * 0.85, padding: 0, backgroundColor: colors.WHITE, alignItems: 'center', alignSelf: 'center', borderRadius: 7 },
    incidentModalButtosContainer: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', marginBottom: 5 },
    textStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        color: colors.BLACK,

    },
    floatButton: {
        borderWidth: 1,
        borderColor: '#5f6769',
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        position: "absolute",
        right: 10,
        height: 50,
        backgroundColor: '#5f6769',
        borderRadius: 30
    },
    floatButton1: {
        borderWidth: 1,
       // borderColor: MAIN_COLOR,
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 50,
        backgroundColor: '#f20505',
        borderRadius: 30
    },
    floatButton2: {
        borderWidth: 1,
       // borderColor: MAIN_COLOR,
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 50,
        backgroundColor: '#f20505',
        borderRadius: 30
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: colors.BACKGROUND
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    textContainerStyle: {
        flexDirection: 'column',
        marginBottom: 12,
    },
    textHeading: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    textHeading1: {
        fontSize: 20,
        color: colors.BLACK
    },
    textContent: {
        fontSize: 14,
        margin: 4,
    },
    textContent1: {
        fontSize: 20,
        color: colors.BUTTON_LOADING,
        padding: 5
    },
    modalButtonStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: MAIN_COLOR,
        width: 100,
        height: 40,
        elevation: 0,
        borderRadius: 10
    },
    modalButtonTextStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 18
    },
    topTitle: {
        //width: 188,
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
        justifyContent: 'center',
        position: 'absolute',
        right: 0,
        top: hasNotch ? 45 : 55
    },
    topTitle1: {
        //width: 188,
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        top: hasNotch ? 45 : 55
    },
    topContainer: {
        flex: 1.5,
        borderTopWidth: 0,
        alignItems: 'center',
        backgroundColor: colors.HEADER,
        paddingEnd: 20
    },
    addressBar: {
        borderBottomWidth: 0.7,
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        paddingLeft: 8,
        paddingRight: 8,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
    },
    addressBarMul: {
        borderBottomWidth: 0.7,
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
    },
    ballandsquare: {
        width: 12,
        alignItems: 'center',
        justifyContent: 'center',
        left: 5
    },
    hbox1: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: colors.GREEN_DOT
    },
    hbox2: {
        height: 36,
        width: 1,
        backgroundColor: colors.MAP_TEXT
    },
    hbox3: {
        height: 12,
        width: 12,
        backgroundColor: colors.DULL_RED
    },
    hboxMul: {
        height: 12,
        width: 12,
        backgroundColor: colors.BUTTON_YELLOW
    },
    contentStyle: {
        justifyContent: 'center',
        width: '95%',
        height: 90,
        left: 7
    },
    contentStyleMul: {
        width: '100%',
        marginHorizontal: 5
    },
    addressStyle1: {
        borderBottomWidth: 1,
        height: 45,
        justifyContent: 'center',
        paddingTop: 2
    },
    addressStyle2: {
        height: 45,
        justifyContent: 'center',
    },
    menuIcon: {
        height: 40,
        width: 40,
        borderRadius: 25,
        backgroundColor: colors.WHITE,
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center',
        position: 'absolute',
        top: hasNotch ? 40 : 55,
    },
    menuIconButton: {
        flex: 1,
        height: 50,
        width: 50,
        justifyContent: 'center',
    },
    buttonClose: {
        backgroundColor: "#f20505",
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
});