import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TabData {
    posts: any[];
    projects: any[];
    catalog: any[];
    spaces: any[];
}

interface TabState {
    data: any[];
    isLoading: boolean;
    lastUpdated: number;
    page: number;
    hasMore: boolean;
}

interface ProfileTabState {
    data: {
        posts: TabState;
        projects: TabState;
        catalog: TabState;
        spaces: TabState;
    };
    activeTab: string;
    error: string | null;
}

const initialState: ProfileTabState = {
    data: {
        posts: { data: [], isLoading: false, lastUpdated: 0, page: 1, hasMore: true },
        projects: { data: [], isLoading: false, lastUpdated: 0, page: 1, hasMore: true },
        catalog: { data: [], isLoading: false, lastUpdated: 0, page: 1, hasMore: true },
        spaces: { data: [], isLoading: false, lastUpdated: 0, page: 1, hasMore: true }
    },
    activeTab: 'posts',
    error: null
};

const profileTabSlice = createSlice({
    name: 'profileTab',
    initialState,
    reducers: {
        setTabData: (state, action: PayloadAction<{ 
            tab: string; 
            data: any[];
            page?: number;
            hasMore?: boolean;
        }>) => {
            const { tab, data, page, hasMore } = action.payload;
            state.data[tab as keyof typeof state.data] = {
                data,
                isLoading: false,
                lastUpdated: Date.now(),
                page: page !== undefined ? page : state.data[tab as keyof typeof state.data].page,
                hasMore: hasMore !== undefined ? hasMore : state.data[tab as keyof typeof state.data].hasMore
            };
        },
        setActiveTab: (state, action: PayloadAction<string>) => {
            state.activeTab = action.payload;
        },
        setTabLoading: (state, action: PayloadAction<{ tab: string; isLoading: boolean }>) => {
            const { tab, isLoading } = action.payload;
            state.data[tab as keyof typeof state.data].isLoading = isLoading;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        updateItemInTab: (state, action: PayloadAction<{ 
            tab: string; 
            itemId: string; 
            updates: Partial<any> 
        }>) => {
            const { tab, itemId, updates } = action.payload;
            const tabData = state.data[tab as keyof typeof state.data];
            tabData.data = tabData.data.map(item => 
                item._id === itemId ? { ...item, ...updates } : item
            );
        },
        clearTabData: (state) => {
            state.data = {
                posts: { data: [], isLoading: false, lastUpdated: 0, page: 1, hasMore: true },
                projects: { data: [], isLoading: false, lastUpdated: 0, page: 1, hasMore: true },
                catalog: { data: [], isLoading: false, lastUpdated: 0, page: 1, hasMore: true },
                spaces: { data: [], isLoading: false, lastUpdated: 0, page: 1, hasMore: true }
            };
        }
    }
});

export const { 
    setTabData, 
    setActiveTab, 
    setTabLoading, 
    setError, 
    updateItemInTab, 
    clearTabData 
} = profileTabSlice.actions;

export default profileTabSlice.reducer; 