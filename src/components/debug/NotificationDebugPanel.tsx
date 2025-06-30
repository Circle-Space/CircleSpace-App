import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { testNotificationSetup, sendTestNotification, clearNotificationData } from '../../utils/notificationTest';

interface NotificationDebugPanelProps {
  visible?: boolean;
}

const NotificationDebugPanel: React.FC<NotificationDebugPanelProps> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Notification Debug Panel</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS} {Platform.Version}</Text>
      
      <TouchableOpacity style={styles.button} onPress={testNotificationSetup}>
        <Text style={styles.buttonText}>🧪 Test Notification Setup</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={sendTestNotification}>
        <Text style={styles.buttonText}>📱 Get FCM Token</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={clearNotificationData}>
        <Text style={styles.buttonText}>🗑️ Clear Notification Data</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>
        📝 Check console logs for detailed information
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  note: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default NotificationDebugPanel; 