import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationHeader from './NotificationHeader';
import NotificationTags from './NotificationTags';
import NotificationList from './NotificationList';
interface NotificationsProps {
  navigation: any;
  route: any;
  refreshing?: boolean;
  onRefresh?: () => void;
  onUnreadCountChange?: (count: number) => void;
}
const Notifications: React.FC<NotificationsProps> = ({navigation, route, refreshing, onRefresh, onUnreadCountChange}) => {
  return (
    <SafeAreaView>
      <View
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
          backgroundColor: 'white',
        }}>
        <StatusBar
          backgroundColor={Platform.OS === 'android' ? 'gray' : 'white'}
        />
        {/* <NotificationHeader /> */}
        {/* <NotificationTags /> */}
        <NotificationList 
          route={route} 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          navigation={navigation} 
          onUnreadCountChange={onUnreadCountChange}
        />
      </View>
    </SafeAreaView>
  );
};
export default Notifications;
