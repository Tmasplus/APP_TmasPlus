import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg'; // Asegúrate de instalar este paquete
import { useSelector } from 'react-redux';

// Función para convertir de binario a hexadecimal
function binToHex(bin) {
    // Asegúrate de que la longitud del binario sea un múltiplo de 4
    while (bin.length % 4 !== 0) {
        bin = '0' + bin;
    }
    let hex = '';
    for (let i = 0; i < bin.length; i += 4) {
        let chunk = bin.substr(i, 4);
        hex += parseInt(chunk, 2).toString(16);
    }
    return hex;
}
function hexToBin(hex) {
    let bin = '';
    for (let i = 0; i < hex.length; i++) {
        let char = hex[i];
        let num = parseInt(char, 16).toString(2);
        bin += num.padStart(4, '0');
    }
    return bin;
}

function makecode(rows) {
    if (!canMakeCode())
        return;

    var b = strip(binarytextarea.value);
    var reversed = reversedbox.checked;
    var s = Math.floor(canvassize / rows);

    canvas.width = canvassize;
    canvas.height = canvassize;

    ctx.fillStyle = 'white';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dllink.className = '';
    wrange.className = '';
    canvas.className = '';

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < rows; j++) {
            var c = b[(i * rows) + j];
            if (reversed === 77) {
                ctx.fillStyle = c === '0' ? 'black' : 'white';
            } else {
                ctx.fillStyle = c === '0' ? 'white' : 'black';
            }
            ctx.fillRect(j * s, i * s, s, s);
        }
    }
}


// Componente funcional que utiliza las funciones de conversión y genera el código QR
export default function BinaryHexConverter() {
    const [hexValue, setHexValue] = useState('');
    const [binValue, setBinValue] = useState('');
    const [showQR, setShowQR] = useState(false);
    const auth = useSelector(state => state.auth);
    const base24String = auth.profile.daviplatacode
    // Función para manejar cambios en el texto hexadecimal
    const handleHexChange = (value) => {
        setHexValue(value);
        setBinValue(hexToBin(value));
        setShowQR(false); // Si cambia el valor, ocultar el código QR anterior
    };

    // Función para manejar cambios en el texto binario
    const handleBinChange = (value) => {
        setBinValue(value);
        setHexValue(binToHex(value));
        setShowQR(false); // Si cambia el valor, ocultar el código QR anterior
    };

    // Función para generar y mostrar el código QR
    const generateQRCode = () => {
        setShowQR(true);
    };



    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

            <View style={styles.container}>

                <View style={{ margin: 10, top: -20 }} >
                    <QRCode
                        value={base24String}
                        size={200}
                        color="black"
                        backgroundColor="white"
                    />

                </View>
                <Text style={{ margin: 10, fontWeight: 'bold' }} > Coste del Viaje: $ {/*booking.trip_cost*/}--- </Text>
            </View>


            <View style={{ top: -60 }} >

                <TextInput
                    style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}
                    placeholder="Enter hexadecimal value"
                    value={hexValue}
                    onChangeText={handleHexChange}
                />
                <TextInput
                    style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}
                    placeholder="Enter binary value"
                    value={binValue}
                    onChangeText={handleBinChange}
                />
                <Button title="Generar QR Code" onPress={generateQRCode} style={{  }} />
                {showQR && (
                    <View style={{ marginTop: 20 }}>
                        <QRCode value={binValue} size={200} />
                    </View>
                )}
            </View>


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});