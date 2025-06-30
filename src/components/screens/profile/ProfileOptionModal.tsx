import {BlurView} from '@react-native-community/blur';
import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface ProfileOptionModalProps {
  visible: boolean;
  setVisible: any;
  fromPrivateChat?: boolean;
  callBack?: any;
  blocked: any;
}
const ProfileOptionModal: React.FC<ProfileOptionModalProps> = ({
  visible,
  setVisible,
  fromPrivateChat = false,
  callBack,
  blocked,
}) => {
  //   const [visible, setVisible] = useState(false);
  //'Clear Chat'
  //'Report','Block', 'Copy profile URL',
  // const list = [ 'Report',blocked?'Unblock':'Block','Send profile', 'Cancel',];
  const list = [ 'Report',blocked?'Unblock':'Block'];

  const values = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}>
        {fromPrivateChat ? null : (
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
            blurType="light"
            blurAmount={1}
            reducedTransparencyFallbackColor="white"
          />
        )}
        <Pressable
          onPress={() => {
            setVisible(false);
          }}
          style={{
            flex: 1,
            justifyContent: fromPrivateChat ? 'flex-start' : 'center',
            alignItems: 'center',
            backgroundColor: fromPrivateChat
              ? 'transparent'
              : 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
          }}>
          <View
            style={
              fromPrivateChat
                ? {
                    width: 250,
                    padding: 0,
                    backgroundColor: '#F3F3F3',
                    borderRadius: 10,
                    gap: 10,
                    top: values.top + 80,
                    left: 40,
                  }
                : {
                    width: 200,
                    padding: 0,
                    backgroundColor: '#F3F3F3',
                    borderRadius: 10,
                    shadowColor: '##00000024',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5, // For Android shadow
                    gap: 10,
                  }
            }>
            <View
              style={{
                gap: 10,
                padding: 15,
                borderRadius: 20,
                paddingLeft: 0,
                paddingRight: 0,
              }}>
              {list?.map((s, key) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (callBack) {
                        callBack(s?.toLowerCase()?.trim());
                      }
                      setVisible(false);
                    }}
                    key={s}
                    style={{
                      borderBottomColor: '#B9B9BB',
                      borderBottomWidth: key === list?.length - 1 ? 0 : 0.5,
                      paddingBottom: key === list?.length - 1 ? 0 : 10,
                      //   paddingLeft: 10,
                    }}>
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: 13,
                        color: ['Block','Report','Unblock'].includes(s) ? '#ED4956' : '#4A4A4A',
                        fontFamily: 'Gilroy-Medium',
                        textAlign: 'center',
                      }}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    width: 200,
    padding: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    gap: 10,
    top: 100,
    left: 60,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default ProfileOptionModal;
