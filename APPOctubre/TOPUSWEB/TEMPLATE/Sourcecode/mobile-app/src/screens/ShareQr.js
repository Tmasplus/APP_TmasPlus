import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Image, Linking } from 'react-native';
import { colors } from '../common/theme';
import { useSelector } from 'react-redux';
var { width } = Dimensions.get('window');

const ShareQr = () => {


    const auth = useSelector(state => state.auth);



    return (
        <View style={styles.mainView}>
              <Image source={require('../../assets/images/treasapp_beacons_qrcode.jpg')} style={{ width: 300, height: 300, borderRadius: 23, margin: 20, marginLeft: 50 }} />
            <Text style={styles.textStyleId}> {auth.profile.referralId}  </Text>
            <Text style={styles.textStyle}> "¡Haz crecer la comunidad de TREASAPP! Comparte tu código QR único con amigos y familiares y muéstrales la increíble experiencia que ofrece nuestra aplicación. Cuando ellos se registren usando tu código, ¡ambos ganarán recompensas especiales en TREASAPP! Ayúdanos a construir una comunidad más grande y a disfrutar juntos de todos los beneficios que TREASAPP tiene para ofrecer. ¡Comparte tu código QR hoy mismo y comencemos esta emocionante aventura juntos en TREASAPP!" </Text>
        </View>
    );
}

const styles = StyleSheet.create({

    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        alignItems: 'center',

    },
    textStyle: {
        color: colors.CONVERTDRIVER_TEXT,
        fontFamily: 'Roboto-Bold',
        fontSize: 13,
        top: 60,
        width: width - 86,
        textAlign: 'justify'

    },
    textStyleId: {
        color: colors.RED_TREAS,
        fontFamily: 'Roboto-Bold',
        fontSize: 30,
        top: 20,
        width: width - 86,
        textAlign: 'center'

    },
    Image: {
        width: 250,
        height: 250,
        borderRadius: 1,
        margin: 20,
        alignItems: 'center',
        boxShadowColor: 'rgba(0,0,0,0.2)',
        backgroundColor: '#FADEE0',
        borderRadius: 23,
        elevation: 10,
    },
});
export default ShareQr;