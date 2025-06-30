import {combineReducers, configureStore, createAction} from '@reduxjs/toolkit';
import {chatSlice} from './reducers/chatSlice';
import {MessageTypes} from '../components/screens/chat/private-chat/MessageCard';
import {reelsSlice} from './reducers/reelsSlice';
import postReducer from './slices/postSlice';
import followReducer from './slices/followSlice';
import likeReducer from './slices/likeSlice';
import profileTabReducer from './slices/profileTabSlice';
import feedReducer from './slices/feedSlice';
import saveReducer from './slices/saveSlice';
import commentReducer from './slices/commentSlice';

export const revertAll = createAction('REVERT_ALL');
export interface ApplicationState {
  chat: {
    messageOptionEnable: MessageTypes;
    accountType: string;
    currentUserId: string;
    update: any;
    deleteMessageId: any;
    commentReply: {
      id: any;
      postId: any;
      name: any;
    };
    currentPostAuthor:string
  };
  reel: {
    audioEnable: boolean;
  };
  follow: {
    followers: any[];
    following: any[];
    followersCount: number;
    followingCount: number;
  };
  like: {
    likedPosts: { [key: string]: boolean };
    likeCounts: { [key: string]: number };
  };
  save: {
    SavedPosts: { [key: string]: boolean };
  };
  comment: {
    commentCounts: { [key: string]: number };
  };
}

const combinedReducer = combineReducers({
  chat: chatSlice.reducer,
  reel: reelsSlice.reducer,
  posts: postReducer,
  follow: followReducer,
  like: likeReducer,
  profileTab: profileTabReducer,
  feed: feedReducer,
  save: saveReducer,
  comment: commentReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'REVERT_ALL') {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
  });
}

const store = makeStore();
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
