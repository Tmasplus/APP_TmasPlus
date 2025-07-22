import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Alert,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Modal,
    Image
} from 'react-native';
import { colors } from '../common/theme';
var { height, width } = Dimensions.get('window');
import i18n from 'i18n-js';
import RadioForm from 'react-native-simple-radio-button';
import RNPickerSelect from './RNPickerSelect';
import { useSelector } from 'react-redux';
import { api } from 'common';
import { Feather, AntDesign } from '@expo/vector-icons';
import { MAIN_COLOR } from '../common/sharedFunctions';
import Button from './Button';

const hasNotch = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && ((height === 780 || width === 780) || (height === 812 || width === 812) || (height === 844 || width === 844) || (height === 852 || width === 852) || (height === 896 || width === 896) || (height === 926 || width === 926) || (height === 932 || width === 932))

export default function Registration(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const {
        countries
    } = api;
    const [state, setState] = useState({
        usertype: 'customer',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        mobile: '',
        referralId: '',
        carType: ''
    });

    const [countryCode, setCountryCode] = useState();
    const [mobileWithoutCountry, setMobileWithoutCountry] = useState('');
    const settings = useSelector(state => state.settingsdata.settings);
    const [confirmpassword, setConfirmPassword] = useState('');
    const [eyePass, setEyePass] = useState(true);
    const [eyeConfirmPass, setEyeConfirmPass] = useState(true);

    const [firstNameFocus, setFirstNameFocus] = useState(false)
    const [lastNameFocus, setlastNameFocus] = useState(false)
    const [EmailFocus, setEmailFocus] = useState(false)
    const [countrycodeFocus, setCountryCodeFocus] = useState(false)
    const [carTypeFocus, setCarTypeFocus] = useState(false)
    const [numberFocus, setNumberFocus] = useState(false)
    const [passwordFocus, setpasswordFocus] = useState(false)
    const [confirmPasswordFocus, setconfirmPasswordFocus] = useState(false)
    const [referralIdFocus, setreferralIdFocus] = useState(false)
    const pickerRef1 = React.createRef();
    const pickerRef2 = React.createRef();
    const [modalVisible, setModalVisible] = useState(false);

    const { loading } = props
    const radio_props = [
        { label: t('customer'), value: 0 },
        { label: t('driver'), value: 1 }
    ];

    const formatCountries = () => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            let txt = countries[i].label + " (+" + countries[i].phone + ")";
            arr.push({ label: txt, value: txt, key: txt });
        }
        return arr;
    }

    useEffect(() => {
        if (settings) {
            for (let i = 0; i < countries.length; i++) {
                if (countries[i].label == settings.country) {
                    setCountryCode(countries[i].label + " (+" + countries[i].phone + ")");
                }
            }
        }
    }, [settings]);


    const validateMobile = () => {
        let mobileValid = true;
        if (mobileWithoutCountry.length < 6) {
            mobileValid = false;
            Alert.alert(t('alert'), t('mobile_no_blank_error'));
        }
        return mobileValid;
    }

    const checkPasswordValidity = value => {
        if (value != confirmpassword) {
            return (t('confirm_password_not_match_err'));
        }

        const isNonWhiteSpace = /^\S*$/;
        if (!isNonWhiteSpace.test(value)) {
            return (t('password_must_not_contain_whitespaces'));
        }

        const isContainsUppercase = /^(?=.*[A-Z]).*$/;
        if (!isContainsUppercase.test(value)) {
            return (t('password_must_have_at_least_one_uppercase_character'));
        }

        const isContainsLowercase = /^(?=.*[a-z]).*$/;
        if (!isContainsLowercase.test(value)) {
            return (t('password_must_have_at_least_one_lowercase_character'));
        }

        const isContainsNumber = /^(?=.*[0-9]).*$/;
        if (!isContainsNumber.test(value)) {
            return (t('password_must_contain_at_least_one_digit'));
        }

        const isValidLength = /^.{8,16}$/;
        if (!isValidLength.test(value)) {
            return (t('password_must_be_8-16_characters_long'));
        }

        return null;
    }

    const onPressRegister = () => {
        const { onPressRegister } = props;
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const validatePassword = checkPasswordValidity(state.password);
        if (re.test(state.email)) {
            if (/\S/.test(state.firstName) && state.firstName.length > 0 && /\S/.test(state.lastName) && state.lastName.length > 0) {
                if (!validatePassword) {
                    if (validateMobile()) {
                        const userData = { ...state };
                        if (userData.usertype == 'customer') delete userData.carType;
                        onPressRegister(userData);
                    } else {
                        Alert.alert(t('alert'), t('mobile_no_blank_error'));
                    }
                } else {
                    Alert.alert(t('alert'), validatePassword);
                }
            } else {
                Alert.alert(t('alert'), t('proper_input_name'));
            }
        } else {
            Alert.alert(t('alert'), t('proper_email'));
        }

    }

    const upDateCountry = (text) => {
        setCountryCode(text);
        let extNum = text.split("(")[1].split(")")[0];
        let formattedNum = mobileWithoutCountry.replace(/ /g, '');
        formattedNum = extNum + formattedNum.replace(/-/g, '');
        setState({ ...state, mobile: formattedNum })
    }


    useEffect(() => {
        setModalVisible(true)
    }, [])


    const carTypes = [
        { label: 'SERVICIO PARTICULAR', value: 'TREAS-X' },
        { label: 'SERVICIO TAXI', value: 'TREAS-T' },
        { label: 'SERVICIO ESPECIAL', value: 'TREAS-E' },
        { label: 'SERVICIO VAN', value: 'TREAS-VAN' },
    ]

    return (
        <View style={{ flex: 1, }}>
            <SafeAreaView style={{ flex: 1, position: 'absolute', backgroundColor: colors.WHITE, height: '100%', width: '100%' }}>
                <View style={[{ backgroundColor: colors.WHITE }]}>
                    <TouchableOpacity style={isRTL ? { marginRight: 10, alignSelf: 'flex-end', width: 70, padding: 8, marginTop: 12 } : { marginLeft: 10, width: 70, padding: 8, marginTop: Platform.OS == 'android' ? (__DEV__ ? 15 : 20) : (hasNotch ? 35 : 30) }} onPress={props.onPressBack} >
                        <AntDesign name={isRTL ? 'right' : "left"} size={30} color="black" />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.headerStyle, [isRTL ? { marginRight: 25, textAlign: 'right', padding: 8, } : { marginLeft: 8, padding: 8 }]]}>{t('registration_title')} para {state.usertype === 'customer' ? 'Cliente' : 'Conductor'} </Text>
                <View style={{ height: '85%' }}>
                    <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                        <View style={styles.containerStyle}>
                            {/* <KeyboardAvoidingView style={styles.form} behavior={Platform.OS == "ios" ? "padding" : (__DEV__ ? null : "padding")}> */}
                            <KeyboardAvoidingView style={styles.form} behavior={Platform.OS === 'ios' ? 'padding' : (__DEV__ ? null : "padding")} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} >

                                {/* <ScrollView style={styles.form} showsVerticalScrollIndicator={false} > */}


                                <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <TextInput
                                        autoComplete='false'
                                        placeholder={t('first_name_placeholder')}
                                        onFocus={() => setFirstNameFocus(!firstNameFocus)}
                                        onBlur={() => setFirstNameFocus(!firstNameFocus)}
                                        value={state.firstName}
                                        onChangeText={(text) => {
                                            // Validar y eliminar caracteres especiales y el símbolo '@'
                                            const cleanText = text.replace(/[^A-Za-z]/g, ' '); // Esto permite solo letras (mayúsculas y minúsculas)
                                            setState({ ...state, firstName: cleanText });
                                        }}
                                        textAlign={isRTL ? 'right' : 'left'}
                                        placeholderTextColor={colors.PLACEHOLDER_COLOR}
                                        style={[styles.textInputStyle, { width: "47%" }, (firstNameFocus === true || state.firstName.length > 0) ? styles.inputFocused : styles.textInputStyle]}
                                        keyboardType={'email-address'}
                                    />
                                    <TextInput
                                        placeholder={t('last_name_placeholder')}
                                        onFocus={() => setlastNameFocus(!lastNameFocus)}
                                        onBlur={() => setlastNameFocus(!lastNameFocus)}
                                        value={state.lastName}
                                        textAlign={isRTL ? 'right' : 'left'}
                                        onChangeText={(text) => {
                                            // Validar y eliminar caracteres especiales y el símbolo '@'
                                            const cleanText = text.replace(/[^A-Za-z]/g, ' '); // Esto permite solo letras (mayúsculas y minúsculas)
                                            setState({ ...state, lastName: cleanText });
                                        }}
                                        placeholderTextColor={colors.PLACEHOLDER_COLOR}
                                        style={[styles.textInputStyle, { width: "47%" }, (lastNameFocus === true || state.lastName.length > 0) ? styles.inputFocused : styles.textInputStyle]}
                                        keyboardType={'email-address'}
                                    />

                                </View>
                                <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <TextInput
                                        placeholder={t('email_placeholder')}
                                        onFocus={() => setEmailFocus(!EmailFocus)}
                                        onBlur={() => setEmailFocus(!EmailFocus)}
                                        value={state.email}
                                        placeholderTextColor={colors.PLACEHOLDER_COLOR}
                                        textAlign={isRTL ? 'right' : 'left'}
                                        style={[styles.textInputStyle, { width: "100%" }, (EmailFocus === true || state.email.length > 0) ? styles.inputFocused : styles.textInputStyle]}
                                        onChangeText={(text) => { setState({ ...state, email: text }) }}
                                        keyboardType={'email-address'}
                                    />
                                </View>
                                <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <TouchableOpacity activeOpacity={0.5} style={[styles.RnpickerBox, { flexDirection: isRTL ? 'row-reverse' : "row", justifyContent: 'space-between' }]} >
                                        <View style={{ overflow: "hidden", height: '100%', width: "80%", }} >
                                            <RNPickerSelect
                                                numberOfLines={1}
                                                pickerRef={pickerRef1}
                                                onFocus={() => setCountryCodeFocus(!countrycodeFocus)}
                                                onBlur={() => setCountryCodeFocus(!countrycodeFocus)}
                                                key={countryCode}
                                                placeholder={{ label: t('select_country'), value: t('select_country') }}
                                                value={countryCode}
                                                textInputProps={{
                                                    maxLength: 6,
                                                    styles: {
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }
                                                }}

                                                useNativeAndroidPickerStyle={false}
                                                style={{
                                                    inputIOS: [styles.pickerStyle, { textAlign: isRTL ? 'right' : 'left', alignSelf: isRTL ? 'flex-end' : 'flex-start' }, (countrycodeFocus === true) ? styles.pickerFocus
                                                        : styles.pickerStyle],
                                                    placeholder: {
                                                        color: colors.PLACEHOLDER_COLOR
                                                    },
                                                    inputAndroid: [styles.pickerStyle, { textAlign: isRTL ? 'right' : 'left', alignSelf: isRTL ? 'flex-end' : 'flex-start' }, (countrycodeFocus === true) ? styles.pickerFocus
                                                        : styles.pickerStyle]
                                                }}
                                                onTap={() => { pickerRef1.current.focus() }}
                                                onValueChange={(text) => { upDateCountry(text); }}
                                                items={formatCountries()}
                                                disabled={settings.AllowCountrySelection ? false : true}
                                            />

                                        </View>
                                        <AntDesign name="arrowdown" size={24} color={colors.BLACK} style={{ width: 'auto', alignContent: 'flex-end' }} />
                                    </TouchableOpacity>
                                    <TextInput
                                        placeholder={t('mobile')}
                                        onFocus={() => setNumberFocus(!numberFocus)}
                                        onBlur={() => setNumberFocus(!numberFocus)}
                                        value={mobileWithoutCountry}
                                        placeholderTextColor={colors.PLACEHOLDER_COLOR}
                                        textAlign={isRTL ? 'right' : 'left'}
                                        style={[styles.textInputStyle, { width: "58%" }, (numberFocus === true || mobileWithoutCountry.length > 0) ? styles.inputFocused : styles.textInputStyle]}
                                        onChangeText={
                                            (text) => {
                                                setMobileWithoutCountry(text)
                                                let formattedNum = text.replace(/ /g, '');
                                                formattedNum = countryCode.split("(")[1].split(")")[0] + formattedNum.replace(/-/g, '');
                                                setState({ ...state, mobile: formattedNum })
                                            }
                                        }
                                        keyboardType={'number-pad'}
                                    />
                                </View>
                                <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <TextInput
                                        placeholder={t('password')}
                                        onFocus={() => setpasswordFocus(!passwordFocus)}
                                        onBlur={() => setpasswordFocus(!passwordFocus)}
                                        placeholderTextColor={colors.PLACEHOLDER_COLOR}
                                        value={state.password}
                                        textAlign={isRTL ? 'right' : 'left'}
                                        style={[styles.textInputStyle, { width: "100%" }, (passwordFocus === true || state.password.length > 0) ? styles.inputFocused : styles.textInputStyle]}
                                        onChangeText={(text) => setState({ ...state, password: text })}
                                        keyboardType="default"
                                        secureTextEntry={eyePass}
                                    />
                                    <TouchableOpacity onPress={() => setEyePass(!eyePass)} style={styles.passwordIcon}>
                                        <Feather name={eyePass === true ? "eye-off" : "eye"} size={24} color={(passwordFocus === true || state.password.length > 0) ? MAIN_COLOR : colors.PLACEHOLDER_COLOR} />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <TextInput
                                        placeholder={t('confirm_password')}
                                        secureTextEntry={eyeConfirmPass}
                                        onFocus={() => setconfirmPasswordFocus(!confirmPasswordFocus)}
                                        onBlur={() => setconfirmPasswordFocus(!confirmPasswordFocus)}
                                        placeholderTextColor={colors.PLACEHOLDER_COLOR}
                                        value={confirmpassword}
                                        textAlign={isRTL ? 'right' : 'left'}
                                        style={[styles.textInputStyle, { width: "100%" }, (confirmPasswordFocus === true || confirmpassword.length > 0) ? styles.inputFocused : styles.textInputStyle
                                        ]}
                                        onChangeText={(text) => setConfirmPassword(text)}
                                        keyboardType="default"
                                    />
                                    <TouchableOpacity onPress={() => setEyeConfirmPass(!eyeConfirmPass)} style={styles.passwordIcon}>
                                        <Feather name={eyeConfirmPass === true ? "eye-off" : "eye"} size={24} color={(confirmPasswordFocus === true || confirmpassword.length > 0) ? MAIN_COLOR : colors.PLACEHOLDER_COLOR} />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.textInputBoxStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <TextInput
                                        editable={true}
                                        placeholder={t('referral_id_placeholder')}
                                        onFocus={() => setreferralIdFocus(!referralIdFocus)}
                                        onBlur={() => setreferralIdFocus(!referralIdFocus)}
                                        placeholderTextColor={colors.PLACEHOLDER_COLOR}
                                        value={state.referralId}
                                        textAlign={isRTL ? 'right' : 'left'}
                                        style={[styles.textInputStyle, { width: "100%" }, (referralIdFocus === true || state.referralId.length > 0) ? styles.inputFocused : styles.textInputStyle]}
                                        onChangeText={(text) => { setState({ ...state, referralId: text }) }}
                                        keyboardType={'email-address'}

                                    />
                                </View>

                                <View style={[styles.buttonContainer]}>
                                    <Button
                                        title={t('register_button')}
                                        style={[styles.registerButton, loading === true ? styles.registerButtonClicked : styles.registerButton]}
                                        buttonStyle={[styles.buttonStyle]}
                                        btnClick={onPressRegister}
                                        activeOpacity={0.8}
                                        loading={loading === true ? true : false}
                                        loadingColor={{ color: MAIN_COLOR }}
                                    />

                                </View>
                                <Modal
                                    visible={modalVisible}
                                    animationType="slide"
                                    transparent={true}
                                    onRequestClose={() => setModalVisible(false)}
                                >
                                    <View style={styles.centeredView}>
                                        <View style={styles.modalView}>
                                            <Text style={[styles.headerStyle2, [isRTL ? { marginRight: 25, textAlign: 'right', padding: 8 } : { marginLeft: 8, padding: 8 }]]}>  ¿Cómo quieres registrarte?  </Text>

                                            {state.usertype === 'customer' ?
                                                <Image source={require('../../assets/images/customer.png')} style={{ width: 300, height: 300, marginBottom: 15 }} />
                                                :
                                                <Image source={require('../../assets/images/driver.png')} style={{ width: 300, height: 300, marginBottom: 15 }} />
                                            }



                                            <RadioForm
                                                radio_props={radio_props}
                                                initial={0}
                                                animation={true}
                                                formHorizontal={true}
                                                labelHorizontal={true}
                                                buttonColor={colors.HEADER}
                                                labelColor={colors.HEADER}
                                                style={isRTL ? { marginRight: 20 } : { marginLeft: 20 }}
                                                labelStyle={isRTL ? { marginRight: 10 } : { marginRight: 10 }}
                                                selectedButtonColor={colors.RED_TREAS}
                                                selectedLabelColor={colors.BLACK}
                                                onPress={(value) => {
                                                    const userType = value === 0 ? 'Cliente' : 'Conductor';
                                                    if (value == 0) {
                                                        setState({ ...state, usertype: 'customer' });
                                                    } else {
                                                        setState({ ...state, usertype: 'driver' });
                                                    }
                                                }}
                                            />

                                            {state.usertype === 'customer' ?

                                                <TouchableOpacity style={[styles.registerButton2, { marginTop: state.usertype == 'driver' ? 30 : 10, alignItems: 'center', justifyContent: 'center' }]} onPress={() => setModalVisible(false)}>
                                                    <Text style={{ color: colors.WHITE, fontWeight: '700' }} >Inicia como Cliente</Text>
                                                </TouchableOpacity>

                                                :

                                                <TouchableOpacity style={[styles.registerButton2, { marginTop: state.usertype == 'driver' ? 30 : 10, alignItems: 'center', justifyContent: 'center' }]} onPress={() => setModalVisible(false)}>
                                                    <Text style={{ color: colors.WHITE, fontWeight: '700' }} >Inicia como Conductor</Text>

                                                </TouchableOpacity>}
                                        </View>
                                    </View>
                                </Modal>

                            </KeyboardAvoidingView>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
    },
    vew: {
        borderTopLeftRadius: 130,
        height: '100%',
        alignItems: 'flex-end',
    },

    headerContainerStyle: {
        backgroundColor: colors.RE_GREEN,
        borderBottomWidth: 0,
        marginTop: 0
    },
    headerInnerContainer: {
        marginLeft: 10,
        marginRight: 10
    },
    textInputContainerStyle: {
        width: width - 25,
        alignItems: 'center',
        justifyContent: "center",
    },
    form: {
        alignItems: 'center',
        width: '100%',
        gap: 25,
        marginBottom: 25,
        flex: 1

    },
    containerStyle: {
        flexDirection: 'column',
        marginTop: 10,
        width: '100%',
        backgroundColor: colors.WHITE,
    },
    textInputBoxStyle: {
        width: width - 25,
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    passwordIcon: {
        position: "absolute",
        right: 12
    },
    textInputStyle: {
        borderWidth: 1,
        borderColor: colors.PLACEHOLDER_COLOR,
        paddingVertical: 12,
        borderRadius: 10,
        paddingLeft: 10,
        paddingRight: 10,
        fontWeight: "600"
    },
    inputFocused: {
        borderColor: MAIN_COLOR,
        paddingVertical: 12,
    },
    inputContainerStyle: {
        width: "100%",
    },
    iconContainer: {
        width: '15%',
        alignItems: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: width - 25,
        position: 'relative',
        marginBottom: 40
    },
    registerButton: {
        width: '100%',
        backgroundColor: colors.RED_TREAS,
        borderRadius: 10,

        marginBottom: 5
    },
    loadingBox: {
        position: 'absolute',
        top: 10
    },

    registerButtonClicked: {
        width: '100%',
        borderWidth: 1,
        backgroundColor: colors.WHITE,
        borderColor: MAIN_COLOR,
        borderRadius: 10,
        elevation: 0
    },
    buttonStyle: {
        paddingVertical: 3,
        fontSize: 22,
        fontFamily: "Roboto-Bold",
        color: colors.WHITE,
    },
    pickerStyle: {
        color: colors.BLACK,
        fontSize: 15,
        paddingVertical: 12,
        position: 'relative',
        paddingLeft: 10,
        paddingRight: 10,
        color: colors.BLACK,
        fontWeight: '600',
        flexWrap: 'wrap',
        width: "100%",
    },
    RnpickerBox: {
        width: "35%",
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: MAIN_COLOR,
        borderRadius: 10,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    RnpickerBox2: {
        width: "100%",
        overflow: 'hidden',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: MAIN_COLOR,
        borderRadius: 10,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    pickerFocus: {
        borderWidth: 2,
        borderColor: colors.INPUT_FOCUS
    },
    inputTextStyle: {
        color: colors.HEADER,
        fontSize: 13,
        marginLeft: 0,
        height: 32,
    },
    errorMessageStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 0
    },
    scrollViewStyle: {
        flex: 1,
        marginTop: 15
    },
    headerStyle: {
        fontSize: 35,
        color: colors.RED_TREAS,
        flexDirection: 'row',
        fontFamily: "Roboto-Bold",
        // fontWeight: "700"
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
    imagePosition: {
        position: 'relative'
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
        backgroundColor: colors.BORDER_TEXT,
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
    textStyle: {
        color: colors.ProfileDetails_Text,
        fontFamily: 'Roboto-Bold',
        fontSize: 13
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    registerButton2: {
        width: 180,
        height: 50,
        borderColor: '#fff',
        borderWidth: 0,
        marginTop: 30,
        borderRadius: 15,
        backgroundColor: '#F20505',
    },
});


