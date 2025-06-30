import React, {useState} from 'react';
import {
  Pressable,
  Dimensions,
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CustomIcons from '../../../constants/CustomIcons';
import {setCommentReply} from '../../../redux/reducers/chatSlice';
import ChildComments from './ChildComments';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import dayjs from 'dayjs';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import { Color, FontFamilies } from '../../../styles/constants';
import { ApplicationState } from '../../../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { getInitials } from '../../../utils/commonFunctions';

type RootStackParamList = {
  OtherUserProfile: {
    userId: string;
    isSelfProfile: boolean;
    token: string;
  };
  Profile: {
    id: string;
  };
};

interface CommentCardProps {
  c: any;
  setShowDeleteModal: (value: any) => void;
  postId: string;
  token: string;
  isProject?: boolean;
  selfPost?: boolean;
  currentUserId?: string;
}

const CommentCard: React.FC<CommentCardProps> = ({
  c,
  setShowDeleteModal,
  postId,
  token,
  isProject = false,
  selfPost = false, 
  currentUserId
}) => {
  const userId = useCurrentUserId();

  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showChildCommnets, setShowChildCommnets] = useState(false);
  
  // Get the current reply state from Redux
  const replyCommentData = useSelector(
    (state: ApplicationState) => state?.chat?.commentReply,
  );

  // Check if this comment is being replied to, ensuring it's always a boolean
  const isBeingRepliedTo: boolean = !!(replyCommentData?.id && replyCommentData.id === c?._id);

  const routeToProfile = async (id: any,accountType:string) => {
    try {
      const account_ = await AsyncStorage.getItem('user');
      const currentUser = JSON.parse(account_ || '{}')._id;
      const savedToken = await AsyncStorage.getItem('userToken');
      if (!savedToken) return;
      
      // Determine which profile screen to navigate to
      const screen = userId !== id ? 'OtherUserProfile' : 'Profile';
      if (screen === 'OtherUserProfile') {    
        if(accountType === "professional"){
          navigation.navigate('otherBusinessScreen', {
            userId: id,
            isSelf: false
          });
        }else{
          navigation.navigate('otherProfileScreen', {
            userId: id,
            isSelf: false
          });
        }
      } else {
        navigation.navigate('BottomBar', {
          screen: 'ProfileScreen',
          params: {
            isSelf: true
          }
        });
      }
    } catch (error) {
      console.error('Error routing to profile:', error);
    }
  };
   const postAuthor = useSelector((state:ApplicationState)=>state?.chat?.currentPostAuthor)
  const handleLongPress = () => {
    console.log("self ::",c,userId);
    if (c?.userId?._id === userId) {
      setShowDeleteModal(c);
    }else if(userId === postAuthor){
      setShowDeleteModal(c);
    }
  };

  return (
    <>
      <TouchableOpacity
        onLongPress={handleLongPress}
        style={{
          alignItems: 'center',
          padding: 10,
          paddingLeft: 25,
          paddingRight: 20,
          paddingTop: 0,
          flexDirection: 'row',
          marginTop: 10,
          width: Dimensions.get('window').width / 1.01,
          backgroundColor: isBeingRepliedTo ? '#F0F8FF' : 'transparent', // Light blue background when being replied to
          borderRadius: 8,
        }}>
        <View
          style={{
            position: 'relative',
            width: '15%',
          }}>
          <TouchableOpacity onPress={() => routeToProfile(c?.userId?._id,c?.userId?.accountType)}>
            {c?.userId?.profilePic ? (
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
                  uri: c?.userId?.profilePic,
                }}
              />
            ) : (
              <View style={{width: 36, height: 36, borderRadius: 18, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center'}} >
              <Text style={{fontSize: 16, fontFamily: FontFamilies.medium, color: Color.white}} >
                {getInitials(c?.userId?.username)}
              </Text>
            </View>

            )}
          </TouchableOpacity>
          {/* {isOnline ? (
          <View
            style={{
              backgroundColor: '#0FE16D',
              width: 8,
              height: 8,
              borderRadius: 16,
              bottom: 10,
              left: 38,
            }}></View>
        ) : null} */}
        </View>
        <View
          style={{
            gap: 8,
            width: '75%',
          }}>
          <TouchableOpacity onPress={() => routeToProfile(c?.userId?._id,c?.userId?.accountType)}>
            <Text
              style={{
                color: '#1E1E1E',
                fontFamily: FontFamilies.medium,
                fontWeight: '400',
                fontSize: 13,
              }}>
              {c?.userId?.username}
              {'  '}
              <Text
                style={{
                  color: '#828282',
                  fontFamily: FontFamilies.medium,
                  fontWeight: '400',
                  fontSize: 11,
                  marginLeft: 10,
                }}>
                {dayjs().isSame(c?.createdAt, 'd')
                  ? dayjs(c?.createdAt).format('hh:mm A')
                  : `${dayjs().diff(c?.createdAt, 'd')}d`}
              </Text>
            </Text>
          </TouchableOpacity>
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
            {c?.text}
          </Text>
          <TouchableOpacity
            onPress={() => {
              dispatch(
                setCommentReply({
                  id: c?._id,
                  postId: postId,
                  name: `@${c?.userId?.username} `,
                }),
              );
            }}>
            <Text
              style={{
                color: '#828282',
                fontFamily: FontFamilies.medium,
                fontWeight: '400',
                fontSize: 11,
              }}>
              {'Reply'}
            </Text>
          </TouchableOpacity>
          {c?.replyCount === 0 ? null : showChildCommnets  ? null : (
            <TouchableOpacity
              onPress={() => {
                setShowChildCommnets(true);
              }}
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}>
              <View
                style={{
                  width: '30%',
                  backgroundColor: '#B9B9BB',
                  height: 0.5,
                }}></View>
              <Text
                style={{
                  color: '#81919E',
                  fontFamily: FontFamilies.medium,
                  fontWeight: '400',
                  fontSize: 11,
                }}>
                {`View ${c?.replyCount} more replies`}
              </Text>
              <View
                style={{
                  width: '30%',
                  backgroundColor: '#B9B9BB',
                  height: 0.5,
                }}></View>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            gap: 10,
            width: '15%',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          {/* <View
            style={{
              flexDirection: 'row',
              gap: 0,
              justifyContent: 'flex-end',
            }}>
            <TouchableOpacity>
              <CustomIcons type="HEART" width={15} height={15} />
            </TouchableOpacity>
          </View> */}

          {/* <Text
            style={{
              color: '#828282',
              fontFamily: FontFamilies.medium,
              fontWeight: '400',
              fontSize: 12,
              textAlign: 'right',
            }}>
            {c?.likes}
          </Text> */}
        </View>
      </TouchableOpacity>
      {showChildCommnets ? (
        <ChildComments
          postId={postId}
          isLast={false}
          navigation={navigation}
          token={token}
          commetsList={c?.replies}
          callBack={() => {
            setShowChildCommnets(false);
          }}
          isProject={isProject}
          isSelfPost={selfPost}
        />
      ) : null}
    </>
  );
};
export default CommentCard;
