import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../common/theme';
import { Video } from 'expo-av';

export default function AuthLoadingScreen(props) {
  return (
    <View style={styles.container}>
      <Video
        source={require('./../../assets/images/Intro.mp4')} // Ruta de tu video .mp4
        shouldPlay
        isLooping
        resizeMode="cover"
        style={styles.imagebg}
      />
      <ActivityIndicator style={{ paddingBottom: 100 }} color={'#F20505'} size='large' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  imagebg: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: 'center',
    height: '250%',
    width: 'auto',
    top: 120

  }
});