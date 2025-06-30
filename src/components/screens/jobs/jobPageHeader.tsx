import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Dimensions
} from 'react-native';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../styles/constants';
import { moderateScale } from 'react-native-size-matters';

const JobHeader = ({
  accountType,
  activeTab,
  setActiveTab,
  searchText,
  setSearchText,
}: any) => {
  const personalTabs = ['Explore', 'Applied', 'Saved'];
  const professionalTabs = ['Active', 'Draft','Closed'];
  const [selectedTab, setSelectedTab] = useState('jobsForYou');

  // Automatically set the first filter as active when the selectedTab changes
  useEffect(() => {
    if (selectedTab === 'jobsForYou') {
      setActiveTab(personalTabs[0]); // Set the first personal tab as active
    } else if (selectedTab === 'jobPostings') {
      setActiveTab(professionalTabs[0]); // Set the first professional tab as active
    }
  }, [selectedTab, setActiveTab]);

  return (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Image
            source={require('../../../assets/icons/searchIcon.png')} // Path to your search icon
            style={styles.searchIcon}
          />
          <TextInput
            placeholderTextColor="#81919E"
            placeholder="Search for jobs"
            style={styles.searchInput}
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
        </View>
        <View style={styles.filterIcon}>
          <Image
          source={require('../../../assets/community/filterIcon.png')}
          style={styles.searchIcon}
          />
        </View>
      </View>

      {/* Tab Bar */}
      {accountType == 'professional' && (
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'jobsForYou' && styles.activeTab,
            ]}
            onPress={() => setSelectedTab('jobsForYou')}>
            <Image
              source={require('../../../assets/jobs/jobsForYouInactive.png')} // Path to your image
              style={[
                styles.tabIcon,
                {
                  tintColor:
                    selectedTab === 'jobsForYou' ? '#1E1E1E' : '#A0A0A0',
                }, // Dynamic color
              ]}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'jobsForYou' && styles.activeText,
              ]}>
              Jobs for you
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'jobPostings' && styles.activeTab,
            ]}
            onPress={() => setSelectedTab('jobPostings')}>
            <Image
              source={require('../../../assets/jobs/yourPostingIconActive.png')} // Path to your image
              style={[
                styles.tabIcon,
                {
                  tintColor:
                    selectedTab === 'jobPostings' ? '#1E1E1E' : '#A0A0A0',
                }, // Dynamic color
              ]}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'jobPostings' && styles.activeText,
              ]}>
              Your job postings
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Tab Filter Buttons */}
      <View style={styles.tabFilterContainer}>
        {accountType != 'temp' ?(selectedTab === 'jobsForYou' ? personalTabs : professionalTabs).map(
          (tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab && styles.tabButtonTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ),
        ) : null }
      </View>

      {/* Label under Tabs */}
      <Text style={styles.activeLabel}>
        {activeTab === 'Explore'
          ? ''
          : activeTab === 'Applied'
          ? ''
          : activeTab === 'Saved'
          ? ''
          : activeTab === 'Active'
          ? ''
          : activeTab === 'Draft'
          ? ''
          : activeTab === 'Closed'
          ?''
          : 'Your posted jobs'}
      </Text>
    </View>
  );
};

export default JobHeader;

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:14,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    // marginRight: 10,
    // gap: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    // tintColor: '#828282',
  },
  filterIcon: {
    backgroundColor:Color.black,
    height:44,
    width:44,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#81919E',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#F2F2F2',
    marginTop: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E1E1E',
  },
  tabIcon: {
    height: 22,
    width: 22,
  },
  tabText: {
    fontSize: FontSizes.medium,
    marginTop: 10,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    color: '#81919E',
  },
  activeText: {
    color: Color.black,
  },
  tabFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 14,
  },
  tabButton: {
    flex: 1,
    minWidth: 86,
    justifyContent: 'center',
    height: 36,
    borderRadius: 12,
    backgroundColor: Color.white, // Default light background color for inactive tabs
    alignItems: 'center',
    borderWidth:1,
    paddingHorizontal:20,
    paddingVertical:10,
  },
  tabButtonActive: {
    backgroundColor: '#1E1E1E',
  },
  tabButtonText: {
    color: Color.black,
    fontSize: moderateScale(14),
    fontWeight: '400',
    lineHeight: LineHeights.small,
    fontFamily: FontFamilies.medium,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  activeLabel: {
    fontWeight: '400',
    fontSize: FontSizes.large,
    lineHeight: 19,
    color: Color.black,
    fontFamily: FontFamilies.semibold,
  },
});
