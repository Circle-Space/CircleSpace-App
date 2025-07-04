import React from 'react';
import {StyleSheet} from 'react-native';
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import {ParamListBase} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {FontFamilies} from '../styles/constants';
import BackButton from '../components/commons/customBackHandler';

// Authentication screens
import Landing from '../components/commons/landing';
import OTPVerificationForLogin from '../components/screens/auth/OTPVerificationForLogin';
// Main screens
import CustomBottomBar from '../components/commons/customBottomBar';
import Home from '../components/screens/home';

// Feed screens
import FeedWallExp from '../components/screens/rewampedExp/feedWallExp';
import FeedDetailExp from '../components/screens/rewampedExp/feedDetailExp';

// Profile screens
import ProfileEditPage from '../components/screens/profile/editProfile';
import EditProfileRewamped from '../components/screens/profile/profileRewamp/editProfileRewamped';
import ProfileLayout from '../components/screens/profile/profileRewamp/profileLayout';
import OtherUserProfileRewamped from '../components/screens/rewampedScreens/otherUserProfileRewamped';

// Post & Project screens
import ImageUploadPage from '../components/screens/fileUpload';
import UpdateDraftPage from '../components/screens/ugc/UpdateDraftPage';
import UploadProjects from '../components/screens/ugc/uploadProjects';
import EditPostRewamped from '../components/screens/rewampedScreens/editPostRewamped';
import PostDetailRewamped from '../components/screens/rewampedScreens/postDetailRewamped';
import ProjectDetailRewamped from '../components/screens/rewampedScreens/projectDetailRewamped';
import FullScreenLayout from '../components/screens/rewampedScreens/fullScreenLayout';
import VideoFullScreenRewamped from '../components/screens/rewampedScreens/videoFullScreenRewamped';
import FullScreenProjectRewamped from '../components/screens/rewampedScreens/fullScreenProjectRewamped';
import SelectLocation from '../components/screens/ugc/selectLocation';
import SelectTags from '../components/screens/ugc/selectTags';
import TagResultScreenRewamped from '../components/screens/rewampedScreens/tagResultScreenRewamped';
import SettingsPage from '../components/screens/profile/setting/settingsPage';
import feedSearchScreen from '../components/screens/Home/feedSearchScreen';
import FollowFollowingRewamp from '../components/screens/profile/profileRewamp/followFollowingRewamp';
import PrivacySecurityScreen from '../components/screens/profile/setting/privacySecurity';
import PremiumFeatures from '../components/screens/premium/PremiumFeatures';
import CheckoutScreens from '../components/screens/premium/CheckoutScreens';
import CouponScreen from '../components/screens/premium/CouponScreen';
import AboutUsPage from '../components/screens/profile/setting/aboutUsPage';
import SettingsReviews from '../components/screens/profile/setting/SettingsReviews';
import feedWallExp from '../components/screens/rewampedExp/feedWallExp';
import ProfessionalDetailRewamped from '../components/screens/rewampedScreens/professionalDetailRewamped';
import FullScreenImageView from '../components/screens/profile/profileRewamp/fullScreenImageViewRewamp';
import SpaceDetail from '../components/screens/profile/profileRewamp/spaceDetail';
import ViewBusinessProfile from '../components/screens/profile/viewBusinessProfile';

import Notifications from '../components/screens/notifications/Notifications';
import VideoPlayer from '../components/screens/videoplayer/VideoPlayer';
import routes from '../constants/routes';
import ImageViewer from '../components/screens/chat/private-chat/ImageViewer';
import PrivateChat from '../components/screens/chat/private-chat/PrivateChat';
import Chats from '../components/screens/chat/Chats';
import SubscriptionScreen from '../components/screens/profile/setting/subscriptionScreen';
import shareCollectionDetail from '../components/screens/profile/sharedCollection/shareCollectionDetail';
import EditSpaces from '../components/screens/profile/editSpaces';
import SavedDetailedLayout from '../components/screens/profile/savedDetailLayout';
import GetDrafts from '../components/screens/ugc/getDrafts';
import UploadCatalog from '../components/screens/ugc/uploadCatalog';

