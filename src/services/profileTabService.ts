/**
 * Profile Tab Service
 * 
 * Fixed issues:
 * - Ensure page 1 is always used for initial loading
 * - Fix project like/save handlers to correctly update both posts and projects tabs
 * - Fix pagination handling in all tab data operations
 * - Fix API endpoint construction for self vs other user profiles
 * - Add improved logging for debugging
 */

import { get, post, put, del } from './dataRequest';
import { setTabLoading, setTabData, setActiveTab } from '../redux/slices/profileTabSlice';
import { toggleLike as toggleLikeInLikeSlice, initializeLikes } from '../redux/slices/likeSlice';
import { toggleLike as toggleLikeInPostSlice } from '../redux/slices/postSlice';
import { Dispatch } from 'redux';
import store from '../redux/store';
import { initializeCommentCounts, setCommentCount } from '../redux/slices/commentSlice';

export interface TabState {
    data: any[];
    isLoading: boolean;
}

export interface ProfileTabState {
    data: {
        posts: TabState;
        projects: TabState;
        catalog: TabState;
        spaces: TabState;
    };
    activeTab: string;
}

export type TabKey = 'posts' | 'projects' | 'catalog' | 'spaces';

// New interface for pagination parameters
interface PaginationOptions {
    page: number;
    limit: number;
    isLoadMore?: boolean;
}

// Update LoadTabDataOptions to include pagination and deduplication
interface LoadTabDataOptions {
    userId: string;
    userToken: string;
    dispatch: Dispatch;
    isOtherUser?: boolean;
    pagination?: PaginationOptions;
    deduplicateData?: boolean;
}

// Default pagination values
const DEFAULT_PAGE_SIZE = 24;

// Helper function to deduplicate items by id or _id
const deduplicateItems = (items: any[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        return items;
    }
    
    const uniqueMap = new Map();
    
    // Use a map to keep only unique items based on id/_id
    items.forEach(item => {
        const itemId = item._id || item.id;
        if (itemId && !uniqueMap.has(itemId)) {
            uniqueMap.set(itemId, item);
        }
    });
    
    return Array.from(uniqueMap.values());
};

// New function to clear tab data immediately when switching profiles
export const clearProfileData = (dispatch: Dispatch) => {
    // Clear all tab data immediately
    ['posts', 'projects', 'catalog', 'spaces'].forEach(tab => {
        dispatch(setTabData({ tab, data: [], page: 1, hasMore: true }));
        dispatch(setTabLoading({ tab, isLoading: true }));
    });
};

