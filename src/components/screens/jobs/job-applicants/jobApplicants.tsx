import AsyncStorage from '@react-native-async-storage/async-storage';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {get} from '../../../../services/dataRequest';
import {useNavigation} from '@react-navigation/native';
import { Color, FontSizes, LineHeights } from '../../../../styles/constants';
import { getInitials } from '../../../../utils/commonFunctions';

const ApplicantCard = ({applicant, photo, applicantId , job}: any) => {
  const navigation = useNavigation();
  const openLink = (url: any) => {
    if (url) {
      navigation.navigate('PDFViewer', {
        url: url,
        title: applicant.name,
      });
    } else {
      Alert.alert('No File found');
    }
  };
  const navigateToProfile = ()=>{
    console.log('navigateToProfile', JSON.stringify(applicantId));
    navigation.navigate('OtherUserProfile', {
      userId: applicantId,
      isSelfProfile: false,
    });
  }
  
  const handleMenuToggle = () => {
  };
  // Function to calculate "time ago" for when the applicant applied
  const getTimeAgo = (date) => {
    if (!date) return "Applied recently"; // Fallback if no date is found

    const now = new Date();
    const appliedDate = new Date(date);
    const diffTime = Math.abs(now - appliedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Applied 1 day ago";
    } else if (diffDays < 1) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      return diffHours > 1 ? `Applied ${diffHours} hours ago` : "Applied just now";
    }
    return `Applied ${diffDays} days ago`;
  };
  return (
    // <View style={styles.card}>
    //   <View style={styles.cardHeader}>
    //     <TouchableOpacity onPress={()=>navigateToProfile()} activeOpacity={1}>
    //     {photo ? (
    //       <Image source={{uri: photo}} style={styles.avatar} />
    //     ) : (
    //       <View style={styles.initialsAvatar}>
    //         <Text style={styles.initialsText}>
    //           {getInitials(applicant.name)}
    //         </Text>
    //       </View>
    //     )}
    //     </TouchableOpacity>
    //     <Text style={styles.name} onPress={()=>navigateToProfile()}>{applicant.name ?? 'Applicant Name'}</Text>
    //   </View>
    //   <Text style={styles.detailText}>
    //     {applicant.email ?? 'abc@email.com'}
    //   </Text>
    //   <Text style={styles.detailText}>
    //     {applicant.experience ?? 'Applicant Experience'}{' '}
    //     {applicant.experience == 1 ? 'Year' : 'Years'} of Experience
    //   </Text>
    //   <Text style={styles.detailText}>
    //     Notice Period : {applicant.noticePeriod ?? 'Notice Period'} Days
    //   </Text>
    //   <View style={styles.buttonContainer}>
    //     {applicant?.portfolio && (
    //       <TouchableOpacity
    //         style={styles.button}
    //         onPress={() => openLink(applicant?.portfolio)}>
    //         <Text style={styles.buttonText}>Portfolio</Text>
    //       </TouchableOpacity>
    //     )}
    //     {applicant?.resume && (
    //       <TouchableOpacity
    //         style={[styles.button, styles.resumeButton]}
    //         onPress={() => openLink(applicant.resume)}>
    //         <Text style={[styles.buttonText, styles.resumeButtonText]}>
    //           Resume
    //         </Text>
    //       </TouchableOpacity>
    //     )}
    //   </View>
    // </View>
    <TouchableOpacity style={styles.card} onPress={() => openLink(applicant.resume)}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>{getInitials(applicant.name)}</Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{applicant.name ?? 'Applicant Name'}</Text>
            {/* <Text style={styles.position}>Process Engineer at Codelane</Text>
            <Text style={styles.location}>San Francisco Bay Area</Text> */}
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleMenuToggle()}>
            <Image
              source={require('../../../../assets/header/moreWhiteIcon.png')}
              style={{height: 16, width: 16}}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {applicant.experience ?? '0'} {applicant.experience == 1 ? 'Year' : 'Years'}
          </Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {job?.jobData?.salaryRange?.length === 2
              ? `₹ ${job.jobData.salaryRange[0]}L - ₹ ${job.jobData.salaryRange[1]}L/yr`
              : '₹ 5L - ₹ 9L'}
          </Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {applicant.noticePeriod ?? '0'} Days Notice
          </Text>
        </View>
      </View>
      <View style={styles.separator}/>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{getTimeAgo(applicant.createdAt)}</Text>
        <Text style={styles.footerText}>• 3/3 requirements</Text>
      </View>
    </TouchableOpacity>
  );
};

