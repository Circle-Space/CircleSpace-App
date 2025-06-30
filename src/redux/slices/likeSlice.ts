import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LikeState {
  likedPosts: { [key: string]: boolean }; // Map of postId to like status
  likeCounts: { [key: string]: number }; // Map of postId to like count
}

const initialState: LikeState = {
  likedPosts: {},
  likeCounts: {},
};

const likeSlice = createSlice({
  name: 'like',
  initialState,
  reducers: {
    setLikeStatus: (
      state,
      action: PayloadAction<{ postId: string; isLiked: boolean; likeCount: number }>
    ) => {
      const { postId, isLiked, likeCount } = action.payload;
      state.likedPosts[postId] = isLiked;
      state.likeCounts[postId] = likeCount;
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const currentLikeStatus = state.likedPosts[postId] || false;
      state.likedPosts[postId] = !currentLikeStatus;
      state.likeCounts[postId] = (state.likeCounts[postId] || 0) + (currentLikeStatus ? -1 : 1);
      console.log('state.likedPosts', state.likedPosts);
      console.log('state.likeCounts', state.likeCounts);
    },
    initializeLikes: (
      state,
      action: PayloadAction<Array<{ _id: string; isLiked: boolean; likes: number }>>
    ) => {
      action.payload.forEach((post) => {
        state.likedPosts[post._id] = post.isLiked;
        state.likeCounts[post._id] = post.likes;
      });
    },
    clearLikes: (state) => {
      state.likedPosts = {};
      state.likeCounts = {};
    },
  },
});

export const { setLikeStatus, toggleLike, initializeLikes, clearLikes } = likeSlice.actions;

export default likeSlice.reducer; 