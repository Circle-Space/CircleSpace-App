import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Share,
} from 'react-native';
import CustomIcons from '../../../constants/CustomIcons';
import {isEmpty, times} from 'lodash';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import {ChatRooms, Room} from '../chat/Chats';
import chatRequest from '../../../services/chatRequest';
import apiEndPoints from '../../../constants/apiEndPoints';
import {useSelector} from 'react-redux';
import {ApplicationState} from '../../../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import routes from '../../../constants/routes';
import {
  handleShareProfile,
  handleSinglePostShare,
  truncateText,
} from '../jobs/utils/utils';
import { FontFamilies } from '../../../styles/constants';
import { getInitials } from '../../../utils/commonFunctions';

// Interface for User Details
interface UserDetails {
  __v: number;
  _id: string;
  accountType: 'personal' | 'professional';
  address: object; // You can define the address structure if known
  bio: string;
  businessName: string;
  certifications: string[];
  createdAt: string; // ISO string format date
  dateOfBirth: string;
  dateOfCreation: string; // ISO string format date
  email: string;
  fcmToken: string;
  firstName: string;
  isDeleted: boolean;
  isPaid: boolean;
  jobProfileId: string;
  lastName: string;
  locationServed: string[];
  maxBudget: string;
  minBudget: string;
  mobileNo: string;
  otp: string;
  otpVerified: boolean;
  password: string;
  professionalCategory: string[];
  professionalType: string;
  profilePic: string;
  servicesProvided: string[];
  socialProfileId: string;
  updatedAt: string; // ISO string format date
  userId: string;
  username: string;
  website: string;
}

// Interface for the Poster Details (could be the same as UserDetails)
interface PosterDetails extends UserDetails {
  businessName: string;
  profilePic: string;
  username: string;
  servicesProvided: string[];
  locationServed: string[];
}

// Interface for Flags
interface Flags {
  archive: boolean;
  deleted: boolean;
  draft: boolean;
}

// Interface for the main Post Data
interface PostData {
  __v: number;
  _id: string;
  caption: string;
  comments: string | null;
  commentsCount: number;
  contentType: 'ugc'; // Assuming UGC (User Generated Content)
  contentUrl: string;
  createdAt: string; // ISO string format date
  flags: Flags;
  isLiked: boolean;
  isMentioned: boolean;
  isSaved: boolean;
  isTagged: boolean;
  likedBy: string[]; // List of user IDs
  likedByUsers: UserDetails[]; // List of users who liked the post
  likes: number;
  location: string;
  mentionedUsers: string[]; // List of user IDs
  mentionedUsersDetails: UserDetails[]; // List of mentioned user details
  posterDetails: PosterDetails[]; // Poster details of the user who created the post
  taggedUsers: string[]; // List of tagged user IDs
  taggedUsersDetails: UserDetails[]; // List of tagged user details
  tags: string[]; // List of tags associated with the post
  updatedAt: string; // ISO string format date
  userId: string;
}