const JobApplicants = ({ jobId }: { jobId: string }) => {
  // const {jobId} = route.params;
  const [token, setToken] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreApplicants, setHasMoreApplicants] = useState(true);

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setToken(savedToken);
      } else {
        setToken('No token found');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error fetching token');
    }
  }, []);

  const fetchApplicants = useCallback(
    async (page = 1) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await get(
          `jobs/get-jobapplicants/${jobId}?page=${page}&limit=50`,
          {},
          token,
        );
        setApplicants(prevApplicants =>
          page === 1
            ? data.applicants
            : [...prevApplicants, ...data.applicants],
        );
        setPage(page);
        setHasMoreApplicants(data.applicants.length === 10);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      } finally {
        setLoading(false);
      }
    },
    [token, jobId],
  );

  useEffect(() => {
    fetchApplicants();
  }, [token, fetchApplicants]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMoreApplicants(true);
    fetchApplicants(1).then(() => setRefreshing(false));
  }, [fetchApplicants]);

  const loadMoreApplicants = () => {
    if (!loading && hasMoreApplicants) {
      fetchApplicants(page + 1);
    }
  };

  // Conditionally render if no applicants are present
  if (applicants.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <Text>No applicants found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {flex:1}]}>
      {/* <FlashList
        showsHorizontalScrollIndicator={false}
        data={applicants}
        renderItem={({item}) => (
          <ApplicantCard
            applicant={item?.applicantProfile?.applicantData}
            photo={item?.applicantProfile?.photo}
            applicantId={item.applicantProfile?.userId}
            job={jobId} // Pass job data
          />
        )}
        keyExtractor={(item: any) => item?.applicantProfile?._id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMoreApplicants}
        onEndReachedThreshold={0.1}
      /> */}
      <FlashList
        showsHorizontalScrollIndicator={false}
        data={applicants}
        renderItem={({ item }) => (
          <ApplicantCard
            applicant={{
              ...item?.applicantProfile?.applicantData,
              appliedAt: item?.appliedAt, // Ensure appliedAt is passed
            }}
            photo={item?.applicantProfile?.photo}
            job={jobId} // Pass job data
            openLink={(resume) => {
              if (resume) {
                Linking.openURL(resume);
              }
            }}
          />
        )}
        keyExtractor={(item:any) => item?.applicantProfile?._id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMoreApplicants}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 15,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#EFEFEF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width:'100%',
  },
  // card: {
  //   backgroundColor: '#fff',
  //   borderRadius: 12,
  //   padding: 16,
  //   marginBottom: 16,
  //   shadowColor: '#000',
  //   shadowOffset: {
  //     width: 0,
  //     height: 2,
  //   },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 3,
  // },
  header: {
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent:'center',
    alignItems:'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginRight: 12,
  },
  initialsAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    fontSize: FontSizes.medium2,
    color: Color.white,
    fontFamily: 'Gilroy-Regular',
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: FontSizes.medium2,
    fontWeight: '400',
    marginBottom: 4,
    fontFamily: 'Gilroy-SemiBold',
    lineHeight:LineHeights.large,
    color:Color.black,
  },
  menuButton: {
    backgroundColor: Color.black,
    padding: 5,
    borderRadius: 50,
  },
  position: {
    fontSize: FontSizes.medium,
    color:Color.black,
    marginBottom: 2,
    fontFamily: 'Gilroy-Regular',
  },
  location: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Gilroy-Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
    justifyContent:'center',
  },
  tag: {
    backgroundColor: Color.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius:8,
    height:27,
    width:'30%',
    justifyContent:'center',
    alignItems:'center',
  },
  tagText: {
    fontSize: FontSizes.medium,
    color:Color.black,
    fontFamily: 'Gilroy-Regular',
  },
    // White line separator below tags
  separator: {
    height: 1,
    backgroundColor: '#fff', // White color
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Gilroy-Regular',
  },
  documentButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  docButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#181818',
  },
  docButtonText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Gilroy-SemiBold',
  },
  resumeButtonText: {
    color: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  moreIcon: {
    padding: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Gilroy-Regular',
    color: '#555',
    marginBottom: 10,
  },
  noticePeriodText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
    color: '#000',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#181818',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Gilroy-SemiBold',
  },
  resumeButtonText: {
    color: '#FFFFFF',
  },
});

export default JobApplicants;
