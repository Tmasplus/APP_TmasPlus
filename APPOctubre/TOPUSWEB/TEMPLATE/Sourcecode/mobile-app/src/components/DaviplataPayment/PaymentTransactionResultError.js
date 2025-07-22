import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { colors } from "../../common/theme";
import React from "react";
import { useNavigation } from '@react-navigation/native';

const PaymentTransactionResultError = ({ transactionResult, redirectSuccessTransaction = 'Map' }) => {
    const navigation = useNavigation();

    // Función para formatear la fecha
    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };


    return <View style={styles.container}>
        <View style={styles.dataBuyContainer}>
            <View style={styles.transactionContainer}>
                
                <Text style={styles.textTitleTransaction}>Error en la Transacción</Text>
            </View>
            <Text style={{ marginBottom: 15 }}>La compra no se ha realizado con exitosamente.</Text>
            <View style={styles.resultContainer}>
                <Text style={styles.resultName}>Fecha:</Text>
                <Text
                    style={{ marginBottom: 10 }}>  {formatDate(new Date())} {/*new Date(transactionResult?.fechaTransaccion)?.toLocaleString()*/}</Text>
            </View>
            <View style={styles.resultContainer}>
                <Text style={styles.resultName}>Número de aprobación:</Text>
                <Text style={{ marginBottom: 10 }}>{/*transactionResult?.numAprobacion*/} </Text>
            </View>
            <View style={styles.resultContainer}>
                <Text style={styles.resultName}>Estado:</Text>
                <Text style={{ marginBottom: 10 }}>  CANCELADO {transactionResult?.estado}</Text>
            </View>
            <View style={styles.resultContainer}>
                <Text style={styles.resultName}>Monto:</Text>
                <Text style={{ marginBottom: 10 }}>  ${/*transactionResult?.estado*/} CANCELADO </Text>
            </View>
            <TouchableOpacity style={styles.containerButtonEnd} onPress={() =>  props.navigation.goBack()
            }>
                <Text style={styles.textBuyButtonEnd}>Volver</Text>
            </TouchableOpacity>
        </View>
    </View>
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        backgroundColor: colors.WHITE,
        alignItems: 'center',
        display: 'flex',
    },
    titleResult: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionContainer: {
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'center'
    },
    dataBuyContainer: {
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        padding: 18,
        paddingBottom: 50,
        borderRadius: 10,
        position: 'relative'
    },
    textTitleTransaction: {
        color: 'red',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 15
    },
    resultContainer: {
        flexDirection: 'row',
    },
    resultName: {
        fontWeight: 'bold',
        marginRight: 5
    },
    containerButtonEnd: {
        borderRadius: 10,
        width: "80%",
        padding: 8,
        backgroundColor: colors.RED_TREAS,
        position: 'absolute',
        bottom: -15,
        left: 22,
    },
    textBuyButtonEnd: {
        fontFamily: 'Roboto-Bold',
        fontWeight: 'bold',
        fontSize: 15,
        color: colors.WHITE,
        marginVertical: 1,
        marginHorizontal: 70,
        textAlign: 'center'
    },
})
export default PaymentTransactionResultError;