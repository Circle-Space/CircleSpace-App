// /* eslint-disable prettier/prettier */
// import React, {useEffect, useRef, useState} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   ImageBackground,
//   Modal,
//   Alert,
// } from 'react-native';
// import {Divider} from 'react-native-paper';
// import {get} from '../../../services/dataRequest';
// import LoginBottomSheet from '../../commons/loginBottomSheet';

// const JobDetailScreen = ({route, navigation}: any) => {
//   const {job} = route.params;
//   const getRandomLightColor = () => {
//     const min = 150; // Minimum RGB value for a light color
//     const max = 255; // Maximum RGB value

//     // Generate random RGB values within the light color range
//     const r = Math.floor(Math.random() * (max - min + 1)) + min;
//     const g = Math.floor(Math.random() * (max - min + 1)) + min;
//     const b = Math.floor(Math.random() * (max - min + 1)) + min;
//     return `rgb(${r},${g},${b})`;
//   };

//   const [token, setToken] = useState('');
//   const [accountType, setAccountType] = useState('');
//   const scrollViewRef = useRef<ScrollView>(null);
//   const [isChildClicked, setIsChildClicked] = useState(false);
//   useEffect(() => {
//     const fetchToken = async () => {
//       try {
//         const savedToken = await AsyncStorage.getItem('userToken');
//         const accountType_ = await AsyncStorage.getItem('accountType');
//         if (savedToken !== null) {
//           setToken(savedToken);
//         } else {
//           setToken('No token found');
//         }
//         if (accountType_ !== null) {
//           setAccountType(accountType_);
//         }
//       } catch (error) {
//         console.error('Failed to fetch token:', error);
//         setToken('Error fetching token');
//       }
//     };
//     fetchToken();
//   }, [isChildClicked]);
//   // similar jobs
//   const [jobData, setJobsData] = useState<any>([]);

//   const fetchPosts = async () => {
//     try {
//       if (token) {
//         const data = await get('jobs/get-all-jobs?page=1&limit=20', {}, token);
//         const filteredJobs = data.jobs.filter(
//           (job_: any) => job_._id !== job._id,
//         );
//         setJobsData(filteredJobs || []);
//       }
//     } catch (error) {
//       console.error('Error fetching posts:', error);
//     }
//   };

//   useEffect(() => {
//     fetchPosts();
//   }, [token, job]); // Fetch posts when the token is available

//   const truncateText = (text: any, maxLength: any) => {
//     if (text.length > maxLength) {
//       return text.substring(0, maxLength) + '...';
//     }
//     return text;
//   };
//   const toTitleCase = (str: string) => {
//     return str.replace(/\b\w/g, char => char.toUpperCase());
//   };

//   const routeToJobDetail = (
//     item: any,
//     scrollRef: React.RefObject<ScrollView>,
//   ) => {
//     setIsChildClicked(true);
//     navigation.navigate('JobDetail', {job: item});
//     scrollViewRef.current!.scrollTo({y: scrollRef!.current?.y, animated: true});
//   };

//   // save job
//   const saveJob = async (id: any) => {
//     if (accountType === 'temp') {
//       setLoginModalVisible(true);
//     } else {
//       try {
//         if (token) {
//           const data = await get(`jobs/save-job/${id}`, {}, token);
//           if (data.status === 200) {
//             Alert.alert(data.message);
//             navigation.navigate('Jobs' as never);
//           } else {
//             Alert.alert(data.message);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching posts:', error);
//       }
//     }
//   };
//   const [loginModalVisible, setLoginModalVisible] = useState(false);
//   const routeToApplyForm = (jobTitle: any, jobId: any) => {
//     if (accountType === 'temp') {
//       setLoginModalVisible(true);
//     } else {
//       navigation.navigate('contactInfoForm' as never, {jobTitle, jobId});
//     }
//   };
//   const viewApplicants = (id: any) => {
//     navigation.navigate('jobApplicants', {jobId: id});
//   };
//   const formatLocation = location => {
//     return location.join(' | ');
//   };

