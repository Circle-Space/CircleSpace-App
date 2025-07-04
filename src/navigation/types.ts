import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Define the types for all route params
export type RootStackParamList = {
  // Authentication screens
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  OTPVerification: { email?: string; phone?: string };
  OTPVerificationForLogin: { email?: string; phone?: string };
  ForgotPassword: undefined;
  ResetPassword: { token?: string; email?: string; };
  SelectAccount: undefined;
  selectAccountForReset: undefined;
  AccountType: undefined;
  personalForm: undefined;
  businessForm: undefined;
  AccountDetails: undefined;
  MultiSelectCategory: undefined;
  OtherCategory: undefined;
  AccountTypeCategorySelection: undefined;
  AccountTypeLocationSelection: undefined;
  
  // Main app screens
  BottomBar: { screen?: string };
  Home: undefined;
  
  // Feed screens
  FeedWallExp: undefined;
  FeedDetailExp: { 
    posts: any[];
    currentIndex: number;
    type: string;
    projectId: string;
    token: string;
    pageName: string;
    onFollowUpdate?: (updatedPosts: any[]) => void;
    navigationStack?: any[];
  };
  
  // Profile screens
  EditProfile: undefined;
  EditProfileRewamped: undefined;
  UserProfile: {
    profile: any;
    self: boolean;
    setOpenShare: (val: boolean) => void;
    openShare: boolean;
    navigation: any;
  };
  OtherUserProfileRewamped: {
    userId: string;
    isSelfProfile: boolean;
  };
  
  // Post and project screens
  UploadFile: undefined;
  UpdateDraftPage: { data: any };
  UploadProjects: { data?: any };
  EditPostRewamped: { draft: any };
  PostDetailRewamped: { 
    feed: any;
    token: string;
    accountType?: string;
    pageName?: string;
  };
  ProjectDetailRewamped: { 
    feed: any;
    token: string;
    pageName?: string;
  };
  FullScreenLayout: {
    items: any[];
    initialIndex: number;
    type: string;
    projectId?: string;
  };
  VideoFullScreenRewamped: {
    items: any[];
    initialIndex: number;
    type: string;
    projectId?: string;
  };
  FullScreenProjectRewamped: {
    items: any[];
    initialIndex: number;
    type: string;
    projectId?: string;
  };
  SelectLocation: {
    onSelect: (location: any) => void;
  };
  SelectTags: {
    selectedTags: any[];
    onSelect: (tags: any[]) => void;
  };
  TagResultScreenRewamped: {
    query: string;
  };
  privateChat: { roomData: any };
  
  // Follow/Following screens
  FollowersFollowingScreen: {
    username: string;
    userId: string;
    followersCount: number;
    followingCount: number;
    initialTab: 'followers' | 'following';
    isSelfProfile: boolean;
  };
  FollowFollowingRewamp: {
    id: string;
    tabName: string;
    username: string;
    user: any;
    self: boolean;
  };
  
  // Video Call screens
  AgoraVideoCall: {
    channelId: string;
    token?: string;
    uid?: number;
  };
  VideoCallScreen: {
    channelId?: string;
    token?: string;
    uid?: number;
  };
  VideoCallTest: undefined;
  
  // Settings and other screens
  SettingPage: undefined;
  Checkout: undefined;
  PrivacySecurity: undefined;
  SettingsReviews: undefined;
  NotificationSetting: undefined;
  CancelSubscriptionScreen: undefined;
  RatingsAndReviews: undefined;
  AddReview: undefined;
  CancelSubscriptionConfirmationScreen: undefined;
  AboutUsPage: undefined;
  CheckoutScreen: undefined;
  BusinessAccountDetails: undefined;
  BusinessDetailsStep2: undefined;
  BusinessDetailsStep3: undefined;
  BusinessDetailsStep4: undefined;
  BusinessListedSuccess: undefined;
  JobDetail: undefined;
  JobsScreen: undefined;
  AddJobDetailFormOne: undefined;
  addJobDetailFormTwo: undefined;
  addJobDetailFormThree: undefined;
  WebViewScreen: undefined;
  finalJobFormPreview: undefined;
  CityDateFilterScreen: undefined;
  feedSearchScreen: undefined;
  TagResultsScreen: undefined;
  contactInfoForm: undefined;
  ProfessionalDetailForm: undefined;
  UserFinalReviewForm: undefined;
  ApplySuccessScreen: undefined;
  PDFViewer: undefined;
  jobApplicants: undefined;
  EditProfileForm: undefined;
  EditBusinessPage: undefined;
  SeeAllGallery: undefined;
  filesUpload: undefined;
  selectPeople: undefined;
  UserPosted: undefined;
  SinglePostView: undefined;
  FollowingList: undefined;
  AllCategories: undefined;
  EventDetail: undefined;
  ProfessionalsScreen: undefined;
  FollowersList: undefined;
  FindProfessionals: undefined;
  FindServices: undefined;
  ProjectsWorkingOn: undefined;
  PlanToStart: undefined;
  EstimatedBudget: undefined;
  AreaOfProject: undefined;
  FindingUsers: undefined;
  UploadCatalog: undefined;
  GetDrafts: undefined;
  SavedDetailedLayout: undefined;
  EditSpaces: undefined;
  shareCollectionDetail: undefined;
  SubscriptionScreen: undefined;
  ViewBusinessProfile: undefined;
  PremiumFeatures: undefined;
  SpaceDetail: undefined;
  FullScreenImageView: undefined;
  ProfessionalDetailRewamped: undefined;
  CouponScreen: undefined;
  otherProfileScreen: undefined;
  otherBusinessScreen: undefined;
  PostDetailExp: undefined;
  PDFViewerNative: undefined;
  InquiryForm: undefined;
  InquirySuccess: undefined;
};

// Define navigation prop types
export type NavigationProps<T extends keyof RootStackParamList> = StackNavigationProp<RootStackParamList, T>;

// Define route prop types
export type RouteProps<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>; 