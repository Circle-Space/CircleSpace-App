import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Header from './Header';
import PostTab from './PostTab';
import SavedTab from './SavedTab';
import ProjectTab from './ProjectTab';
import CatalogTab from './CatalogTab';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../../hooks/useProfile';

const { width } = Dimensions.get('window');

type SeeAllGalleryRouteParams = {
  userId: string;
  username: string;
  isSelf?: boolean;
  profile?: any;
  accountType: string;
};

const SeeAllGallery = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, SeeAllGalleryRouteParams>, string>>();
  const { userId, username, isSelf, accountType } = (route.params || {}) as SeeAllGalleryRouteParams;
  console.log("isSelf", isSelf);
  const [userToken, setUserToken] = useState('');
  console.log("SeeAllGallery userId:", userId);
  const { catalogs, fetchCatalogs, catalogsLoading, catalogsError } = useProfile();
  const [selectedTab, setSelectedTab] = useState('posts');

  // Dynamically build TABS based on catalogs
  const TABS = [
    { key: 'posts', label: 'Posts' },
    { key: 'projects', label: 'Projects' },
    ...(catalogs && catalogs.length > 0 ? [{ key: 'catalog', label: 'Catalog' }] : []),
    { key: 'saved', label: 'Saved' },
  ];

  useEffect(() => {
    const fetchUserToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token || '');
    };
    fetchUserToken();
    fetchCatalogs(userId, !isSelf);
  }, []);

  // If catalogs become empty and catalog tab is selected, switch to posts
  useEffect(() => {
    if (selectedTab === 'catalog' && (!catalogs || catalogs.length === 0)) {
      setSelectedTab('posts');
    }
  }, [catalogs, selectedTab]);

  // Placeholder for Projects and Catalog
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'posts':
        return <PostTab userId={userId} isSelf={isSelf} token={userToken} accountType={accountType} />;
      case 'projects':
        return <ProjectTab userId={userId} isSelf={isSelf} token={userToken} accountType={accountType} />;
      case 'catalog':
        return <CatalogTab userId={userId} isSelf={isSelf} token={userToken} accountType={accountType} />;
      case 'saved':
        return <SavedTab userId={userId} isSelf={isSelf} token={userToken} accountType={accountType} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>

   
    <View style={styles.container}>
      {/* Custom Header with back arrow, username, and 3-dot menu */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-ios" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{username}</Text>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Icon name="more-vert" size={22} color="#222" />
        </TouchableOpacity>
      </View>
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBarPill}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, selectedTab === tab.key && styles.tabBtnActive]}
              onPress={() => setSelectedTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={{ flex: 1 }}>{renderTabContent()}</View>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginHorizontal: 8,
  },
  usernameRow: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  tabBarContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  tabBarPill: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F4',
    borderRadius: 14,
    width: width * 0.9,
    alignSelf: 'center',
    height: 48,
    padding: 4,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 2,
  },
  tabText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    fontWeight: '700',
    color: '#111',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default SeeAllGallery; 