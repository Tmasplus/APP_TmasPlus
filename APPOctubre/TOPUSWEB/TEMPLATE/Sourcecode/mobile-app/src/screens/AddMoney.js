
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TextInput,
  FlatList,
  Dimensions,
  Modal,
  Pressable,
  Linking,
  Image
} from 'react-native';
import { colors } from '../common/theme';
import { Ionicons } from '@expo/vector-icons';

import i18n from 'i18n-js';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
var { width, height } = Dimensions.get('window');


export default function AddMoneyScreen(props) {

  const settings = useSelector(state => state.settingsdata.settings);
  const { userdata, providers } = props.route.params;

  const [state, setState] = useState({
    userdata: userdata,
    providers: providers,
    amount: '',
    qickMoney: [],
  });

  const defaultAmount =  ['5', '10', '20', '50', '100'];

  useEffect(() => {
    let arr = [];
    if (settings && settings.walletMoneyField && settings.walletMoneyField != "") {
      const moneyField = settings.walletMoneyField.split(",");
      for (let i = 0; i < moneyField.length; i++) {
        arr.push({ amount: moneyField[i], selected: false });
      }

    }
    else {
      for (let i = 0; i < defaultAmount.length; i++) {
        arr.push({ amount: defaultAmount[i], selected: false });
      }
    }
    setState({ ...state, amount: arr[0].amount, qickMoney: arr });
  }, [settings]);

  const quckAdd = (index) => {
    let quickM = state.qickMoney;
    for (let i = 0; i < quickM.length; i++) {
      quickM[i].selected = false;
      if (i == index) {
        quickM[i].selected = true;
      }
    }
    setState({
      ...state,
      amount: quickM[index].amount,
      qickMoney: quickM
    })
  }

  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const reference = [...Array(4)].map(_ => c[~~(Math.random() * c.length)]).join('');

  const payNow = () => {
    if (parseFloat(state.amount) >= 1) {
      var d = new Date();
      var time = d.getTime();
      let payData = {
        email: state.userdata.email,
        amount: state.amount,
        order_id: "wallet-" + state.userdata.uid + "-" + reference,
        name: t('add_money'),
        description: t('wallet_ballance'),
        currency: settings.code,
        quantity: 1,
        paymentType: 'walletCredit'
      }
      if (payData) {
        props.navigation.navigate("paymentMethod", {
          payData: payData,
          userdata: state.userdata,
          settings: state.settings,
          providers: state.providers
        });
      }
    } else {
      Alert.alert(t('alert'), t('valid_amount'));
    }
  }


  const payDaviplata = () => {
    if (parseFloat(state.amount) >= 1) {
      var d = new Date();
      var time = d.getTime();
      let payData = {
        email: state.userdata.email,
        amount: state.amount,
        order_id: "wallet-" + state.userdata.uid + "-" + reference,
        name: t('add_money'),
        description: t('wallet_ballance'),
        currency: settings.code,
        quantity: 1,
        paymentType: 'walletCredit'
      }
      if (payData) {
        props.navigation.navigate("DaviplataPayment", {
          redirectSuccessTransaction : 'Wallet',
          payData: payData,
          userdata: state.userdata,
          settings: state.settings,
          providers: state.providers
        });
      }
    } else {
      Alert.alert(t('alert'), t('valid_amount'));
    }
  }


  const newData = ({ item, index }) => {
    return (
      <TouchableOpacity style={[styles.boxView, { backgroundColor: item.selected ? colors.BUTTON_BACKGROUND : colors.BACKGROUND_PRIMARY }]} onPress={() => { quckAdd(index); }}>
        {settings.swipe_symbol === false ?
          <Text style={[styles.quckMoneyText, { color: item.selected ? colors.WHITE : colors.BLACK }]} >{settings.symbol}{item.amount}</Text>
          :
          <Text style={[styles.quckMoneyText, { color: item.selected ? colors.WHITE : colors.BLACK }]} >{item.amount}{settings.symbol}</Text>
        }
      </TouchableOpacity>
    )
  }


  const [isModalOpen, setIsModalOpen] = useState({
    button1: false,
    button2: false,
    button3: false,
    button4: false,
    button5: false,
  });

  const openModal = (buttonName) => {
    setIsModalOpen({ ...isModalOpen, [buttonName]: true });
  };

  const closeModal = (buttonName) => {
    setIsModalOpen({ ...isModalOpen, [buttonName]: false });
  };

  const PoliciesButton = () => {

    const policiesURL = 'https://treasapp.com/condiciones-recargas'; // Reemplaza con tu URL de políticas
    Linking.openURL(policiesURL);


  }

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

  return (
    <View style={styles.mainView}>

      <View style={styles.bodyContainer}>
        <View style={[isRTL ? { flexDirection: 'row-reverse', alignItems: 'center' } : { flexDirection: 'row', alignItems: 'center' }]}>
          <Text style={styles.walletbalText}>{t('Balance')} </Text>

          {settings.swipe_symbol === false ?
            <Text style={styles.ballance}>{settings.symbol}{state.userdata ? parseFloat(state.userdata.walletBalance).toFixed(settings.decimal) : ''}</Text>
            :
            <Text style={styles.ballance}>{state.userdata ? parseFloat(state.userdata.walletBalance).toFixed(settings.decimal) : ''}{settings.symbol}</Text>
          }
        </View>
        <View style={styles.inputTextStyle}>
          <TextInput
            style={isRTL ? { textAlign: 'right', fontSize: 30 } : { textAlign: 'left', fontSize: 30 }}
            placeholder={t('addMoneyTextInputPlaceholder') + " (" + settings.symbol + ")"}
            keyboardType={'number-pad'}
            onChangeText={(text) => setState({ ...state, amount: text })}
            value={state.amount}
          />
        </View>
        <View style={styles.quickMoneyContainer}>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={state.qickMoney}
            renderItem={newData}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
          />
        </View>
        <TouchableOpacity
          style={styles.buttonWrapper23}
          onPress={payNow}>
          <Image source={require('./../../assets/payment-icons/payulatam-logo.png')}  />
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.buttonWrapper23}
          onPress={payDaviplata}>
         <Image source={require('./../../assets/payment-icons/daviplata-logo.png')} style={{ width: 200, height: 100 }} />
        </TouchableOpacity>





        <View style={{ display: 'flex', flexDirection: 'column', width: '100%', height: height, top: 10 }}>
          {userdata && userdata.usertype === 'customer' ? (
            <Text style={styles.textStyle}>
              Por favor digita el valor de tu servicio conforme a la liquidación presentada al final de tu servicio.  Si deseas realizar una recarga para utilizar nuestra billetera por favor digita el valor que deseas recargar y luego "Añadir dinero"
            </Text>
          ) : null}


          {userdata && userdata.usertype === 'driver' ? (
            <View style={styles.container}>

              {userdata && userdata.carType === 'TREAS-X' ?
                <TouchableOpacity onPress={() => openModal('button1')} style={styles.packageButton}>
                  <Text style={styles.packageButtonText}>
                    <Ionicons name="cash" size={24} color="white" />
                    {' '} $15.000 COP  {' '}
                    <Ionicons name="cash" size={24} color="white" />
                  </Text>
                </TouchableOpacity>
                : null}
              {userdata && userdata.carType === 'TREAS-T' ?
                <TouchableOpacity onPress={() => openModal('button2')} style={styles.packageButton}>
                  <Text style={styles.packageButtonText}>
                    <Ionicons name="cash" size={24} color="white" />
                    {' '} $36.000 COP  {' '}
                    <Ionicons name="cash" size={24} color="white" />
                  </Text>
                </TouchableOpacity>
                : null}
              {userdata && userdata.carType === 'TREAS-X' ?
                <TouchableOpacity onPress={() => openModal('button3')} style={styles.packageButton}>
                  <Text style={styles.packageButtonText}>
                    <Ionicons name="cash" size={24} color="white" />
                    {' '} $48.000 COP  {' '}
                    <Ionicons name="cash" size={24} color="white" />
                  </Text>
                </TouchableOpacity>
                : null}
              <TouchableOpacity onPress={() => openModal('button4')} style={styles.packageButton}>
                <Text style={styles.packageButtonText}>
                  <Ionicons name="cash" size={24} color="white" />
                  {' '} $96.000 COP  {' '}
                  <Ionicons name="cash" size={24} color="white" />
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={PoliciesButton} style={{ top: 20 }} >
                <Text style={{ color: colors.RED_TREAS, fontSize: 23, fontWeight: '500', textAlign: 'center', top: 5, left: 4, margin: 10 }}>POLÍTICAS DE RECARGA</Text>
              </TouchableOpacity>



              <Modal
                animationType="slide"
                transparent={true}
                visible={isModalOpen['button1']}
                onRequestClose={() => closeModal('button1')}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 15, fontSize: 28 }} >$15.000</Text>
                    <Text>Esta recarga te brinda acceso a la aplicación hasta que se gaste la recarga con servicios prestados por la aplicación" $5.000 es el costo del Hosting y $10.000 que se consumirán con seguros</Text>
                    <Pressable onPress={() => closeModal('button1')} style={[styles.button, styles.buttonClose, { marginTop: 20 }]} >
                      <Text style={styles.textStyle}>Volver</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>

              <Modal
                animationType="slide"
                transparent={true}
                visible={isModalOpen['button2']}
                onRequestClose={() => closeModal('button2')}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 15, fontSize: 28 }} >$36.000</Text>
                    <Text>Esta recarga te brinda acceso a la aplicación hasta que se gaste la recarga con servicios prestados por la aplicación" $5.000 es el costo del Hosting y $31.000 que se consumirán con seguros</Text>
                    <Pressable onPress={() => closeModal('button2')} style={[styles.button, styles.buttonClose, { marginTop: 20 }]} >
                      <Text style={styles.textStyle}>Volver</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>

              <Modal
                animationType="slide"
                transparent={true}
                visible={isModalOpen['button3']}
                onRequestClose={() => closeModal('button3')}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 15, fontSize: 28 }} >$48.000</Text>
                    <Text>Esta recarga te brinda acceso a la aplicación hasta que se gaste la recarga con servicios prestados por la aplicación" $5.000 es el costo del Hosting y $43.000 que se consumirán con 250 kms seguros.</Text>
                    <Pressable onPress={() => closeModal('button3')} style={[styles.button, styles.buttonClose, { marginTop: 20 }]} >
                      <Text style={styles.textStyle}>Volver</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>

              <Modal
                animationType="slide"
                transparent={true}
                visible={isModalOpen['button4']}
                onRequestClose={() => closeModal('button4')}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 15, fontSize: 28 }} >$96.000</Text>
                    <Text>Esta recarga te brinda acceso a la aplicación hasta que se gaste la recarga con servicios prestados por la aplicación" $5.000 es el costo del Hosting y $91.000 que se consumirán con 500 kms de seguros.</Text>
                    <Pressable onPress={() => closeModal('button4')} style={[styles.button, styles.buttonClose, { marginTop: 20 }]} >
                      <Text style={styles.textStyle}>Volver</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>


            </View>
          ) : null}
        </View>
      </View>
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

  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  bodyContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 12
  },
  walletbalText: {
    fontSize: 20,
    margin: 10,
  },
  ballance: {
    fontWeight: 'bold',
    fontSize: 20,
    //margin: 10,
  },
  inputTextStyle: {
    marginTop: 1,
    height: 40,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,

  },
  buttonWrapper2: {
    marginBottom: 10,
    marginTop: 18,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.RED_TREAS,
    borderRadius: 8,
  },
  buttonWrapper23: {
    marginBottom: 10,
    marginTop: 18,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 8,
  },
  buttonTitle: {
    color: colors.WHITE,
    fontSize: 18,
  },
  quickMoneyContainer: {
    marginTop: 18,
    flexDirection: 'row',
    paddingVertical: 4,
    paddingLeft: 6,
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
  },
  boxView: {
    height: 40,
    width: 85,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  quckMoneyText: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  textStyle: {
    color: colors.CONVERTDRIVER_TEXT,
    fontFamily: 'Roboto-Bold',
    fontSize: 13,
    top: 70,
    width: width - 86,
    left: 45,
    textAlign: 'justify'
  },
  textdriver: {
    marginLeft: 15,
    top: 20,
    color: colors.CONVERTDRIVER_TEXT,
    fontFamily: 'Roboto-Bold',
    fontSize: 13,
  },
  titledriver: { fontSize: 18, color: colors.RED_TREAS, margin: 5, fontWeight: '600' },
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
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: colors.RED_TREAS,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    textAlign: 'justify'
  },
  flatListContainer: {
    // Agrega aquí los estilos que desees para el contenedor de la FlatList
    // Por ejemplo:
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    // ... otros estilos
  },

  packageButton: {
    backgroundColor: colors.RED_TREAS,
    borderRadius: 13,
    marginTop: 10,
    width: 180,
    marginBottom: 10,
  },
  packageButtonText: {
    color: colors.WHITE,
    margin: 10,
    textAlign: 'center',
  },


});
