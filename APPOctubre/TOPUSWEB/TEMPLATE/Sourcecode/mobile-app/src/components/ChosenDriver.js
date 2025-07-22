import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { CheckBox } from 'react-native-elements';
import i18n from 'i18n-js';
import RNPickerSelect from './RNPickerSelect';
import { useSelector } from 'react-redux';
import { colors } from '../common/theme';

const { width } = Dimensions.get('window');

export default function ChosenDriver(props) {
    const { t } = i18n;
    const auth = useSelector(state => state.auth);
    const bookings = useSelector(state => state.bookinglistdata.bookings);
    const [chosenDriver, setChosenDriver] = useState(null);
    const [driversList, setDriversList] = useState([]);
    useEffect(() => {
        if (bookings && bookings.length > 0) {
            const uniqueDrivers = Array.from(new Set(bookings.map(booking => booking.driver)));
    
            if (uniqueDrivers.length > 0) {
                // Filtrar primero antes de mapear para evitar incluir conductores no deseados
                const validDrivers = uniqueDrivers.filter(driver => {
                    const driverName = bookings.find(booking => booking.driver === driver)?.driver_name;
                    return driverName && driverName !== 'undefined'; // Asegurarse de que el nombre no sea undefined
                });
    
                const mappedDrivers = validDrivers.map(driver => {
                    return {
                        label: bookings.find(booking => booking.driver === driver)?.driver_name,
                        value: driver
                    };
                });
    
                setDriversList(mappedDrivers);
            } else {
                setDriversList([]);
                handleChoseDriver(null);  // Reinicia el conductor elegido si no hay conductores
            }
        } else {
            setDriversList([]);
            handleChoseDriver(null);  // Reinicia el conductor elegido si no hay bookings
        }
    }, [bookings]);
    
    
    // Asegúrate de validar el valor antes de establecerlo como chosenDriver
    const handleValueChange = (value) => {
        if (value !== null && driversList.some(driver => driver.value === value)) {
            handleChoseDriver(value);
        } else {
            handleChoseDriver(null);
        }
    };
   
    const handleChoseDriver = (value) => {
        setChosenDriver(value);
    };
  
    
   
    
    return (
        <View style={[auth && auth.profile && auth.profile.firstName && auth.profile.lastName && auth.profile.email ? styles.view : styles.bottomContainer1, { flexDirection: 'column', width: '100%' }]} >
            <CheckBox
                checkedColor={colors.MAIN_COLOR}
                uncheckedColor='black'
                title={t('chosen_driver')}
                checked={chosenDriver !== null}
                onPress={() => handleChoseDriver(!chosenDriver)}
                textStyle={{ fontSize: 16, color: colors.BLACK }}
            />
            {chosenDriver !== null && (
                <View style={{ flexDirection: 'column', width: '100%', marginTop: 10 }} >
                    <RNPickerSelect
                        placeholder={driversList.length > 0 ? { label: 'Selecciona tu conductor', value: null } : { label: 'No hay conductores', value: null }}
                        onValueChange={handleValueChange}
                        items={driversList}
                        style={{
                            inputIOS: styles.inputStyle,
                            inputAndroid: styles.inputStyle,
                            placeholder: {
                                color: colors.DRIVER_TRIPS_TEXT
                            }
                        }}
                        useNativeAndroidPickerStyle={false}
                        value={chosenDriver}
                    />
                </View>
            )}
        </View>
    );
    
                    }
const styles = StyleSheet.create({
    inputStyle: {
        borderWidth: 1,
        borderColor: colors.BACKGROUND_PRIMARY,
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        width: '100%',
        textAlign: 'left',
        fontSize: 16,
        color: colors.MAIN_COLOR
    },
    bottomContainer1: {
        alignItems: 'center',
    },
    view: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        backgroundColor: colors.WHITE,
        marginTop: 5
    }
});