//   return (
//     <View>
//       <ScrollView
//         style={styles.container}
//         ref={scrollViewRef}
//         scrollIndicatorInsets={{right: 1}}>
//         <View style={styles.jobDetail}>
//           <View style={styles.jobCardContainer}>
//             <View style={styles.jobCard}>
//               {/* Column 1: Logo */}

//               {/* Column 2: Details */}
//               <View style={styles.jobDetails}>
//                 <View style={styles.jobcardHeader}>
//                   <View style={{flexDirection: 'row'}}>
//                     <Image
//                       source={{
//                         uri:
//                           job?.postedBy?.logoUrl ||
//                           'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/images.png',
//                       }}
//                       style={styles.companyLogo}
//                     />
//                     <View>
//                       <Text style={styles.jobTitle}>{job?.jobData?.title}</Text>
//                       <Text
//                         style={[
//                           styles.jobTitle,
//                           {
//                             width:
//                               job?.postedBy?.businessName?.length > 30
//                                 ? '80%'
//                                 : '100%',
//                           },
//                         ]}>
//                         {job?.postedBy?.businessName || job?.postedBy?.username}
//                       </Text>
//                     </View>
//                   </View>
//                   {/* Column 3: Saved Icon (Example) */}
//                   {/* <TouchableOpacity style={styles.savedIconContainer}>
//                     <ImageBackground
//                       source={require('../../../assets/icons/jobsMore.png')}
//                       style={styles.savedIconContainer}
//                       resizeMode="contain"
//                     />
//                   </TouchableOpacity> */}
//                 </View>
//                 <Divider style={{marginVertical: 10}} />
//                 {/* Location */}
//                 <View style={styles.infoContainer}>
//                   <Image
//                     source={require('../../../assets/icons/location.png')}
//                     style={styles.icon}
//                   />
//                   <Text style={styles.jobInfo}>
//                     {formatLocation(job?.jobData?.location)}
//                   </Text>
//                 </View>

//                 {/* Experience */}
//                 <View style={styles.infoContainer}>
//                   <Image
//                     source={require('../../../assets/icons/experience.png')}
//                     style={styles.icon}
//                   />
//                   <Text style={styles.jobInfo}>
//                     Experience:{' '}
//                     {job?.jobData?.expRange.toString().split(',').join('-')}{' '}
//                     Years
//                   </Text>
//                 </View>

//                 {/* Pay Range */}
//                 <View style={styles.infoContainer}>
//                   <Image
//                     source={require('../../../assets/icons/rupee.png')}
//                     style={styles.icon}
//                   />
//                   <Text style={styles.jobInfo}>
//                     {job?.jobData?.salaryRange[0] == 0 &&
//                     job?.jobData?.salaryRange[1] == 0
//                       ? 'Pay Range: Not disclosed'
//                       : `Pay Range: ${job?.jobData?.salaryRange[0]} - ${job?.jobData?.salaryRange[1]} LPA`}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//           <Divider style={{marginVertical: 15}} />
//           <Text style={styles.sectionTitle}>Job Description</Text>
//           <Text style={{textAlign: 'justify'}}>
//             {job?.jobData?.description}
//           </Text>
//           <Divider style={{marginVertical: 15}} />
//           <Text style={styles.sectionTitle}>Skills</Text>
//           <View style={styles.skillsContainer}>
//             {job?.jobData?.skills.map((skill: any, index: any) => (
//               <Text key={index} style={styles.skill}>
//                 {skill}
//               </Text>
//             ))}
//           </View>
//           <Divider style={{marginVertical: 15}} />
//           <Text style={styles.sectionTitle}>Qualifications</Text>
//           {job?.jobData?.qualifications.map(
//             (qualification: any, index: any) => (
//               <Text key={index}>{qualification}</Text>
//             ),
//           )}
//           <Divider style={{marginVertical: 15}} />
//           <Text style={styles.sectionTitle}>Experience</Text>
//           <Text>{job?.jobData?.expRange.toString().split(',').join('-')}</Text>
//           <Divider style={{marginVertical: 15}} />
//           <Text style={styles.sectionTitle}>Applicants Count</Text>
//           <Text>{job?.applicants?.length ?? 0}</Text>
//         </View>
//         {accountType !== 'professional' ? (
//           <View>
//             <Text style={[styles.sectionTitle, styles.moreTitle]}>
//               Recommended Jobs
//             </Text>
//             <View>
//               {jobData?.slice(0, 3)?.map((job: any, index: any) => (
//                 <TouchableOpacity
//                   activeOpacity={1}
//                   style={styles.jobCardContainer}
//                   key={index}
//                   onPress={() => routeToJobDetail(job, scrollViewRef)}>
//                   <View style={[styles.jobCard, styles.moreJobs]}>
//                     {/* Column 1: Logo */}

