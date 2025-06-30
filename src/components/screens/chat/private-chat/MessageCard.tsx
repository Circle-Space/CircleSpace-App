import React from 'react';
import TextMessage from './TextMessage';
import PhotoMessage from './PhotoMessage';
import VideoMessage from './VideoMessage';
import MediaMessage from './MediaMessage';
import PostMessage from './PostMessage';
import {Text} from 'react-native';
import ProfileMessage from './ProfileMessage';
import {PrivateMessage, roomData} from './PrivateChat';
import DocumentMessage from './DocumentMessage';
import { isEmpty } from 'lodash';
import ShareProfileMessage from './ShareProfileMessage';

export interface MessageTypes {
  type: string;
  content: string[];
  postBy?: {
    name: string;
    profile: string;
    thumbnail: string;
  };
  user: {
    name: string;
    username: string;
    profile: string;
  };
  user_id: string;
  created_at: number;
}
export interface MessageCardProps {
  message: PrivateMessage|any;
  roomData:roomData
}
const MessageCard: React.FC<MessageCardProps> = ({message,roomData}) => {
  const parsedObject = message
  ? isEmpty(message?.payload)
    ? null
    : JSON.parse(message?.payload)
  : null;
  const isPost = parsedObject?.postBy?.type==="post";
  const isShareProfile = parsedObject?.user?.type==="shareprofile"
  console.log('messagecard',message,isShareProfile)
  if(isPost) return <PostMessage message={message} />
  if(isShareProfile) return <ShareProfileMessage message={message}  />
  switch (message?.entity_type) {
    case 'text':
      return <TextMessage message={message} />;
    case 'photo':
      return <PhotoMessage message={message} />;
    case 'video':
      return <VideoMessage message={message} />;
    case 'media':
      return <MediaMessage message={message} />;
    case 'post':
      return <PostMessage message={message} />;
    case 'profile':
      return <ProfileMessage message={message} roomData={roomData} />;
    case 'document':
      return <DocumentMessage message={message} />;
    default:
      return null;
  }
};

export default MessageCard;
