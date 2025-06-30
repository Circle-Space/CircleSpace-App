import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FollowState {
    followers: any[];
    following: any[];
    followersCount: number;
    followingCount: number;
    followedUsers: Record<string, boolean>;
    lastUpdatedUserId: string | null;
    followCounts: { [key: string]: number };
    lastAction: 'follow' | 'unfollow' | null;
}

const initialState: FollowState = {
    followers: [],
    following: [],
    followersCount: 0,
    followingCount: 0,
    followedUsers: {},
    lastUpdatedUserId: null,
    followCounts: {},
    lastAction: null
};

const followSlice = createSlice({
    name: 'follow',
    initialState,
    reducers: {
        setFollowers: (state, action: PayloadAction<any[]>) => {
            state.followers = action.payload;
        },
        setFollowing: (state, action: PayloadAction<any[]>) => {
            state.following = action.payload;
        },
        updateFollowStatus: (state, action: PayloadAction<{ userId: string; isFollowed: boolean }>) => {
            const { userId, isFollowed } = action.payload;
            state.followedUsers[userId] = isFollowed;
            state.lastUpdatedUserId = userId;
            state.lastAction = isFollowed ? 'follow' : 'unfollow';
        },
        updateMultipleFollowStatus: (state, action: PayloadAction<Record<string, boolean>>) => {
            state.followedUsers = { ...state.followedUsers, ...action.payload };
        },
        updateFollowCount: (state, action: PayloadAction<{ userId: string; count: number }>) => {
            const { userId, count } = action.payload;
            state.followCounts[userId] = count;
        },
        removeFollower: (state, action: PayloadAction<string>) => {
            state.followers = state.followers.filter(user => user._id !== action.payload);
            state.followersCount -= 1;
        },
        setFollowCounts: (state, action: PayloadAction<{ followers: number; following: number }>) => {
            state.followersCount = action.payload.followers;
            state.followingCount = action.payload.following;
        },
        appendFollowers: (state, action: PayloadAction<any[]>) => {
            state.followers = [...state.followers, ...action.payload];
        },
        appendFollowing: (state, action: PayloadAction<any[]>) => {
            state.following = [...state.following, ...action.payload];
        },
        clearLastUpdatedUser: (state) => {
            state.lastUpdatedUserId = null;
            state.lastAction = null;
        },
        resetFollowState: (state) => {
            state.followedUsers = {};
            state.lastUpdatedUserId = null;
            state.followCounts = {};
            state.lastAction = null;
        }
    },
});

export const {
    setFollowers,
    setFollowing,
    updateFollowStatus,
    updateMultipleFollowStatus,
    updateFollowCount,
    removeFollower,
    setFollowCounts,
    appendFollowers,
    appendFollowing,
    clearLastUpdatedUser,
    resetFollowState
} = followSlice.actions;

export default followSlice.reducer; 