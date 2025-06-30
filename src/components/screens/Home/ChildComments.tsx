import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomIcons from '../../../constants/CustomIcons';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import apiEndPoints from '../../../constants/apiEndPoints';
import {get} from '../../../services/dataRequest';
import {useDispatch, useSelector} from 'react-redux';
import {ApplicationState} from '../../../redux/store';
import {setCommentReply} from '../../../redux/reducers/chatSlice';
import {ActivityIndicator} from 'react-native-paper';
import CommentDeleteModal from './CommentDeleteModal';
import { Color, FontFamilies } from '../../../styles/constants';
import { getInitials } from '../../../utils/commonFunctions';
interface ChildCommentsProps {
  postId: any;
  isLast: boolean;
  navigation: any;
  token: any;
  commetsList: any;
  callBack:any
  isProject: boolean;
  isSelfPost: boolean;

}

const ChildComments: React.FC<ChildCommentsProps> = ({
  postId,
  isLast,
  token,
  commetsList,
  callBack,
  isProject,
  isSelfPost
}) => {
  const navigation = useNavigation();
  const userId = useCurrentUserId();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const isOnline = false;
  const dispatch = useDispatch();
  //   const [commetsList, setCommentList] = useState<any>();
  const [showChildCommnets, setShowChildCommnets] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // console.log("child",commetsList?.[0])
  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 0,
      }}>
      {loading ? (
        <ActivityIndicator
          style={{
            marginTop: 100,
          }}
        />
      ) : (
        commetsList?.map(c => {
          return (
            <>
              <TouchableOpacity
                 onLongPress={() => {
                    if (userId !== c?.userId?._id) {
                      setShowDeleteModal(c);
                    }
                  }}
                style={{
                  alignItems: 'center',
                  padding: 10,
                  paddingLeft: 70,
                  paddingRight: 20,
                  paddingTop: 0,
                  flexDirection: 'row',
                  marginTop: 10,
                  width: Dimensions.get('window').width / 1.01,
                }}>
                <View
                  style={{
                    position: 'relative',
                    width: '15%',
                  }}>
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
                  {isOnline ? (
                    <View
                      style={{
                        backgroundColor: '#0FE16D',
                        width: 8,
                        height: 8,
                        borderRadius: 16,
                        bottom: 10,
                        left: 38,
                      }}></View>
                  ) : null}
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
                         {dayjs().isSame(c?.createdAt,'d')
                      ? dayjs(c?.createdAt).format('hh:mm A')
                      : `${dayjs().diff(c?.createdAt, 'd')}d`}
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
                    {c?.text}
                  </Text>
                  {/* <TouchableOpacity
                    onPress={() => {
                      dispatch(
                        setCommentReply({
                          id: c?.commentId,
                          postId: postId,
                          name: `@${c?.userId?.username}`,
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
                  </TouchableOpacity> */}
                  {/* {c?.replyCount === 0 ? null : showChildCommnets ===
                  c?._id ? null : (
                  <TouchableOpacity
                    onPress={() => {
                      setShowChildCommnets(c?._id);
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
                )} */}
                  <TouchableOpacity
                    onPress={() => {
                        callBack()
                    }}>
                    <Text
                      style={{
                        color: '#828282',
                        fontFamily: FontFamilies.medium,
                        fontWeight: '400',
                        fontSize: 11,
                      }}>
                      {'Hide Replies'}
                    </Text>
                  </TouchableOpacity>
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
                    {c?.likes}
                  </Text>
                </View> */}
              </TouchableOpacity>
            </>
          );
        })
      )}
       <CommentDeleteModal
        visible={showDeleteModal}
        setVisible={setShowDeleteModal}
        postId={postId}
        isReply={true}
        isProject={isProject}
        isSelfPost={isSelfPost}
      />
    </ScrollView>
  );
};
export default ChildComments;
