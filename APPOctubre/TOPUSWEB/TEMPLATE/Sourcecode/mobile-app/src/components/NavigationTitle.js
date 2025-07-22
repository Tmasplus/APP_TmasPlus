
import React from 'react';
import { Text } from 'react-native';

const NavigationTitle = ({ title, color = 'white', fontSize = 18 }) => {
    return (
        <Text allowFontScaling={false} style={{ color, fontSize, fontWeight: 'bold', textAlign: 'center' }}>
            {title}
        </Text>
    );
};

export default NavigationTitle;
