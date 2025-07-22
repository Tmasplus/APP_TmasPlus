import React, { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import AppContainer from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  LogBox
} from "react-native";
import { Provider } from "react-redux";
import {
  FirebaseProvider,
  store
} from 'common';
import AppCommon from './AppCommon';
import { FirebaseConfig } from './config/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { Video } from 'expo-av';
import * as Sentry from '@sentry/react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';


Sentry.init({
  dsn: 'https://ac5facfb0d476d75e2ff076b3d05081e@o4507296135184384.ingest.us.sentry.io/4507296139640832',
});

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {

  const [assetsLoaded, setAssetsLoaded] = useState(false);


  useEffect(() => {
    (async () => {
      const { status } = await requestTrackingPermissionsAsync();
      if (status === 'granted') {
        // console.log('Yay! I have user permission to track data');
      }
    })();
  }, []);

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    LogBox.ignoreLogs([
      'Setting a timer',
      'SplashScreen.show'
    ])

    const ReactNative = require('react-native');
    try {
      ReactNative.I18nManager.allowRTL(false);
    } catch (e) {
      console.log(e);
    }

    onLoad();
  }, []);

  const _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/background.jpg'),
        require('./assets/images/logo165x90white.png'),
        require('./assets/images/bg.jpg'),
        require('./assets/images/intro.jpg'),
        require('./assets/images/Intro.mp4'),
        require('./assets/images/g4.gif'),
        require('./assets/images/lodingDriver.gif'),
      ]),
      Font.loadAsync({
        'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
        'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
        'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
        'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
        'Ubuntu-Regular': require('./assets/fonts/Ubuntu-Regular.ttf'),
        'Ubuntu-Medium': require('./assets/fonts/Ubuntu-Medium.ttf'),
        'Ubuntu-Light': require('./assets/fonts/Ubuntu-Light.ttf'),
        'Ubuntu-Bold': require('./assets/fonts/Ubuntu-Bold.ttf')
      }),
    ]);
  };

  const onLoad = async () => {
    if (__DEV__) {
      _loadResourcesAsync().then(() => setAssetsLoaded(true));
    } else {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
        _loadResourcesAsync().then(() => setAssetsLoaded(true));
      } catch (error) {
        _loadResourcesAsync().then(() => setAssetsLoaded(true));
      }
    }
  }

  if (!assetsLoaded) {
    return <View style={styles.container}>
      <Video
        source={require('./assets/images/Intro.mp4')} // Ruta de tu video .mp4
        shouldPlay
        isLooping
        resizeMode="cover"
        style={styles.imagebg}
      />
      <ActivityIndicator style={{ paddingBottom: 100 }} color={'#F20505'} size='large' />
    </View>
  }

  return (
    <Provider store={store}>
      <FirebaseProvider config={FirebaseConfig} AsyncStorage={AsyncStorage}>
        <AppCommon>
          <AppContainer />
        </AppCommon>
      </FirebaseProvider>
    </Provider>
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