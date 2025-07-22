import React from 'react';
import { View, StyleSheet, Text, Dimensions, Image, TouchableOpacity, Linking, ScrollView, PixelRatio } from 'react-native';
import { colors } from '../common/theme';
import email from 'react-native-email'
import { useSelector } from 'react-redux';
import i18n from 'i18n-js';
var { width, height } = Dimensions.get('window');

const Insurers = () => {

    const auth = useSelector(state => state.auth);
    const { t } = i18n;


    const onPressCall = () => {
        let call_link = Platform.OS == 'android' ? 'tel:' + 6017430544 : 'telprompt:' + 6017430544;
        Linking.openURL(call_link);
    }

    handleEmail = () => {
        const to = ['procesos@treascorp.co',] // string or array of email addresses
        email(to, {
            cc: ['servicioalcliente@treasapp.com'], // string or array of email addresses
            subject: 'Solicitud certificación de mi poliza de seguros.  ' + auth.profile.vehicleNumber,
            body: ''
        }).catch(console.error)
    }


    return (
        <View style={{ backgroundColor: colors.WHITE, height: height, alignItems: 'center' }} >
             <Image source={require('../../assets/images/Warning3D.png')} style={{ width: 300, height: 300, borderRadius: 23, margin: 20, marginLeft: 50 }} />

{/**
              
            <TouchableOpacity onPress={onPressCall} style={{ backgroundColor: colors.RED_TREAS, top: -30, width: 150, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 23, }} >
                <Text style={styles.boton}> Reporta Incidente </Text>
            </TouchableOpacity>
 */}

            <ScrollView style={{ height: 150, display: 'flex' }} >
                <View style={{ display: 'flex', alignItems: 'center' }} >
                    <Text style={styles.textStyle}>
                        {t('SBS')}
                    </Text>


                    <TouchableOpacity
                        onPress={handleEmail}
                        style={{ backgroundColor: colors.RED_TREAS, top: 70, width: 180, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 23, }} >
                        <Text style={styles.boton}> Atención al cliente </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({

    textStyle: {
        color: colors.CONVERTDRIVER_TEXT,
        fontFamily: 'Roboto-Bold',
        fontSize: PixelRatio.getFontScale() * 12,
        top: 40,
        width: width - 86,

        textAlign: 'justify'

    },
    boton: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: PixelRatio.getFontScale() * 15,
        width: width,
        textAlign: 'center',
        marginHorizontal: 15
    }
});
export default Insurers;
