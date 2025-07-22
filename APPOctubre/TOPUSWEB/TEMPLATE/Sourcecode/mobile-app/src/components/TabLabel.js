// TabLabel.js
import React from 'react';
import { Text } from 'react-native';

const TabLabel = ({ focused, color, label }) => {
    return (
        <Text allowFontScaling={false} style={{ color: color, fontSize: 14, textAlign: 'center' }}>
            {label}
        </Text>
    );
};

export default TabLabel;
