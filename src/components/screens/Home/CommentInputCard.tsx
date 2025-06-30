import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import CustomIcons from '../../../constants/CustomIcons';
import {ApplicationState} from '../../../redux/store';
import apiEndPoints from '../../../constants/apiEndPoints';
import {get, post} from '../../../services/dataRequest';
import {useNavigation} from '@react-navigation/native';
import {setCommentReply, setUpdate} from '../../../redux/reducers/chatSlice';
import {useKeyboardVisible} from '../../../hooks/useKeyboardVisible';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import PeopleFilter from './utils/PeopleFilter';
import { Color, FontFamilies } from '../../../styles/constants';
import {incrementCommentCount} from '../../../redux/slices/commentSlice';
import { getInitials } from '../../../utils/commonFunctions';

interface CommentInputCardProps {
  postId: any;
  token: any;
  onCommentAdded?: () => void;
  isProject?: boolean;
}
const CommentInputCard: React.FC<CommentInputCardProps> = ({postId, token, onCommentAdded, isProject = false}) => {
  console.log ('token', isProject)
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const replyCommentData = useSelector(
    (state: ApplicationState) => state?.chat?.commentReply,
  );
  const userId = useCurrentUserId();
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState();
  const [comment, setComment] = useState('');
  const handleAddComments = () => {
    if (!comment.trim() || loading) {
      return; // Don't proceed if comment is empty, only whitespace, or already loading
    }
    const payload = {
      text: comment,
    };
    setLoading(true);
    const endpoint = isProject 
      ? apiEndPoints.addProjectComment(postId)
      : apiEndPoints.addComment(postId);

    post(endpoint, payload)
      .then(res => {
        console.log("55 :: res ::", res);
        setComment('');
        Keyboard.dismiss();
        dispatch(setUpdate(Date.now()));
        dispatch(incrementCommentCount(postId));
        if (onCommentAdded) {
          onCommentAdded();
        }
      })
      .catch(e => {
        console.log('add comments error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleReplyComments = () => {
    if (!comment.trim() || loading) {
      return; // Don't proceed if comment is empty, only whitespace, or already loading
    }
    const cleanComment = comment.replace('Replying to', ''); // Remove "Replying to {name}: "
    const payload = {
      text: cleanComment,
      ugcId: postId,
      projectId: postId,
    };
    setLoading(true);
    const endpoint = isProject 
      ? apiEndPoints.replyProjectComment(replyCommentData?.id)
      : apiEndPoints.replyComment(replyCommentData?.id);
    console.log ('endpoint', endpoint,payload)

    post(endpoint, payload)
      .then(res => {
        console.log('add reply', res);
        setComment('');
        Keyboard.dismiss();
        dispatch(setUpdate(Date.now()));
        dispatch(setCommentReply(null));
      })
      .catch(e => {
        console.log('add reply error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  // const handleReplyComments = () => {
  //   const payload = {
  //     text: comment,
  //     userId: userId,
  //   };
   
  
  const [profilePic, setProfilePic] = useState('');
  const emojis = [
    '👍',
    '🙏',
    '👋',
    '🙈',
    '🙌',
    '🔥',
    '📸',
    '😍',
    '😆',
    '😂',
    '😉',
    '😊',
    '😋',
    '😎',
    '😅',
    '🤩',
  ];
  const [inputHeight, setInputHeight] = useState(50); // Default height
  const inputRef = useRef<any>(null);
  const handleContentSizeChange = (event: any) => {
    // Dynamically update the height based on the content
    setInputHeight(event.nativeEvent.contentSize.height);
  };
  const isKeyboardVisible = useKeyboardVisible();
  useEffect(() => {
    if (replyCommentData?.name) {
      setComment('Replying to ' + replyCommentData?.name);
      // Add a small delay to ensure the sheet animation is complete before focusing
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 300);
    }
  }, [replyCommentData]);
  const fetchUserProfile = async (userId: any, token: any) => {
    console.log('user ID :', userId);
    try {
      const profileData = await get(`user/get-user-info/${userId}`, {}, token);
      if (profileData.status === 200) {
        const userProfile = profileData?.user;
        console.log("userProfile :::", userProfile);

        // Set profile and related states
        setProfile(userProfile);
        setProfilePic(userProfile?.profilePic);
        setUsername(userProfile?.username);

        // Load initial posts for the user
      } else {
        // Alert.alert('Session Expired. Please login.');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
    }
  };
  useEffect(() => {
    if (userId && token) {
      fetchUserProfile(userId, token);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : isKeyboardVisible ? 20 : 0}
      style={{ marginBottom: Platform.OS === 'ios' ? -10 : -20 }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 10,
          gap: 10,
          marginBottom: Platform.OS === 'ios' ? 0 : -10
        }}
        horizontal={true}
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}>
        {emojis?.map(e => {
          return (
            <TouchableOpacity
              onPress={() => {
                setComment(comment?.concat(e));

                // handleMessafeReaction(e?.toString());
                //update message
              }}
              style={{}}
              key={e}>
              <Text
                style={{
                  fontFamily: FontFamilies.semibold,
                  fontWeight: '400',
                  color: '#1E1E1E',

                  fontSize: 24,
                }}>
                {e?.trim()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
     
      <View
        style={{
          backgroundColor: 'white',
          height: 'auto',
          padding: 10,
          flexDirection: 'row',
          width: '100%',
          gap: 12,
          paddingLeft: 15,
          paddingRight: 15,
          position: 'relative',
          alignItems: 'center',
          marginBottom: Platform.OS === 'ios' ? 20 : 20
        }}>
        <View
          style={{
            position: 'relative',
            width: '10%',
          }}>
          {profilePic ? (
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
                uri: profilePic,
              }}
            />
          ) : (
            <View style={{width: 36, height: 36, borderRadius: 18, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center'}} >
              <Text style={{fontSize: 16, fontFamily: FontFamilies.medium, color: Color.white}} >
                {getInitials(username)}
              </Text>
            </View>

          )}
        </View>
        <View
          style={{
            borderRadius: 14,
            backgroundColor: '#F3F3F3',
            width: '75%',
            // padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 40,
            maxHeight: 70,
          }}>
          {/* {Platform.OS === 'ios' ? ( */}
            <BottomSheetTextInput
              onChangeText={e => {
                setComment(e);
              }}
              style={{
                width: '100%',
                borderRadius: 10,
                paddingLeft: 10,
                fontFamily: FontFamilies.medium,
                fontWeight: '400',
                fontSize: 14,
                color: 'black',
                //   height: inputHeight,
                maxHeight: 60,
                paddingTop: 10,
                marginTop: 0,
                lineHeight: 18,
                padding:10
              }}
              // onContentSizeChange={handleContentSizeChange}
              blurOnSubmit={false}
              onSubmitEditing={() => {
                if (replyCommentData?.id) {
                  handleReplyComments();
                } else {
                  handleAddComments();
                }
              }}
              ref={inputRef}
              value={comment}
              returnKeyType="send"
              placeholder={'Type your comment'}
              placeholderTextColor="#81919E"
            />
          {/* ) : ( */}
            {/* <TextInput
              autoFocus
              onChangeText={e => {
                setComment(e);
              }}
              style={{
                width: '100%',
                borderRadius: 10,
                fontFamily: FontFamilies.medium,
                fontWeight: '400',
                fontSize: 14,
                color: 'black',
                //   height: inputHeight,
                maxHeight: 60,
                paddingHorizontal: 10,
                lineHeight: 18,
              }}
              // onContentSizeChange={handleContentSizeChange}
              blurOnSubmit={false}
              onSubmitEditing={() => {
                if (replyCommentData?.id) {
                  handleReplyComments();
                } else {
                  handleAddComments();
                }
              }}
              ref={inputRef}
              value={comment}
              returnKeyType="send"
              placeholder={'Type your comment'}
              placeholderTextColor="#81919E"
            /> */}
          
         
        </View>
       
        <TouchableOpacity
          disabled={loading || !comment.trim()}
          onPress={() => {
            if (replyCommentData?.id) {
              handleReplyComments();
            } else {
              handleAddComments();
            }
          }}
          style={{
            borderRadius: 50,
            backgroundColor: loading || !comment.trim() ? '#A0A0A0' : '#1E1E1E',
            padding: 10,
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <CustomIcons type="SEND" color={'white'} width={15} height={15} />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => {
            if (replyCommentData?.id) {
              handleReplyComments();
            } else {
              handleAddComments();
            }
          }}
          style={{
            borderRadius: 50,
            // backgroundColor: '#1E1E1E',
            padding: 10,
            width: '10%',
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <CustomIcons type="STICKERS" color={'white'} width={25} height={25} />
        </TouchableOpacity> */}
      </View>
    </KeyboardAvoidingView>
  );
};
export default CommentInputCard;
