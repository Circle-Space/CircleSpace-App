import {BlurView} from '@react-native-community/blur';
import {isEmpty} from 'lodash';
import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomIcons from '../../../constants/CustomIcons';
import dayjs from 'dayjs';
import {del} from '../../../services/dataRequest';
import apiEndPoints from '../../../constants/apiEndPoints';
import {useDispatch} from 'react-redux';
import {setUpdate} from '../../../redux/reducers/chatSlice';
import { FontFamilies } from '../../../styles/constants';
import {decrementCommentCount} from '../../../redux/slices/commentSlice';

interface CommentDeleteModalProps {
  visible: any;
  setVisible: any;
  fromPrivateChat?: boolean;
  callBack?: any;
  postId: any;
  isReply?: boolean;
  isProject?: boolean;
  selfPost?: boolean;
  currentUserId?: string;
}

const CommentDeleteModal: React.FC<CommentDeleteModalProps> = ({
  visible,
  setVisible,
  fromPrivateChat = false,
  callBack,
  postId,
  isReply = false, 
  isProject = false,
  selfPost = false,
  currentUserId
}) => {
  console.log('selfPostdelete', selfPost)
  //   const [visible, setVisible] = useState(false);
  //'Clear Chat'
  const list = ['Delete'];
  console.log ('isProjectdelete', isProject)

  const values = useSafeAreaInsets();
  const dispatch = useDispatch();
  const handleDeleteComment = async () => {
    Alert.alert('Delete Comment');
    const endpoint = isProject
      ? (isReply
          ? apiEndPoints.deleteProjectReply(postId, visible?.commentId, visible?._id)
          : apiEndPoints.deleteProjectComment(postId, visible?._id))
      : (isReply
          ? apiEndPoints.deleteReply(postId, visible?.commentId, visible?._id)
          : apiEndPoints.deleteComment(postId, visible?._id));

    await del(endpoint, '')
      .then(res => {
        dispatch(setUpdate(Date.now()));
        dispatch(decrementCommentCount(postId));
      })
      .catch(e => {
        console.log('delete comment err', e);
      })
      .finally(() => {
        setVisible(null);
      });
  };
  
  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={!isEmpty(visible)}
        onRequestClose={() => setVisible(null)}>
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
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          />
        )}
        <Pressable
          onPress={() => {
            setVisible(null);
          }}
          style={{
            flex: 1,
            justifyContent: fromPrivateChat ? 'flex-start' : 'center',
            alignItems: 'center',
            backgroundColor: fromPrivateChat
              ? 'transparent'
              : 'rgba(0, 0, 0, 0.5)',
            gap: 10,
          }}>
          <View
            style={
              fromPrivateChat
                ? {
                    width: 250,
                    padding: 0,
                    backgroundColor: 'white',
                    borderRadius: 10,
                    gap: 10,
                    top: values.top + 80,
                    left: 40,
                  }
                : {
                    width: 200,
                    padding: 0,
                    backgroundColor: 'white',
                    borderRadius: 10,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
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
                      handleDeleteComment();
                    }}
                    key={s}
                    style={{
                      borderBottomColor: '#B9B9BB',
                      borderBottomWidth: key === list?.length - 1 ? 0 : 0.5,
                      paddingBottom: key === list?.length - 1 ? 0 : 10,
                    }}>
                    <Text
                      style={{
                        fontWeight: '400',
                        fontSize: 13,
                        color: s === 'Delete' ? '#ED4956' : '#4A4A4A',
                        fontFamily: FontFamilies.medium,
                        textAlign: 'center',
                      }}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <Pressable
            style={{
              alignItems: 'center',
              padding: 20,
              paddingLeft: 25,
              paddingRight: 20,
              paddingTop: 20,
              flexDirection: 'row',
              marginTop: 10,
              width: Dimensions.get('window').width / 1.01,
              backgroundColor: 'white',
            }}>
            <View
              style={{
                position: 'relative',
                width: '15%',
              }}>
              {visible?.userId?.profilePic ? (
                <Image
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderColor: 'gray',
                    borderWidth: 0.2,
                  }}
                  source={{
                    width: 36,
                    height: 36,
                    uri: visible?.userId?.profilePic,
                  }}
                />
              ) : (
                <Image
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderColor: 'gray',
                    borderWidth: 0.2,
                  }}
                  source={{
                    width: 36,
                    height: 36,
                    uri: 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
                  }}
                />
              )}
            </View>
            <View
              style={{
                gap: 8,
                width: '75%',
              }}>
              <Text
                style={{
                  color: '#1E1E1E',
                  fontFamily: FontFamilies.medium,
                  fontWeight: '400',
                  fontSize: 13,
                }}>
                {visible?.userId?.username}
                {'  '}
                <Text
                  style={{
                    color: '#828282',
                    fontFamily: FontFamilies.medium,
                    fontWeight: '400',
                    fontSize: 11,
                    marginLeft: 10,
                  }}>
                  {dayjs(visible?.createdAt)
                    .diff(Date.now(), 'day')
                    ?.toString() === '0'
                    ? ''
                    : dayjs(visible?.createdAt).diff(Date.now(), 'day')}
                </Text>
              </Text>
              <Text
                numberOfLines={3}
                style={{
                  color: '#4A4A4A',
                  fontFamily: FontFamilies.medium,
                  fontWeight: '400',
                  fontSize: 11,
                  maxHeight: 100,
                  lineHeight: 15,
                }}>
                {visible?.text}
              </Text>
            </View>
            {/* <View
              style={{
                gap: 10,
                width: '15%',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 0,
                  justifyContent: 'flex-end',
                }}>
                <TouchableOpacity>
                  <CustomIcons type="HEART" width={15} height={15} />
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  color: '#828282',
                  fontFamily: FontFamilies.medium,
                  fontWeight: '400',
                  fontSize: 12,
                  textAlign: 'right',
                }}>
                {visible?.likes}
              </Text>
            </View> */}
          </Pressable>
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

export default CommentDeleteModal;
