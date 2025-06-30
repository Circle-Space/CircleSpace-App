/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
  ScrollView,
  ImageBackground,
  TextInput,
  Keyboard,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Appbar, Divider, FAB} from 'react-native-paper';
import {get, post} from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JobCard from './utils/jobCard';
import {FlashList} from '@shopify/flash-list';
import {set} from 'date-fns';
import JobHeader from './jobPageHeader';
import CustomJobFAB from '../../commons/customJobFab';
import LoginBottomSheet from '../../commons/loginBottomSheet';
import PremiumUpgradeCard from './premiumUpgradeCard';
import { FontFamilies } from '../../../styles/constants'; 
export default function Jobs() {
  const [jobData, setJobsData] = useState<any>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredJobs, setFilteredJobs]: any = useState([]);
  const [token, setToken] = useState('');
  const [accountType, setAccountType] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeSwitch, setActiveSwitch] = useState(
    accountType === 'professional' ? 'posting' : 'jobs',
  );
  const jobsToDisplay: any = searchText ? filteredJobs : jobData;
  const tabs = ['Explore', 'Applied', 'Saved'];

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      },
    );

    // Remove listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const [userDetails, setUserDetails] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const navigation: any = useNavigation();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const routeToJobDetail = (item: any) => {
    if (accountType == 'temp') {
      setLoginModalVisible(true);
    } else {
      navigation.navigate('JobDetail', {
        job: item,
        token: token,
        accountType: accountType,
        userId: userDetails,
      });
    }
  };

  const updateJobDetail = async (item: any) => {
    const data = await post(`jobs/change-job-status/${item._id}`, {
      jobStatus: 'deleted',
    });
    console.log(data);
    if (data?.message.includes('Job status updated successfully')) {
      fetchPosts();
    }
  };

  const refreshJobs = async () => {
    fetchPosts();
  };

  useEffect(() => {
    fetchToken();
  }, []);
  const fetchToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const accountType_ = await AsyncStorage.getItem('accountType');
      const user: any = await AsyncStorage.getItem('user');
      const paidStatus = await AsyncStorage.getItem('isPaid');
      setIsPaid(paidStatus === 'true');
      if (user) {
        let parsed = JSON.parse(user);
        setUserDetails(parsed.userId);
      }
      setAccountType(accountType_!);
      setActiveSwitch(accountType_ == 'professional' ? 'posting' : 'jobs');
      if (savedToken !== null) {
        setToken(savedToken);
      } else {
        setToken('No token found');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error fetching token');
    }
  };

  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  const [activeTab, setActiveTab] = useState('Explore');

  const fetchPosts = useCallback(
    async (pageNumber = 1) => {
      if (!token) return;
      setLoading(true);
      try {
        let endpoint = '';
        // switch (activeSwitch) {
        //   case 'jobs':
        //     endpoint = `jobs/get-all-jobs?page=${pageNumber}&limit=20`;
        //     break;
        //   case 'posting':
        //     endpoint = `jobs/get-loggedinuser-jobs?page=${pageNumber}&limit=20`;
        //     break;
        //   case 'saved':
        //     endpoint = `jobs/get-saved-jobs?page=${pageNumber}&limit=20`;
        //     break;
        //   case 'apply':
        //     endpoint = `jobs/get-all-applied-jobs?page=${pageNumber}&limit=20`;
        //     break;
        //   default:
        //     endpoint = `jobs/get-all-jobs?page=${pageNumber}&limit=20`;
        //     break;
        // }
        switch (activeTab) {
          case 'Explore':
            endpoint = `jobs/get-all-jobs?page=${pageNumber}&limit=20`;
            break;
          case 'Your job postings':
            endpoint = `jobs/get-loggedinuser-jobs?page=${pageNumber}&limit=20`;
            break;
          case 'Saved':
            endpoint = `jobs/get-saved-jobs?page=${pageNumber}&limit=20`;
            break;
          case 'Applied':
            endpoint = `jobs/get-all-applied-jobs?page=${pageNumber}&limit=20`;
            break;
          case 'Draft':
            endpoint = `jobs/get-loggedinuser-jobs?page=${pageNumber}&limit=20`;
            break;
          case 'Active':
            endpoint = `jobs/get-loggedinuser-jobs?page=${pageNumber}&limit=20`;
            break;
          default:
            endpoint = `jobs/get-all-jobs?page=${pageNumber}&limit=20`;
            break;
        }
        const data = await get(endpoint, {}, token);

        if (data?.jobs) {
          if (isPaid !== true) {
            // setJobsData(data?.jobs?.slice(0, 1));
           setJobsData(data?.jobs);
          } else {
            setJobsData((prevJobs: any) => {
              const filteredJobs = data?.jobs?.filter((job: any) => {
                if (activeTab === 'Draft') {
                  return job.jobStatus === 'draft'; // Keep jobs with jobStatus "Draft"
                } else if (activeTab === 'Active') {
                  return job.jobStatus === 'live'; // Keep jobs with jobStatus "Live"
                }
                return true; // If no filter, return all jobs
              });

              return pageNumber === 1
                ? filteredJobs
                : [...prevJobs, ...filteredJobs];
            });
          }
          // setJobsData((prevJobs: any) =>
          //   pageNumber === 1 ? data?.jobs : [...prevJobs, ...data?.jobs],
          // );
          setPageNumber(pageNumber);
          setHasMoreJobs(data?.jobs?.length === 20);
        } else {
          setJobsData([]);
          Alert.alert('We are facing some issue.');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    },
    [token, activeSwitch, activeTab],
  );

  useEffect(() => {
    if (searchText === '') {
      setFilteredJobs(jobData);
    } else {
      const filtered = jobData.filter((job: any) => {
        const titleMatch = job?.jobData?.title
          .toLowerCase()
          .includes(searchText.toLowerCase());
        const businessNameMatch = job?.postedBy?.businessName
          ?.toLowerCase()
          .includes(searchText.toLowerCase());
        const usernameMatch = job?.postedBy?.username
          ?.toLowerCase()
          .includes(searchText.toLowerCase());

        return titleMatch || businessNameMatch || usernameMatch;
      });
      setFilteredJobs(filtered);
    }
  }, [searchText, jobData]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts(); // Fetch posts when the screen gains focus
    }, [token, activeSwitch, fetchPosts]), // Ensure dependencies are included in the dependency array
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    if (activeSwitch != 'posting') {
      setRefreshing(true);
      setHasMoreJobs(true);
      fetchPosts(1).then(() => setRefreshing(false));
    }
  }, [fetchPosts]);

  const loadMoreJobs = () => {
    if (!loading && hasMoreJobs) {
      fetchPosts(pageNumber + 1);
    }
  };

  const renderItem = (index: any, item: any) => (
    <>
      <JobCard
        job={item}
        index={index}
        routeToJobDetail={routeToJobDetail}
        accountType={accountType}
        token={token}
        activeTab={activeTab}
        userId={userDetails}
        updateJobDetail={updateJobDetail}
        refreshJobs={refreshJobs}
      />
      {/* {!isPaid && <PremiumUpgradeCard token={token} />} */}
    </>
  );
  return (
    <SafeAreaView style={styles.container}>
      {/* new jobs header */}
      <JobHeader
        accountType={accountType}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <View style={{flex: 1, marginHorizontal: 15}}>
        <FlashList
          data={jobsToDisplay}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyExtractor={(item: any) => item?._id?.toString()}
          renderItem={({item, index}) => renderItem(index, item)}
          onEndReached={loadMoreJobs}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={
            !loading && (
              <View style={styles.noPostsContainer}>
                <Image
                  source={require('../../../assets/not-found/noJobsIcon.png')}
                  style={styles.notFound}
                />
                <Text style={styles.noPostsText}>
                  {activeTab === 'Your job postings'
                    ? 'No jobs posted'
                    : activeTab === 'Explore'
                    ? 'No jobs found'
                    : activeTab === 'Saved'
                    ? 'No jobs saved'
                    : activeTab === 'Applied'
                    ? 'No jobs applied'
                    : activeTab === 'Draft'
                    ? 'No drafts found.'
                    : activeTab == 'Live'
                    ? 'No jobs published.'
                    : null}
                </Text>
                <Text style={styles.subNoPostText}>
                  {activeTab === 'Your job postings'
                    ? "You haven't posted any jobs yet. Start posting to attract candidates."
                    : activeTab === 'Explore'
                    ? "We don't have any jobs to show you at the moment."
                    : activeTab === 'Saved'
                    ? 'You haven’t saved any jobs yet. Save jobs to easily find them later.'
                    : activeTab === 'Applied'
                    ? 'You haven’t applied to any jobs yet. Start applying to get noticed!'
                    : "We don't have any jobs to show you at the moment."}
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            loading && hasMoreJobs ? (
              <ActivityIndicator size="large" color="#1E1E1E" />
            ) : null
          }
          contentContainerStyle={styles.postListContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {accountType === 'professional' && (
        // <FAB
        //   style={styles.fab}
        //   icon="plus"
        //   color="white"
        //   onPress={() =>
        //     navigation.navigate('AddJobDetailFormOne', {fromEdit: false})
        //   }
        // />
        <CustomJobFAB isPaid={isPaid} />
      )}
      {loginModalVisible && (
        <LoginBottomSheet
          visible={loginModalVisible}
          onClose={() => {
            setLoginModalVisible(false);
          }}
          showIcon={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: Platform.OS === 'android' ? 0 : 20,
  },
  shadowed: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(23, 26, 31, 0.07)',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(222, 225, 230, 1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '400',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  tabButton: {
    marginHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButtonActive: {
    borderBottomColor: 'rgba(30, 30, 30, 1)',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    fontWeight: '400',
    marginLeft: 5,
  },
  // filter buttons
  filterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
  },
  filterButton: {
    marginRight: 10,
    borderColor: 'rgba(203, 203, 203, 1)',
    borderWidth: 1,
    borderRadius: 12,
    width: 75,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
    width: 12,
    height: 12,
  },
  // search
  searchHeader: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'rgba(203, 203, 203, 1)',
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 10,
    borderRadius: 4,
    height: 40,
  },
  filterIcon: {
    marginLeft: 10,
  },
  commonIconStyle: {height: 24, width: 24},
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: 'black',
  },
  noPostsContainer: {
    flex: 1,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    padding: 20,
  },
  notFound: {
    height: 120,
    width: 120,
  },
  noPostsText: {
    marginTop: 20,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    color: '#1E1E1E',
    fontFamily: FontFamilies.semibold,
  },
  subNoPostText: {
    marginTop: 5,
    color: '#81919E',
    fontWeight: '400',
    fontSize: 12,
    width: '80%',
    textAlign: 'center',
    fontFamily: FontFamilies.regular,
    lineHeight: 15,
  },
  postListContainer: {
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'android' ? 100 : 50,
  },
});
