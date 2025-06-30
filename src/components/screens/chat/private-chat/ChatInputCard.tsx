import React, {useRef, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomIcons, {ICONTYPE} from '../../../../constants/CustomIcons';
import {BlurView} from '@react-native-community/blur';
import {
  DocumentPickerResponse,
  pick,
  types,
} from 'react-native-document-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useKeyboardVisible} from '../../../../hooks/useKeyboardVisible';
import {Room} from '../Chats';
import {useSelector} from 'react-redux';
import {ApplicationState} from '../../../../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isArray, isEmpty} from 'lodash';
import chatRequest from '../../../../services/chatRequest';
import apiEndPoints from '../../../../constants/apiEndPoints';
import {
  getFileBlobFromUri,
  uploadFileInChunks,
} from '../../../../services/ChatFileUploads';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import {launchImageLibrary} from 'react-native-image-picker';
import {el, fi} from 'date-fns/locale';
import UploadLoadingModal from './UploadLoadingModal';
import EmojiKeyboard from 'rn-emoji-keyboard';
import { FontFamilies } from '../../../../styles/constants';
import useClickOutside from '../../../../hooks/useOutSideHook';
interface ChatInputCardProps {
  roomData: Room;
}
const ChatInputCard: React.FC<ChatInputCardProps> = ({roomData}) => {
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

  const uploadMenu = [
    {
      name: 'Photo',
      icon: 'GALLERY' as ICONTYPE,
      typs: 'photo',
    },
    {
      name: 'Video',
      icon: 'VIDEOUPLOAD' as ICONTYPE,
      typs: 'video',
    },
    // {
    //   name: 'Audio',
    //   icon: 'AUDIOUPLOAD' as ICONTYPE,
    //   typs: types.audio,
    // },
    {
      name: 'Document',
      icon: 'DOCUMENTUPLOAD' as ICONTYPE,
      typs: [
        types.csv,
        types.doc,
        types.docx,
        types.pdf,
        types.ppt,
        types.pptx,
      ],
    },
  ];
  const [isEmojiOpen, setEmojiOpen] = useState<boolean>(false);
  const [uploadType, setUploadType] = useState<any>('');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const values = useSafeAreaInsets();
  const isKeyboardVisible = useKeyboardVisible();
  const [loading, setLoading] = useState(false);
  const accountType = useSelector(
    (state: ApplicationState) => state?.chat?.accountType,
  );
  const [message, setMessage] = useState('');
  const userId = useCurrentUserId();
  const isSeller = roomData?.user_id === userId;
  const handleSendMessage = async () => {
    if (loading) return null;
    if (isEmpty(message?.trim())) {
      Alert.alert('please enter message');
      return null;
    }
    setLoading(true);
    const user: any = (await AsyncStorage.getItem('user')) ?? '';
    const userData = JSON.parse(user);
    const formdata = new FormData();
    formdata.append('entity_type', 'text');
    formdata.append('user_id', userData?._id);
    formdata.append(
      'user_username',
      isEmpty(userData?.firstName && userData?.lastName)
        ? userData?.username
        : `${userData?.firstName} ${userData?.lastName} `,
    );
    formdata.append('room_id', roomData?.room_id);
    formdata.append('message', message?.trim());
    formdata.append(
      'user_avatar',
      isEmpty(userData?.profilePic)
        ? 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png'
        : userData?.profilePic,
    );
    formdata.append('room_pk', roomData?.id);
    
    formdata.append('receiver_id', roomData?.receiver_id);
    console.log('message', formdata);
    chatRequest(
      apiEndPoints.sendMessage,
      'POST',
      formdata,
      'multipart/form-data',
    )
      .then((res: any) => {
        console.log(res);
        if (!res?.error) {
          setMessage('');
        } else {
          Alert.alert(res?.error_messages);
        }
      })
      .catch(e => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const uriToBlob = (uri: string) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        // return the blob
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error('uriToBlob failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);

      xhr.send(null);
    });
  };
  // Function to handle multiple file uploads
  const [progress, setProgress] = useState({});
  const handleFileUpload = async (
    files: DocumentPickerResponse[],
    type?: string,
  ) => {
    setUploading(true);
    let valid = true;

    files.forEach((file: any) => {
      const size = file?.size ?? file?.fileSize;
      console.log('filesize', size, MAX_FILE_SIZE);
      if (size > MAX_FILE_SIZE) {
        Alert.alert(
          'File too large',
          `The file "${
            file?.name ?? file?.fileName
          }" exceeds the 100MB limit. Please choose a smaller file.`,
        );
        valid = false;
        setShowUploadMenu(false);
        setUploading(false);
        return null;
      }
    });

    if (valid) {
      setUploading(true);
      setShowUploadMenu(false);
      try {
        const results = await Promise.all(
          files.map(async (file: any) => {
            const blob = await uriToBlob(file?.uri);
            const fileType = file?.type; // Get the file type dynamically
            const name = file?.name ?? file?.fileName;
            console.log('blob', name);
            const result: any = await uploadFileInChunks(
              blob,
              name,
              fileType,
              name,
              setProgress,
            ); // Pass the file name for progress tracking
            return result; // Return the result of the upload for each file
          }),
        );
        const user: any = (await AsyncStorage.getItem('user')) ?? '';
        const userData = JSON.parse(user);
        const data = results?.reduce((acc, url, index) => {
          acc[index] = url;
          return acc;
        }, {});
        console.log('All files uploaded successfully:', results?.length);
        const payload = new FormData();
        const isDoc = [
          'application/msword',
          'text/csv',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/pdf',
          'text/plain',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(files?.[0]?.type as any);

        payload.append(
          'entity_type',
          results?.length === 1 ? (isDoc ? files?.[0]?.type : type) : 'media',
        );
        payload.append('user_id', userData?._id);
        payload.append(
          'user_username',
          isEmpty(userData?.firstName && userData?.lastName)
            ? userData?.username
            : `${userData?.firstName} ${userData?.lastName} `,
        );
        payload.append('message', JSON.stringify(data));
        payload.append('room_id', roomData?.room_id);
        payload.append(
          'user_avatar',
          isEmpty(userData?.profilePic)
            ? 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png'
            : userData?.profilePic,
        );
        payload.append('room_pk', roomData?.id);
        payload.append('receiver_id', roomData?.receiver_id);
        payload.append(
          'payload',
          JSON.stringify({
            mime_type: files?.[0]?.type,
            name: files?.[0]?.name ?? (files?.[0] as any)?.fileName ?? 'Unknown File',
          }),
        );

        // console.log('data', payload);
        chatRequest(
          apiEndPoints.sendMessage,
          'POST',
          payload,
          'multipart/form-data',
        )
          .then((res: any) => {
            console.log(res);
            if (!res?.error) {
            } else {
              Alert.alert(res?.error_messages);
            }
          })
          .catch(e => {
            console.log(e);
          })
          .finally(() => {
            setUploading(false);
          });

        return data; // Return all results after successful uploads
      } catch (error) {
        console.error('Error uploading files:', error);
        throw error; // Rethrow the error for handling outside if needed
      }
    }
  };
  const [inputHeight, setInputHeight] = useState(50); // Default height
  const [cursorPosition, setCursorPosition] = useState(0);
  const textInputRef = useRef<any>(null);

  const handleContentSizeChange = (event: any) => {
    // Dynamically update the height based on the content
    setInputHeight(event.nativeEvent.contentSize.height);
  };

  const insertEmojiAtCursor = (emoji: string) => {
    const newMessage = message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
    setMessage(newMessage);
    // Update cursor position to after the inserted emoji
    const newCursorPos = cursorPosition + emoji.length;
    setCursorPosition(newCursorPos);
    // Focus and set cursor position
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.setNativeProps({
          selection: { start: newCursorPos, end: newCursorPos }
        });
      }
    }, 10);
  };
  const { ref: myRef, handleOutsideClick } = useClickOutside(() => {
    if (showUploadMenu) {
      console.log('Clicked outside the component!');
      setShowUploadMenu(false); // Example: Close a modal or dropdown
    }
  });
  const blocked = roomData?.status_id === 'blocked';
  // Don't show input if user is blocked by anyone
  if(blocked) return null;
  return (
    <>
      <View
        style={{
          backgroundColor: '#CBCBCB',
          height: 'auto',
          minHeight: 70,
          padding: 10,
          flexDirection: 'row',
          width: '100%',
          gap: 12,
          paddingLeft: 15,
          paddingRight: 15,
          alignItems: 'center',
          paddingBottom: Platform.OS === 'ios' ? isKeyboardVisible?  10:20 : 10,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        }}>
        <View
          style={{
            borderRadius: 34,
            backgroundColor: 'white',
            width: '80%',
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: Platform.OS === 'android' ? 40 : 40,
            maxHeight: 70,
          }}>
          <TouchableOpacity
            disabled={blocked}
            onPress={() => {
              if (blocked) return;
              setEmojiOpen(true);
            }}
            style={{
              marginRight: 8,
            }}>
            <Entypo name="emoji-happy" color={'#81919E'} size={20} />
          </TouchableOpacity>
          <TextInput
            onChangeText={e => {
              setMessage(e);
            }}
            onSelectionChange={(event) => {
              setCursorPosition(event.nativeEvent.selection.start);
            }}
            style={{
              width: '70%',
              borderRadius: 10,
              paddingLeft: 10,
              fontFamily: FontFamilies.medium,
              fontWeight: '400',
              fontSize: 14,
              color: 'black',
              height: inputHeight,
              maxHeight: 60,
              paddingTop: 0,
              marginTop: Platform.OS === 'android' ? 10 : 0,
              lineHeight: 18,
            }}
            multiline
            onContentSizeChange={handleContentSizeChange}
            blurOnSubmit={false}
            onSubmitEditing={() => {
              handleSendMessage();
            }}
            value={message}
            returnKeyType="send"
            placeholder={
              blocked
                ? `${
                    userId === roomData?.blocked_by
                      ? 'This contact has been blocked'
                      : `You cannot send messages to this contact`
                  } `
                : 'Message...'
            }
            placeholderTextColor="black"
            readOnly={blocked}
            ref={textInputRef}
          />
          <TouchableOpacity
            disabled={blocked}
            onPress={() => {
              if (blocked) return null;
              setShowUploadMenu(!showUploadMenu);
            }}
            style={{
              width: 34,
              height: 34,
              backgroundColor: '#EAEAEA',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 40,
            }}>
            <Entypo name="plus" color={'#81919E'} size={20} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          disabled={blocked}
          onPress={handleSendMessage}
          style={{
            borderRadius: 50,
            backgroundColor: '#1E1E1E',
            padding: 10,
            width: '15%',
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <CustomIcons type="SEND" color={'white'} />
        </TouchableOpacity>
          <Modal
          visible={showUploadMenu}
          transparent={true}
          animationType="fade"
        >
          <TouchableWithoutFeedback onPress={() => setShowUploadMenu(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  ref={myRef}
                  style={{
                    position: 'absolute',
                    width: '90%',
                    backgroundColor: '#FFFFFFAD',
                    flexDirection: 'row',
                    borderRadius: 20,
                    padding: 10,
                    bottom: 90,
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}>
                  <BlurView
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      borderRadius: 20,
                    }}
                    blurType="light"
                    blurAmount={10}
                    reducedTransparencyFallbackColor="white"
                  />
                  {uploadMenu?.map(s => {
                    return (
                      <TouchableOpacity
                        key={s?.name}
                        onPress={async () => {
                          if (blocked) return null;
                          if (Platform.OS === 'ios' && s?.typs === 'video') {
                            launchImageLibrary(
                              {
                                mediaType: s?.typs as any,
                                selectionLimit: s?.typs === 'video' ? 1 : 10,
                              },
                              (response: any) => {
                                if (response.didCancel) {
                                  console.log('User cancelled image picker');
                                } else if (response.error) {
                                  console.log('ImagePicker Error: ', response.error);
                                } else {
                                  handleFileUpload(response?.assets, s?.typs as string);
                                }
                              },
                            );
                          } else if (['photo', 'video']?.includes(s?.typs as any)) {
                            setUploadType(s?.typs);
                            launchImageLibrary(
                              {
                                mediaType: s?.typs as any,
                                selectionLimit: s?.typs === 'video' ? 1 : 10,
                              },
                              (response: any) => {
                                if (response.didCancel) {
                                  console.log('User cancelled image picker');
                                } else if (response.error) {
                                  console.log('ImagePicker Error: ', response.error);
                                } else {
                                  handleFileUpload(response?.assets, s?.typs as string);
                                }
                              },
                            );
                          } else if (s?.typs === types.audio) {
                            // Handle audio files specifically
                            setUploadType('audio');
                            try {
                              pick({
                                allowMultiSelection: false,
                                type: types.audio,
                              })
                                .then(res => {
                                  if (res && res.length > 0) {
                                    handleFileUpload(res, 'audio');
                                  }
                                })
                                .catch(e => {
                                  console.log('Audio picker error:', e);
                                });
                            } catch (error) {
                              console.log('Audio selection error:', error);
                            }
                          } else {
                            pick({
                              allowMultiSelection: false,
                              type: s?.typs,
                            })
                              .then(res => {
                                const allFilesArePdfOrDocx = res.every(
                                  (file: any) => file.hasRequestedType,
                                );
                                if (!allFilesArePdfOrDocx) {
                                  // console.log('file', res?.[0]);
                                  handleFileUpload(res, 'document');
                                  // tell the user they selected a file that is not a pdf or docx
                                }
                              })
                              .catch(e => {
                                console.log('err', e);
                              });
                          }
                        }}
                        style={{
                          padding: 10,
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 15,
                        }}>
                        <View
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: '#F4F4F5',
                            borderRadius: 10,
                            padding: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <CustomIcons type={s?.icon} />
                        </View>
                        <Text
                          style={{
                            color: '#1E1E1E',
                            fontSize: 12,
                            fontWeight: '400',
                            fontFamily: FontFamilies.medium,
                          }}>
                          {s?.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
      {uploading ? (
        <UploadLoadingModal
          visible={uploading}
          setVisible={setUploading}
          type={uploadType ? `upload_${uploadType}` : "upload"}
        />
      ) : null}
      <EmojiKeyboard
        hideHeader
        enableRecentlyUsed
        expandable
        allowMultipleSelections
        enableSearchAnimation
        onEmojiSelected={(emojiObject) => {
          insertEmojiAtCursor(emojiObject.emoji);
        }}
        open={isEmojiOpen}
        enableSearchBar
        onRequestClose={() => setEmojiOpen(false)}
        onClose={() => setEmojiOpen(false)}
      />
    </>
  );
};
export default ChatInputCard;
