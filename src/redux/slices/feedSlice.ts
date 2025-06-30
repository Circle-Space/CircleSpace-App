import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FeedPost {
  _id: string;
  posterDetails: {
    _id: string;
    userId: string;
    isFollowed: boolean;
    [key: string]: any;
  };
  userDetails: {
    id: string;
    isFollowed: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

interface FeedState {
  posts: any[];
  userFollowStatus: { [userId: string]: boolean };
  lastUpdatedUserId: string | null;
  lastAction: 'follow' | 'unfollow' | null;
  followCounts: {
    followers: number;
    following: number;
  };
}

const initialState: FeedState = {
  posts: [],
  userFollowStatus: {},
  lastUpdatedUserId: null,
  lastAction: null,
  followCounts: {
    followers: 0,
    following: 0
  }
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFeedPosts: (state, action: PayloadAction<any[]>) => {
      state.posts = action.payload;
      // Update follow states from posts
      action.payload.forEach(post => {
        if (post.posterDetails?.userId) {
          state.userFollowStatus[post.posterDetails.userId] = post.posterDetails.isFollowed;
        }
      });
    },
    updatePostFollowStatus: (state, action: PayloadAction<{ userId: string; isFollowed: boolean }>) => {
      const { userId, isFollowed } = action.payload;
      
      // Update the global follow status
      state.userFollowStatus[userId] = isFollowed;
      state.lastUpdatedUserId = userId;
      state.lastAction = isFollowed ? 'follow' : 'unfollow';
      
      // Update follow states in all posts
      state.posts = state.posts.map(post => {
        if (post.posterDetails?.userId === userId) {
          return {
            ...post,
            posterDetails: {
              ...post.posterDetails,
              isFollowed
            },
            userDetails: {
              ...post.userDetails,
              isFollowed
            }
          };
        }
        return post;
      });
    },
    syncFollowStatus: (state, action: PayloadAction<{ userId: string; isFollowed: boolean }>) => {
      const { userId, isFollowed } = action.payload;
      
      // Update the global follow status
      state.userFollowStatus[userId] = isFollowed;
      state.lastUpdatedUserId = userId;
      state.lastAction = isFollowed ? 'follow' : 'unfollow';
      
      // Update follow states in all posts
      state.posts = state.posts.map(post => {
        if (post.posterDetails?.userId === userId) {
          return {
            ...post,
            posterDetails: {
              ...post.posterDetails,
              isFollowed
            },
            userDetails: {
              ...post.userDetails,
              isFollowed
            }
          };
        }
        return post;
      });
    },
    setFollowCounts: (state, action: PayloadAction<{ followers: number; following: number }>) => {
      state.followCounts = action.payload;
    },
    clearLastUpdatedUser: (state) => {
      state.lastUpdatedUserId = null;
      state.lastAction = null;
    }
  }
});

export const {
  setFeedPosts,
  updatePostFollowStatus,
  syncFollowStatus,
  setFollowCounts,
  clearLastUpdatedUser
} = feedSlice.actions;

export default feedSlice.reducer; 