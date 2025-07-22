import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { api } from 'common';
import RNPickerSelect from '../components/RNPickerSelect';
import i18n from 'i18n-js';
import { colors } from '../common/theme';
import { MAIN_COLOR } from '../common/sharedFunctions';


const MyFamily = () => {
    const auth = useSelector(state => state.auth);
    const [modalVisible, setModalVisible] = useState(false);
    const myFamily = auth.profile.myfamily || {};
    const {
        updateProfile
    } = api;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verifyId, setVerifyId] = useState('');
    const [relationship, setRelationship] = useState('');
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const dispatch = useDispatch();
    const handleAddToFamily = () => {
        setModalVisible(true)
     
    };

    const handleAddMember = () => {
        if (!name || !phoneNumber || !verifyId || !relationship) {
            console.log('Por favor, completa todos los campos');
            return;
        }
        if (Object.values(myFamily).some(member => member.mobile === phoneNumber)) {
            console.log('Esta persona ya está en tu familia');
            return;
        }
        const newMember = {
            Name: name,
            mobile: phoneNumber,
            parentage: relationship,
            verifyId: verifyId,
            email: email
        };

        const updatedFamily = { ...myFamily, [phoneNumber]: newMember };
        dispatch(updateProfile({ myfamily: updatedFamily }));

        setName('');
        setPhoneNumber('');
        setVerifyId('');
        setRelationship('');
        setModalVisible(false);
    };



    const handleRemoveMember = (phoneNumber) => {
        Alert.alert(
            'Eliminar miembro',
            '¿Estás seguro de que quieres eliminar a este miembro de tu grupo familiar?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    onPress: () => {
                        const updatedFamily = { ...myFamily };
                        delete updatedFamily[phoneNumber];
                        dispatch(updateProfile({ myfamily: updatedFamily }));
                    },
                },
            ],
            { cancelable: false }
        );
    };

  
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.searchContainer}>
                <Text style={styles.heading}>Miembros actuales de mi familia:</Text>
                {Object.keys(myFamily).map(uid => (
                <TouchableOpacity key={uid} onPress={() => handleRemoveMember(uid)}>
                    <View key={uid} style={styles.card}>
                        <Image
                            style={styles.image}
                            source={{ uri: myFamily[uid].Image }}
                        />
                        <View style={{ display: 'flex', flexDirection: 'column', marginHorizontal: 15 }} >
                            <Text style={styles.name}>{myFamily[uid].Name}</Text>
                            <Text style={styles.parentage}>Teléfono: {myFamily[uid].mobile}</Text>
                            <Text style={styles.parentage}>Parentesco: {myFamily[uid].parentage}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                ))}
            </View>

            <View style={{ width: '100%', alignItems: 'center' }} >
                <TouchableOpacity style={[styles.registerButton, { marginTop: 30, alignItems: 'center', justifyContent: 'center' }]} onPress={handleAddToFamily}>
                    <Text style={{ color: colors.WHITE, fontWeight: '700' }} > Añadir miembro </Text>
                </TouchableOpacity>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalHeading}>Agregar a la familia:</Text>
                        <TextInput
                            textAlign={isRTL ? 'right' : 'left'}
                            style={[styles.textInputStyle]}
                            placeholder="Nombre completo"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={[styles.textInputStyle]}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                          
                        />
                         <TextInput
                            style={[styles.textInputStyle]}
                            placeholder="Número de teléfono"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            textAlign={isRTL ? 'right' : 'left'}
                            style={[styles.textInputStyle]}
                            placeholder="Número de documento"
                            value={verifyId}
                            onChangeText={setVerifyId}
                            keyboardType="phone-pad"
                        />
                        <RNPickerSelect
                            style={pickerSelectStyles}
                            placeholder={{
                                label: 'Seleccionar parentesco',
                                value: '',
                            }}
                            onValueChange={(value) => setRelationship(value)}
                            items={[
                                { label: 'Madre', value: 'madre' },
                                { label: 'Padre', value: 'padre' },
                                { label: 'Hijo/a', value: 'hijo/a' },
                                { label: 'Hermano/a', value: 'hermano/a' },
                                { label: 'Tio/a', value: 'Tio/a' },
                                { label: 'Abuelo/a', value: 'Abuelo/a' },
                                { label: 'Pareja', value: 'Pareja' },

                                // Agrega más opciones según sea necesario
                            ]}
                        />
                        <View style={{ display: 'flex', flexDirection: 'row-reverse' }} >

                            <TouchableOpacity style={[styles.registerButton, { marginTop: 30, alignItems: 'center', justifyContent: 'center' }]} onPress={handleAddMember}>
                                <Text style={{ color: colors.WHITE, fontWeight: '700' }} > Agregar a mi familia </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.registerButton2, { marginTop: 30, marginRight: 10, alignItems: 'center', justifyContent: 'center' }]} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: colors.WHITE, fontWeight: '700' }} > Cancelar </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    searchContainer: {
        marginBottom: 20,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    card: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        padding: 10,
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row'
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 10,
        borderRadius: 60,
        marginVertical: 5
    },
    name: {
        fontSize: 20,
        color: '#F20505',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    parentage: {
        fontSize: 14,
        marginBottom: 5,
    },
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        width: '100%',
    },
    modalHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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

    textInputStyle: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#f20505',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
        marginVertical: 10,
        width: 370
    },
    buttonStyle: {
        paddingVertical: 3,
        fontSize: 22,
        fontFamily: "Roboto-Bold",
        color: colors.WHITE,
    },
    registerButton: {
        width: 180,
        height: 50,
        borderColor: '#fff',
        borderWidth: 0,
        marginTop: 30,
        borderRadius: 15,
        backgroundColor: '#F20505',
    },

    registerButton2: {
        width: 180,
        height: 50,
        borderColor: '#fff',
        borderWidth: 0,
        marginTop: 30,
        borderRadius: 15,
        backgroundColor: '#333',
    },
    registerButtonClicked: {
        width: '100%',
        borderWidth: 1,
        backgroundColor: colors.WHITE,
        borderColor: MAIN_COLOR,
        borderRadius: 10,
        elevation: 0
    },

    noFamilyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noFamilyImage: {
        width: 400,
        height: 400,
        marginBottom: 20,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#f20505',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
});

export default MyFamily;
