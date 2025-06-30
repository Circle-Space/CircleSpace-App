import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CommentState {
  commentCounts: { [key: string]: number }; // Map of postId to comment count
}

const initialState: CommentState = {
  commentCounts: {},
};

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    // Set comment count for a post
    setCommentCount: (
      state,
      action: PayloadAction<{ postId: string; commentCount: number }>
    ) => {
      const { postId, commentCount } = action.payload;
      state.commentCounts[postId] = commentCount;
      console.log('Comment count set:', postId, commentCount);
    },
    
    // Increment comment count
    incrementCommentCount: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      state.commentCounts[postId] = (state.commentCounts[postId] || 0) + 1;
      console.log('Comment count incremented for:', postId, state.commentCounts[postId]);
    },
    
    // Decrement comment count (with minimum of 0)
    decrementCommentCount: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      state.commentCounts[postId] = Math.max(0, (state.commentCounts[postId] || 1) - 1);
      console.log('Comment count decremented for:', postId, state.commentCounts[postId]);
    },
    
    // Initialize comment counts for multiple posts
    initializeCommentCounts: (
      state,
      action: PayloadAction<Array<{ _id: string; commentCount: number }>>
    ) => {
      action.payload.forEach((post) => {
        state.commentCounts[post._id] = post.commentCount || 0;
      });
      console.log('Comment counts initialized:', state.commentCounts);
    },
    
    // Clear all comment counts
    clearCommentCounts: (state) => {
      state.commentCounts = {};
      console.log('Comment counts cleared');
    },
  },
});

export const {
  setCommentCount,
  incrementCommentCount,
  decrementCommentCount,
  initializeCommentCounts,
  clearCommentCounts
} = commentSlice.actions;

export default commentSlice.reducer; 