import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../common/theme';
import * as Notifications from 'expo-notifications';

var { width, height } = Dimensions.get('window');

const Suscription = (props) => {
  const auth = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [balance, setBalance] = useState(auth.profile?.walletBalance || 0);
  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    if (balance < 5000) {
      scheduleNotification('Alerta', 'Tu saldo en la billetera es inferior a 5000. Por favor, recarga tu suscripción.');
    } else if (balance >= 10000) {
      const currentDate = new Date();
      const balanceDate = new Date(); // Asumiendo que el balance se actualiza en este momento

      balanceDate.setDate(balanceDate.getDate() + 30);

      const remainingDays = Math.ceil((balanceDate - currentDate) / (1000 * 60 * 60 * 24));

      if (remainingDays <= 5 && remainingDays > 0) {
        scheduleNotification('Recordatorio', `Quedan ${remainingDays} día(s) o menos para que expire tu suscripción.`);
      }
    }
  }, [balance]);

  useEffect(() => {
    if (auth.profile && auth.profile.uid) {
      setProfileData({ ...auth.profile });
    }
  }, [auth.profile]);

  const scheduleNotification = (title, message) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: message,
      },
      trigger: null,
    });
  };

  const gotopayment = () => {
    props.navigation.push('wallet');
  };
 
  return (
    <View style={styles.mainView}>
      <View style={{ display: 'flex', flexDirection: 'column', width: '100%', height: height }}>
        <View style={{ width: width, height: '20%' }}>
          <Image style={styles.tinyLogo} source={require('../../assets/images/Component3.png')} />
        </View>

        <Text style={{ fontSize: 23, fontWeight: '700', margin: 15, top: 50, position: 'absolute', width: 150, left: 10, color: colors.RED_TREAS }}>
          ¡Renueva tu suscripción!
        </Text>

        <Text style={{ fontSize: 19, fontWeight: '500', margin: 10, top: 10 }}>
          Hola {profileData && profileData.firstName ? profileData.firstName : 'Conductor'}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '500', marginLeft: 10, top: 10 }}>Tu saldo - ${profileData && profileData.walletBalance ? profileData.walletBalance : ''}</Text>

        <Text style={styles.textStyle}>
          La suscripción de kilómetros te permitirá viajar sin preocuparte por los límites, ya que contarás con una generosa cantidad de 500 kilómetros disponibles para disfrutar en tus viajes. Podrás explorar nuevos destinos, realizar múltiples paradas y disfrutar de la libertad de recorrer la distancia que desees.
        </Text>

        <Text style={{ fontSize: 19, fontWeight: '500', margin: 10, top: 100, left: '25%' }}>Planes de Suscripción</Text>

        <View style={{ top: 130, margin: 10, alignItems: 'center' }}>
          <TouchableOpacity onPress={gotopayment} style={{ backgroundColor: colors.RED_TREAS, borderRadius: 13, bottom: 10 }}>
            <Text style={{ color: colors.WHITE, margin: 10 }}>Compra tu suscripción por 30 dias</Text>
          </TouchableOpacity>

          {profileData && profileData.usertype == 'driver' && profileData.carType == 'TREAS-X' ? (
            <TouchableOpacity onPress={gotopayment} style={{ backgroundColor: colors.RED_TREAS, borderRadius: 13 }}>
              <Text style={{ color: colors.WHITE, margin: 10 }}>Compra tu Paquete de 500 kilometros</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

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
    tinyLogo: {
        width: '150%',
        height: '100%',
        left: -190
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
        top: 70,
        width: width - 86,
        left: 45,
        textAlign: 'justify'

    }
});

export default Suscription;
