import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { colors } from '../common/theme';



const Instructive = () => {
    const video = React.useRef(null);
    const [status, setStatus] = React.useState({});

    return (
        <View style={styles.container}>
            <Video
                ref={video}
                style={styles.video}
                source={
                    require('./../../assets/video/instructivo.mp4')
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
    },
    video: {
        alignSelf: 'center',
        width: 500,
        height: 750,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    },
});

export default Instructive;