//                     {/* Column 2: Details */}
//                     <View style={styles.jobDetails}>
//                       <View style={styles.jobcardHeader}>
//                         <View style={{flexDirection: 'row'}}>
//                           <Image
//                             source={{
//                               uri:
//                                 job.postedBy.profilePic ||
//                                 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/images.png',
//                             }}
//                             style={styles.companyLogo}
//                           />
//                           <View>
//                             <Text style={styles.jobTitle}>
//                               {job?.jobData?.title}
//                             </Text>
//                             <Text
//                               style={styles.jobTitle}
//                               numberOfLines={1}
//                               ellipsizeMode="tail">
//                               {truncateText(
//                                 toTitleCase(job?.postedBy.businessName),
//                                 30,
//                               )}
//                             </Text>
//                           </View>
//                         </View>
//                         {/* Column 3: Saved Icon (Example) */}
//                         {/* <TouchableOpacity style={styles.savedIconContainer}>
//                           <ImageBackground
//                             source={require('../../../assets/icons/jobsMore.png')}
//                             style={styles.savedIconContainer}
//                             resizeMode="contain"
//                           />
//                         </TouchableOpacity> */}
//                       </View>
//                       <Divider style={{marginVertical: 10}} />
//                       {/* Location */}
//                       <View style={styles.infoContainer}>
//                         <Image
//                           source={require('../../../assets/icons/location.png')}
//                           style={styles.icon}
//                         />
//                         <Text style={styles.jobInfo}>
//                           {formatLocation(job?.jobData?.location)}
//                         </Text>
//                       </View>

//                       {/* Experience */}
//                       <View style={styles.infoContainer}>
//                         <Image
//                           source={require('../../../assets/icons/experience.png')}
//                           style={styles.icon}
//                         />
//                         <Text style={styles.jobInfo}>
//                           Experience: {job.jobData.expRange[0]} to{' '}
//                           {job.jobData.expRange[1]} years
//                         </Text>
//                       </View>
//                       {/* Pay Range */}
//                       <View style={styles.infoContainer}>
//                         <Image
//                           source={require('../../../assets/icons/rupee.png')}
//                           style={styles.icon}
//                         />
//                         <Text style={styles.jobInfo}>
//                           {job.jobData.salaryRange[0] == 0 &&
//                           job.jobData.salaryRange[1] == 0
//                             ? 'Pay Range: Not disclosed'
//                             : `Pay Range: ${job.jobData.salaryRange[0]} - ${job.jobData.salaryRange[1]} LPA`}
//                         </Text>
//                       </View>
//                       {/* Skills */}
//                       <View style={styles.infoContainer}>
//                         {job?.jobData?.skills &&
//                           job.jobData?.skills
//                             ?.slice(0, 2)
//                             .map((skill: any, index: any) => {
//                               // Determine displayed skill based on length and whether it contains spaces
//                               let displayedSkill = skill;
//                               if (skill.includes(' ')) {
//                                 const words = skill.split(' ');
//                                 if (words.length > 1) {
//                                   displayedSkill = `${words[0]} ...`;
//                                 }
//                               } else if (
//                                 job.jobData.skills.length > 2 &&
//                                 skill.length > 8
//                               ) {
//                                 displayedSkill = `${skill.slice(0, 8)}...`;
//                               }