export const loadTabData = async (
    tab: string,
    options: LoadTabDataOptions
) => {
    const { userId, userToken, dispatch, isOtherUser = false, pagination = { page: 1, limit: DEFAULT_PAGE_SIZE }, deduplicateData = false } = options;
    const { page, limit, isLoadMore = false } = pagination;
    
    try {
        console.log(`[ProfileTabService] Loading ${tab} data for userId: ${userId}, page: ${page}, isLoadMore: ${isLoadMore}, isOtherUser: ${isOtherUser}`);
        
        if (!isLoadMore) {
            dispatch(setTabLoading({ tab, isLoading: true }));
            
            // If this is a fresh load (page 1), clear existing data
            if (page === 1) {
                console.log(`[ProfileTabService] Clearing existing ${tab} data for fresh load`);
                dispatch(setTabData({ tab, data: [], page: 1, hasMore: true }));
            }
        }
        
        let response;
        let data;

        // Use the correct endpoints based on self vs other profile
        switch (tab) {
            case 'posts':
                const postsEndpoint = isOtherUser
                    ? `ugc/get-user-ugc/${userId}?page=${page}&limit=${limit}`
                    : `ugc/get-user-ugc?page=${page}&limit=${limit}`;
                console.log(`[ProfileTabService] Using ${isOtherUser ? 'other user' : 'self'} posts endpoint: ${postsEndpoint}`);
                response = await get(postsEndpoint, {}, userToken);
                console.log("post container 84 ::",response);
                data = response?.ugcs || [];
                break;
            case 'projects':
                const projectsEndpoint = isOtherUser
                    ? `project/get-project?userId=${userId}&page=${page}&limit=${limit}`
                    : `project/get-project?page=${page}&limit=${limit}`;
                console.log(`[ProfileTabService] Using ${isOtherUser ? 'other user' : 'self'} projects endpoint: ${projectsEndpoint}`);
                response = await get(projectsEndpoint, {}, userToken);
                console.log(`[ProfileTabService] Projects response:`, response);
                data = response?.projects || [];
                break;
            case 'catalog':
                const catalogEndpoint = isOtherUser
                    ? `catalog/get-catalogs?userId=${userId}&page=${page}&limit=${limit}`
                    : `catalog/get-catalogs?page=${page}&limit=${limit}`;
                console.log(`[ProfileTabService] Using ${isOtherUser ? 'other user' : 'self'} catalog endpoint: ${catalogEndpoint}`);
                response = await get(catalogEndpoint, {}, userToken);
                console.log(`[ProfileTabService] Catalog response:`, response);
                data = response?.catalogs || [];
                break;
            case 'spaces':
                const spacesEndpoint = isOtherUser
                    ? `collections/public/${userId}?page=${page}&limit=${limit}`
                    : `collections/user-collections?page=${page}&limit=${limit}`;
                console.log(`[ProfileTabService] Using ${isOtherUser ? 'other user' : 'self'} spaces endpoint: ${spacesEndpoint}`);
                response = await get(spacesEndpoint, {}, userToken);
                console.log(`[ProfileTabService] Spaces response:`, response);
                data = response?.collections || [];
                break;
            default:
                data = [];
                break;
        }

        // Determine if there's more data to load based on response metadata
        let hasMore = false;
        
        // Check if we have pagination info from the API
        if (response) {
            // Most reliable: check currentPage vs totalPages
            if (response.currentPage !== undefined && response.totalPages !== undefined) {
                hasMore = response.currentPage < response.totalPages;
                console.log(`[ProfileTabService] ${tab} hasMore based on pages: ${hasMore} (current: ${response.currentPage}, total: ${response.totalPages})`);
            } 
            // Fallback: check data length against requested limit
            else {
                hasMore = data.length === limit;
                console.log(`[ProfileTabService] ${tab} hasMore based on data length: ${hasMore} (got: ${data.length}, limit: ${limit})`);
            }
        } else {
            hasMore = data.length === limit;
        }

        // Initialize Redux state for likes if we have posts/projects data
        if (tab === 'posts' && data.length > 0) {
            const likeData = data.map((post: any) => ({
                _id: post._id,
                isLiked: post.isLiked || false,
                likes: post.likes || 0
            }));
            dispatch(initializeLikes(likeData));
            
            dispatch(initializeCommentCounts(data.map((post: any) => ({
                _id: post._id,
                commentCount: post.commentsCount || 0
            }))));
        } else if (tab === 'projects' && data.length > 0) {
            const likeData = data.map((project: any) => ({
                _id: project._id,
                isLiked: project.isLiked || false,
                likes: project.likes || 0
            }));
            dispatch(initializeLikes(likeData));
            
            dispatch(initializeCommentCounts(data.map((project: any) => ({
                _id: project._id,
                commentCount: project.commentsCount || 0
            }))));
        }

        // Apply deduplication if requested (especially important for spaces)
        if (deduplicateData && data.length > 0) {
            data = deduplicateItems(data);
            console.log(`[ProfileTabService] Deduplicated ${tab} data, new length: ${data.length}`);
        }

        // Update the store with either appended or fresh data
        if (isLoadMore && page > 1) {
            // Get current data from the store
            const state = store.getState() as any;
            const currentData = state.profileTab.data[tab as TabKey].data || [];
            
            // Append new data to existing data
            let updatedData = [...currentData, ...data];
            
            // Deduplicate the combined data if requested
            if (deduplicateData) {
                updatedData = deduplicateItems(updatedData);
                console.log(`[ProfileTabService] Deduplicated combined ${tab} data, final length: ${updatedData.length}`);
            }
            
            // Update Redux with appended data and new page number
            dispatch(setTabData({ 
                tab, 
                data: updatedData,
                page,
                hasMore
            }));
        } else {
            // Fresh load, replace all data
            dispatch(setTabData({ 
                tab, 
                data,
                page: 1,
                hasMore
            }));
        }
    } catch (error) {
        console.error(`Error fetching ${tab} data:`, error);
        // Set empty data on error to avoid showing previous user's data
        dispatch(setTabData({ tab, data: [], page: 1, hasMore: false }));
    } finally {
        dispatch(setTabLoading({ tab, isLoading: false }));
    }
};

