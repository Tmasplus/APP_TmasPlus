import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    Linking
} from 'react-native';

import { colors } from '../common/theme';
import { MaterialIcons } from '@expo/vector-icons';




var { width, height } = Dimensions.get('window');

export default function CustomerSupport(props) {


    const [profileData, setProfileData] = useState(null);

    const handleChatPressDriver = () => {

        Linking.openURL(`https://wa.me/message/BTQOY5GZC7REF1`);
    };

    const handleChatPress = () => {
        const message = encodeURIComponent('Hola');
        Linking.openURL('whatsapp://send?text=Hola&phone=573208202221')

    };



    return (
        <View style={styles.mainView}>

            <View style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'absolute', height: '90%', top: 80 }} >

                <Text style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: 16, fontWeight: 'bold', left: '20%', top: 40 }}> ¿ Cómo podemos ayudarte ?  </Text>

                <Text style={styles.textStyle}>
                    Estamos aqui para ayudarte a resolver cualquier inquietud. {' '}
                    <Text> Chatea en linea con uno de nuestros asesores y resolveremos cualquier consulta en horario de oficina de Lunes a Viernes en dias habiles o puedes acceder a nuestra pagina oficial donde encontraras toda la información más relevante  </Text>
                </Text>
            </View>




            {profileData && profileData.usertype === 'customer' ?
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={  handleChatPress} style={{ backgroundColor: '#ffcccc', borderRadius: 18, marginHorizontal: '16%', alignItems: 'flex-end', top: '110%', bottom: -30 }} >
                        <MaterialIcons name="support-agent" size={53} color="#f20505" style={{ marginHorizontal: 100, marginVertical: 8 }} />
                   
                    </TouchableOpacity>
                </View>
                :

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleChatPressDriver} style={{ backgroundColor: '#ffcccc', borderRadius: 18, marginHorizontal: '16%', alignItems: 'flex-end', top: '110%', bottom: -30 }} >
                    <MaterialIcons name="support-agent" size={53} color="#f20505" style={{ marginHorizontal: 100, marginVertical: 8 }} />
                      
                    </TouchableOpacity>
                </View>


            }
        </View>
    );
}

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.HEADER,
        borderBottomWidth: 0
    },
    headerTitleStyle: {
        color: colors.WHITE,
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
    scrollViewStyle: {
        width: width,
        height: 50,
        marginVertical: 10,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profStyle: {
        fontSize: 18,
        left: 20,
        fontWeight: 'bold',
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Bold'
    },
    bonusAmount: {
        right: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
    viewStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 13
    },
    imageParentView: {
        borderRadius: 150 / 2,
        width: 150,
        height: 150,
        backgroundColor: '#9b9b9b',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageViewStyle: {
        borderRadius: 140 / 2,
        width: 140,
        height: 140,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textPropStyle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: colors.BUTTON,
        fontFamily: 'Roboto-Bold',
        top: 8,
        textTransform: 'uppercase'
    },
    newViewStyle: {
        flex: 1,
        marginTop: 10
    },
    myViewStyle: {
        flex: 1,
        left: 20,
        marginRight: 40,
        marginBottom: 8,
        borderBottomColor: colors.BORDER_TEXT,
        borderBottomWidth: 1
    },
    iconViewStyle: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    emailStyle: {
        fontSize: 17,
        left: 10,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Bold'
    },
    emailAdressStyle: {
        fontSize: 15,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Regular'
    },
    mainIconView: {
        flex: 1,
        left: 20,
        marginRight: 40,
        borderBottomColor: colors.BUTTON,
        borderBottomWidth: 1
    },
    text1: {
        fontSize: 17,
        left: 10,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Bold'
    },
    text2: {
        fontSize: 15,
        left: 10,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Regular'
    },
    textIconStyle: {
        width: width,
        height: 50,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textIconStyle2: {
        width: width,
        height: 50,
        marginTop: 10,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight 
    },
    flexView1: {
        flex: 1
    },
    flexView2: {
        flex: 1
    },
    flexView3: {
        marginTop: 10,
        marginBottom: 10
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
    },
    pickerStyle: {
        color: colors.WHITE,
        width: 45,
        marginRight: 12,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
    },
    pickerStyle1: {
        color: colors.WHITE,
        width: 68,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',

    },
    imageStyle2: {
        width: 30,
        height: 30
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    containerView: { flex: 1 },
    textContainer: { textAlign: "center" },
    mainView: {
        flex: 1,
        backgroundColor: colors.BACKGROUND_PRIMARY
    },
    headerContainerStyle: {
        backgroundColor: colors.RED_TREAS,
        borderBottomWidth: 0,
        marginTop: 0
    },
    headerInnerContainer: {
        marginLeft: 10,
        marginRight: 10
    },

    textInputStyle: {
        width: width - 60
    },


    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 40
    },

    containerStyle: {
        flexDirection: 'column',
        marginTop: 20,
        marginRight: 20,
        marginLeft: 20
    },
    form: {
        flex: 1,
    },
    logo: {
        width: '100%',
        justifyContent: "flex-start",
        marginTop: 10,
        alignItems: 'center',
    },
    scrollViewStyle: {
        height: height
    },
    textInputContainerStyle: {
        flexDirection: 'row',
        alignItems: "center",
        //marginLeft: 20,
        marginRight: 20,
        width: width - 40
    },
    headerStyle: {
        fontSize: 18,
        color: colors.WHITE,
        textAlign: 'center',
        flexDirection: 'row',
        marginTop: 0
    },

    capturePhoto: {
        width: '80%',
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: colors.WHITE,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15
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
        flex: 1,
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
    textStyle: {
        color: colors.CONVERTDRIVER_TEXT,
        fontFamily: 'Roboto-Bold',
        fontSize: 13,
        top: 110,
        width: width - 86,
        left: 45,
        textAlign: 'justify'

    }
});