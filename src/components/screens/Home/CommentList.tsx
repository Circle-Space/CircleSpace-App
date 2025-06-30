import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomIcons from '../../../constants/CustomIcons';
import {useNavigation} from '@react-navigation/native';
import routes from '../../../constants/routes';
import dayjs from 'dayjs';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import chatRequest from '../../../services/chatRequest';
import apiEndPoints from '../../../constants/apiEndPoints';
import {isEmpty, omit, uniqBy} from 'lodash';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ChildComments from './ChildComments';
import {get} from '../../../services/dataRequest';
import {useDispatch, useSelector} from 'react-redux';
import {ApplicationState} from '../../../redux/store';
import {setCommentReply, setCurrentUserId} from '../../../redux/reducers/chatSlice';
import {ActivityIndicator} from 'react-native-paper';
import CommentDeleteModal from './CommentDeleteModal';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import CommentCard from './CommentCard';
import {setCommentCount} from '../../../redux/slices/commentSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CommentListProps {
  postId: string;
  isLast: boolean;
  navigation: any;
  token: string;
  onCommentAdded?: () => void;
  onCommentRemoved?: () => void;
  isProject?: boolean;
  selfPost?: boolean;
  currentUserId?: string;
}

const CommentList: React.FC<CommentListProps> = ({
  postId,
  isLast,
  navigation,
  token,
  onCommentAdded,
  onCommentRemoved,
  isProject,
  selfPost = false,
  currentUserId
}) => {
  const userId = useCurrentUserId();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const isOnline = false;
  const updateQuery = useSelector(
    (state: ApplicationState) => state?.chat?.update,
  );
  const dispatch = useDispatch();
  const [commetsData, setCommentData] = useState<any>();
  const [commetsList, setCommentList] = useState<any>([]);
  const [showChildCommnets, setShowChildCommnets] = useState(false);

  const handleGetComments = async () => {
    setLoading(true);
    const endpoint = isProject 
      ? apiEndPoints.getProjectComments(postId, page, 10)
      : apiEndPoints.getComments(postId, page, 10);

    console.log('endpoint', endpoint);
    const [profile, accountType, userInfo, paidStatus] = await Promise.all([
      AsyncStorage.getItem('profile'),
      AsyncStorage.getItem('accountType'),
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('isPaid')
    ]);
    const id = JSON.parse(userInfo)?._id;
    console.log("id",id)
    dispatch(setCurrentUserId(id))
    await get(endpoint, undefined, token)
      .then(res => {
        console.log("res comment", res?.comments)
        console.log('Project Comments Response:', {
          endpoint,
          status: res?.status,
          data: res,
          token: token ? 'present' : 'missing'
        });
        if (page === 1) {
          setCommentList(res?.comments);
          console.log("res?.comments", res?.comments)
          
          if (onCommentAdded) {
            onCommentAdded();
          }
        } else {
          setCommentList([...commetsList, ...res?.comments]);
        }
        setCommentData(omit(res, 'comments'));
        
        // Update comment count in Redux
        dispatch(setCommentCount({
          postId,
          commentCount: res?.totalComments || 0
        }));
      })
      .catch(e => {
        console.log('Project Comments Error:', {
          endpoint,
          error: e,
          token: token ? 'present' : 'missing'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (postId) {
      handleGetComments();
    }
  }, [postId, updateQuery, page]);

  const onScrollEnd = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
    );
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  console.log('commetsList-replies',commetsList?.[0]?.replies)
  return (
    <BottomSheetScrollView
      contentContainerStyle={{
        paddingBottom:Platform.OS==="android"?200: 100,
        height: 'auto',
      }}
      keyboardShouldPersistTaps={'always'}
      keyboardDismissMode="on-drag"
      nestedScrollEnabled={true}
      onScroll={({nativeEvent}) => {
        Keyboard.dismiss();
        if (onScrollEnd(nativeEvent)) {
          if (
            nativeEvent?.contentOffset?.x === 0 &&
            page !== commetsData?.totalPages
          ) {
            setPage(page + 1);
          }
        }
      }}
      contentInset={{
        bottom: 100,
      }}>
      {uniqBy(commetsList, '_id')?.map((c: any) => {
        return (
          <CommentCard
            key={c?._id}
            c={c}
            setShowDeleteModal={setShowDeleteModal}
            postId={postId}
            token={token}
            isProject={isProject}
            selfPost={selfPost}
            currentUserId={currentUserId}
          />
        );
      })}
      {loading ? (
        <ActivityIndicator
          style={{
            marginTop: isEmpty(commetsList) ? 100 : 10,
          }}
        />
      ) : isEmpty(commetsList) ? (
        <Text
          style={{
            alignSelf: 'center',
            fontWeight: '400',
            fontSize: 13,
            color: '#1E1E1E',
            marginVertical: 12,
          }}>
          No comments yet!
        </Text>
      ) : null}
      <CommentDeleteModal
        visible={showDeleteModal}
        setVisible={setShowDeleteModal}
        postId={postId}
        isProject={isProject}
        selfPost={selfPost}
        currentUserId={currentUserId}
      />
    </BottomSheetScrollView>
  );
};

export default CommentList;
