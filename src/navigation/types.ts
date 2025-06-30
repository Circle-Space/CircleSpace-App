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
};

// Define navigation prop types
export type NavigationProps<T extends keyof RootStackParamList> = StackNavigationProp<RootStackParamList, T>;

// Define route prop types
export type RouteProps<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>; 