import FindingUsers from '../components/screens/quiz/findingUsers';
import AreaOfProject from '../components/screens/quiz/areaOfProject';
import EstimatedBudget from '../components/screens/quiz/estimatedBudget';
import PlanToStart from '../components/screens/quiz/planToStart';
import ProjectsWorkingOn from '../components/screens/quiz/projectsWorkingOn';
import FindServices from '../components/screens/quiz/findServices';
import FindProfessionalsScreen from '../components/screens/quiz/findProfessionals';
import FollowersList from '../components/screens/profile/FollowersList';
import ProfessionalsScreen from '../components/screens/ProfessionalsScreen';
import EventDetail from '../components/screens/events/EventDetail';
import AllCategoriesScreen from '../components/screens/AllCategoriesScreen';
import FollowingList from '../components/screens/profile/FollowingList';

import NotificationSettingPage from '../components/screens/profile/setting/notificationSettingPage';
import CancelSubscriptionScreen from '../components/screens/profile/setting/cancelSubscription';
import RatingsAndReviewsView from '../components/screens/profile/RatingsAndReviewsView';
import AddReviewView from '../components/screens/profile/AddReviewView';
import CancelSubscriptionConfirmationScreen from '../components/screens/profile/setting/cancelSubscriptionConfirmation';
import CheckoutScreen from '../components/screens/profile/setting/checkoutScreen';
import SelectAccount from '../components/screens/auth/selectAccount';

import AccountDetails from '../components/screens/auth/accountDetails';
import MultiSelectCategory from '../components/screens/auth/multiSelectCategory';
import OtherCategory from '../components/screens/auth/otherCustomCategory';

import JobDetailScreen from '../components/screens/jobs/jobDetail';
import Jobs from '../components/screens/jobs/jobs';
import addJobDetailFormOne from '../components/screens/jobs/addJob/addJobDetailForm';
import AddJobDetailFormTwo from '../components/screens/jobs/addJob/addJobDetailFormTwo';
import AddJobDetailFormThree from '../components/screens/jobs/addJob/addJobDetailFormThree';
import {FinalJobFormPreview} from '../components/screens/jobs/addJob/finalJobFormPreview';
import CityDateFilterScreen from '../components/screens/events/CityDateFilterScreen';
import ContactInfoForm from '../components/screens/jobs/user-apply-forms/contactInfoForm';
import ProfessionalDetailForm from '../components/screens/jobs/user-apply-forms/professionalDetailForm';
import WebViewScreen from '../components/screens/events/WebViewScreen';

import FeedSearchScreen from '../components/screens/Home/feedSearchScreen';
import TagResultsScreen from '../components/screens/Home/utils/tagResults';
import UserFinalReviewForm from '../components/screens/jobs/user-apply-forms/userFinalReviewForm';
import ApplySuccessScreen from '../components/screens/jobs/user-apply-forms/applySuccessScreen';
import PDFViewer from '../components/screens/jobs/user-apply-forms/pdfViewer';
import jobApplicants from '../components/screens/jobs/job-applicants/jobApplicants';

import filesUpload from '../components/screens/profile/sharedCollection/filesUpload';
import selectPeople from '../components/screens/profile/sharedCollection/selectPeople';

import UserPosted from '../components/screens/profile/userPosted';
import SinglePostView from '../components/screens/profile/singlePostView';

import FollowersFollowingScreen from '../components/profile/FollowersFollowingScreen';
import EditProfileForm from '../components/profile/EditProfileForm';
import EditBusinessPage from '../components/profile/EditBusinessPage';
import ProfileScreen from '../components/profile/ProfileScreen';
import OtherProfileScreen from '../components/profile/OtherProfileScreen';
import SeeAllGallery from '../components/profile/SeeAllGallery';
import BusinessPageScreen from '../components/profile/BusinessPageScreen';
import PostDetailExp from '../components/profile/postdetailExp';
import PDFViewerNative from '../components/profile/pdfViewerNative';
import BusinessAccountDetails from '../components/screens/auth/BusinessAccountDetails';
import BusinessDetailsStep2 from '../components/screens/auth/BusinessDetailsStep2';
import BusinessDetailsStep3 from '../components/screens/auth/BusinessDetailsStep3';
import BusinessDetailsStep4 from '../components/screens/auth/BusinessDetailsStep4';
import BusinessListedSuccess from '../components/screens/auth/BusinessListedSuccess';
import InquiryFormScreen from '../components/inquiry/InquiryFormScreen';
import InquirySuccessScreen from '../components/inquiry/InquirySuccessScreen';
import UserCard from '../components/agora/UserCard';
import VideoCall from '../components/agora/VideoCall';
import VideoCallScreen from '../components/screens/VideoCallScreen';
import VideoCallTest from '../components/screens/VideoCallTest';

