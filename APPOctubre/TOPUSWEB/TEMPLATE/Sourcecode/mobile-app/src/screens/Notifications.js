import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Button } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../common/theme';
import { useSelector } from 'react-redux';
import i18n from 'i18n-js';
import moment from 'moment/min/moment-with-locales';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SECONDORY_COLOR } from '../common/sharedFunctions';

export default function Notifications(props) {
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const notificationdata = useSelector(state => state.notificationdata);
    const [data, setData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState(null);

    useEffect(() => {
        if (notificationdata.notifications) {
            setData(notificationdata.notifications);
            if (notificationdata.notifications.length > 0) {
                const latestNotification = notificationdata.notifications[0];
                setCurrentNotification(latestNotification);
                setModalVisible(true);
            }
        } else {
            setData([]);
        }
    }, [notificationdata.notifications]);

    const show = (item) => {
        setCurrentNotification(item);
        setModalVisible(true);
    };

    const newData = ({ item }) => {
        return (
            <View style={styles.container}>
                <View style={[styles.divCompView, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>

                    <View style={styles.vew2}>
                        <MaterialCommunityIcons name="car-parking-lights" size={33} color={colors.HEADER} />
                    </View>

                    <TouchableOpacity onPress={() => show(item)} style={styles.statusView}>
                        <View style={styles.textContainer}>
                            <Text numberOfLines={1} style={[styles.textStyle, { textAlign: isRTL ? 'right' : 'left' }]}>{item.title}</Text>
                            <Text style={[styles.textStyleBold, { textAlign: isRTL ? 'right' : 'left' }]}>{item.msg}</Text>
                        </View>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <Icon
                                iconStyle={styles.iconPositionStyle}
                                name='clock'
                                type='octicon'
                                size={15}
                                color={colors.RIDELIST_TEXT}
                            />
                            <Text style={[styles.textStyle, [isRTL ? { paddingRight: 5, color: colors.FOOTERTOP, fontSize: 12 } : { paddingLeft: 5, color: colors.FOOTERTOP, fontSize: 12 }]]}>{moment(item.dated).format('ll')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={data}
                renderItem={newData}
            />
            {currentNotification && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalView}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{currentNotification.title}</Text>
                            <Text style={styles.modalMessage}>{currentNotification.msg}</Text>
                            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    divCompView: {
        borderRadius: 10,
        backgroundColor: colors.WHITE,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2,
        elevation: 2,
        marginHorizontal: 10,
        marginVertical: 5,
        alignItems: 'center'
    },
    statusView: {
        flex: 1,
        flexDirection: 'column',
        height: "100%",
        borderRadius: 10,
        padding: 8
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        height: "100%",
        borderRadius: 10,
        marginBottom: 8
    },
    textStyle: {
        fontSize: 13,
        fontFamily: 'Roboto-Regular'
    },
    textStyleBold: {
        fontSize: 13,
        fontFamily: 'Roboto-Bold'
    },
    iconPositionStyle: {
        alignSelf: 'flex-start'
    },
    vew2: {
        padding: 6,
        marginHorizontal: 5,
        backgroundColor: SECONDORY_COLOR,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        width: 50,
        height: 50,
        justifyContent: 'center'
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20
    },
    buttonText: {
        backgroundColor: colors.RED_TREAS,
        padding:10,
        fontSize: 16,
        fontWeight: 'bold',
       color: 'white',
       borderRadius: 10
    }
});