//                               return (
//                                 <Text
//                                   key={index}
//                                   style={[
//                                     styles.jobInfo,
//                                     styles.skillCard,
//                                     {
//                                       backgroundColor: getRandomLightColor(),
//                                     },
//                                   ]}>
//                                   {displayedSkill}
//                                 </Text>
//                               );
//                             })}
//                         {job?.jobData?.skills?.length > 3 && (
//                           <Text
//                             style={[
//                               styles.skillCard,
//                               {backgroundColor: getRandomLightColor()},
//                             ]}>
//                             +{job.jobData.skills.length - 3} more
//                           </Text>
//                         )}
//                       </View>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               ))}
//               <TouchableOpacity
//                 style={[
//                   styles.seeMoreButton,
//                   {marginBottom: accountType !== 'professional' ? 100 : 40},
//                 ]}
//                 onPress={() => navigation.navigate('Jobs' as never)}>
//                 <Text style={styles.seeMoreText}>See more jobs like this</Text>
//                 <ImageBackground
//                   source={require('../../../assets/icons/arrowRight.png')}
//                   style={styles.savedIconContainer}
//                   resizeMode="contain"
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : null}
//       </ScrollView>
//       {accountType !== 'professional' && (
//         <View style={styles.bottomButtons}>
//           {job?.isSaved ? (
//             <View style={[styles.bottomButton]}>
//               <Text style={[styles.buttonText]}>Saved</Text>
//             </View>
//           ) : (
//             <TouchableOpacity
//               style={styles.bottomButton}
//               onPress={() => {
//                 saveJob(job?._id);
//               }}>
//               <Text style={styles.buttonText}>Save</Text>
//             </TouchableOpacity>
//           )}
//           {!job?.isApplied ? (
//             <TouchableOpacity
//               style={[styles.bottomButton, styles.bottomApply]}
//               onPress={() =>
//                 // applyJob(job?._id)
//                 routeToApplyForm(job?.jobData?.title, job?._id)
//               }>
//               <Text style={[styles.buttonText, styles.buttonActiveText]}>
//                 Apply
//               </Text>
//             </TouchableOpacity>
//           ) : (
//             <View style={[styles.bottomButton, styles.bottomApply]}>
//               <Text style={[styles.buttonText, styles.buttonActiveText]}>
//                 Applied
//               </Text>
//             </View>
//           )}
//         </View>
//       )}
//       {accountType == 'professional' && (
//         <View style={styles.bottomButtons}>
//           <TouchableOpacity
//             style={[
//               styles.bottomButton,
//               styles.bottomApplicants,
//               styles.bottomApply,
//             ]}
//             onPress={() => {
//               viewApplicants(job?._id);
//             }}>
//             <Text style={[styles.buttonText, styles.buttonActiveText]}>
//               View Applicants
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       {/* <LoginBottomSheet
//         visible={loginModalVisible}
//         onClose={() => setLoginModalVisible(false)}
//         showIcon={true}
//       /> */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     height: '100%',
//     backgroundColor: '#fff',
//   },
//   jobDetail: {
//     padding: 16,
//     borderColor: 'rgba(203, 203, 203, 1)',
//     borderWidth: 1,
//     borderRadius: 16,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     fontFamily: 'Gilroy-ExtraBold',
//   },
//   company: {
//     fontSize: 18,
//     marginBottom: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     fontFamily: 'Gilroy-Regular',
//     marginBottom: 8,
//     color: 'rgba(30, 30, 30, 1)',
//   },
//   moreTitle: {
//     marginVertical: 10,
//     fontWeight: 'bold',
//     fontFamily: 'Gilroy-ExtraBold',
//   },
//   skillsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   skill: {
//     marginRight: 8,
//     borderColor: 'rgba(203, 203, 203, 1)',
//     borderWidth: 1,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//     marginTop: 4,
//   },
//   //   head
//   jobCardContainer: {
//     marginBottom: 8,
//   },
//   jobCard: {
//     flexDirection: 'row',
//     borderRadius: 8,
//   },
//   companyLogo: {
//     width: 50,
//     height: 50,
//     borderRadius: 50,
//     marginRight: 15,
//     resizeMode: 'cover',
//   },
//   jobDetails: {
//     flex: 1,
//   },
//   jobcardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   jobTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginBottom: 6,
//     color: 'rgba(23, 26, 31, 1)',
//   },
//   jobLocation: {
//     fontSize: 14,
//     fontFamily: 'Gilroy-Regular',
//     color: 'rgba(144, 149, 160, 1)',
//     marginBottom: 1,
//   },
//   infoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//     marginRight: 10,
//   },
//   jobInfo: {
//     fontSize: 14,
//     fontFamily: 'Gilroy-Regular',
//     marginBottom: 1,
//     color: 'rgba(144, 149, 160, 1)',
//   },
//   skillCard: {
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     margin: 5,
//     borderRadius: 20,
//     color: '#000',
//     fontWeight: 'bold',
//     fontFamily: 'Gilroy-ExtraBold',
//   },
//   savedIconContainer: {
//     height: 20,
//     width: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   icon: {
//     marginRight: 10,
//     width: 12,
//     height: 12,
//   },
//   moreJobs: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 3,
//   },
//   seeMoreButton: {
//     padding: 10,
//     marginVertical: 10,
//     borderColor: 'rgba(123, 123, 123, 1)',
//     borderWidth: 1,
//     borderRadius: 10,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'row',
//   },
//   seeMoreText: {
//     fontWeight: 'bold',
//     fontFamily: 'Gilroy-ExtraBold',
//     color: 'rgba(44, 44, 44, 1)',
//   },
//   bottomButtons: {
//     position: 'absolute',
//     bottom: 10,
//     padding: 10,
//     paddingBottom: 20,
//     paddingTop: 10,
//     paddingHorizontal: 20,
//     borderTopRightRadius: 12,
//     borderTopLeftRadius: 12,
//     flexDirection: 'row',
//     backgroundColor: 'rgba(255, 255, 255, 1)',
//     width: '100%',
//     // height: 64,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   bottomButton: {
//     height: 40,
//     width: 140,
//     borderColor: 'rgba(123, 123, 123, 1)',
//     borderWidth: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 12,
//   },
//   bottomApply: {
//     backgroundColor: 'rgba(44, 44, 44, 1)',
//   },
//   bottomApplicants: {
//     width: '100%',
//   },
//   buttonText: {
//     fontWeight: 'bold',
//     fontFamily: 'Gilroy-ExtraBold',
//     color: 'black',
//   },
//   buttonActiveText: {
//     color: 'rgba(255, 255, 255, 1)',
//   },

//   // modal
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.65)',
//   },
//   modalContainer: {
//     width: '80%',
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 20,
//     height: 250,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   modalButton: {
//     marginTop: 'auto',
//     backgroundColor: '#2196F3',
//     width: '100%',
//     borderRadius: 20,
//     padding: 10,
//     elevation: 2,
//   },
//   modalButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontFamily: 'Gilroy-ExtraBold',
//     textAlign: 'center',
//   },
// });