export const loadAllTabData = async (
    options: LoadTabDataOptions
) => {
    const { userId, userToken, dispatch, isOtherUser = false, pagination = { page: 1, limit: DEFAULT_PAGE_SIZE }, deduplicateData = false } = options;
    const { page, limit } = pagination;

    try {
        console.log(`[ProfileTabService] loadAllTabData called for userId: ${userId}, page: ${page}, isOtherUser: ${isOtherUser}`);
        
        // First clear all existing tab data to prevent showing previous user's content
        clearProfileData(dispatch);
        
        // Load all tabs in parallel with correct endpoints
        const tabPromises = ['posts', 'projects', 'catalog', 'spaces'].map(tab => {
            console.log(`[ProfileTabService] Setting up load for ${tab} with page: 1`);
            
            return loadTabData(tab, { 
                userId, 
                userToken, 
                dispatch, 
                isOtherUser,
                pagination: { 
                    page: 1, // Always start with page 1 for initial load
                    limit,
                    isLoadMore: false
                },
                deduplicateData // Pass through the deduplication flag
            });
        });
        
        await Promise.all(tabPromises);
        console.log('[ProfileTabService] All tabs loaded successfully');
    } catch (error) {
        console.error('Error fetching all tab data:', error);
        // Set empty data for all tabs on error
        ['posts', 'projects', 'catalog', 'spaces'].forEach(tab => {
            dispatch(setTabData({ tab, data: [], page: 1, hasMore: false }));
        });
    } finally {
        ['posts', 'projects', 'catalog', 'spaces'].forEach(tab => {
            dispatch(setTabLoading({ tab, isLoading: false }));
        });
    }
};

interface HandleTabPressOptions extends LoadTabDataOptions {
    tabData: any;
}

export const handleTabPress = async (
    tab: string,
    options: HandleTabPressOptions
) => {
    const { tabData, userId, userToken, dispatch, isOtherUser = false } = options;

    if (tabData[tab as keyof typeof tabData].isLoading) return;
    
    // First set the active tab in the UI
    dispatch(setActiveTab(tab));
    
    // Check if we already have data for this tab
    const currentTabData = tabData[tab as keyof typeof tabData];
    const hasExistingData = currentTabData && currentTabData.data && currentTabData.data.length > 0;
    
    // Always load the first page when switching tabs
    await loadTabData(tab, { 
        userId, 
        userToken, 
        dispatch, 
        isOtherUser,
        pagination: { 
            page: 1, 
            limit: DEFAULT_PAGE_SIZE,
            isLoadMore: false
        }
    });
};

interface HandleItemOptions {
    item: any;
    tabData: any;
    dispatch: Dispatch;
}

