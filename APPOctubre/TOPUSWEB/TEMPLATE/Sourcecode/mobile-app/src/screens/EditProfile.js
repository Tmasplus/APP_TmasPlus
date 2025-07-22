import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from 'react-native';
import { Icon, Button, Input } from 'react-native-elements'
import { colors } from '../common/theme';
import ActionSheet from "react-native-actions-sheet";
import i18n from 'i18n-js';

var { height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { api } from 'common';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons, AntDesign, Feather } from '@expo/vector-icons';
import Footer from '../components/Footer';
import { FontAwesome5 } from '@expo/vector-icons';
import RNPickerSelect from '../components/RNPickerSelect';
import { getUserVerification } from "../common/topus-integration";
import { Tab, TabView } from '@rneui/themed';





export default function EditProfilePage(props) {
    const {
        updateProfile
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const [profileData, setProfileData] = useState(null);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const actionSheetRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturedImageBack, setCapturedImageback] = useState(null);
    const [capturedIdImage, setCapturedIdImage] = useState(null);
    const [capturedImageSOAT, setCapturedImageSOAT] = useState(null);
    const [capturecardPropImage, setCapturecardPropImage] = useState(null);
    const [capturedIdImageBack, setCapturedIdImageBack] = useState(null);
    const [capturecardPropImageBK, setcapturecardPropImageBK] = useState(null);
    const [capturecardOPmage, setcapturecardOPmage] = useState(null);
    const [capturecardOPmageBK, setcapturecardOPmageBK] = useState(null);
    const [captureccEmpTransImage, setCaptureccEmpTransImage] = useState(null);
    const [capturecardIDEmpTransRLImage, setCapturecardIDEmpTransRLImage] = useState(null);
    const [capturecardIDEmpTransRLImageBK, setCapturecardIDEmpTransRLImageBK] = useState(null);
    const [captureRutImage, setCaptureRutImage] = useState(null);
    const [check, setCheck] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updateCalled, setUpdateCalled] = useState(false);
    const [index, setIndex] = React.useState(0);
    const fromPage = props.route.params && props.route.params.fromPage ? props.route.params.fromPage : null;
    const onPressBack = () => {
        if (fromPage == 'DriverTrips' || fromPage == 'Map' || fromPage == 'Wallet') {
            props.navigation.navigate('TabRoot', { screen: fromPage });
        } else {
            props.navigation.goBack()
        }
    }

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData({ ...auth.profile });
            if (updateCalled) {
                setLoading(false);
                Alert.alert(
                    t('alert'),
                    t('profile_updated'),
                    [
                        {
                            text: t('ok'), onPress: () => {

                            }
                        }
                    ],
                    { cancelable: true }
                );
                setUpdateCalled(false);
            }
        }
    }, [auth.profile, updateCalled]);

    const showActionSheet = (text) => {
        setCheck(text);
        actionSheetRef.current?.setModalVisible(true);
    }

    const [state, setState] = useState({
        licenseImage: null,
        licenseImageBack: null,
        verifyIdImage: null,
        verifyIdImageBk: null,
        SOATimage: null,
        RutImage: null,
        cardPropImage: null,
        cardPropImageBK: null,
        cardOPmage: null,
        cardOPmageBK: null,
        ccEmpTransImage: null,
        cardIDEmpTransRLImage: null,
        cardIDEmpTransRLImageBK: null,
        updateAt: new Date().getTime()
    });


    const uploadImage = () => {
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity
                    style={{
                        width: '90%',
                        alignSelf: 'center',
                        paddingLeft: 20,
                        paddingRight: 20,
                        borderColor: colors.CONVERTDRIVER_TEXT,
                        borderBottomWidth: 1,
                        height: 60,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        _pickImage('CAMERA', ImagePicker.launchCameraAsync)
                    }}
                >
                    <Text style={{ color: colors.CAMERA_TEXT, fontWeight: 'bold' }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        width: '90%',
                        alignSelf: 'center',
                        paddingLeft: 20,
                        paddingRight: 20,
                        borderBottomWidth: 1,
                        borderColor: colors.CONVERTDRIVER_TEXT,
                        height: 60,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync)
                    }}
                >
                    <Text style={{ color: colors.CAMERA_TEXT, fontWeight: 'bold' }}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        width: '90%',
                        alignSelf: 'center',
                        paddingLeft: 20,
                        paddingRight: 20,
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        actionSheetRef.current?.setModalVisible(false);
                    }}>
                    <Text style={{ color: 'red', fontWeight: 'bold' }}>{t('cancel')}</Text>
                </TouchableOpacity>
            </ActionSheet>
        )
    }

    const _pickImage = async (permissionType, res) => {
        var pickFrom = res;
        let permisions;
        if (permissionType == 'CAMERA') {
            permisions = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        const { status } = permisions;

        if (status == 'granted') {

            let result = await pickFrom({
                allowsEditing: true,
                aspect: [4, 3]
            });

            actionSheetRef.current?.setModalVisible(false);

            if (!result.canceled) {
                if (check == 0) {
                    setCapturedImage(result.assets[0].uri);
                } else if (check == 1) {
                    setCapturedImageback(result.assets[0].uri);
                } else if (check == 2) {
                    setCapturedIdImage(result.assets[0].uri);

                } else if (check == 3) {
                    setCapturedImageSOAT(result.assets[0].uri);
                } else if (check == 4) {
                    setCapturecardPropImage(result.assets[0].uri);
                } else if (check == 5) {
                    setcapturecardPropImageBK(result.assets[0].uri);
                } else if (check == 6) {
                    setcapturecardOPmage(result.assets[0].uri);
                } else if (check == 7) {
                    setcapturecardOPmageBK(result.assets[0].uri);
                } else if (check == 8) {
                    setCaptureccEmpTransImage(result.assets[0].uri);
                } else if (check == 9) {
                    setCapturecardIDEmpTransRLImage(result.assets[0].uri);
                } else if (check == 10) {
                    setCapturecardIDEmpTransRLImageBK(result.assets[0].uri);
                } else if (check == 11) {
                    setCapturedIdImageBack(result.assets[0].uri);
                } else if (check == 12) {
                    setCaptureRutImage(result.assets[0].uri);
                }

                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        Alert.alert(t('alert'), t('image_upload_error'));
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', result.assets[0].uri, true);
                    xhr.send(null);
                });
                if (blob) {
                    if (check == 0) {
                        setState({ ...state, licenseImage: blob });
                    } else if (check == 1) {
                        setState({ ...state, licenseImageBack: blob });
                    } else if (check == 2) {
                        setState({ ...state, verifyIdImage: blob });
                    } else if (check == 3) {
                        setState({ ...state, SOATimage: blob });
                    } else if (check == 4) {
                        setState({ ...state, cardPropImage: blob });
                    } else if (check == 5) {
                        setState({ ...state, cardPropImageBK: blob });
                    } else if (check == 6) {
                        setState({ ...state, cardOPmage: blob });
                    } else if (check == 7) {
                        setState({ ...state, cardOPmageBK: blob });
                    } else if (check == 8) {
                        setState({ ...state, ccEmpTransImage: blob });
                    } else if (check == 9) {
                        setState({ ...state, cardIDEmpTransRLImage: blob });
                    } else if (check == 10) {
                        setState({ ...state, cardIDEmpTransRLImageBK: blob });
                    } else if (check == 11) {
                        setState({ ...state, verifyIdImageBk: blob });
                    } else if (check == 12) {
                        setState({ ...state, RutImage: blob });
                    }

                }
                //  openModal();
            }
        } else {
            Alert.alert(t('alert'), t('camera_permission_error'))
        }
    }

    const cancelPhoto = () => {
        setCapturedImage(null);
    }

    const cancelPhotoback = () => {
        setCapturedImageback(null);
    }


    const cancelPhotoSOAT = () => {
        setCapturedImageSOAT(null);
    }

    const cancelCardPropImage = () => {
        setCapturecardPropImage(null);
    }


    const cancelCardPropImageBK = () => {
        setcapturecardPropImageBK(null);
    }

    const cancelCardOPmage = () => {
        setcapturecardOPmage(null);
    }

    const cancelCardOPmageBK = () => {
        setcapturecardOPmageBK(null);
    }

    const cancelCCEmpTransImage = () => {
        setCaptureccEmpTransImage(null);
    }


    const cancelRut = () => {
        setCaptureRutImage(null);
    }

    const cancelIdPhoto = () => {
        setCapturedIdImage(null);
    }

    const verifyUserInTopus = async (data) => {
        Alert.alert('Consulta de antecedentes en proceso', 'Su cuenta esta siendo verificada. Este proceso puede demorar unos minutos')
        return await getUserVerification({
            'doc_type': data.docType,
            'identification': data.verifyId,
            'name': data.firstName,
        })
    }


    const completeSubmit = async () => {
        let userData = {
            verifyId: profileData.verifyId ? profileData.verifyId : null,
            docType: profileData.docType ? profileData.docType : null,
            city: profileData.city ? profileData.city : null,
            addres: profileData.addres ? profileData.addres : null,
            bankAccount: profileData.bankAccount ? profileData.bankAccount : null,
            reviewed: false,
            updateAt: new Date().getTime()
        }
        setUpdateCalled(true);
        if ((auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw) && profileData.bankAccount && profileData.bankAccount.length &&
            profileData.bankCode && profileData.bankCode.length &&
            profileData.bankName && profileData.bankName.length) {
            userData.reviewed = false;
            userData.bankCode = profileData.bankCode;
            userData.bankName = profileData.bankName;
            userData.docType = profileData.docType;
            userData.city = profileData.city;
            userData.addres = profileData.addres;
            userData.bankAccount = profileData.bankAccount;
            userData.verifyId = profileData.verifyId;
        }
        if (auth.profile.usertype == 'driver') {
            if (capturedImage) {
                userData.licenseImage = state ? state.licenseImage : profileData.licenseImage ? profileData.licenseImage : null;
            }
            if (capturedImageBack) {
                userData.licenseImageBack = state ? state.licenseImageBack : profileData.licenseImageBack ? profileData.licenseImageBack : null;
            }
            if (capturedImageSOAT) {
                userData.SOATimage = state ? state.SOATimage : profileData.SOATimage ? profileData.SOATimage : null;
            }
            if (capturecardPropImage) {
                userData.cardPropImage = state ? state.cardPropImage : profileData.cardPropImage ? profileData.cardPropImage : null;
            }
            if (capturecardPropImageBK) {
                userData.cardPropImageBK = state ? state.cardPropImageBK : profileData.cardPropImageBK ? profileData.cardPropImageBK : null;
            }
            if (capturecardOPmage) {
                userData.cardOPmage = state ? state.cardOPmage : profileData.cardOPmage ? profileData.cardOPmage : null;
            }
            if (capturecardOPmageBK) {
                userData.cardOPmageBK = state ? state.cardOPmageBK : profileData.cardOPmageBK ? profileData.cardOPmageBK : null;
            }
            if (captureccEmpTransImage) {
                userData.ccEmpTransImage = state ? state.ccEmpTransImage : profileData.ccEmpTransImage ? profileData.ccEmpTransImage : null;
            }
            if (capturecardIDEmpTransRLImage) {
                userData.cardIDEmpTransRLImage = state ? state.cardIDEmpTransRLImage : profileData.cardIDEmpTransRLImage ? profileData.cardIDEmpTransRLImage : null;
            }
        }
        if (capturedIdImage) {
            userData.verifyIdImage = state ? state.verifyIdImage : profileData.verifyIdImage ? profileData.verifyIdImage : null;
        }
        if (capturedIdImageBack) {
            userData.verifyIdImageBk = state ? state.verifyIdImageBk : profileData.verifyIdImageBk ? profileData.verifyIdImageBk : null;
        }
        dispatch(updateProfile(userData));
    }


    const completeSubmitValidate = async () => {
        let userData = {
            verifyId: profileData.verifyId ? profileData.verifyId : null,
            docType: profileData.docType ? profileData.docType : null,
            city: profileData.city ? profileData.city : null,
            addres: profileData.addres ? profileData.addres : null,
            bankAccount: profileData.bankAccount ? profileData.bankAccount : null,
            reviewed: false,
            updateAt: new Date().getTime()

        }
        if ((userData.docType && userData?.verifyId) && (auth.profile?.verifyId !== userData?.verifyId)) {
            try {
                const dateRequest = new Date().getTime();
                const results = await verifyUserInTopus(userData);
                const actualSecurityData = auth?.profile?.securityData || [];
                dispatch(updateProfile({
                    securityData: [{
                        date: dateRequest,
                        verifyId: userData.verifyId,
                        firstName: auth?.profile.firstName,
                        lastName: auth?.profile.lastName,
                        docType: userData.docType,
                        antecedents: results,
                    }, ...actualSecurityData],
                    verifyId: userData.verifyId,
                    docType: userData.docType,
                }));
                const hasAntecedents = results.some(result => {
                    if (result?.entidad === 'policia') {
                        return result?.respuesta?.mensaje.trim().toLowerCase() !== 'NO TIENE ASUNTOS PENDIENTES CON LAS AUTORIDADES JUDICIALES'
                    } else if (result?.entidad === 'simit') {
                        return result?.respuesta?.Simit.trim().toLowerCase() !== 'El ciudadano no presenta multas ni comparendos en el Simit.'
                    } else if (result?.entidad === 'contraloria') {
                        return result?.respuesta?.Resultado.trim().toLowerCase() !== 'NO SE ENCUENTRA REPORTADO COMO RESPONSABLE FISCAL'
                    } else if (result?.entidad === 'ofac') {
                        return !result?.respuesta?.archivo_respuesta.trim().toLowerCase().includes('No registra en la OFAC.')
                    } else if (result?.entidad === 'interpol') {
                        return result?.respuesta?.Resultado.trim().toLowerCase() !== 'La persona NO presenta cargos ante el Interpol.'
                    } else if (result?.entidad === 'ONU') {
                        return result?.respuesta?.Resultado.trim().toLowerCase() !== 'La persona NO registra en la ONU :'
                    } else {
                        return false;
                    }
                })
                if (hasAntecedents) {
                    Alert.alert('Consulta de antecedentes', 'Su cuenta ha sido aprobada. ¡Bienvenido a TREASAPP!');
                    setLoading(false);
                    dispatch(updateProfile({ blocked: false }))
                    return;
                } else {
                    // Si no hay antecedentes, la cuenta está aprobada
                    Alert.alert('Consulta de antecedentes', 'Su cuenta no fue aprobada, por favor comuniquese con soporte, para resolver su caso.');
                    setLoading(false);
                    dispatch(updateProfile({ blocked: true }))
                }
            } catch (error) {
                Alert.alert('Error', error.message || 'Ha ocurrido un error en la consulta de antecedentes, intentelo de nuevo');
                setLoading(false);
                return;
            }
        }

        setUpdateCalled(true);
        if ((auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw) && profileData.bankAccount && profileData.bankAccount.length &&
            profileData.bankCode && profileData.bankCode.length &&
            profileData.bankName && profileData.bankName.length) {
            userData.reviewed = false;
            userData.bankCode = profileData.bankCode;
            userData.bankName = profileData.bankName;
            userData.docType = profileData.docType;
            userData.city = profileData.city;
            userData.addres = profileData.addres;
            userData.bankAccount = profileData.bankAccount;
            userData.verifyId = profileData.verifyId;
        }
        dispatch(updateProfile(userData));
    }

    const saveProfile = async () => {
        if (((auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw)) && !(profileData.bankAccount && profileData.bankCode && profileData.bankName)) {
            Alert.alert(t('alert'), t('no_details_error'));
        } else {
            setLoading(true);
            completeSubmit();
        }
    }



    const saveProfileDocument = async () => {
        if (((auth.profile.usertype == 'driver' && settings.bank_fields)) && !(profileData.bankAccount && profileData.bankCode && profileData.bankName)) {
            Alert.alert(t('alert'), t('no_details_error'));
        } else {
            setLoading(true);
            completeSubmitValidate();
            Alert.alert('Un momento', 'Espera un momento, mientras se guarda la información.');
        }
    }


    const saveProfileData = async () => {
        if (((auth.profile.usertype == 'driver' && settings.bank_fields) || (auth.profile.usertype == 'customer' && settings.bank_fields && settings.RiderWithDraw)) && !(profileData.bankAccount && profileData.bankCode && profileData.bankName)) {
            Alert.alert(t('alert'), t('no_details_error'));
        } else {
            setLoading(false);
            completeSubmit();
        }
    }




    const lCom = () => {
        return (
            <TouchableOpacity style={{ marginLeft: 10 }} onPress={onPressBack}>
                <FontAwesome5 name="arrow-left" size={24} color={colors.WHITE} />
            </TouchableOpacity>
        );
    }

    useEffect(() => {
        props.navigation.setOptions({
            headerLeft: lCom,
        });
    }, [props.navigation]);


    const tipoDoc = [
        { label: 'Cédula de Ciudadania.', value: 'CC' },
        { label: 'Cédula de Extranjeria', value: 'CE' },
        { label: 'Pasaporte', value: 'Pasaporte' },
        { label: 'Tarjeta de Identidad', value: 'TI' }
    ]

    const ciudadesColombia = [
        { label: 'Bogotá', value: 'Bogota' },
        { label: 'Medellín', value: 'Medellin' },
        { label: 'Cali', value: 'Cali' },
        { label: 'Barranquilla', value: 'Barranquilla' },
        { label: 'Cartagena', value: 'Cartagena' },
        { label: 'Cúcuta', value: 'Cúcuta' },
        { label: 'Bucaramanga', value: 'Bucaramanga' },
        { label: 'Pereira', value: 'Pereira' },
        { label: 'Santa Marta', value: 'Santa Marta' },
        { label: 'Ibagué', value: 'Ibagué' },
        { label: 'Pasto', value: 'Pasto' },
        { label: 'Manizales', value: 'Manizales' },
        { label: 'Neiva', value: 'Neiva' },
        { label: 'Villavicencio', value: 'Villavicencio' },
        { label: 'Armenia', value: 'Armenia' },
        { label: 'Valledupar', value: 'Valledupar' },
        { label: 'Montería', value: 'Montería' },
        { label: 'Sincelejo', value: 'Sincelejo' },
        { label: 'Popayán', value: 'Popayán' },
        { label: 'Floridablanca', value: 'Floridablanca' },
        { label: 'Soledad', value: 'Soledad' },
        { label: 'Palmira', value: 'Palmira' },
        { label: 'Bello', value: 'Bello' },
        { label: 'Itagüí', value: 'Itagüí' },
        { label: 'San Juan de Pasto', value: 'San Juan de Pasto' },
        { label: 'Santa Rosa de Cabal', value: 'Santa Rosa de Cabal' },
        { label: 'Tuluá', value: 'Tuluá' },
        { label: 'Barrancabermeja', value: 'Barrancabermeja' },
        { label: 'Tumaco', value: 'Tumaco' },
        { label: 'Florencia', value: 'Florencia' },
        { label: 'Girardot', value: 'Girardot' },
        { label: 'Zipaquirá', value: 'Zipaquirá' },
        { label: 'Buenaventura', value: 'Buenaventura' },
        { label: 'Riohacha', value: 'Riohacha' },
        { label: 'Duitama', value: 'Duitama' },
        { label: 'Quibdó', value: 'Quibdó' },
        { label: 'Arauca', value: 'Arauca' },
        { label: 'Tunja', value: 'Tunja' },
        { label: 'Magangué', value: 'Magangué' },
        { label: 'Sogamoso', value: 'Sogamoso' },
        { label: 'Girón', value: 'Girón' },
        { label: 'Chía', value: 'Chía' },
        { label: 'Facatativá', value: 'Facatativá' },
        { label: 'Sincelejo', value: 'Sincelejo' },
        { label: 'Rionegro', value: 'Rionegro' },
        { label: 'Piedecuesta', value: 'Piedecuesta' },
        { label: 'Ciénaga', value: 'Ciénaga' },
        { label: 'La Dorada', value: 'La Dorada' },
        { label: 'Maicao', value: 'Maicao' },
        { label: 'Barrancas', value: 'Barrancas' },
        { label: 'Calarcá', value: 'Calarcá' },
        { label: 'Fundación', value: 'Fundación' },
        { label: 'La Ceja', value: 'La Ceja' },
        { label: 'Chiquinquirá', value: 'Chiquinquirá' },
        { label: 'Sahagún', value: 'Sahagún' },
        { label: 'Villa del Rosario', value: 'Rosalrio' },
        { label: 'Montelíbano', value: 'Montelíbano' },
        { label: 'Pitalito', value: 'Pitalito' },
        { label: 'Tumaco', value: 'Tumaco' },
        { label: 'Providencia', value: 'Providencia' },
        { label: 'San Martín', value: 'San Martín' },
        { label: 'Sahagún', value: 'Sahagún' },
        { label: 'Sincé', value: 'Sincé' },
        { label: 'Corozal', value: 'Corozal' },
        { label: 'Tolú', value: 'Tolú' },
        { label: 'Puerto Asís', value: 'Puerto Asís' },
        { label: 'Ayapel', value: 'Ayapel' },

    ];


    return (
        <View style={{ flex: 1 }}>

            <Footer />
            <View style={{ position: 'absolute', backgroundColor: colors.TRANSPARENT, width: '100%', height: '100%' }}>

                <Tab
                    value={index}
                    onChange={(e) => setIndex(e)}
                    indicatorStyle={{
                        backgroundColor: 'white',
                        height: 3,
                    }}

                >
                    <Tab.Item
                        containerStyle={(active) => ({
                            backgroundColor: active ? colors.RED_TREAS : colors.TAXIPRIMARY,

                        })}
                        title="Datos Personales"
                        titleStyle={{ color: 'white', fontSize: 12, }}
                        icon={{ name: 'person', type: 'ionicon', color: 'white' }}
                    />
                    <Tab.Item
                        containerStyle={(active) => ({
                            backgroundColor: active ? colors.RED_TREAS : colors.TAXIPRIMARY,
                        })}
                        title="Documentos"
                        titleStyle={{ fontSize: 12, color: 'white' }}
                        icon={{ name: 'document', type: 'ionicon', color: 'white' }}
                    />

                </Tab>



                <TabView value={index} onChange={setIndex} animationType="spring">
                    <TabView.Item style={{ backgroundColor: 'white', width: '100%' }}>

                        <View style={styles.containerStyle}>
                            {(auth.profile.usertype == 'driver') ?
                                <View style={styles.textInputContainerStyle}>
                                    <Text style={[styles.text1, isRTL ? {
                                        textAlign: 'right',
                                        marginRight: 30
                                    } : { textAlign: 'left', marginLeft: 7 }]}>{t('bankAccount')}</Text>
                                    <View
                                        style={[styles.textInputContainerStyle1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <Icon
                                            name='numeric'
                                            type='material-community'
                                            color={colors.PROFILE_PLACEHOLDER_CONTENT}
                                            size={30}
                                            containerStyle={styles.iconContainer}
                                        />
                                        <View style={{ width: '75%' }}>
                                            <Input
                                                editable={true}
                                                underlineColorAndroid={colors.TRANSPARENT}
                                                placeholder={t('bankAccount')}
                                                placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
                                                value={profileData && profileData.bankAccount ? profileData.bankAccount : ''}
                                                keyboardType={'email-address'}
                                                inputStyle={[styles.inputTextStyle, isRTL ? {
                                                    textAlign: 'right',
                                                    fontSize: 13,
                                                } : { textAlign: 'left', fontSize: 13, }]}
                                                onChangeText={(text) => {
                                                    setProfileData({ ...profileData, bankAccount: text })
                                                }}
                                                secureTextEntry={false}
                                                errorStyle={styles.errorMessageStyle}
                                                inputContainerStyle={styles.inputContainerStyle}
                                                containerStyle={[styles.textInputStyle, { marginLeft: 0 }]}
                                            />
                                        </View>
                                    </View>
                                </View>
                                : null}


                            {settings && settings.imageIdApproval ?
                                <View style={styles.textInputContainerStyle}>
                                    <Text style={[styles.text1, isRTL ? {
                                        textAlign: 'right',
                                        marginRight: 35
                                    } : { textAlign: 'left', marginLeft: 10 }]}>{'Ciudad'}</Text>
                                    <View
                                        style={[styles.textInputContainerStyle1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.iconContainer}>
                                            <Feather name="flag" size={24} color={colors.HEADER} />
                                        </View>
                                        <View style={{ width: '75%' }}>
                                            <RNPickerSelect
                                                placeholder={{ label: 'Selecciona una ciudad', value: '' }}
                                                items={ciudadesColombia}
                                                onValueChange={(value) => setProfileData({ ...profileData, city: value })}
                                                value={profileData && profileData.city ? profileData.city : ''}
                                                style={{
                                                    inputAndroid: {
                                                        borderBottomColor: 'black',
                                                        borderBottomWidth: 1,
                                                        height: 40, // Altura del input
                                                        paddingHorizontal: 5, // Espacio dentro del input
                                                        fontSize: 16, // Tamaño de fuente
                                                        color: 'black', // Color del texto
                                                    },
                                                    inputIOS: {
                                                        borderBottomColor: 'black',
                                                        borderBottomWidth: 1,
                                                        height: 40,
                                                        paddingHorizontal: 5,
                                                        fontSize: 16,
                                                        color: 'black',
                                                    },
                                                    placeholder: {
                                                        color: colors.PROFILE_PLACEHOLDER_TEXT,
                                                    },
                                                }}
                                            />

                                        </View>
                                    </View>
                                </View>
                                : null}


                            {(auth.profile.usertype == 'driver') ?
                                <View style={styles.textInputContainerStyle}>
                                    <Text style={[styles.text1, isRTL ? {
                                        textAlign: 'right',
                                        marginRight: 30
                                    } : { textAlign: 'left', marginLeft: 7 }]}>{t('addres')}</Text>
                                    <View
                                        style={[styles.textInputContainerStyle1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <Icon
                                            name='numeric'
                                            type='material-community'
                                            color={colors.PROFILE_PLACEHOLDER_CONTENT}
                                            size={30}
                                            containerStyle={styles.iconContainer}
                                        />
                                        <View style={{ width: '75%' }}>
                                            <Input
                                                editable={true}
                                                underlineColorAndroid={colors.TRANSPARENT}
                                                placeholder={t('addres')}
                                                placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
                                                value={profileData && profileData.addres ? profileData.addres : ''}
                                                keyboardType={'email-address'}
                                                inputStyle={[styles.inputTextStyle, isRTL ? {
                                                    textAlign: 'right',
                                                    fontSize: 13,
                                                } : { textAlign: 'left', fontSize: 13, }]}
                                                onChangeText={(text) => {
                                                    setProfileData({ ...profileData, addres: text })
                                                }}
                                                secureTextEntry={false}
                                                errorStyle={styles.errorMessageStyle}
                                                inputContainerStyle={styles.inputContainerStyle}
                                                containerStyle={[styles.textInputStyle, { marginLeft: 0 }]}
                                            />
                                        </View>
                                    </View>
                                </View>
                                : null}




                            <View style={styles.buttonContainer}>
                                <Button
                                    loading={loading}
                                    onPress={saveProfileData}
                                    title={t('update_button')}
                                    titleStyle={styles.buttonTitle}
                                    buttonStyle={[styles.registerButton, { backgroundColor: colors.PAYMENT_BUTTON_BLUE }]}
                                />
                            </View>

                            {settings && settings.imageIdApproval ?
                                <View style={styles.textInputContainerStyle}>
                                    <Text style={[styles.text1, isRTL ? {
                                        textAlign: 'right',
                                        marginRight: 35
                                    } : { textAlign: 'left', marginLeft: 10 }]}>{'Tipo de Documento'}</Text>
                                    <View
                                        style={[styles.textInputContainerStyle1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.iconContainer}>
                                            <MaterialCommunityIcons name="cellphone-information" size={24}
                                                color={colors.HEADER} />
                                        </View>
                                        <View style={{ width: '75%' }}>
                                            <RNPickerSelect
                                                placeholder={{ label: 'Selecciona El Tipo de Doc', value: '' }}
                                                items={tipoDoc}
                                                onValueChange={(value) => setProfileData({ ...profileData, docType: value })}
                                                value={profileData && profileData.docType ? profileData.docType : ''}
                                                style={{
                                                    inputAndroid: {
                                                        borderBottomColor: 'black',
                                                        borderBottomWidth: 1,
                                                        height: 40, // Altura del input
                                                        paddingHorizontal: 5, // Espacio dentro del input
                                                        fontSize: 16, // Tamaño de fuente
                                                        color: 'black', // Color del texto
                                                    },
                                                    inputIOS: {
                                                        borderBottomColor: 'black',
                                                        borderBottomWidth: 1,
                                                        height: 40,
                                                        paddingHorizontal: 5,
                                                        fontSize: 16,
                                                        color: 'black',
                                                    },
                                                    placeholder: {
                                                        color: colors.PROFILE_PLACEHOLDER_TEXT,
                                                    },
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                                : null}



                            {settings && settings.imageIdApproval ?
                                <View style={styles.textInputContainerStyle}>
                                    <Text style={[styles.text1, isRTL ? {
                                        textAlign: 'right',
                                        marginRight: 35
                                    } : { textAlign: 'left', marginLeft: 10 }]}>{t('verify_id')}</Text>
                                    <View
                                        style={[styles.textInputContainerStyle1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                        <View style={styles.iconContainer}>
                                            <AntDesign name="idcard" size={24} color={colors.HEADER} />

                                        </View>
                                        <View style={{ width: '75%' }}>
                                            <Input
                                                underlineColorAndroid={colors.TRANSPARENT}
                                                placeholder={t('verify_id')}
                                                placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
                                                value={profileData && profileData.verifyId ? profileData.verifyId : ''}
                                                keyboardType={'numeric'}
                                                inputStyle={[styles.inputTextStyle, isRTL ? {
                                                    textAlign: 'right',
                                                    fontSize: 13,
                                                } : { textAlign: 'left', fontSize: 13, }]}
                                                onChangeText={(text) => {
                                                    setProfileData({ ...profileData, verifyId: text })
                                                }}
                                                secureTextEntry={false}
                                                errorStyle={styles.errorMessageStyle}
                                                inputContainerStyle={styles.inputContainerStyle}
                                                containerStyle={styles.textInputStyle}
                                            />
                                        </View>
                                    </View>
                                </View>
                                : null}



                            <View style={styles.buttonContainer}>
                                <Button
                                    loading={loading}
                                    onPress={saveProfileDocument}
                                    title={'Completar Perfil'}
                                    titleStyle={styles.buttonTitle}
                                    buttonStyle={[styles.registerButton, { backgroundColor: colors.PAYMENT_BUTTON_BLUE }]}
                                />
                            </View>



                        </View>

                    </TabView.Item>
                    <TabView.Item style={{ backgroundColor: 'white', width: '100%' }}>
                        <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>

                            {
                                !auth.profile.verifyIdImage ?
                                    capturedIdImage ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelIdPhoto}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturedIdImage }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text
                                                            style={styles.capturePhotoTitle}>{t('upload_verifyIdImage')}</Text>
                                                        :
                                                        <Text
                                                            style={styles.errorPhotoTitle}>{t('upload_verifyIdImage')}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('2')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text style={styles.text}>{t('verifyid_image')}</Text>
                                        </View>
                                        {capturedIdImage ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelIdPhoto}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturedIdImage ?
                                            <TouchableOpacity onPress={() => showActionSheet('2')}>
                                                <Image source={{ uri: capturedIdImage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('2')}>
                                                <Image source={{ uri: auth.profile.verifyIdImage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>

                            }


                            {auth.profile.usertype == 'driver' && settings.license_image_required ?
                                !auth.profile.verifyIdImageBk ?
                                    capturedIdImageBack ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelIdPhoto}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturedIdImageBack }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text style={styles.capturePhotoTitle}>{'Cédula Posterior'}</Text>
                                                        :
                                                        <Text style={styles.errorPhotoTitle}>{'Cédula Posterior'}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('11')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text style={styles.text}>{'Cédula de Ciudadanía Posterior'}</Text>
                                        </View>
                                        {capturedIdImageBack ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelIdPhoto}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturedIdImageBack ?
                                            <TouchableOpacity onPress={() => showActionSheet('11')}>
                                                <Image source={{ uri: capturedIdImageBack }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('11')}>
                                                <Image source={{ uri: auth.profile.verifyIdImageBk }}
                                                    style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }

                            {auth.profile.usertype == 'driver' && settings.license_image_required ?
                                !auth.profile.licenseImage ?
                                    capturedImage ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhoto}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturedImage }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text
                                                            style={styles.capturePhotoTitle}>{t('upload_driving_license_front')}</Text>
                                                        :
                                                        <Text
                                                            style={styles.errorPhotoTitle}>{t('upload_driving_license_front')}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('0')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5 }}>
                                            <Text style={styles.text}>{t('driving_license_font')}</Text>
                                        </View>
                                        {capturedImage ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhoto}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturedImage ?
                                            <TouchableOpacity onPress={() => showActionSheet('0')}>
                                                <Image source={{ uri: capturedImage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('0')}>
                                                <Image source={{ uri: auth.profile.licenseImage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }

                            {auth.profile.usertype == 'driver' && settings.license_image_required ?
                                !auth.profile.licenseImageBack ?
                                    capturedImageBack ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhotoback}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturedImageBack }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text
                                                            style={styles.capturePhotoTitle}>{t('upload_driving_license_back')}</Text>
                                                        :
                                                        <Text
                                                            style={styles.errorPhotoTitle}>{t('upload_driving_license_back')}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('1')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text style={styles.text}>{t('driving_license_back')}</Text>
                                        </View>
                                        {capturedImageBack ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhotoback}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturedImageBack ?
                                            <TouchableOpacity onPress={() => showActionSheet('1')}>
                                                <Image source={{ uri: capturedImageBack }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('1')}>
                                                <Image source={{ uri: auth.profile.licenseImageBack }}
                                                    style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }

                            {
                                //---------------------------------------------------------------- SOAT -------------------------------------------------------
                            }


                            {auth.profile.usertype == 'driver' && settings.SOAT_image_required ?
                                !auth.profile.SOATimage ?
                                    capturedImageSOAT ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhotoSOAT}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturedImageSOAT }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text style={styles.capturePhotoTitle}>{'SOAT'}</Text>
                                                        :
                                                        <Text style={styles.errorPhotoTitle}>{'SOAT'}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('3')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text style={styles.text}>{'SOAT'}</Text>
                                        </View>
                                        {capturedImageSOAT ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhotoSOAT}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturedImageSOAT ?
                                            <TouchableOpacity onPress={() => showActionSheet('3')}>
                                                <Image source={{ uri: capturedImageSOAT }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('3')}>
                                                <Image source={{ uri: auth.profile.SOATimage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }


                            {auth.profile.usertype == 'driver' && settings.tajetadeprpiedad_image_required ?
                                !auth.profile.cardPropImage ?
                                    capturecardPropImage ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCardPropImage}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturecardPropImage }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text
                                                            style={styles.capturePhotoTitle}>{'Tarjeta de Propiedad Frente'}</Text>
                                                        :
                                                        <Text
                                                            style={styles.errorPhotoTitle}>{'Tarjeta de Propiedad Frente'}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('4')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text style={styles.text}>{'Tarjeta de Propiedad'}</Text>
                                        </View>
                                        {capturecardPropImage ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCardPropImage}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturecardPropImage ?
                                            <TouchableOpacity onPress={() => showActionSheet('4')}>
                                                <Image source={{ uri: capturecardPropImage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('4')}>
                                                <Image source={{ uri: auth.profile.cardPropImage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }


                            {auth.profile.usertype == 'driver' && settings.tprpiedadBk_image_required ?
                                !auth.profile.cardPropImageBK ?
                                    capturecardPropImageBK ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCardPropImageBK}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturecardPropImageBK }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text
                                                            style={styles.capturePhotoTitle}>{'Tarjeta de propiedad posterior'}</Text>
                                                        :
                                                        <Text
                                                            style={styles.errorPhotoTitle}>{'Tarjeta de Propiedad Posterior'}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('5')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text style={styles.text}>{'Tarjeta de Propiedad Posteriror'}</Text>
                                        </View>
                                        {capturecardPropImageBK ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCardPropImageBK}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturecardPropImageBK ?
                                            <TouchableOpacity onPress={() => showActionSheet('5')}>
                                                <Image source={{ uri: capturecardPropImageBK }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('5')}>
                                                <Image source={{ uri: auth.profile.cardPropImageBK }}
                                                    style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }


                            {auth.profile.usertype == 'driver' && auth.profile.carType == 'TREAS-E' && auth.profile.carType == 'TREAS-T' ?
                                !auth.profile.cardOPmage ?
                                    capturecardOPmage ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCardOPmage}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturecardOPmage }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text
                                                            style={styles.capturePhotoTitle}>{'tarjeta de Operación'}</Text>
                                                        :
                                                        <Text style={styles.errorPhotoTitle}>{'Tarjeta de Operación'}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('6')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text style={styles.text}>{'Tarjeta de Operación'}</Text>
                                        </View>
                                        {capturecardOPmage ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCardOPmage}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturecardOPmage ?
                                            <TouchableOpacity onPress={() => showActionSheet('6')}>
                                                <Image source={{ uri: capturecardOPmage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('6')}>
                                                <Image source={{ uri: auth.profile.cardOPmage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }


                            {auth.profile.usertype == 'driver' && auth.profile.carType == 'TREAS-E' && auth.profile.carType == 'TREAS-T' ?
                                !auth.profile.cardOPmageBK ?
                                    capturecardOPmageBK ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCardOPmageBK}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: capturecardOPmageBK }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text
                                                            style={styles.capturePhotoTitle}>{'tarjeta de Operación Posterior'}</Text>
                                                        :
                                                        <Text
                                                            style={styles.errorPhotoTitle}>{'Tarjeta de Operación Posterior'}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('7')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text style={styles.text}>{'Tarjeta de Operación Posterior'}</Text>
                                        </View>
                                        {capturecardOPmageBK ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCardOPmageBK}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {capturecardOPmageBK ?
                                            <TouchableOpacity onPress={() => showActionSheet('7')}>
                                                <Image source={{ uri: capturecardOPmageBK }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('7')}>
                                                <Image source={{ uri: auth.profile.cardOPmageBK }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }


                            {auth.profile.usertype == 'driver' && auth.profile.carType == 'TREAS-c' ?
                                !auth.profile.RutImage ?
                                    captureRutImage ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelPhotoSOAT}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: captureRutImage }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text style={styles.capturePhotoTitle}>{'RUT'}</Text>
                                                        :
                                                        <Text style={styles.errorPhotoTitle}>{'RUT'}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('12')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text style={styles.text}>{'RUT'}</Text>
                                        </View>
                                        {captureRutImage ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelRut}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {captureRutImage ?
                                            <TouchableOpacity onPress={() => showActionSheet('12')}>
                                                <Image source={{ uri: captureRutImage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('12')}>
                                                <Image source={{ uri: auth.profile.RutImage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }


                            {auth.profile.usertype == 'driver' && auth.profile.carType == 'TREAS-c' && settings.CCET_image_required ?
                                !auth.profile.ccEmpTransImage ?
                                    captureccEmpTransImage ?
                                        <View style={styles.imagePosition}>
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCCEmpTransImage}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            <Image source={{ uri: captureccEmpTransImage }} style={styles.photoResult}
                                                resizeMode={'cover'} />
                                        </View>
                                        :
                                        <View style={styles.capturePhoto}>
                                            <View>
                                                {
                                                    state.imageValid ?
                                                        <Text
                                                            style={styles.capturePhotoTitle}>{'Sube la Cáamara y comercio de la empresa Transportadora '}</Text>
                                                        :
                                                        <Text
                                                            style={styles.errorPhotoTitle}>{'Sube la cámara y comercio de la empresa Transportadora '}</Text>
                                                }

                                            </View>
                                            <View
                                                style={[styles.capturePicClick, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                                <TouchableOpacity style={styles.flexView1}
                                                    onPress={() => showActionSheet('8')}>
                                                    <View>
                                                        <View style={styles.imageFixStyle}>
                                                            <Image source={require('../../assets/images/camera.png')}
                                                                resizeMode={'contain'} style={styles.imageStyle2} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={styles.myView}>
                                                    <View style={styles.myView1} />
                                                </View>
                                                <View style={styles.myView2}>
                                                    <View style={styles.myView3}>
                                                        <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    :
                                    <View style={styles.imagePosition}>
                                        <View style={{ padding: 5, marginTop: 5 }}>
                                            <Text
                                                style={styles.text}>{'Cámara y comercio de la empresa Transportadora '}</Text>
                                        </View>
                                        {captureccEmpTransImage ?
                                            <TouchableOpacity style={styles.photoClick} onPress={cancelCCEmpTransImage}>
                                                <Image source={require('../../assets/images/cross.png')}
                                                    resizeMode={'contain'} style={styles.imageStyle} />
                                            </TouchableOpacity>
                                            : null}

                                        {captureccEmpTransImage ?
                                            <TouchableOpacity onPress={() => showActionSheet('8')}>
                                                <Image source={{ uri: captureccEmpTransImage }} style={styles.photoResult}
                                                    resizeMode={'cover'} />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => showActionSheet('8')}>
                                                <Image source={{ uri: auth.profile.ccEmpTransImage }}
                                                    style={styles.photoResult} resizeMode={'cover'} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                : null
                            }


                            <View style={styles.buttonContainer}>
                                <Button
                                    loading={loading}
                                    onPress={saveProfile}
                                    title={t('update_button')}
                                    titleStyle={styles.buttonTitle}
                                    buttonStyle={[styles.registerButton, { backgroundColor: colors.PAYMENT_BUTTON_BLUE }]}
                                />
                            </View>
                            <View style={styles.gapView} />
                        </ScrollView>
                    </TabView.Item>
                </TabView>
            </View>
            {
                uploadImage()
            }
        </View>

    );

}


const styles = StyleSheet.create({
    pickerStyle: {
        color: colors.HEADER,
        width: 200,
        fontSize: 15,
        height: 40,
        marginBottom: 27,
        margin: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.HEADER,

    },
    container: {
        height: '100%',
        width: '100%',
    },
    vew: {
        borderTopLeftRadius: 130,
        height: '100%',
        alignItems: 'flex-end'
    },
    textInputContainerStyle: {
        width: '100%',
        height: 82,
        borderRadius: 10,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
        backgroundColor: colors.WHITE
    },

    textInputContainerStyle1: {
        width: '100%',
        height: 60,
        borderRadius: 10,
        marginVertical: -3,
        backgroundColor: colors.WHITE,
        alignItems: 'center'
    },
    vew1: {
        height: '100%',
        borderBottomRightRadius: 120,
        overflow: 'hidden',
        backgroundColor: colors.WHITE,
        width: '100%'
    },
    textInputStyle: {},
    inputContainerStyle: {
        width: "100%",
    },
    iconContainer: {
        width: '15%',
        alignItems: 'center'
    },
    gapView: {
        height: 40,
        width: '100%'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 40
    },
    registerButton: {
        width: 180,
        height: 50,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        marginTop: 30,
        borderRadius: 15,
    },
    buttonTitle: {
        fontSize: 16
    },
    inputTextStyle: {
        color: colors.HEADER,
        fontSize: 13,
        height: 32,
    },
    errorMessageStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 0
    },
    containerStyle: {
        flexDirection: 'column',
        width: '100%'
    },
    logo: {
        width: '65%',
        justifyContent: "center",
        height: '15%',
        borderBottomRightRadius: 150,
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 5,
        marginBottom: 5,
    },
    headerStyle: {
        fontSize: 25,
        color: colors.WHITE,
        flexDirection: 'row',
        width: '80%'
    },
    imagePosition: {
        position: 'relative'
    },
    imageStyle: {
        width: 30,
        height: height / 15
    },
    photoResult: {
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15,
        width: '80%',
        height: height / 4
    },
    capturePhoto: {
        width: '60%',
        height: 110,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        backgroundColor: colors.WHITE
    },
    capturePhotoTitle: {
        color: colors.BLACK,
        fontSize: 14,
        textAlign: 'center',
        paddingBottom: 15,

    },
    errorPhotoTitle: {
        color: colors.RED,
        fontSize: 13,
        textAlign: 'center',
        paddingBottom: 15,
    },
    photoClick: {
        paddingRight: 48,
        position: 'absolute',
        zIndex: 1,
        marginTop: 18,
        alignSelf: 'flex-end'
    },
    capturePicClick: {
        backgroundColor: colors.WHITE,
        flexDirection: 'row',
        position: 'relative',
        zIndex: 1
    },
    imageStyle: {
        width: 30,
        height: height / 15
    },
    flexView1: {
        flex: 12
    },
    imageFixStyle: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageStyle2: {
        width: 150,
        height: height / 15
    },
    myView: {
        flex: 2,
        height: 50,
        width: 1,
        alignItems: 'center'
    },
    myView1: {
        height: height / 18,
        width: 1.5,
        backgroundColor: colors.CONVERTDRIVER_TEXT,
        alignItems: 'center',
        marginTop: 10
    },
    myView2: {
        flex: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    myView3: {
        flex: 2.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    segmentcontrol: {
        color: colors.WHITE,
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        marginTop: 0,
        alignSelf: "center",
        height: 50
    },
    text1: {
        fontSize: 17,
        left: 10,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Bold',
        marginTop: 5
    },
    text: {
        color: colors.BLACK,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',

    },
});

