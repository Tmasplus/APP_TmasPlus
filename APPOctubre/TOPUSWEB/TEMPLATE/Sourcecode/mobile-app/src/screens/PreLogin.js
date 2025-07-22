import React, { useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    View,
    ImageBackground,
    Text,
    Dimensions,
    Platform,
    Keyboard,
    
} from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { colors } from '../common/theme';
var { width } = Dimensions.get('window');

const PreLogin = (props) => {

    const [keyboardStatus, setKeyboardStatus] = useState("Keyboard Hidden");



    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardStatus('Keyboard Shown');
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardStatus('Keyboard Hidden');
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);


    const openRegister = () => {
        props.navigation.navigate("Register");
    }

    const openLogin = () => {
        props.navigation.navigate("Login");
    }


    const backgroundImageStyle = [
        styles.imagebg,
        {
            marginTop: keyboardStatus === 'Keyboard Shown' ? -(width * 0.55) : 0,
        },
    ];

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/PreLogin.png')}
                resizeMode="stretch"
                style={backgroundImageStyle}
            >
               <ScrollView>
               <View style={styles.box2}>
                    <View style={{ width: '90%', alignItems: 'center', top: 10 }}>
                        <Text style={styles.title}>Bienvenido</Text>
                        <Text style={styles.description}>
                            Si aún no tienes cuenta con nosotros y no has disfrutado de nuestros servicios y beneficios,
                            por favor Registrate. Si ya te registraste, por favor ingresa tu correo electrónico y
                            contraseña asignada.
                        </Text>
                    </View>

                    <TouchableOpacity onPress={openLogin} style={styles.button}>
                        <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={openRegister} style={styles.button}>
                        <Text style={styles.buttonText}>Crear cuenta</Text>
                    </TouchableOpacity>
                </View>
               </ScrollView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imagebg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height + (Platform.OS === 'android' && !__DEV__ ? 40 : 0),
    },
    box2: {
        marginTop: '105%',
        marginLeft: 35,
        marginRight: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    title: {
        color: colors.BLACK,
        fontWeight: '500',
        fontSize: 30,
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
        marginVertical: 10,
        width: '90%',
    },
    button: {
        borderRadius: 23,
        width: 180,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.RED_TREAS,
        marginVertical: 15,
    },
    buttonText: {
        color: colors.WHITE,
        fontWeight: '500',
        fontSize: 18,
    },
});

export default PreLogin;