const styles = StyleSheet.create({
  headerTitleStyle: {
    fontFamily: FontFamilies.bold,
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
    color: '#1E1E1E',
  },
  header: {
    elevation: 0,
  },
});

// Create the stack navigator with our type definition
const Stack = createStackNavigator<RootStackParamList>();

// Define the component props interface
interface AppNavigatorProps {
  initialRoute?: keyof RootStackParamList;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({
  initialRoute = 'Landing',
}) => {
  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      {/* Authentication Screens */}
      <Stack.Screen
        name="Landing"
        component={Landing}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SettingPage"
        component={SettingsPage}
        options={{
          title: 'Settings',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreens}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{
          title: 'Privacy & Security',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="SettingsReviews"
        component={SettingsReviews}
        options={{
          headerShown: true,
          title: 'Reviews',
          headerTitleStyle: {
            fontFamily: 'Roboto-SemiBold',
            fontSize: 18,
          },
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="NotificationSetting"
        component={NotificationSettingPage}
        options={{
          title: 'Unlock Benefits',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="CancelSubscriptionScreen"
        component={CancelSubscriptionScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="RatingsAndReviews"
        component={RatingsAndReviewsView}
        options={{
          title: 'Ratings & Reviews',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="AddReview"
        component={AddReviewView}
        options={{
          title: 'Ratings & Reviews',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="CancelSubscriptionConfirmationScreen"
        component={CancelSubscriptionConfirmationScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AboutUsPage"
        component={AboutUsPage}
        options={{
          title: 'About Us',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="CheckoutScreen"
        component={CheckoutScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="OTPVerificationForLogin"
        component={OTPVerificationForLogin}
        options={{
          title: '',
          headerLeft: () => <BackButton />,
          headerStyle: {
            shadowColor: 'transparent',
            elevation: 0,
          },
        }}
      />
      <Stack.Screen
        name="SelectAccount"
        component={SelectAccount}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AccountDetails"
        component={AccountDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BusinessAccountDetails"
        component={BusinessAccountDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BusinessDetailsStep2"
        component={BusinessDetailsStep2}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BusinessDetailsStep3"
        component={BusinessDetailsStep3}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BusinessDetailsStep4"
        component={BusinessDetailsStep4}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="BusinessListedSuccess"
        component={BusinessListedSuccess}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MultiSelectCategory"
        component={MultiSelectCategory}
        options={{
          title: '',
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="OtherCategory"
        component={OtherCategory}
        options={{
          title: '',
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{
          headerTitleAlign: 'center',
          title: 'Job Details',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="JobsScreen"
        component={Jobs}
        options={{
          headerTitleAlign: 'center',
          title: 'Jobs',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="AddJobDetailFormOne"
        component={addJobDetailFormOne}
        options={{
          headerTitleAlign: 'center',
          title: 'New job post',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="addJobDetailFormTwo"
        component={AddJobDetailFormTwo}
        options={{
          headerTitleAlign: 'center',
          title: 'New job post',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="addJobDetailFormThree"
        component={AddJobDetailFormThree}
        options={{
          title: 'New job post',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="UploadFile"
        component={ImageUploadPage}
        options={{
          // title: 'New Post',
          // headerTitleAlign: 'center',
          // headerTitleStyle: styles.headerTitleStyle,
          // headerLeft: () => <BackButton />,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UpdateDraftPage"
        component={UpdateDraftPage}
        options={{
          // title: 'Edit Post',
          // headerTitleAlign: 'center',
          // headerLeft: () => <BackButton />,
          // headerTitleStyle: styles.headerTitleStyle,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="WebViewScreen"
        component={WebViewScreen}
        options={{
          // title: '',
          // headerLeft: () => <BackButton />,
          // headerTitleStyle: styles.headerTitleStyle,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="finalJobFormPreview"
        component={FinalJobFormPreview}
        options={{
          title: 'New job post',
          headerTitleStyle: styles.headerTitleStyle,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <BackButton showCustomAlert={true} visible={true} isJobs={true} />
          ),
        }}
      />
      <Stack.Screen
        name="CityDateFilterScreen"
        component={CityDateFilterScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="feedSearchScreen"
        component={feedSearchScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TagResultsScreen"
        component={TagResultsScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="contactInfoForm"
        component={ContactInfoForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProfessionalDetailForm"
        component={ProfessionalDetailForm}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="UserFinalReviewForm"
        component={UserFinalReviewForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ApplySuccessScreen"
        component={ApplySuccessScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PDFViewer"
        component={PDFViewer}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="jobApplicants"
        component={jobApplicants}
        options={{
          title: 'Job Applicants',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      {/* <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      /> */}

      <Stack.Screen
        name="EditProfileForm"
        component={EditProfileForm}
        options={{
          headerShown: false,
          title: 'Edit Profile',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => (
            <BackButton showCustomAlert={true} visible={true} />
          ),
        }}
      />
      <Stack.Screen
        name="EditBusinessPage"
        component={EditBusinessPage}
        options={{
          headerShown: false,
          title: 'Edit Profile',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => (
            <BackButton showCustomAlert={true} visible={true} />
          ),
        }}
      />
      <Stack.Screen
        name="SeeAllGallery"
        component={SeeAllGallery}
        options={{
          headerShown: false,
          title: 'Gallery',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => (
            <BackButton showCustomAlert={true} visible={true} />
          ),
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={ProfileEditPage}
        options={{
          title: 'Edit Profile',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => (
            <BackButton showCustomAlert={true} visible={true} />
          ),
        }}
      />
      <Stack.Screen
        name="filesUpload"
        component={filesUpload}
        options={{
          title: 'New Collections',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => (
            <BackButton showCustomAlert={true} visible={true} />
          ),
        }}
      />
      <Stack.Screen
        name="selectPeople"
        component={selectPeople}
        options={{
          title: 'Select People',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="UserPosted"
        component={UserPosted}
        options={{
          title: 'Posts',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="SinglePostView"
        component={SinglePostView}
        options={{
          title: 'Post',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="FollowingList"
        component={FollowingList}
        options={{
          title: 'Following',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="AllCategories"
        component={AllCategoriesScreen}
        options={{
          headerShown: false,
          title: 'Professionals',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetail}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ProfessionalsScreen"
        component={ProfessionalsScreen}
        options={{
          title: '',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="FollowersList"
        component={FollowersList}
        options={{
          title: 'Followers',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="BottomBar"
        component={CustomBottomBar}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="FindProfessionals"
        component={FindProfessionalsScreen}
        options={{
          title: 'Find Professionals',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="FindServices"
        component={FindServices}
        options={{
          title: 'Quick Quiz',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="ProjectsWorkingOn"
        component={ProjectsWorkingOn}
        options={{
          title: 'Quick Quiz',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="PlanToStart"
        component={PlanToStart}
        options={{
          title: 'Quick Quiz',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="EstimatedBudget"
        component={EstimatedBudget}
        options={{
          title: 'Quick Quiz',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="AreaOfProject"
        component={AreaOfProject}
        options={{
          title: 'Quick Quiz',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="FindingUsers"
        component={FindingUsers}
        options={{
          title: 'Professionals',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="UploadProjects"
        component={UploadProjects}
        options={{
          // title: 'New Project',
          // headerTitleAlign: 'center',
          // headerTitleStyle: styles.headerTitleStyle,
          // headerLeft: () => <BackButton />,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SelectLocation"
        component={SelectLocation}
        options={{
          title: 'Select Location',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="SelectTags"
        component={SelectTags}
        options={{
          title: 'Select Tags',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="UploadCatalog"
        component={UploadCatalog}
        options={{
          // title: 'New Catalog',
          // headerTitleAlign: 'center',
          // headerTitleStyle: styles.headerTitleStyle,
          // headerLeft: () => <BackButton />,
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="GetDrafts"
        component={GetDrafts}
        options={{
          title: 'Drafts',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="SavedDetailedLayout"
        component={SavedDetailedLayout}
        options={{
          headerShown: false,
          title: '',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
        }}
      />
      <Stack.Screen
        name="EditSpaces"
        component={EditSpaces}
        options={{
          title: '',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="shareCollectionDetail"
        component={shareCollectionDetail}
        options={{
          title: 'Shared Collection',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="SubscriptionScreen"
        component={SubscriptionScreen}
        options={{
          title: '',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name={routes.chats}
        component={Chats}
        options={{
          headerShown: false,
          headerTitleStyle: styles.headerTitleStyle,
        }}
      />
      <Stack.Screen
        name={routes.privateChat}
        component={PrivateChat}
        key={routes.privateChat}
        options={{
          headerShown: false,
          // headerTitleStyle: styles.headerTitleStyle,
        }}
      />
      <Stack.Screen
        name={routes.ImageViewer}
        component={ImageViewer}
        key={routes.ImageViewer}
        options={{
          headerShown: false,
          headerTitleStyle: styles.headerTitleStyle,
        }}
      />
      <Stack.Screen
        name={routes.VideoPlayer}
        component={VideoPlayer}
        key={routes.VideoPlayer}
        options={{
          headerShown: false,
          headerTitleStyle: styles.headerTitleStyle,
        }}
      />

      <Stack.Screen
        name={routes.notifications}
        component={Notifications}
        key={routes.notifications}
        options={{
          headerShown: false,
          headerTitleStyle: styles.headerTitleStyle,
        }}
      />

      <Stack.Screen
        name="ViewBusinessProfile"
        component={ViewBusinessProfile}
        options={{
          headerShown: false,
          title: 'Professional Details',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="PremiumFeatures"
        component={PremiumFeatures}
        options={{
          headerShown: false,
        }}
      />
      {/* new flow screens */}
      <Stack.Screen
        name="SpaceDetail"
        component={SpaceDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FullScreenImageView"
        component={FullScreenImageView}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VideoFullScreenRewamped"
        component={VideoFullScreenRewamped}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FollowFollowingRewamp"
        component={FollowFollowingRewamp}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProjectDetailRewamped"
        component={ProjectDetailRewamped}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="PostDetailRewamped"
        component={PostDetailRewamped}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProfessionalDetailRewamped"
        component={ProfessionalDetailRewamped}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfileRewamped"
        component={EditProfileRewamped}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="CouponScreen"
        component={CouponScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={ProfileLayout}
        options={{
          headerTitle: 'Profile',
          headerTitleAlign: 'center',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="EditPostRewamped"
        component={EditPostRewamped}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AgoraVideoCall"
        component={VideoCall}
        options={{
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="VideoCallScreen"
        component={VideoCallScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VideoCallTest"
        component={VideoCallTest}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OtherUserProfileRewamped"
        component={OtherUserProfileRewamped}
        options={{
          headerShown: false,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="otherProfileScreen"
        component={ProfileScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
          animationEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="otherBusinessScreen"
        component={BusinessPageScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
          animationEnabled: false,
          headerShown: false}}
      />
      <Stack.Screen
        name="FullScreenLayout"
        component={FullScreenLayout}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TagResultScreenRewamped"
        component={TagResultScreenRewamped}
        options={{
          headerShown: false,
        }}
      />

      {/* exp exp exp */}
      <Stack.Screen
        name="FeedWallExp"
        component={feedWallExp}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FeedDetailExp"
        component={FeedDetailExp}
        options={{
          // gestureEnabled: false,
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="PostDetailExp"
        component={PostDetailExp}
        options={{
          // gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PDFViewerNative"
        component={PDFViewerNative}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FullScreenProjectRewamped"
        component={FullScreenProjectRewamped}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="FollowersFollowingScreen"
        component={FollowersFollowingScreen}
        options={{ 
          cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
          animationEnabled: false,
          headerShown: false,
         }}
      />
      <Stack.Screen
        name="InquiryForm"
        component={InquiryFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InquirySuccess"
        component={InquirySuccessScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
