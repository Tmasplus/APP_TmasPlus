import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    TouchableOpacity,
    Alert,
    Platform,
    Share,
    KeyboardAvoidingView,
    ImageBackground
} from 'react-native';
import { Icon } from 'react-native-elements'
import { colors } from '../common/theme';
import i18n from 'i18n-js';
var { width, height } = Dimensions.get('window');
import { useSelector } from 'react-redux';
import { FontAwesome5 } from '@expo/vector-icons';

export default function MyCardId(props) {
    const { t } = i18n;
    const [isRTL, setIsRTL] = useState();

    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const [profileData, setProfileData] = useState(null);
    const actionSheetRef = useRef(null);
    const [langSelection, setLangSelection] = useState();

    const fromPage = props.route.params && props.route.params.fromPage ? props.route.params.fromPage : null;


    useEffect(() => {
        setLangSelection(i18n.locale);
        setIsRTL(i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0);
    }, []);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData(auth.profile);
        }
    }, [auth.profile]);



    const [updateCalled, setUpdateCalled] = useState(false);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData({ ...auth.profile });
            if (updateCalled) {
                Alert.alert(
                    t('alert'),
                    t('profile_updated'),
                    [
                        {
                            text: t('ok'), onPress: () => {
                                setUpdateCalled(false);
                            }
                        }
                    ],
                    { cancelable: true }
                );
                setUpdateCalled(false);
            }
        }
    }, [auth.profile, updateCalled]);

    const onPressBack = () => {
        if (fromPage == 'DriverTrips' || fromPage == 'Map' || fromPage == 'Wallet') {
            props.navigation.navigate('TabRoot', { screen: fromPage });
        } else {
            props.navigation.goBack()
        }
    }

    const lCom = () => {
        return (
            <TouchableOpacity style={{ marginLeft: 10 }} onPress={onPressBack}>
                <FontAwesome5 name="arrow-left" size={24} color={colors.WHITE} />
            </TouchableOpacity>
        );
    }

    React.useEffect(() => {
        props.navigation.setOptions({
            headerLeft: lCom,
        });
    }, [props.navigation]);


    return (
        <View style={styles.mainView}>
            {auth.profile.usertype == 'customer' ?
                <ImageBackground
                    resizeMode={'stretch'} // or cover
                    style={{ flex: 1 }} // must be passed from the parent, the number may vary depending upon your screen size
                    source={require('../../assets/images/cardid_rider.png')}
                >

                    <View style={{ marginTop: 43 }} >

                    </View>
                    <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : (__DEV__ ? null : "padding")}>
                        <View>
                            <View style={styles.viewStyle}>
                                <View style={styles.imageViewStyle} >
                                    <Image source={profileData && profileData.profile_image ? { uri: profileData.profile_image } : require('../../assets/images/profilePic.png')} style={{ width: 95, height: 95, alignSelf: 'center', borderRadius: 95 / 2 }} />
                                </View>
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginHorizontal: 20, paddingRight: 15 }}>

                                    <View style={{ width: '100%' }}>
                                        {isRTL ?
                                            <Text numberOfLines={1} style={[styles.textPropStyle, [isRTL ? { marginRight: 35 } : { marginLeft: 40 }]]} >{auth.profile && (auth.profile.firstName && auth.profile.lastName) ? auth.profile.lastName.toUpperCase() + " " + auth.profile.firstName.toUpperCase() : t('no_name')}</Text>
                                            :
                                            <Text numberOfLines={1} style={[styles.textPropStyle, [isRTL ? { marginRight: 35 } : { marginLeft: 40 }]]} >{auth.profile && (auth.profile.firstName && auth.profile.lastName) ? auth.profile.firstName.toUpperCase() + " " + auth.profile.lastName.toUpperCase() : t('no_name')}</Text>
                                        }

                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.newViewStyle}>
                            <View style={styles.myViewStyle}>
                                <View style={styles.iconViewStyle}>
                                    <Icon
                                        name='envelope-letter'
                                        type='simple-line-icon'
                                        color={colors.RED_TREAS}
                                        size={30}
                                    />
                                    <Text style={styles.textPropStyle}>{profileData ? profileData.email : ''}</Text>
                                </View>
                            </View>
                            <View style={styles.myViewStyle}>
                                <View style={styles.iconViewStyle}>
                                    <Icon
                                        name='phone-call'
                                        type='feather'
                                        color={colors.RED_TREAS}
                                    />
                                    <Text style={styles.text1}>{profileData ? profileData.mobile : ''}</Text>
                                </View>
                            </View>
                            {profileData && profileData.referralId ?
                                <View style={styles.myViewStyle}>
                                    <View style={styles.iconViewStyle}>
                                        <Icon
                                            name='award'
                                            type='feather'
                                            color={colors.RED_TREAS}
                                        />
                                        <Text style={styles.textPropStyle}>{profileData.referralId}</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        <Text style={styles.text2}>{profileData.referralId}</Text>
                                        <TouchableOpacity
                                            style={{ marginLeft: 20 }}
                                            onPress={() => {
                                                settings.bonus > 0 ?
                                                    Share.share({
                                                        message: t('share_msg') + settings.code + ' ' + settings.bonus + ".\n" + t('code_colon') + auth.info.profile.referralId + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                                    })
                                                    :
                                                    Share.share({
                                                        message: t('share_msg_no_bonus') + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                                    })
                                            }}
                                        >
                                            <Icon
                                                name={Platform.OS == 'android' ? 'share-social' : 'share'}
                                                type='ionicon'
                                                color={colors.INDICATOR_BLUE}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                : null}
                            <View style={styles.myViewStyle}>
                                <View style={styles.iconViewStyle}>
                                    <Icon
                                        name='user'
                                        type='simple-line-icon'
                                        color={colors.RED_TREAS}
                                    />
                                    <Text style={styles.textPropStyle}>{profileData && profileData.docType + "-" + profileData.verifyId}</Text>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </ImageBackground>
                :
                <ImageBackground
                    resizeMode={'stretch'} // or cover
                    style={{ flex: 1 }} // must be passed from the parent, the number may vary depending upon your screen size
                    source={require('../../assets/images/cardid_rider.png')}
                >

                    <View style={{ marginTop: 43 }} >

                    </View>
                    <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : (__DEV__ ? null : "padding")}>
                        <View>
                            <View style={styles.viewStyle}>
                                <View style={styles.imageViewStyle} >
                                    <Image source={profileData && profileData.profile_image ? { uri: profileData.profile_image } : require('../../assets/images/profilePic.png')} style={{ width: 95, height: 99, alignSelf: 'center', borderRadius: 95 / 2 }} />
                                </View>
                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', marginHorizontal: 20, paddingRight: 15 }}>

                                    <View style={{ width: '100%' }}>
                                        {isRTL ?
                                            <Text numberOfLines={1} style={[styles.textPropStyle, [isRTL ? { marginRight: 35 } : { marginLeft: 40 }]]} >{auth.profile && (auth.profile.firstName && auth.profile.lastName) ? auth.profile.lastName.toUpperCase() + " " + auth.profile.firstName.toUpperCase() : t('no_name')}</Text>
                                            :
                                            <Text numberOfLines={1} style={[styles.textPropStyle, [isRTL ? { marginRight: 35 } : { marginLeft: 40 }]]} >{auth.profile && (auth.profile.firstName && auth.profile.lastName) ? auth.profile.firstName.toUpperCase() + " " + auth.profile.lastName.toUpperCase() : t('no_name')}</Text>
                                        }

                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.newViewStyle}>
                            <View style={styles.myViewStyle}>
                                <View style={styles.iconViewStyle}>
                                    <Icon
                                        name='envelope-letter'
                                        type='simple-line-icon'
                                        color={colors.RED_TREAS}
                                        size={30}
                                    />
                                    <Text style={styles.textPropStyle}>{profileData ? profileData.email : ''}</Text>
                                </View>
                            </View>
                            <View style={styles.myViewStyle}>
                                <View style={styles.iconViewStyle}>
                                    <Icon
                                        name='phone-call'
                                        type='feather'
                                        color={colors.RED_TREAS}
                                    />
                                    <Text style={styles.text1}>{profileData ? profileData.mobile : ''}</Text>
                                </View>
                            </View>
                            {profileData && profileData.referralId ?
                                <View style={styles.myViewStyle}>
                                    <View style={styles.iconViewStyle}>
                                        <Icon
                                            name='award'
                                            type='feather'
                                            color={colors.RED_TREAS}
                                        />
                                        <Text style={styles.textPropStyle}>{profileData.referralId}</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        <Text style={styles.text2}>{profileData.referralId}</Text>
                                        <TouchableOpacity
                                            style={{ marginLeft: 20 }}
                                            onPress={() => {
                                                settings.bonus > 0 ?
                                                    Share.share({
                                                        message: t('share_msg') + settings.code + ' ' + settings.bonus + ".\n" + t('code_colon') + auth.info.profile.referralId + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                                    })
                                                    :
                                                    Share.share({
                                                        message: t('share_msg_no_bonus') + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                                    })
                                            }}
                                        >
                                            <Icon
                                                name={Platform.OS == 'android' ? 'share-social' : 'share'}
                                                type='ionicon'
                                                color={colors.INDICATOR_BLUE}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                : null}
                            <View style={styles.myViewStyle}>
                                <View style={styles.iconViewStyle}>
                                    <Icon
                                        name='user'
                                        type='simple-line-icon'
                                        color={colors.RED_TREAS}
                                    />
                                    <Text style={styles.textPropStyle}>{profileData && profileData.docType + "-" + profileData.verifyId}</Text>
                                </View>
                            </View>
                            {profileData && profileData.usertype == 'driver' ?
                                <View style={styles.myViewStyle}>
                                    <View style={styles.iconViewStyle}>
                                        <Icon
                                            name='car-outline'
                                            type='ionicon'
                                            color={colors.RED_TREAS}
                                        />
                                        <Text style={styles.textPropStyle}>{profileData && profileData.vehicleNumber + "/" + profileData.vehicleForm + "/" + profileData.carType}</Text>
                                    </View>
                                </View>
                                : null}

                        </View>


                    </KeyboardAvoidingView>
                </ImageBackground>}
        </View>
    );
}

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.TRANSPARENT,
        borderBottomWidth: 0
    },
    headerTitleStyle: {
        color: colors.RED_TREAS,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    logo: {
        flex: 1,
        position: 'absolute',
        top: 110,
        width: '100%',
        justifyContent: "flex-end",
        alignItems: 'center'
    },
    footer: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        height: 150,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    scrollStyle: {
        flex: 1,
        height: height,
        backgroundColor: colors.WHITE
    },
    scrollViewStyle1: {
        width: width,
        height: 50,
        marginTop: 20,
        backgroundColor: 'silver',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    scrollViewStyle: {
        width: width,
        height: 50,
        marginTop: 30,
        backgroundColor: 'silver',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profStyle: {
        fontSize: 18,
        left: 20,
        fontWeight: 'bold',
        color: colors.RED_TREAS,
        fontFamily: 'Roboto-Bold'
    },
    bonusAmount: {
        right: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
    viewStyle: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginTop: 140,
        marginRight: 30
    },
    imageParentView: {
        borderRadius: 150 / 2,
        width: 150,
        height: 150,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageViewStyle: {
        top: 30,
        borderRadius: 140 / 2,
        width: 140,
        height: 140,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textPropStyle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.BLACK,
        fontFamily: 'Roboto-Bold',
        top: 2,
        textTransform: 'uppercase'
    },
    newViewStyle: {

        marginTop: 0
    },
    myViewStyle: {

        left: 25,
        marginRight: 40,
        marginBottom: 2,
        borderBottomColor: colors.BORDER_BACKGROUND,
        borderBottomWidth: 0
    },
    iconViewStyle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    textPropStyle: {
        fontSize: 17,
        left: 10,
        color: colors.BLACK,
        fontFamily: 'Roboto-Bold'
    },
    emailAdressStyle: {
        fontSize: 15,
        color: 'grey',
        fontFamily: 'Roboto-Regular'
    },
    mainIconView: {
        flex: 1,
        left: 20,
        marginRight: 40,
        borderBottomColor: colors.BORDER_BACKGROUND,
        borderBottomWidth: 1
    },
    text1: {
        fontSize: 17,
        left: 10,
        color: colors.RED_TREAS,
        fontFamily: 'Roboto-Bold'
    },
    text2: {
        fontSize: 15,
        left: 10,
        color: 'grey',
        fontFamily: 'Roboto-Regular'
    },
    textIconStyle: {
        width: width,
        height: 50,
        backgroundColor: 'silver',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textIconStyle2: {
        width: width,
        height: 50,
        marginTop: 10,
        backgroundColor: 'silver',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    mainView: {
        flex: 1,

        //backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight 
    },
    flexView1: {
        flex: 1
    },
    flexView2: {
        flex: 1
    },
    flexView3: {
        marginTop: 10
    },
    loadingcontainer: {
        flex: 1,
        justifyContent: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    contStyle: {
        width: 90,
        marginLeft: 20
    }
});