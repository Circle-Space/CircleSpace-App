import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PostState {
  posts: {
    [id: string]: {
      isLiked: boolean;
      isSaved: boolean;
      likeCount: number;
      commentCount: number;
      isFollowed?: boolean;
      fullPostData?: any;
      lastUpdated?: number;
    };
  };
  lastEditedPostId: string | null;
}

const initialState: PostState = {
  posts: {},
  lastEditedPostId: null
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    updatePostState: (state, action: PayloadAction<{
      id: string;
      isLiked?: boolean;
      isSaved?: boolean;
      likeCount?: number;
      commentCount?: number;
      isFollowed?: boolean;
    }>) => {
      const { id, ...updates } = action.payload;
      if (!state.posts[id]) {
        state.posts[id] = {
          isLiked: false,
          isSaved: false,
          likeCount: 0,
          commentCount: 0,
          isFollowed: false
        };
      }
      state.posts[id] = {
        ...state.posts[id],
        ...updates
      };
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.posts[id]) {
        state.posts[id].isLiked = !state.posts[id].isLiked;
        state.posts[id].likeCount += state.posts[id].isLiked ? 1 : -1;
      }
    },
    toggleSave: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.posts[id]) {
        state.posts[id].isSaved = !state.posts[id].isSaved;
      }
    },
    updateCommentCount: (state, action: PayloadAction<{id: string, count: number}>) => {
      const { id, count } = action.payload;
      if (state.posts[id]) {
        state.posts[id].commentCount = count;
      }
    },
    toggleFollow: (state, action: PayloadAction<{id: string, isFollowed: boolean}>) => {
      const { id, isFollowed } = action.payload;
      if (state.posts[id]) {
        state.posts[id].isFollowed = isFollowed;
      }
    },
    updateCompletePost: (state, action: PayloadAction<{
      postId: string;
      postData: any;
    }>) => {
      const { postId, postData } = action.payload;
      
      if (!state.posts[postId]) {
        state.posts[postId] = {
          isLiked: postData.isLiked || false,
          isSaved: postData.isSaved || false,
          likeCount: postData.likes || 0,
          commentCount: postData.commentsCount || 0,
          isFollowed: postData.posterDetails?.isFollowed || false,
          fullPostData: postData,
          lastUpdated: Date.now()
        };
      } else {
        state.posts[postId] = {
          ...state.posts[postId],
          isLiked: postData.isLiked !== undefined ? postData.isLiked : state.posts[postId].isLiked,
          isSaved: postData.isSaved !== undefined ? postData.isSaved : state.posts[postId].isSaved,
          likeCount: postData.likes !== undefined ? postData.likes : state.posts[postId].likeCount,
          commentCount: postData.commentsCount !== undefined ? postData.commentsCount : state.posts[postId].commentCount,
          isFollowed: postData.posterDetails?.isFollowed !== undefined ? 
            postData.posterDetails.isFollowed : state.posts[postId].isFollowed,
          fullPostData: postData,
          lastUpdated: Date.now()
        };
      }
      
      state.lastEditedPostId = postId;
    },
    clearLastEditedPost: (state) => {
      state.lastEditedPostId = null;
    }
  }
});

export const { 
  updatePostState, 
  toggleLike, 
  toggleSave, 
  updateCommentCount, 
  toggleFollow,
  updateCompletePost,
  clearLastEditedPost 
} = postSlice.actions;
export default postSlice.reducer; 