import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { colors } from '../common/theme';


const TourPage = () => {

    const video = useRef(null);
    const [status, setStatus] = useState({});

    return (
        <View style={styles.container}>
            <Video
                ref={video}
                style={styles.video}
                source={
                    require('./../../assets/video/RegistroConductor.mp4')
                }
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                onPlaybackStatusUpdate={status => setStatus(() => status)}
            />
            <View style={styles.buttons}>
                <TouchableOpacity


                    onPress={() =>
                        status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
                    }
                    style={{ height: '100%', backgroundColor: colors.RED_TREAS, width: '80%', borderRadius: 10, alignSelf: 'center', display: 'flex', alignItems: 'center', }}


                >
                    <Text style={{ margin: 10, color: colors.WHITE }} >  {status.isPlaying ? 'Pause' : 'Reproducir'} </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
    },
    video: {
        alignSelf: 'center',
        width: 500,
        height: 650,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    },
});
export default TourPage;