import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Color, FontFamilies, FontSizes } from '../../../styles/constants';
import Notifications from './Notifications';
import Chats from '../chat/Chats';
import { useBottomBarScroll } from '../../../hooks/useBottomBarScroll';

interface NotificationsScreenProps {
  navigation: any;
  route: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('Notifications');
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { handleScroll } = useBottomBarScroll();

  const onRefresh = async () => {
    setRefreshing(true);
    // Wait for data to refresh
    // Add your data fetching logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleUnreadCountChange = (count: number) => {
    setUnreadCount(count);
  };

  const renderContent = () => {
    if (activeTab === 'Notifications') {
      return (
        <Notifications 
          navigation={navigation} 
          route={route} 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          onUnreadCountChange={handleUnreadCountChange}
          onScroll={handleScroll}
        />
      );
    } else {
      return <Chats navigation={navigation} route={route} refreshing={refreshing} onRefresh={onRefresh} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Logo and Menu */}
     

      {/* <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Image
            source={require('../../../assets/icons/searchIcon.png')}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor="#666"
          />
        </View> */}
       
      {/* </View> */}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Notifications' && styles.activeTab]}
          onPress={() => setActiveTab('Notifications')}
        >
          <View style={styles.tabContent}>
            <View style={styles.iconContainer}>
              <Image
                source={
                  activeTab === 'Notifications'
                    ? require('../../../assets/bottombarIcons/notificationBlack.png')
                    : require('../../../assets/bottombarIcons/notificationBorder.png')
                }
                style={styles.tabIcon}
              />
              
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabText, activeTab === 'Notifications' && styles.activeTabText]}>
            Notifications
            </Text>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity 
          style={[styles.tab, activeTab === 'Chats' && styles.activeTab]}
          onPress={() => setActiveTab('Chats')}
        >
          <View style={styles.tabContent}>
            <View style={styles.iconContainer}>
              <Image
                source={
                  activeTab === 'Chats'
                    ? require('../../../assets/bottombarIcons/chatTabActive.png')
                    : require('../../../assets/bottombarIcons/chatTabInactive.png')
                }
                style={styles.tabIcon}
              />
              
            </View>
            <Text style={[styles.tabText, activeTab === 'Chats' && styles.activeTabText]}>
              Chats
            </Text>
          </View>
        </TouchableOpacity> */}
      </View>

      {/* Dynamic Content based on active tab */}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
    marginTop: 10,
    width: '100%',
    gap: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    maxWidth: '95%',
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#81919E',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
  filterButton: {
    padding: 8,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: FontFamilies.semibold,
    textAlign: 'center',
  },
  tabText: {
    fontSize: 14,
    fontFamily: FontFamilies.medium,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#000',
    fontFamily: FontFamilies.semibold,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyStateImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: FontSizes.large,
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.regular,
    color: Color.primarygrey,
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  startChatButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: FontFamilies.medium,
  },
});

export default NotificationsScreen; 