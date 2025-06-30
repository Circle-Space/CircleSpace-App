export interface Giver {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePic?: string;
  avatar?: string;
  accountType: string;
}

export interface Review {
  _id: string;
  giver: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePic: string;
    avatar: string;
    accountType: string;
  };
  type: 'positive' | 'negative';
  note: string;
  isVisible: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  totalVisible: number;
  positiveCount: number;
  negativeCount: number;
  positivePercentage: number;
}

export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RatingResponse {
  message: string;
  status: number;
  data: Review[];
  stats: RatingStats;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
} 