// export default JobDetailScreen;

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {get} from '../../../services/dataRequest';
import {Divider} from 'react-native-paper';
import CustomRichTextInput from '../profile/businessProfile/customRichTextInput';
import RichTextViewer from '../profile/businessProfile/richTextViewer';
import { Color, FontFamilies, FontSizes, FontWeights, LetterSpacings, LineHeights } from '../../../styles/constants';
import JobApplicants from './job-applicants/jobApplicants';
import { getInitials } from '../../../utils/commonFunctions';

const JobDetailScreen = ({route, navigation}: any) => {
  const {job, token, accountType, userId} = route.params;
  const formatLocation = (location: any) => {
    return location.join(' | ');
  };

  const [activeTab, setActiveTab] = useState('Description');

  const routeToApplyForm = (jobTitle: any, jobId: any) => {
    navigation.navigate('contactInfoForm' as never, {jobTitle, jobId});
  };
  const viewApplicants = (id: any) => {
    navigation.navigate('jobApplicants', {jobId: id});
  };

  const [isSaved, setIsSaved] = useState(job?.isSaved);
  const saveJobPost = async (id: any) => {
    try {
      if (token) {
        const data = await get(`jobs/save-job/${id}`, {}, token);
        if (data.status === 200) {
          setIsSaved(true); // Update state to reflect saved status
          navigation.navigate('Jobs' as never);
        } else {
          // Alert.alert(data.message);
        }
      }
    } catch (error) {
      console.error('Error saving job post:', error);
    }
  };
  const routeToProfile = (id: any) => {
    if (id === userId) {
      navigation.navigate('OtherUserProfile', {
        userId: id,
        isSelfProfile: true,
      });
    } else {
      navigation.navigate('OtherUserProfile', {
        userId: id,
        isSelfProfile: false,
      });
    }
  };
  
  const editJobPost = (job: any) => {
    navigation.navigate('AddJobDetailFormOne', {
      comingFromPreview: job,
      isEdit: true,
      jobId: job._id,
    });
  };
  
  return (
    <View style={styles.container}>
      {/* Header and scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Company and Job Title */}
        <View style={styles.companyContainer}>
          <TouchableOpacity
            style={{alignItems: 'center'}}
            onPress={() => {
              routeToProfile(job?.posterDetails?.userId);
            }}>
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
            <Text style={[styles.companyName]}>
              {job?.postedBy?.businessName || job?.postedBy?.username}
            </Text>
          </TouchableOpacity>
          <Text style={styles.jobTitle}>{job?.jobData?.title}</Text>
          <View style={styles.locationContainer}>
            <Image
              source={require('../../../assets/icons/location.png')} // Replace with your location icon path
              style={styles.locationIcon}
            />
            <Text style={styles.locationText}>
              {formatLocation(job?.jobData?.location)}
            </Text>
          </View>
        </View>

        {/* Job Details */}
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
        {/* <Divider /> */}
        {/* Temporary Tab */}
        {/* <View style={styles.tab}>
          <Text style={styles.tabText}>Description</Text>
        </View> */}
        {/* Description and Company Tabs */}
        {/* <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'Description'
                  ? styles.activeTab
                  : styles.inactiveTab,
              ]}
              // onPress={() => setActiveTab('Description')}>
              >
              <Text
                style={
                  activeTab === 'Description'
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }>
                Description
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'Company' ? styles.activeTab : styles.inactiveTab,
              ]}
              // onPress={() => setActiveTab('Company')}>
              >
              <Text
                style={
                  activeTab === 'Company'
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }>
                Company
              </Text>
            </TouchableOpacity>
          </View> */}
        {/* </View> */}
        <View style={styles.tabContainer}>
  <View style={styles.tabWrapper}>
    {/* Show "Description" & "Applicants" when the account is professional and user is the job creator */}
    {accountType === 'professional' && job?.postedBy?.userId === userId ? (
      <>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Description' ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => setActiveTab('Description')}>
          <Text
            style={
              activeTab === 'Description'
                ? styles.activeTabText
                : styles.inactiveTabText
            }>
            Description
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Applicants' ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => setActiveTab('Applicants')}>
          <Text
            style={
              activeTab === 'Applicants'
                ? styles.activeTabText
                : styles.inactiveTabText
            }>
            Applicants
          </Text>
        </TouchableOpacity>
      </>
    ) : (
      /* Default case: Show "Description" & "Company" */
      <>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Description' ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => setActiveTab('Description')}>
          <Text
            style={
              activeTab === 'Description'
                ? styles.activeTabText
                : styles.inactiveTabText
            }>
            Description
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Company' ? styles.activeTab : styles.inactiveTab,
          ]}
          // onPress={() => setActiveTab('Company')}>
          >
          <Text
            style={
              activeTab === 'Company'
                ? styles.activeTabText
                : styles.inactiveTabText
            }>
            Company
          </Text>
        </TouchableOpacity>
      </>
    )}
  </View>