interface SharePostToChatProps {
  setOpenShare: any;
  openShare: boolean;
  feed: PostData;
  isProfile?: boolean;
}
const SharePostToChat: React.FC<SharePostToChatProps> = ({
  setOpenShare,
  openShare,
  feed,
  isProfile,
}) => {
  const shareSheetRef = useRef<BottomSheet>(null);
  const currentUserId = useCurrentUserId();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<ChatRooms>();
  const [selectedIds, setSelectedIds] = useState([]);
  const navigation = useNavigation();
  const [selectedRooms, setSelectedRooms] = useState([]);
  console.log('res share post to chat', rooms?.data?.list);
  const handleGetRooms = async () => {
    setLoading(true);
    await chatRequest(
      apiEndPoints.listRoom(await currentUserId),
      'GET',
      undefined,
      'application/json',
    )
      .then(async (res: any) => {
       
        if (!res?.error) {
          console.log(res?.data?.list, currentUserId);
          setRooms(res);
        } else {
          Alert.alert('faild to get rooms');
          console.log('faild to get rooms');
        }
      })
      .catch(e => {})
      .finally(() => {
        setLoading(false);
      });
  };
  const update = useSelector((state: ApplicationState) => state?.chat?.update);
  useEffect(() => {
    handleGetRooms();
  }, [update]);
  const [query, setQuery] = useState('');
  const handleSendMessage = async (room: Room) => {
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
    formdata.append('room_id', room?.room_id);
    formdata.append(
      'message',
      isProfile ? 'Shared a Profile' : 'Shared a post',
    );
    formdata.append(
      'user_avatar',
      isEmpty(userData?.profilePic)
        ? 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png'
        : userData?.profilePic,
    );
    const profile: any = feed;
    const displayName =
      profile?.accountType === 'professional'
        ? profile?.businessName
        : `${profile?.firstName ?? 'John'} ${profile?.lastName ?? 'Doe'}`;
    //   formdata.append('room_pk', roomData?.id);
    formdata.append(
      'payload',
      JSON.stringify(
        isProfile
          ? {
              user: {
                id: profile?._id,
                name: displayName,
                username: `@${profile?.username}`,
                type: 'shareprofile',
                isSeller: profile?.accountType === 'professional',
                profile:
                  profile?.profilePic ??
                  'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
                professionalType: profile?.professionalType,
                servicesProvided: profile?.servicesProvided,
                profileDetails: profile,
              },
            }
          : {
              postBy: {
                name: isEmpty(feed?.posterDetails?.[0]?.firstName)
                  ? feed?.posterDetails?.[0]?.username
                  : feed?.posterDetails?.[0]?.firstName,
                profile:
                  feed?.posterDetails?.[0]?.profilePic ??
                  'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
                thumbnail:
                  feed?.contentUrl ??
                  'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
                username: feed?.posterDetails?.[0]?.username,
                content: truncateText(feed?.caption, 30),
                type: 'post',
                feed_id: feed?._id,
              },
            },
      ),
    );
    formdata.append('receiver_id', room?.receiver_id);
    console.log('send profile', formdata);
    chatRequest(
      apiEndPoints.sendMessage,
      'POST',
      formdata,
      'multipart/form-data',
    )
      .then((res: any) => {
        console.log(res);
        if (!res?.error) {
          // setMessage('');
        } else {
          Alert.alert(res?.error_messages);
        }
      })
      .catch(e => {
        console.log(e);
      })
      .finally(() => {});
  };
  const handleSendPost = async () => {
    try {
      // Loop through the IDs array and send POST request for each ID
      for (let room of selectedRooms) {
        console.log('room', room);
        const result = await handleSendMessage(room);
        // You can handle the result for each ID if needed
      }
      console.log('Success', 'Data sent successfully for all IDs!');
    } catch (error) {
      console.log('Error', 'Failed to send data for one or more IDs');
    } finally {
      Alert.alert(isProfile ? 'Profile sent' : 'Post sent');
      setOpenShare(false);
      setSelectedIds([]);
      setSelectedRooms([]);
      navigation.navigate(routes.chats);
    }
  };
  const handleShareWebUrl = async () => {
    if (isProfile) {
      await handleShareProfile(feed, feed?.accountType === 'professional');
    } else {
      await handleSinglePostShare(feed);
    }
  };
  return (
    <React.Fragment>
      {openShare ? (
        <BottomSheet
          enablePanDownToClose
          index={1}
          snapPoints={['50%', '80%']}
          ref={shareSheetRef}
          onClose={() => {
            setOpenShare(false);
          }}
          backgroundStyle={{
            borderRadius: 22,
          }}
          style={{
            elevation: 10,
            borderRadius: 22,
          }}
          enableHandlePanningGesture={true}
          enableContentPanningGesture={false}
          handleIndicatorStyle={{
            width: 50,
            backgroundColor: '#CECECE',
            height: 5,
          }}>
          <BottomSheetView
            style={{
              padding: 0,
              paddingLeft: 0,
              paddingRight: 0,
              gap: 0,
            }}>
            <View style={{ padding: 10, gap: 10 }}>
              <Text style={{
                fontFamily: FontFamilies.semibold,
                fontSize: 16,
                color: '#1E1E1E',
                textAlign: 'center',
                marginBottom: 10,
              }}>
                {isProfile ? 'Share Profile' : 'Share Post'}
              </Text>

              <View style={{
                backgroundColor: '#F3F3F3',
                padding: 5,
                borderRadius: 12,
                alignItems: 'center',
                paddingLeft: 10,
                paddingRight: 10,
                gap: 10,
                flexDirection: 'row',
                width: '95%',
                alignSelf: 'center',
              }}>
                <CustomIcons type="SEARCH" />
                <TextInput
                  onChangeText={e => {
                    setQuery(e);
                  }}
                  placeholder="Search chats"
                  style={{
                    fontWeight: '400',
                    fontFamily: FontFamilies.medium,
                    fontSize: 12,
                    width: '80%',
                    color: '#81919E',
                  }}
                  placeholderTextColor={'#81919E'}
                />
              </View>

              <ScrollView
                keyboardShouldPersistTaps="always"
                scrollEnabled
                nestedScrollEnabled
                style={{
                  height: '60%',
                  backgroundColor: '#FFFFFF',
                }}
                contentContainerStyle={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  padding: 15,
                  paddingBottom: 50,
                  backgroundColor: '#FFFFFF',
                }}>
                {loading ? (
                  <ActivityIndicator />
                ) : isEmpty(rooms?.data?.list) ? (
                  <Text
                    style={{
                      alignSelf: 'center',
                      fontWeight: '400',
                      fontSize: 13,
                      color: '#1E1E1E',
                      marginVertical: 12,
                    }}>
                    No chats added yet
                  </Text>
                ) : (
                  rooms?.data?.list
                    ?.sort(
                      (a: any, b: any) =>
                        new Date(b?.updated_at).getTime() - new Date(a?.updated_at).getTime(),
                    )
                    ?.filter(
                      item =>
                        item?.name
                          ?.toLowerCase()
                          .includes(query?.toLowerCase()) ||
                        item?.last_message_sent
                          ?.toLowerCase()
                          ?.includes(query?.toLowerCase()),
                    )
                    ?.map(s => {
                      const hasValidAvatar = s?.user_avatar && s?.user_avatar !== 'undefined' && s?.user_avatar !== '';
                      return (
                        <Pressable
                          key={s?.id}
                          onPress={() => {
                            if (selectedIds?.includes(s?.id)) {
                              const data = selectedIds?.filter(
                                (f: any) => s?.id !== f,
                              );
                              const roomsData = selectedRooms?.filter(
                                (f: any) => s?.id !== f?.id,
                              );
                              setSelectedIds(data);
                              setSelectedRooms(roomsData);
                            } else {
                              setSelectedIds([...selectedIds, s?.id]);
                              setSelectedRooms([...selectedRooms, s]);
                            }
                          }}
                          style={{
                            width: '30%',
                            alignItems: 'center',
                            marginBottom: 20,
                          }}>
                          <View
                            style={{
                              padding: 20,
                              borderRadius: 100,
                              backgroundColor: '#D9D9D9',
                              height: 90,
                              width: 90,
                              justifyContent: 'center',
                              alignItems: 'center',
                              position: 'relative',
                            }}>
                            {hasValidAvatar ? (
                              <Image
                                style={{height: 90, width: 90, borderRadius: 16}}
                                source={{
                                  uri: s?.user_avatar,
                                }}
                              />
                            ) : (
                              <View
                                style={{
                                  height: 90,
                                  width: 90,
                                  borderRadius: 100,
                                  backgroundColor: '#000000',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 20,
                                    fontFamily: FontFamilies.semibold,
                                    color: 'white',
                                  }}>
                                  {getInitials(s?.name || s?.user_username)}
                                </Text>
                              </View>
                            )}
                            {selectedIds?.includes(s?.id) ? (
                              <View
                                style={{
                                  bottom: -3,
                                  position: 'absolute',
                                  right: -5,
                                }}>
                                <CustomIcons
                                  type="BLACKTICK"
                                  height={25}
                                  width={25}
                                />
                              </View>
                            ) : null}
                          </View>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 12,
                              fontWeight: '400',
                              fontFamily: FontFamilies.medium,
                              textAlign: 'center',
                              width: '100%',
                              maxWidth: 90,
                            }}>
                            {s?.name}
                          </Text>
                        </Pressable>
                      );
                    })
                )}
              </ScrollView>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 20,
                width: '100%',
                backgroundColor: '#FFFFFF',
                gap: 10,
              }}>
                <TouchableOpacity
                  onPress={handleShareWebUrl}
                  style={{
                    flex: 1,
                    padding: 15,
                    backgroundColor: '#F3F3F3',
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}>
                  <CustomIcons type="LINK" />
                  <Text
                    style={{
                      fontFamily: FontFamilies.semibold,
                      fontWeight: '400',
                      color: '#1E1E1E',
                      fontSize: 14,
                    }}>
                    Share via link
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (selectedIds?.length) {
                      handleSendPost();
                    } else {
                      Alert.alert(
                        `please select user to share a ${
                          isProfile ? 'profile' : 'post'
                        }`,
                      );
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: 15,
                    backgroundColor: '#181818',
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}>
                  <CustomIcons type="SEND" />
                  <Text
                    style={{
                      fontFamily: FontFamilies.semibold,
                      fontWeight: '400',
                      color: '#FFFFFF',
                      fontSize: 14,
                    }}>
                    Share in chat
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      ) : null}
    </React.Fragment>
  );
};
export default SharePostToChat;
