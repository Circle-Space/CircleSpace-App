import React, {useState} from 'react';
import {
  Image,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import {MessageTypes} from './MessageCard';
import CustomIcons from '../../../../constants/CustomIcons';
import MessageTime from './MessageTime';
import {useDispatch} from 'react-redux';
import {setMessageOptionEnable} from '../../../../redux/reducers/chatSlice';
import {PrivateMessage} from './PrivateChat';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import {isEmpty, isString, toUpper} from 'lodash';
import ImageBlurLoading from 'react-native-image-blur-loading';
import {useNavigation} from '@react-navigation/native';
import routes from '../../../../constants/routes';
import * as mime from 'react-native-mime-types';
import handleDownloadFiles from '../../../../services/downloadFiles';
import UploadLoadingModal from './UploadLoadingModal';
import {FontFamilies} from '../../../../styles/constants';
import Svg, {Path} from 'react-native-svg';
interface DocumentMessageProps {
  message: PrivateMessage | any;
}
const DocumentMessage: React.FC<DocumentMessageProps> = ({message}) => {
  const userId = useCurrentUserId();
  const dispatch = useDispatch();
  const parsedObject = message
    ? isEmpty(message?.payload)
      ? null
      : JSON.parse(message.payload)
    : null;

  const fileData: any = parsedObject ? Object.values(parsedObject) : [];
  const bodyObject = JSON.parse(message.body);
  const url = bodyObject['0'];
  // console.log('fileData', message);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [downloading, setDownloading] = useState(false);
  return (
    <React.Fragment>
      <TouchableOpacity
        onPress={() => {
          handleDownloadFiles(url, fileData?.[1], setDownloading);
        }}
        onLongPress={() => {
          dispatch(setMessageOptionEnable(message));
        }}
        style={{
          width: '60%',
          height: 200,
          borderRadius: 14,
          padding: 10,
          alignSelf: userId === message?.message_by ? 'flex-end' : 'flex-start',
          backgroundColor: loading
            ? 'transparent'
            : userId === message?.message_by
            ? '#EED7B9'
            : 'white',
          borderBottomRightRadius: userId === message?.message_by ? 0 : 14,
          borderBottomLeftRadius: userId === message?.message_by ? 14 : 0,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth:1,borderColor:'lightgray'
        }}>
        <Svg
          data-slot="icon"
          fill="none"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 14,
            alignSelf: 'center',
          }}
          strokeWidth={1.5}
          stroke="lightgray"
          viewBox="0 0 24 24"
          // xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          <Path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
          />
        </Svg>
        {/* <ImageBlurLoading
          onLoad={() => {
            setLoading(false);
          }}
          thumbnailSource={{
            uri: 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
          }}
          withIndicator={true}
          source={{
            uri: 'https://s3-alpha-sig.figma.com/img/c891/d4f2/135e89f7b58b1bcf86ebeda68d9c8702?Expires=1728864000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=I1NaY7qfEDlemVE2~8Ab9x0dO96TcgEGYMVIBoj2ol6DYEQX9gbmyHBbW~avpSUsXA-elAabEn7QNR7lYHnC6GOw7Csj9pOAjfCsRJtANxEdPSw-5mC8AsQ3JyYysqQJteLakiBrAk9TXVAeJ5TCa~Moj8ces74piA2a2R1PoAKJZy5nBN4KQc-y2rz7KJzOxvGwNe58GWmRr~udE4kqZh~L1wIzKwcwwsigi70iXumhlswrx5OM~I7slqzdrvbNEOyNOW6OetflqIFXo-AY31kD2kI3x2SvnHj1lbIBuUW1Dt6IGHPnWwEXQxKICfzJxI5whutdM7vMz3l38ySO1g__',
          }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 14,
            alignSelf: 'center',
          }}
          fastImage={true}

          // fastImage
        /> */}
        {/* <View
          style={{
            alignSelf: 'center',
            position: 'absolute',
            zIndex: 111,
            top: 40,
          }}>
          <CustomIcons type="DOC" width={50} height={50} />
        </View> */}
        <View
          style={{
            height: '50%',
            width: '100%',
            position: 'absolute',
            bottom: 10,
            backgroundColor: '#F4F4F5',
            padding: 10,
            gap: 5,
          }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 14,
              color: '#1E1E1E',
              fontWeight: '400',
              fontFamily: FontFamilies.medium,
              lineHeight: 18,
            }}>
            {fileData?.[1]}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#4A4A4A',
              fontWeight: '400',
              fontFamily: FontFamilies.medium,
              lineHeight: 18,
            }}>
            {/* 52 Pages · 10 MB · */}{' '}
            {toUpper(mime.extension(fileData?.[0]) as string)}
          </Text>
        </View>
        {/* <Image
          style={{
            width: '100%',
            height: 230,
            borderRadius: 14,
          }}
          source={{
            uri: imageArray?.[0],
          }}
        /> */}
      </TouchableOpacity>
      <MessageTime
        userId={userId}
        time={message?.created_at as any}
        messageuserid={message?.message_by}
        isRead={message?.is_read}
      />
      {downloading ? (
        <UploadLoadingModal
          visible={downloading}
          setVisible={setDownloading}
          type="download"
        />
      ) : null}
    </React.Fragment>
  );
};
export default DocumentMessage;
