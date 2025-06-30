import {AnyArn} from 'aws-sdk/clients/groundstation';
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {Divider} from 'react-native-paper';
import {get, post} from '../../../../services/dataRequest';
import {useNavigation} from '@react-navigation/native';
import CustomAlertModal from '../../../commons/customAlert';
import {handleShareJob} from './utils';
import { Color, FontFamilies, FontSizes, LetterSpacings, LineHeights } from '../../../../styles/constants';
import { ScaledSheet, scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { getInitials } from '../../../../utils/commonFunctions';


const JobCard = ({
  job,
  index,
  routeToJobDetail,
  accountType,
  token,
  activeTab,
  userId,
  updateJobDetail,
  refreshJobs,
}: any) => {
  const locations = job?.jobData?.location?.join(', ');
  const navigation = useNavigation();
  const [isSaved, setIsSaved] = useState(job?.isSaved);
  const saveJobPost = async (id: any, type?: any) => {
    try {
      if (token) {
        const data = await get(`jobs/save-job/${id}`, {}, token);
        if (data.status === 200) {
          // Alert.alert(data.message);
          if (type == 'Save') {
            setIsSaved(true); // Update state to reflect saved status
          } else {
            setIsSaved(false);
          }
          navigation.navigate('Jobs' as never);
          setMenuVisible(false);
          refreshJobs();
        } else {
          Alert.alert(data.message);
        }
      }
    } catch (error) {
      console.error('Error saving job post:', error);
    }
  };

  const timeAgo = (timestamp: any) => {
    const now: any = new Date();
    const time: any = new Date(timestamp);
    const secondsAgo = Math.floor((now - time) / 1000);
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);
    const monthsAgo = Math.floor(daysAgo / 30);

    if (monthsAgo > 0) {
      return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
    } else if (daysAgo > 0) {
      return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    } else if (hoursAgo > 0) {
      return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    } else if (minutesAgo > 0) {
      return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
    } else {
      return `${secondsAgo} second${secondsAgo > 1 ? 's' : ''} ago`;
    }
  };

  const routeToProfile = (id: any) => {
    navigation.navigate('OtherUserProfile', {
      userId: id,
      isSelfProfile: false,
    });
  };

  // menu
  const [menuVisible, setMenuVisible] = useState(false);
  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuOptionSelect = (option: string, job: any, type?: any) => {
    setMenuVisible(false);
    switch (option) {
      case 'save':
        saveJobPost(job._id, type);
        break;
      case 'edit':
        // setEditModalVisible(true);
        handleJobEdit(job);
        break;
      case 'delete':
        setJobDeleteModalVisible(true);
        // setEditModalVisible(true);
        break;
      case 'share':
        handleShareJob(job);
        break;
      default:
        break;
    }
  };
  const handleJobEdit = (job: any) => {
    navigation.navigate('AddJobDetailFormOne', {
      comingFromPreview: job,
      isEdit: true,
      jobId: job?._id,
    });
  };

  const handleJobDelete = async (job: any) => {
    updateJobDetail(job);
    setMenuVisible(false);
    setJobDeleteModalVisible(false);

    // const data = await post(`jobs/change-job-status/${job._id}`, {"jobStatus": "deleted"});
    // console.log(data);
    // if (data?.message.includes('Job status updated successfully')) {
    //   navigation.navigate('Jobs' as never);
    // }
  };
  const handleJobPostCancel = () => {
    setJobDeleteModalVisible(false);
  };

  const [jobDeleteModalVisible, setJobDeleteModalVisible] = useState(false);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.jobCardContainer}
      key={index}
      onPress={() => routeToJobDetail(job)}>
      <View style={styles.jobCard}>
        {/* Column 1: Logo */}
        <View style={styles.columnLogo}>
          {/* <Image
            source={{
              uri:
                job?.posterDetails?.profilePic ||
                'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
            }}
            style={styles.companyLogo}
          /> */}
          {job?.posterDetails?.profilePic ? (
            <Image
              source={{uri: job?.posterDetails?.profilePic}}
              style={styles.companyLogo}
            />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>
                {getInitials(
                  job?.postedBy?.username,
                )}{' '}
                {/* Assuming getInitials is a function that extracts initials */}
              </Text>
            </View>
          )}
        </View>

        {/* Column 2: Details */}
        <View style={styles.columnDetails}>
          <Text style={styles.companyTitle}>
            {job?.postedBy?.businessName || job?.postedBy?.username}
          </Text>
          <Text style={styles.jobTitle}>{job?.jobData?.title}</Text>
          <Text style={styles.skills}>{job?.jobData?.skills?.join(', ')}</Text>
        </View>
        {/* Column 3: Saved Icon */}
        {/* {accountType !== 'personal' && ( */}
        {/* {job?.postedBy?.userId !== userId && (
          <TouchableOpacity onPress={() => saveJobPost(job._id)}>
            <Image
              source={
                isSaved
                  ? require('../../../../assets/jobs/saveFillIcon.png') // Filled bookmark icon
                  : require('../../../../assets/jobs/saveIcon.png') // Outline bookmark icon
              }
              style={styles.savedIcon}
            />
          </TouchableOpacity>
        )} */}
        {accountType !== 'temp' && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleMenuToggle()}>
            <Image
              source={require('../../../../assets/header/moreWhiteIcon.png')}
              style={{height: 16, width: 16}}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* Information Block */}
      <View style={styles.infoBlock}>
        <Text style={styles.infoText}>
          {job?.jobData?.expRange[0]} - {job?.jobData?.expRange[1]} yrs.
        </Text>
        <Text style={styles.infoText}>
          ₹ {job?.jobData?.salaryRange[0]}L - ₹ {job?.jobData?.salaryRange[1]}
          L/yr
        </Text>
        <Text style={styles.infoText}>{job?.jobData?.jobType}</Text>
      </View>
      {activeTab == 'Your job postings' && (
        <Text style={[styles.infoText, {width: '100%', textAlign: 'center'}]}>
          {job?.applicants?.length === 1
            ? `${job.applicants.length} Applicant`
            : `${job?.applicants?.length ?? 0} Applicants`}
        </Text>
      )}
      <Divider style={{marginVertical: 10, borderWidth:0.6, borderColor:"#FFFFFF"}} />
      {/* Location and Date */}
      <View style={styles.locationDateContainer}>
        <View style={styles.infoContainer}>
          <Image
            source={require('../../../../assets/icons/locationIcon.png')}
            style={styles.locationIcon}
          />
          <Text style={styles.jobInfo}>{locations}</Text>
        </View>
        <Text style={styles.postedDate}>{timeAgo(job?.dateOfCreation)}</Text>
      </View>

      {menuVisible && (
        <View style={styles.menu}>
          {job?.postedBy?.userId !== userId && (
            <>
              <TouchableOpacity
                onPress={() =>
                  handleMenuOptionSelect(
                    'save',
                    job,
                    isSaved ? 'Saved' : 'Save',
                  )
                }
                style={styles.menuItem}>
                <Text style={styles.menuItemText}>
                  {isSaved ? 'Unsave' : 'Save'}
                </Text>
              </TouchableOpacity>
              <Divider style={styles.divider} />
            </>
          )}
          {job?.postedBy?.userId === userId && (
            <>
              <TouchableOpacity
                onPress={() => handleMenuOptionSelect('edit', job)}
                style={styles.menuItem}>
                <Text style={styles.menuItemText}>Edit</Text>
              </TouchableOpacity>
              <Divider style={styles.divider} />
              <TouchableOpacity
                onPress={() => handleMenuOptionSelect('delete', job)}
                style={styles.menuItem}>
                <Text style={[styles.menuItemText, styles.deleteText]}>
                  Delete
                </Text>
              </TouchableOpacity>
              <Divider style={styles.divider} />
            </>
          )}
          <TouchableOpacity
            onPress={() => handleMenuOptionSelect('share', job)}
            style={styles.menuItem}>
            <Text style={styles.menuItemText}>Share</Text>
          </TouchableOpacity>
          <Divider style={styles.divider} />
          <TouchableOpacity
            onPress={() => handleMenuOptionSelect('cancel', job)}
            style={styles.menuItem}>
            <Text style={styles.menuItemText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <CustomAlertModal
        visible={jobDeleteModalVisible}
        title="Job Post"
        description="Are you sure you want to delete this job post?"
        buttonOneText="Delete"
        buttonTwoText="Cancel"
        onPressButton1={() => handleJobDelete(job)}
        onPressButton2={handleJobPostCancel}
      />
    </TouchableOpacity>
  );
};

export default JobCard;

const styles = StyleSheet.create({
  jobCardContainer: {
    marginBottom: 15,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#EFEFEF',
  },
  jobCard: {
    flexDirection: 'row',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#171A1F',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  columnLogo: {
    marginRight: 15,
  },
  columnDetails: {
    flex: 1,
  },
  companyLogo: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  initialsAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Color.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 15,
  },
  initialsText: {
    justifyContent:'center',
    alignItems:'center',
    color: Color.black,
    fontSize: FontSizes.large,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
  companyTitle: {
    fontSize: FontSizes.extraSmall,
    color: Color.black,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    lineHeight: LineHeights.small,
    letterSpacing:LetterSpacings.wide,
  },
  jobTitle: {
    marginVertical: 5,
    fontSize: FontSizes.medium,
    color: Color.black,
    fontWeight: '400',
    fontFamily: FontFamilies.semibold,
    lineHeight: LineHeights.medium,
    letterSpacing:LetterSpacings.wide,
  },
  skills: {
    fontSize: FontSizes.extraSmall,
    lineHeight: 12,
    fontWeight: '400',
    color: '#4A4A4A',
    fontFamily: FontFamilies.regular,
    letterSpacing:LetterSpacings.wide,
  },
  // infoBlock: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   gap: 9,
  //   marginBottom: 10,
  //   width:'100%',
  // },
  // infoText: {
  //   fontSize: 12,
  //   lineHeight: 15,
  //   color: '#1E1E1E',
  //   fontWeight: '400',
  //   backgroundColor: '#FFFFFF',
  //   paddingHorizontal: 20,
  //   paddingVertical: 6,
  //   borderRadius: 8,
  //   fontFamily: 'Gilroy-Medium',
  // },
  infoBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(6), // Responsive gap
    marginBottom: moderateScale(10),
    width: '100%',
    flexWrap: 'nowrap', // Ensures a single line
    overflow: 'hidden', // Prevents breaking
  },
  infoText: {
    fontSize: scale(FontSizes.small),
    lineHeight: scale(12),
    color: '#1E1E1E',
    fontWeight: '400',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(8),
    fontFamily: FontFamilies.regular,
    textAlign: 'center',
    maxWidth: '48%', // Prevents text from pushing content
    overflow: 'hidden',
    minWidth:'27%',
  },
  locationDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobInfo: {
    fontSize: FontSizes.extraSmall,
    fontWeight: '400',
    color: '#4A4A4A',
    marginLeft: 5,
    fontFamily: FontFamilies.regular,
    lineHeight: LineHeights.medium,
    letterSpacing:LetterSpacings.wide,
  },
  locationIcon: {
    height: 14,
    width: 14,
  },
  postedDate: {
    fontSize: FontSizes.extraSmall,
    fontWeight: '400',
    color: Color.black,
    fontFamily: FontFamilies.regular,
    // width: 52,
    // height: 12,
    marginRight:10,
  },
  savedIcon: {
    height: 30,
    width: 30,
  },
  menuButton: {
    backgroundColor: Color.black,
    padding: 5,
    borderRadius: 50,
  },
  divider: {
    height: 1,
    opacity: 0.4,
    backgroundColor: '#B9B9BB',
    width: '100%',
  },
  menu: {
    position:'absolute',
    right: 20,
    top: Platform.OS == 'ios' ? 60 : 75,
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
    width: 150,
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: FontSizes.small,
    color: '#000',
    fontFamily: 'Gilroy-Medium',
  },
  reportText: {
    color: '#ED4956',
  },
  deleteText: {
    color: '#ED4956',
  },
});