export const handleLikePress = async (
    options: HandleItemOptions
) => {
    const { item, tabData, dispatch } = options;

    try {
        // Determine if this is a post or project
        const isProject = item.contentType === 'project' ||
            (item._id && item._id.startsWith('project_'));

        // First update local tab state for UI consistency
        if (isProject && tabData.projects) {
            const updatedProjects = tabData.projects.data.map((project: any) =>
                project._id === item._id
                    ? {
                        ...project,
                        isLiked: !project.isLiked,
                        likes: project.isLiked ? Math.max(0, project.likes - 1) : project.likes + 1
                    }
                    : project
            );
            dispatch(setTabData({ 
                tab: 'projects', 
                data: updatedProjects,
                page: tabData.projects.page,
                hasMore: tabData.projects.hasMore
            }));
        } else {
            const updatedPosts = tabData.posts.data.map((post: any) =>
                post._id === item._id
                    ? {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked ? Math.max(0, post.likes - 1) : post.likes + 1
                    }
                    : post
            );
            dispatch(setTabData({
                tab: 'posts', 
                data: updatedPosts,
                page: tabData.posts.page,
                hasMore: tabData.posts.hasMore
            }));
        }

        // Determine the correct endpoint
        const endpoint = isProject
            ? `project/toggle-like/${item._id}`
            : `ugc/toggle-like/${item._id}`;

        // Make the API call
        const response = await post(endpoint, {});

        if (response.status !== 200) {
            // If API call fails, revert the local state update
            if (isProject && tabData.projects) {
                const revertedProjects = tabData.projects.data.map((project: any) =>
                    project._id === item._id
                        ? {
                            ...project,
                            isLiked: !project.isLiked,
                            likes: project.isLiked ? project.likes + 1 : Math.max(0, project.likes - 1)
                        }
                        : project
                );
                dispatch(setTabData({ 
                    tab: 'projects', 
                    data: revertedProjects,
                    page: tabData.projects.page,
                    hasMore: tabData.projects.hasMore
                }));
            } else {
                const revertedPosts = tabData.posts.data.map((post: any) =>
                    post._id === item._id
                        ? {
                            ...post,
                            isLiked: !post.isLiked,
                            likes: post.isLiked ? post.likes + 1 : Math.max(0, post.likes - 1)
                        }
                        : post
                );
                dispatch(setTabData({ 
                    tab: 'posts', 
                    data: revertedPosts,
                    page: tabData.posts.page,
                    hasMore: tabData.posts.hasMore
                }));
            }
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        // Revert local state on error
        if (item.contentType === 'project' && tabData.projects) {
            const revertedProjects = tabData.projects.data.map((project: any) =>
                project._id === item._id
                    ? {
                        ...project,
                        isLiked: !project.isLiked,
                        likes: project.isLiked ? project.likes + 1 : Math.max(0, project.likes - 1)
                    }
                    : project
            );
            dispatch(setTabData({ 
                tab: 'projects', 
                data: revertedProjects,
                page: tabData.projects.page,
                hasMore: tabData.projects.hasMore
            }));
        } else {
            const revertedPosts = tabData.posts.data.map((post: any) =>
                post._id === item._id
                    ? {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked ? post.likes + 1 : Math.max(0, post.likes - 1)
                    }
                    : post
            );
            dispatch(setTabData({ 
                tab: 'posts', 
                data: revertedPosts,
                page: tabData.posts.page,
                hasMore: tabData.posts.hasMore
            }));
        }
    }
};

export const handleSavePress = async (
    options: HandleItemOptions
) => {
    const { item, tabData, dispatch } = options;

    try {
        const isProject = item.contentType === 'project' ||
            (item._id && item._id.startsWith('project_'));
            
        // Make the API call
        const response = await post(`ugc/toggle-save/${item._id}`, {});
        
        if (response.status === 200) {
            if (isProject && tabData.projects) {
                const updatedProjects = tabData.projects.data.map((project: any) =>
                    project._id === item._id
                        ? { ...project, isSaved: !project.isSaved }
                        : project
                );
                dispatch(setTabData({ 
                    tab: 'projects', 
                    data: updatedProjects,
                    page: tabData.projects.page,
                    hasMore: tabData.projects.hasMore
                }));
            } else {
                const updatedPosts = tabData.posts.data.map((post: any) =>
                    post._id === item._id
                        ? { ...post, isSaved: !post.isSaved }
                        : post
                );
                dispatch(setTabData({ 
                    tab: 'posts', 
                    data: updatedPosts,
                    page: tabData.posts.page,
                    hasMore: tabData.posts.hasMore
                }));
            }
        }
    } catch (error) {
        console.error('Error toggling save:', error);
    }
};

export const handleDelete = async (
    options: HandleItemOptions
) => {
    const { item, tabData, dispatch } = options;

    try {
        const payload = {
            catalogId: item?._id,
        };
        const response = await post('catalog/delete-catalog', payload);
        if (response.status === 200) {
            const updatedCatalogs = tabData.catalog.data.filter((catalog: any) => catalog._id !== item._id);
            dispatch(setTabData({ 
                tab: 'catalog', 
                data: updatedCatalogs,
                page: tabData.catalog.page,
                hasMore: tabData.catalog.hasMore
            }));
            return true;
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}; 