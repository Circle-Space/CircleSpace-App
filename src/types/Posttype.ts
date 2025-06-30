export interface PosterDetails {
  _id: string;
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    businessName: string;
    profilePic: string;
    isPaid: boolean;
    accountType: string;
    isFollowed: boolean;
    GSTIN?: string;
    PAN?: string;
    aboutUs?: string;
    achievements?: any[];
    activeSince?: string;
    awards?: any[];
    bio?: string;
    businessEmail?: string;
    businessOwnerId?: string;
    category?: string;
    certifications?: any[];
    dateOfCreation?: string;
    email?: string;
    fcmToken?: string;
    gender?: string;
    isDeleted?: boolean;
    location?: string;
    locationServed?: any[];
    maxBudget?: string;
    minBudget?: string;
    mobileNo?: string;
    otherServices?: any[];
    otp?: string;
    otpVerified?: boolean;
    professionalCategory?: any[];
    professionalType?: string;
    servicesProvided?: any[];
    socialMedia?: any;
    teamSize?: number;
    website?: string;
}

export interface UserDetails {
  commentCount: number;
  id: string;
  isFollowed: boolean;
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  location: string;
  name: string;
  profilePic: string;
  username: string;
  isPaid: boolean;
  accountType: string;
};

export interface Post {
  _id: string;
  caption: string;
  contentUrl: string | string[];
  contentUrls?: string[];
  contentType: string;
  isLiked: boolean;
  isSaved: boolean;
  likes: number;
  commentsCount: number;
  savedCount: number;
  shares: number;
  tags: string[];
  posterDetails: PosterDetails;
  createdAt: string;
  updatedAt?: string;
  likedBy?: string[];
  taggedUsersDetails?: any[];
  mentionedUsers: string[];
  mentionedUsersDetails: any[];
  updatedBy: string;
  __v: number;
  visibility: string;
  comments: any[];
  location?: string;
  title?: string;
  coverImage?: string;
  imageUrl?: string;
  userId: string;
  type?: string; // For backwards compatibility
  image?: string; // For backwards compatibility
  duration?: string;
  count?: number;
  userDetails?: UserDetails;
}



export interface RouteParams {
  feed: Post[];
  accountType: string;
  loggedInUserId: string;
  token: string;
  pageName: string;
  userId: string;
  initialIndex?: number;
}

export interface FeedDetailParams {
  posts: Post[];
  currentIndex: number;
  type?: string;
  token: string;
  pageName: string;
  isSelfProfile: boolean;
  onFollowUpdate?: (updatedPosts: Post[]) => void;
}