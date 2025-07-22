import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

const CustomButton = ({ onPress, title, loading, buttonStyle, titleStyle }) => {
    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={[styles.button, buttonStyle]} 
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text 
                    allowFontScaling={false} 
                    style={[styles.buttonTitle, titleStyle]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row', // Asegura que el contenido se alinee horizontalmente
        alignItems: 'center', // Centra el contenido verticalmente
        justifyContent: 'center', // Centra el contenido horizontalmente
        paddingVertical: 12,
        paddingHorizontal: 16, // Ajusta el espacio horizontal según el tamaño del texto
        borderRadius: 4,
        elevation: 3,
        backgroundColor: 'blue',
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default CustomButton;
