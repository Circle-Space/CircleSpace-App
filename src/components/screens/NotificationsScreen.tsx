import React, {useState, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';

import NotificationList from './notifications/NotificationList';
import CustomHeader from '../commons/CustomHeader';

const NotificationsScreen = ({navigation}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle unread count changes from the NotificationList component
  const handleUnreadCountChange = useCallback((count) => {
    setUnreadCount(count);
    
    // Make unread count available to the bottom tab bar
    if (global && typeof global.updateNotificationCount === 'function') {
      global.updateNotificationCount(count);
    }
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Notifications"
        showBackButton={false}
        navigation={navigation}
      />
      <NotificationList 
        navigation={navigation} 
        onUnreadCountChange={handleUnreadCountChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default NotificationsScreen; 