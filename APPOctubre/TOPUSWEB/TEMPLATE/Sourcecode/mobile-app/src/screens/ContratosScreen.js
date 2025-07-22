import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../common/theme';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as  Notifications from 'expo-notifications';

var { width, height } = Dimensions.get('window');

export default function ContratosSreem(props) {


    const [profileData, setProfileData] = useState(null);
    const [updateCalled, setUpdateCalled] = useState(false);
    const auth = useSelector(state => state.auth);
    const [showWebView, setShowWebView] = useState(false);
    const [webViewUrl, setWebViewUrl] = useState(''); // Estado para la URL del WebView


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

    const handleContratos = () => {
        Alert.alert('Atento Conductor', 'Para que puedas acceder a tu contrato inicia sesión con tu email y contraseña de conductor');
        const userEmail = auth.profile.email; // Obtén el correo electrónico del usuario autenticado
        const url = `https://treasupdate.web.app/login?email=${userEmail}`;
        setShowWebView(true);
        setWebViewUrl(url); // Actualiza el estado con la URL
    };



    const handleManualNotification = async () => {

        const triggerInSeconds = 3;
        const triggerDate = new Date(Date.now() + triggerInSeconds * 1000);

        // Enviamos la notificación manualmente
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'TREASAPP',
                body: 'Debes recargar tu suscripción para poder descargar el contrato.',
                ios: {
                    sound: 'default',
                },
                android: {
                    sound: 'default',
                },
                data: {
                    screen: 'wallet',
                },
            },
            trigger: triggerDate, // Si no proporcionas un disparador (trigger), la notificación se mostrará inmediatamente
        });

        console.log('Notificación enviada con ID:', notificationId);
    };






    const renderButton = () => {
        if (profileData.contractenabled) {
            return (
                <TouchableOpacity
                    style={{ backgroundColor: '#ffcccc', borderRadius: 18, marginHorizontal: '16%', alignItems: 'flex-end', top: '100%', bottom: -30, opacity: 0.5 }}
                    onPress={handleContratos}
                >
                    <AntDesign name="copy1" size={53} color="#f20505" style={{ marginHorizontal: 100, marginVertical: 8 }} />
                </TouchableOpacity>
            );
        } else if (profileData.walletBalance >= 96000) {
            return (
                <TouchableOpacity onPress={handleContratos} style={{ backgroundColor: '#ffcccc', borderRadius: 18, marginHorizontal: '16%', alignItems: 'flex-end', top: '100%', bottom: -30 }}>
                    <Ionicons name="cash-sharp" size={53} color="#f20505" style={{ marginHorizontal: 100, marginVertical: 8 }} />
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity onPress={handleManualNotification} style={{ backgroundColor: '#ffcccc', borderRadius: 18, marginHorizontal: '16%', alignItems: 'flex-end', top: '100%', bottom: -30 }}>
                    <Ionicons name="cash-sharp" size={53} color="#f20505" style={{ marginHorizontal: 100, marginVertical: 8 }} />
                </TouchableOpacity>
            )
        }
    };


    return (
        <View style={styles.mainView}>
            {profileData && profileData.carType != 'TREAS-T' ?
                <View style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'absolute', height: '100%', top: 50 }} >

                    <Text style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: 16, fontWeight: 'bold', left: '20%', }}>    Contratos TREAS CORP SAS  </Text>
                    <Text style={styles.textStyle}>
                        En esta sección, podrás revisar los contratos relacionados con tu trabajo como conductor. En primer lugar, encontrarás el 'Contrato Anual', el cual establece los términos y condiciones generales de tu relación laboral con nuestra empresa. Este contrato tiene una duración de un año e incluye información importante, como tus responsabilidades, los beneficios que recibes y los pagos asociados.  {' '}
                        <Text>{"\n"}</Text>
                        <Text>{"\n"}</Text>
                        <Text>Además, encontrarás la sección de 'Contratos por Servicio', donde podrás ver los detalles de cada servicio de conducción que has realizado. Para cada servicio, se genera un contrato individual que contiene información relevante, como la fecha y hora del servicio, los detalles del pasajero y la ruta del trayecto, así como los términos y condiciones específicos de ese servicio en particular. </Text> {' '}
                        <Text>{"\n"}</Text>
                        <Text>{"\n"}</Text>
                        <Text>Te recomendamos revisar estos contratos regularmente para mantener un registro de tus servicios y asegurarte de cumplir con los términos acordados. Si tienes alguna duda o necesitas más información sobre algún contrato, no dudes en contactarnos. Estamos aquí para ayudarte y brindarte la claridad necesaria en todo momento." </Text> {' '}
                    </Text>

                    <View style={styles.buttonContainer}>
                        {renderButton()}
                    </View>

                </View>
                :
                <View style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'absolute', height: '100%', top: 50 }} >

                    <Text style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: 16, fontWeight: 'bold', left: '20%', }}>    Contratos TREAS CORP SAS  </Text>
                    <Text style={styles.textStyle}>
                        En esta sección, podrás revisar los contratos relacionados con tu trabajo como conductor. En primer lugar, encontrarás el 'Contrato Anual', el cual establece los términos y condiciones generales de tu relación laboral con nuestra empresa. Este contrato tiene una duración de un año e incluye información importante, como tus responsabilidades, los beneficios que recibes y los pagos asociados.  {' '}
                        <Text>{"\n"}</Text>
                        <Text>{"\n"}</Text>
                        <Text>Además, encontrarás la sección de 'Contratos por Servicio', donde podrás ver los detalles de cada servicio de conducción que has realizado. Para cada servicio, se genera un contrato individual que contiene información relevante, como la fecha y hora del servicio, los detalles del pasajero y la ruta del trayecto, así como los términos y condiciones específicos de ese servicio en particular. </Text> {' '}
                        <Text>{"\n"}</Text>
                        <Text>{"\n"}</Text>
                        <Text>Te recomendamos revisar estos contratos regularmente para mantener un registro de tus servicios y asegurarte de cumplir con los términos acordados. Si tienes alguna duda o necesitas más información sobre algún contrato, no dudes en contactarnos. Estamos aquí para ayudarte y brindarte la claridad necesaria en todo momento." </Text> {' '}
                    </Text>

                    <View style={styles.buttonContainer}>
                        {profileData && profileData.carType != 'TREAS-T' && renderButton()}
                    </View>

                </View>

            }


            {showWebView && (
                <View style={{ flex: 1 }}>
                    <WebView source={{ uri: webViewUrl }} />
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({

    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight 
    },

    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 40,
        position: 'absolute',
        top: 200,
        left: 10
    },
    textStyle: {
        color: colors.CONVERTDRIVER_TEXT,
        fontFamily: 'Roboto-Bold',
        fontSize: 13,
        top: 70,
        width: width - 86,
        left: 45,
        textAlign: 'justify'

    }
});