</View>

        {/* Scrollable Content */}
        {/* <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Job Description</Text> */}
          {/* <Text style={styles.descriptionText}>
            {job?.jobData?.description}
          </Text> */}
          {/* <RichTextViewer htmlContent={job?.jobData?.description} />
        </View>
        {job?.jobData?.skills?.filter((skill: any) => skill !== null).length >
          0 && (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Skills Required</Text>
            <View style={styles.tagContainer}>
              {job?.jobData?.skills
                ?.filter((skill: any) => skill !== null)
                .map((tag: any, index: any) => (
                  <View key={index} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}
        {job?.jobData?.qualifications?.filter((qual: any) => qual !== null)
          .length > 0 && (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Qualification</Text>
            <View style={styles.tagContainer}>
              {job?.jobData?.qualifications
                ?.filter((qual: any) => qual !== null)
                .map((qual: any, index: any) => (
                  <View key={index} style={styles.tagChip}>
                    <Text style={styles.tagText}>{qual}</Text>
                  </View>
                ))}
            </View>
          </View>
        )} */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
  {/* Render Job Description and Details Only if "Description" Tab is Active */}
  {activeTab === 'Description' && (
    <>
      {/* Job Description */}
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Job Description</Text>
        <RichTextViewer htmlContent={job?.jobData?.description} />
      </View>

      {/* Skills Required */}
      {job?.jobData?.skills?.filter((skill: any) => skill !== null).length > 0 && (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Skills Required</Text>
          <View style={styles.tagContainer}>
            {job?.jobData?.skills
              ?.filter((skill: any) => skill !== null)
              .map((tag: any, index: any) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Qualification */}
      {job?.jobData?.qualifications?.filter((qual: any) => qual !== null).length > 0 && (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Qualification</Text>
          <View style={styles.tagContainer}>
            {job?.jobData?.qualifications
              ?.filter((qual: any) => qual !== null)
              .map((qual: any, index: any) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>{qual}</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Applicants List - Only When Description Tab is Active */}
      {/* <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Applicants</Text>
        <JobApplicants jobId={job?._id} />
      </View> */}
    </>
  )}

  {/* Placeholder for Applicants Tab (You can customize as needed) */}
  {activeTab === 'Applicants' && (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Applicants Tab is Active</Text>
      {/* Add any additional content or placeholder for Applicants tab */}
    </View>
  )}
    {activeTab === 'Applicants' && (
    <View style={{ flex: 1 }}>
      <JobApplicants jobId={job?._id} />
    </View>
  )}
</ScrollView>

      </ScrollView>

      {/* Fixed Bottom Action Buttons */}
      <View style={styles.bottomContainer}>
        {job?.postedBy?.userId === userId ? (
          <>
            {job.jobStatus == 'live' ? (
              <TouchableOpacity
                // style={styles.applyButton}
                // onPress={() => viewApplicants(job._id)} // Remove unnecessary optional chaining
              >
                {/* <Text style={styles.applyButtonText}>View Applicants</Text> */}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => editJobPost(job)} // Remove unnecessary optional chaining
              >
                <Text style={styles.applyButtonText}>Publish Job</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {job?.isApplied ? (
              // If the job is already applied, show a disabled "Applied" button
              <TouchableOpacity style={styles.applyButton} disabled={true}>
                <Text style={styles.applyButtonText}>Applied</Text>
              </TouchableOpacity>
            ) : (
              // If the job is not applied, show the "Apply" button
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => routeToApplyForm(job?.jobData?.title, job?._id)}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        {job?.postedBy?.userId !== userId && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => saveJobPost(job?._id)}>
            <Image
              source={
                isSaved
                  ? require('../../../assets/jobDetail/savedActiveIcon.png')
                  : require('../../../assets/jobDetail/saveIcon.png')
              }
              style={styles.saveIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
export default JobDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 18,
  },
  headerIcon: {
    width: 18,
    height: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1E1E1E',
  },
  companyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: '#FFFFFF', // Ensure a background color for proper shadow visibility
    borderColor:Color.white,
    borderWidth: 1,
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: {width: 0, height: 18}, // Offset for the shadow
    shadowOpacity: 0.24, // Opacity of the shadow for iOS
    shadowRadius: 24, // Blur radius for the shadow
    elevation: 5,
  },
  initialsAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Color.white,
    borderWidth:1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  initialsText: {
    color: Color.black,
    fontSize: 16,
    marginLeft:5,
    fontWeight: '400',
    fontFamily: 'Gilroy-Regular',
  },
  companyName: {
    fontSize: FontSizes.small,
    fontWeight: '400',
    color: Color.black,
    marginBottom: 5,
    letterSpacing:LetterSpacings.wide,
    fontFamily: FontFamilies.medium,
  },
  jobTitle: {
    fontSize: FontSizes.large,
    fontWeight: '400',
    color: Color.black,
    fontFamily: FontFamilies.semibold,
    marginVertical: 5,
    lineHeight: LineHeights.medium,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 14,
    height: 14,
    marginRight: 5,
  },
  locationText: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    color: Color.black,
    letterSpacing:LetterSpacings.wide,
    fontWeight: '400',
  },
  // Temporary Tab css
  tab: {
    backgroundColor: '#1E1E1E', // dark background for the active tab
    paddingVertical: 10, // vertical padding for the active tab
    paddingHorizontal: 20, // horizontal padding for the active tab
    borderRadius: 11, // rounding corners of the active tab
  },
  tabText: {
    textAlign: 'center',
    color: '#FFFFFF', // white text color for the active tab
    fontSize: 16, // font size for the active tab text
    fontWeight: '400', // font weight for better readability
    fontFamily: 'Gilroy-Semibold',
  },
  tabContainer: {
    alignItems: 'center',
    height: 52,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: Color.white,
    borderRadius: 14,
    padding: 8,
    elevation:2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 15,
  },
  activeTab: {
    backgroundColor: '#1E1E1E', // Dark background color for active tab
  },
  inactiveTab: {
    backgroundColor: Color.white, // Transparent background for inactive tab
  },
  activeTabText: {
    color: Color.white, // White text color for active tab
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Gilroy-SemiBold',
  },
  inactiveTabText: {
    color: Color.black, // Brown text color for inactive tab
    fontSize: FontSizes.medium,
    fontFamily: 'Gilroy-SemiBold',
  },
  contentContainer: {
    // flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: '400',
    color: '#1E1E1E',
    marginVertical: 20,
  },

  descriptionText: {
    fontSize: FontSizes.medium,
    letterSpacing:LetterSpacings.wide,
    color:Color.black,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
    marginBottom: 10,
    lineHeight: LineHeights.medium,
  },
  showMoreText: {
    color: '#1E1E1E',
    fontWeight: '400',
    fontFamily: 'Gilroy-Medium',
    fontSize: 12,
    lineHeight: 14.56,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginRight: 10,
    height: 52,
    marginBottom: 10,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: '400',
  },
  saveButton: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveIcon: {
    width: 16,
    height: 16,
  },
  infoBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 20,
  },
  infoText: {
    fontSize: FontSizes.small,
    lineHeight: LineHeights.medium,
    color: Color.black,
    fontWeight: '400',
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 10,
    fontFamily: FontFamilies.medium,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap:3,
  },
  tagChip: {
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: FontSizes.small,
    color: Color.black,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    lineHeight:LineHeights.medium
  },
});
