import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { CheckBox } from 'react-native-btr';

const NotificationSettingPage = () => {
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [personalizedNotifications, setPersonalizedNotifications] = useState({
    posts: true,
    followers: false,
    messages: true,
  });

  const toggleSwitch = () => setIsPushEnabled(previousState => !previousState);

  const handleCheckBoxChange = (key: any) => {
    setPersonalizedNotifications((prevState: any) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Push Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.subtitle}>Pop - up Notification</Text>
          <View style={styles.switchContainer}>
            <Switch
              trackColor={{ false: '#767577', true: '#DABC94' }} // Background color of the switch
              thumbColor={isPushEnabled ? '#FFFFFF' : '#f4f3f4'} // Thumb color based on the switch state
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isPushEnabled}
            />
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>Personalized Notifications</Text>
        <View style={[styles.row, styles.check]}>
          <Text style={styles.subtitle}>Posts, Stories & Comments</Text>
          <CheckBox
            checked={personalizedNotifications.posts}
            onPress={() => handleCheckBoxChange('posts')}
            color="#007AFF"
            containerStyle={styles.checkBoxContainer}
            style={styles.checkBoxStyle}
          />
        </View>
        <View style={[styles.row, styles.check]}>
          <Text style={styles.subtitle}>Following and followers</Text>
          <CheckBox
            checked={personalizedNotifications.followers}
            onPress={() => handleCheckBoxChange('followers')}
            color="#007AFF"
            containerStyle={styles.checkBoxContainer}
            style={styles.checkBoxStyle}
          />
        </View>
        <View style={[styles.row, styles.check]}>
          <Text style={styles.subtitle}>Messages</Text>
          <CheckBox
            checked={personalizedNotifications.messages}
            onPress={() => handleCheckBoxChange('messages')}
            color="#007AFF"
            containerStyle={styles.checkBoxContainer}
            style={styles.checkBoxStyle}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Box shadow for Android
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Gilroy-Regular',
    fontWeight: '500',
    color: '#1E1E1E',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 12,
    color: '#81919E',
    fontFamily: 'Gilroy-Regular',
  },
  check: {
    marginBottom: 10,
  },
  checkBoxContainer: {
    backgroundColor: 'transparent',
    margin: 0,
    borderRadius: 15, // Rounded corners
    borderColor: '#007AFF',
    borderWidth: 2,
    padding: 10, // Adjust padding to ensure checkbox fits well
  },
  checkBoxStyle: {
    borderRadius: 15, // Rounded corners
  },
  switchContainer: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});

export default NotificationSettingPage;
