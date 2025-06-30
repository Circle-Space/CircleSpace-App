import {createSlice, current} from '@reduxjs/toolkit';

const INITIAL_STATE = {
  messageOptionEnable:undefined,
  accountType:null,
  currentUserId:null,
  update:null,
  deleteMessageId:null,
  commentReply:null,
  shouldRefreshComments: false,
  currentPostAuthor:null
};

export const chatSlice = createSlice({
  name: 'CHAT',
  initialState: INITIAL_STATE,
  reducers: {
    setMessageOptionEnable: (state, action) => {
      state.messageOptionEnable = action.payload;
    },
    setChatAccountType:  (state, action) => {
      state.accountType = action.payload;
    },
    setCurrentUserId:(state, action) => {
      state.currentUserId = action.payload;
    },
    setUpdate:(state, action) => {
      state.update = action.payload;
    },
    setDeleteMessageId:(state, action) => {
      state.deleteMessageId = action.payload;
    },
    setCommentReply:(state, action) => {
      state.commentReply = action.payload;
    },
    setShouldRefreshComments:(state, action) => {
      state.shouldRefreshComments = action.payload;
    },
    setCurrentPostAuthor:(state, action) => {
      state.currentPostAuthor = action.payload;
    },
  },
});

export const {
  setCommentReply,
  setDeleteMessageId,
  setUpdate,
  setCurrentUserId,
  setChatAccountType,
  setMessageOptionEnable,
  setShouldRefreshComments,
  setCurrentPostAuthor
} = chatSlice.actions;

export default chatSlice.reducer;
