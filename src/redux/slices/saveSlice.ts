import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SaveState {
  SavedPosts: { [key: string]: boolean }; // Map of postId to like status
} 

const initialState: SaveState = {
  SavedPosts: {},
};

const saveSlice = createSlice({
  name: 'save',
  initialState,
  reducers: {
    setSaveStatus: (
      state,
      action: PayloadAction<{ postId: string; isSaved: boolean }>
    ) => {
      const { postId, isSaved,  } = action.payload;
      state.SavedPosts[postId] = isSaved;
    },
    toggleSave: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const currentSaveStatus = state.SavedPosts[postId] || false;
      state.SavedPosts[postId] = !currentSaveStatus;
      console.log('state.SavedPosts', state.SavedPosts);
      
    },
    initializeSavedPosts: (
      state,
      action: PayloadAction<Array<{ _id: string; isSaved: boolean; }>>
    ) => {
      action.payload.forEach((post) => {
        state.SavedPosts[post._id] = post.isSaved;
      });
    },
    clearSavedPosts: (state) => {
      state.SavedPosts = {};
    },
  },
});

export const { setSaveStatus, toggleSave, initializeSavedPosts, clearSavedPosts } = saveSlice.actions;

export default saveSlice.reducer; 