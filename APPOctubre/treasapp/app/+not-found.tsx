import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any>;

const NotFoundScreen = ({ navigation }: Props) => {

  const navigateHome = () => { // Corregir aquí: usar () => para definir la función
  
      navigation.navigate("Map");
  };

  return (
    <ImageBackground
      source={require('./../assets/images/bg.jpg')}
      style={styles.backgroundImage}
    >
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
         Estamos solucionando tu problema vuelve pronto 
        </ThemedText>
        <TouchableOpacity onPress={navigateHome}>
          <ThemedText type="link" style={styles.link}>
            Go to home screen!
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch' as needed
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo semi-transparente para mejorar legibilidad
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // Color de texto blanco para contraste
    textAlign: 'center',
  },
  link: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 15,
  },
});

export default NotFoundScreen;