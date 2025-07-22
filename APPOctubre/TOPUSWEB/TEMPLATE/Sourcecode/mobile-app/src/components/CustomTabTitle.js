import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomTabTitle = ({ title }) => {
    return (
        <Text allowFontScaling={false} style={styles.title}>
            {title}
        </Text>
    );
};

const styles = StyleSheet.create({
    title: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
    },
});

export default CustomTabTitle;
