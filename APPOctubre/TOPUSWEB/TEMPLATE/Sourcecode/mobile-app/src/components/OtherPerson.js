import React from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { colors } from '../common/theme';
import { Input, CheckBox } from 'react-native-elements';
import i18n from 'i18n-js';
import RNPickerSelect from './RNPickerSelect';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

export default function OtherPerson(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const auth = useSelector(state => state.auth);
    const { otherPerson, setInstructionData, setOtherPerson, instructionData } = props;

    const handleFamilyMemberSelect = (value) => {
        // Find the selected family member in auth.profile.myfamily
        const selectedMember = Object.values(auth.profile.myfamily).find(member => member.Name === value);

        // Update instructionData with selected member's details
        if (selectedMember) {
            setInstructionData({
                ...instructionData,
                otherPerson: value,
                otherPersonPhone: selectedMember.mobile // Update otherPersonPhone with selected member's mobile number
            });
        } else {
            setInstructionData({
                ...instructionData,
                otherPerson: value,
                otherPersonPhone: '' // Reset otherPersonPhone if no member is selected
            });
        }
    };

    return (
        <View style={[auth && auth.profile && auth.profile.firstName && auth.profile.lastName && auth.profile.email ? styles.view : styles.bottomContainer1, { flexDirection: 'column', width: '100%' }]} >
            <CheckBox
                center
                checkedColor={colors.MAIN_COLOR}
                uncheckedColor='black'
                title={t('for_other_person')}
                checked={otherPerson}
                onPress={() => setOtherPerson(!otherPerson)}
                textStyle={{ fontSize: 16, color: colors.BLACK }}
            />
            {otherPerson && auth.profile.myfamily && Object.keys(auth.profile.myfamily).length > 0 ?
                <View style={{ flexDirection: 'column', width: '100%', marginTop: 10 }} >
                    <RNPickerSelect
                        placeholder={{ label: t('select_family_member'), value: null }}
                        onValueChange={handleFamilyMemberSelect}
                        items={Object.keys(auth.profile.myfamily).map(uid => ({
                            label: `${auth.profile.myfamily[uid].parentage} - ${auth.profile.myfamily[uid].Name}`,
                            value: auth.profile.myfamily[uid].Name
                        }))}
                        style={{
                            inputIOS: styles.inputStyle,
                            inputAndroid: styles.inputStyle,
                            placeholder: {
                                color: colors.DRIVER_TRIPS_TEXT
                            }
                        }}
                        useNativeAndroidPickerStyle={false}
                    />
                </View>
                :
                <Text style={styles.inputStyle}>No hay familia disponible</Text>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    inputStyle: {
        borderWidth: 1,
        borderColor: colors.BACKGROUND_PRIMARY,
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        width: '100%',
        textAlign: 'left',
        fontSize: 16,
        color: colors.MAIN_COLOR
    },
    bottomContainer1: {
        alignItems: 'center',
        overflow: 'hidden',
    },
    view: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        backgroundColor: colors.WHITE,
        marginTop: 5
    }
});