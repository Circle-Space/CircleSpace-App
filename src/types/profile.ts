import { Post, PosterDetails } from './Posttype';

export interface ProfileStats {
  saves: number;
  followers: number;
  following: number;
}

export interface ProfileData {
  _id: string;
  name: string;
  accountType: string;
  username: string;
  bio: string;
  profileImage: string;
  about: string;
  jobTitle: string;
  verified: boolean;
  sinceActive: string;
  stats: {
    saves: number;
    followers: number;
    following: number;
  };
  professionalType?: string;
  gender?: string;
  dateOfBirth?: string;
  city?: string;
  contactNumber?: string;
  gstin?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    pinterest?: string;
  };
  website?: string;
  category?: string;
}

export interface SavedCollection {
  _id: string;
  id: string;
  name: string;
  title?: string;
  thumbnails?: string[];
  images?: string[];
  itemCount: number;
  count?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  visibility?: string;
}

export interface CollectionInfo {
  isNewCollection: boolean;
  collectionInfo?: {
    collectionId: string;
  };
}

export interface Project {
  _id: string;
  projectTitle: string;
  caption: string;
  description: string;
  contentType: string;
  contentUrl: string[];
  status: string;
  location: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  commentsCount: number;
  tags: string[];
  draft?: boolean;
  posterDetails: {
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
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  flags: {
    [key: string]: any;
  };
  isFollowed: boolean;
  isMentioned: boolean;
  isTagged: boolean;
  likedBy: string[];
  link: string;
  mentionedUsers: string[];
  mentionedUsersDetails: any[];
  taggedUsers: string[];
  taggedUsersDetails: any[];
  updatedBy: string;
  userId: string;
  visibility: string;
  comments?: any[];
}

export interface Catalog {
  _id: string;
  image: string;
  pdfUrl: string;
  title: string;
}

export interface ProfileContextType {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  posts: Post[];
  fetchPosts: (userId: string, page?: number, isLoadMore?: boolean) => Promise<void>;
  loadMorePosts: (userId: string, isOtherUser: boolean) => Promise<void>;
  postsLoading: boolean;
  postsError: string | null;
  hasMorePosts: boolean;
  currentPage: number;
  savedCollections: SavedCollection[];
  fetchSavedCollections: (userId: string, isOtherUser: boolean) => Promise<void>;
  savedLoading: boolean;
  savedError: string | null;
  togglePostLike: (postId: string) => Promise<boolean>;
  handleSavePress: (post: Post, isCardSave?: boolean) => Promise<boolean>;
  handleSaveToCollection: (collectionInfo: CollectionInfo) => Promise<boolean>;
  selectedPost: Post | null;
  isBottomSheetVisible: boolean;
  setIsBottomSheetVisible: (visible: boolean) => void;
  followers: User[];
  following: User[];
  followersLoading: boolean;
  followingLoading: boolean;
  followersError: string | null;
  followingError: string | null;
  fetchFollowersFollowing: (userId: string, type: 'followers' | 'following', page?: number) => Promise<FollowersFollowingResponse | null>;
  toggleFollow: (userId: string) => Promise<boolean>;
  updateProfile: (profileData: {
    firstName?: string;
    username?: string;
    bio?: string;
    aboutUs?: string;
    GSTIN?: string;
    servicesProvided?: string[];
    location?: string;
    teamSize?: number;
    businessEmail?: string;
    mobileNo?: string;
    website?: string;
    activeSince?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      twitter?: string;
      pinterest?: string;
    };
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    certifications?: string[];
    profilePic?: string;
    dateOfBirth?: string;
    gender?: string;
  }) => Promise<{ success: boolean; message: string }>;
  projects: Project[];
  fetchProjects: (userId: string, isOtherUser: boolean) => Promise<void>;
  projectsLoading: boolean;
  projectsError: string | null;
  catalogs: Catalog[];
  fetchCatalogs: (userId: string, isOtherUser: boolean) => Promise<void>;
  catalogsLoading: boolean;
  catalogsError: string | null;
  deleteCatalog: (catalogId: string) => Promise<{ success: boolean; message: string }>;
  resetContext: any;
}

export interface User {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  profilePic?: string;
  isFollowing?: boolean;
  accountType?: string;
}

export interface FollowersFollowingResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
  totalUsers: number;
}

