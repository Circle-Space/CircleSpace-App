import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProfileContextType, ProfileData, SavedCollection, User, FollowersFollowingResponse, Project, Catalog } from '../types/profile';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post, del, put } from '../services/dataRequest';
import { setSaveStatus, initializeSavedPosts } from '../redux/slices/saveSlice';
import { useDispatch } from 'react-redux';
import { Post } from '../types/Posttype';
import { initializeLikes } from '../redux/slices/likeSlice';
import { initializeCommentCounts } from '../redux/slices/commentSlice';

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [savedCollections, setSavedCollections] = useState<SavedCollection[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);
  const [followingError, setFollowingError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [catalogsError, setCatalogsError] = useState<string | null>(null);
  const resetContext = () => {
    setProfile(null);
    setLoading(false);
    setError(null);
    setPosts([]);
    setPostsLoading(false);
    setPostsError(null);
    setSavedCollections([]);
    setSavedLoading(false);
    setSavedError(null);
    setSelectedPost(null);
    setIsBottomSheetVisible(false);
    setFollowers([]);
    setFollowing([]);
    setFollowersLoading(false);
    setFollowingLoading(false);
    setFollowersError(null);
    setFollowingError(null);
    setProjects([]);
    setProjectsLoading(false);
    setProjectsError(null);
    setCatalogs([]);
    setCatalogsLoading(false);
    setCatalogsError(null);
  };
  
  const fetchProfile = async (userId: string) => {
    const id = userId;
    console.log("fetchProfile enter", userId);
    try {
      setLoading(true);
      setError(null);
      
      const userToken = await AsyncStorage.getItem('userToken');
      console.log("userToken", userToken);
      if (!userToken) {
        throw new Error('No user token found');
      }

      const profileData = await get(`user/get-user-info/${userId}`, {}, userToken);
      console.log("Raw API Response in Context:", profileData);

      if (profileData?.user) {
        // Format sinceActive to show only year
        const sinceActive = profileData.user.activeSince 
          ? new Date(profileData.user.activeSince).getFullYear().toString()
          : '';

        // Map API response to our ProfileData type
        const mappedProfile: ProfileData = {
          _id: profileData.user._id,
          name: profileData.user.businessName || `${profileData.user.firstName} ${profileData.user.lastName}`.trim(),
          accountType: profileData.user.accountType,
          username: profileData.user.username,
          bio: profileData.user.bio || '',
          profileImage: profileData.user.profilePic || '',
          about: profileData.user.aboutUs || '',
          jobTitle: profileData.user.professionalType || '',
          verified: profileData.user.isPaid || false,
          sinceActive: sinceActive,
          stats: {
            saves: profileData.user.savedCount || 0,
            followers: profileData.user.followersCount || 0,
            following: profileData.user.followingCount || 0
          },
          gender: profileData.user.gender || '',
          dateOfBirth: profileData.user.dateOfBirth || '',
          city: profileData.user.address.city || '',
          contactNumber: profileData.user.mobileNo || '',
          gstin: profileData.user.GSTIN || '',
          category: profileData.user.professionalType || '',
          socialMedia: profileData.user.socialMedia || {},
          website: profileData.user.website || '',
        };
        
        console.log("Mapped Profile Data in Context:", mappedProfile);
        setProfile(mappedProfile);
       
      } else {
        throw new Error('No user data in response');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (userId: string, page: number, isLoadMore: boolean = false) => {
    const id = userId;
    console.log("fetchPosts", page);
    try {
      if (!isLoadMore) {
        setPostsLoading(true);
      }
      setPostsError(null);

      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No user token found');
      }

      const postsEndpoint = `ugc/get-user-ugc/${userId}?page=${page}&limit=24`

      const response = await get(postsEndpoint, {}, userToken);
      console.log("Posts response:", response);

      if (response?.ugcs) {
        const mappedPosts: Post[] = response.ugcs.map((ugc: any) => ({
          _id: ugc._id,
          type: ugc.type || 'photo',
          image: ugc.contentUrl || '',
          contentUrl: ugc.contentUrl || [],
          duration: ugc.duration,
          count: ugc.count,
          likes: ugc.likes || 0,
          location: ugc.location || '',
          taggedUsersDetails: ugc.taggedUsersDetails || [],
          tags: ugc.tags || [],
          comments: ugc.comments || 0,
          saves: ugc.saves || 0,
          isLiked: ugc.isLiked || false,
          isSaved: ugc.isSaved || false,
          posterDetails: ugc.posterDetails || null,
          isLikedByUser: ugc.isLikedByUser || false,
          isSavedByUser: ugc.isSavedByUser || false,
          isFollowed: ugc.isFollowed || false,
          isMentioned: ugc.isMentioned || false,
          isTagged: ugc.isTagged || false,
          likedBy: ugc.likedBy || [],
          userDetails: ugc.userDetails || null,
          contentType: ugc.contentType || 'photo',
          caption: ugc.caption || '',
          createdAt: ugc.createdAt || new Date().toISOString(),
          updatedAt: ugc.updatedAt || new Date().toISOString(),
          __v: ugc.__v || 0,
          flags: ugc.flags || {},
        }));

        // Initialize Redux state for likes
        dispatch(initializeLikes(response.ugcs.map((post: any) => ({
          _id: post._id,
          isLiked: post.isLiked || false,
          likes: post.likes || 0
        }))));

        // Initialize Redux state for saved posts
        dispatch(initializeSavedPosts(response.ugcs.map((post: any) => ({
          _id: post._id,
          isSaved: post.isSaved || false
        }))));

        // Initialize Redux state for comment counts
        dispatch(initializeCommentCounts(response.ugcs.map((post: any) => ({
          _id: post._id,
          commentCount: post.commentsCount || 0
        }))));

        if (isLoadMore) {
          setPosts(prevPosts => [...prevPosts, ...mappedPosts]);
        } else {
          setPosts(mappedPosts);
        }

        setCurrentPage(page);
        setHasMorePosts(response.ugcs.length === 24);
      } else {
        if (!isLoadMore) {
          setPosts([]);
        }
        setHasMorePosts(false);
      }
    } catch (error) {
      setPostsError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadMorePosts = async (userId: string, isOtherUser: boolean) => {
    if (!hasMorePosts || postsLoading) return;
    await fetchPosts(userId, currentPage + 1, true);
  };

  const fetchSavedCollections = async (userId: string, isOtherUser: boolean) => {
    try {
      setSavedLoading(true);
      setSavedError(null);

      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No user token found');
      }

      const spacesEndpoint = isOtherUser
        ? `collections/public/${userId}?page=1&limit=24`
        : `collections/user-collections?page=1&limit=24`;

      const response = await get(spacesEndpoint, {}, userToken);
      console.log("Saved collections response:", response);

      if (response?.collections) {
        const mappedCollections: SavedCollection[] = response.collections.map((collection: any) => ({
          _id: collection.id,
          title: collection.name || 'Untitled',
          images: collection.thumbnails || [],
          count: collection.itemCount || 0
        }));
        setSavedCollections(mappedCollections);
      } else {
        setSavedCollections([]);
      }
    } catch (error) {
      setSavedError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching saved collections:', error);
    } finally {
      setSavedLoading(false);
    }
  };

  const togglePostLike = async (postId: string) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No user token found');
      }

      const response = await post(`ugc/toggle-like/${postId}`, {}, userToken);

      if (response.status === 200) {
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post._id === postId) {
              const newLikeCount = post.likes + (post.isLiked ? -1 : 1);
              return {
                ...post,
                likes: newLikeCount,
                isLiked: !post.isLiked
              };
            }
            return post;
          })
        );

        return true;
      } else {
        throw new Error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  };

  const handleSavePress = async (post: Post, isCardSave = false) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No user token found');
      }

      if (post.isSaved) {
        // If already saved, perform unsave operation
        const response = await del(`collections/remove-item/${post._id}`);
        
        if (response.status === 200) {
          dispatch(setSaveStatus({ postId: post._id, isSaved: !post.isSaved }));
          // Update local state
          setPosts(prevPosts => 
            prevPosts.map(p => {
              if (p._id === post._id) {
                return {
                  ...p,
                  isSaved: false,
                  saves: Math.max(0, p.saves - 1)
                };
              }
              return p;
            })
          );
          return true;
        } else {
          throw new Error('Failed to remove from collection');
        }
      } else {
        // If not saved, open the collection selector modal
        if (isCardSave) {
          setSelectedPost(post);
          setIsBottomSheetVisible(true);
          return true;
        } else {
          // For direct saves without collection selection
          const response = await post('ugc/save', {
            ugcId: post._id,
            collectionIds: []
          });

          if (response.status === 200) {
            // Update local state
            setPosts(prevPosts => 
              prevPosts.map(p => {
                if (p._id === post._id) {
                  return {
                    ...p,
                    isSaved: true,
                    saves: p.saves + 1
                  };
                }
                return p;
              })
            );
            return true;
          } else {
            throw new Error('Failed to save post');
          }
        }
      }
    } catch (error) {
      console.error('Error handling save:', error);
      return false;
    }
  };

  const handleSaveToCollection = async (collectionInfo: any) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No user token found');
      }

      if (!selectedPost) return false;

      if (!collectionInfo.isNewCollection) {
        const id = collectionInfo?.collectionInfo?.collectionId;
        if (!id) {
          throw new Error("Missing collection ID");
        }

        // Determine the correct item type
        const itemType = selectedPost.type === "ugc" ? 'photo' : selectedPost.type;

        const response = await post(`collections/add-item/${id}`, {
          itemId: selectedPost._id,
          itemType: itemType
        });

        if (response.status === 200) {
          // Update local state
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post._id === selectedPost._id) {
                return {
                  ...post,
                  isSaved: true,
                  saves: post.saves + 1
                };
              }
              return post;
            })
          );
          return true;
        } else {
          throw new Error('Failed to add to collection');
        }
      }
      return true;
    } catch (error) {
      console.error('Error saving to collection:', error);
      return false;
    } finally {
      setIsBottomSheetVisible(false);
      setSelectedPost(null);
    }
  };

  const fetchFollowersFollowing = async (userId: string, type: 'followers' | 'following', page: number = 1) => {
    try {
      if (type === 'followers') {
        setFollowersLoading(true);
        setFollowersError(null);
      } else {
        setFollowingLoading(true);
        setFollowingError(null);
      }

      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No user token found');
      }

      const endpoint = `user/get-user-${type}/${userId}?page=${page}&limit=20`;
      console.log('Fetching from endpoint:', endpoint);
      const response = await get(endpoint, {}, userToken);
      console.log('API Response:', response);

      if (response?.status === 200) {
        const users = type === 'followers' ? response.followers : response.following;
        const mappedUsers: User[] = users.map((user: any) => ({
          _id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          profilePic: user.profilePic,
          isFollowing: user.isFollowing,
          accountType: user.accountType
        }));

        if (type === 'followers') {
          setFollowers(mappedUsers);
        } else {
          setFollowing(mappedUsers);
        }

        return {
          users: mappedUsers,
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || 1,
          totalUsers: type === 'followers' ? response.totalFollowers : response.totalFollowing
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      if (type === 'followers') {
        setFollowersError(error instanceof Error ? error.message : 'An error occurred');
      } else {
        setFollowingError(error instanceof Error ? error.message : 'An error occurred');
      }
      return null;
    } finally {
      if (type === 'followers') {
        setFollowersLoading(false);
      } else {
        setFollowingLoading(false);
      }
    }
  };

  const toggleFollow = async (userId: string) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No user token found');
      }

      const response = await post(`user/toggle-follow/${userId}`, {}, userToken);

      if (response.status === 200) {
        // Update followers/following lists
        setFollowers(prev => 
          prev.map(user => 
            user._id === userId 
              ? { ...user, isFollowing: !user.isFollowing }
              : user
          )
        );
        setFollowing(prev => 
          prev.map(user => 
            user._id === userId 
              ? { ...user, isFollowing: !user.isFollowing }
              : user
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling follow:', error);
      return false;
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('No user token found');
      }

      const response = await put('user/update-user', profileData, userToken);
      console.log("updateProfile response", response);

      if (response.status === 200) {
        // Update local profile state
        if (profile) {
          setProfile({
            ...profile,
            name: profileData.firstName || profile.name,
            username: profileData.username || profile.username,
            bio: profileData.bio || profile.bio,
            about: profileData.aboutUs || profile.about,
            jobTitle: profileData.servicesProvided?.[0] || profile.jobTitle,
            profileImage: profileData.profilePic || profile.profileImage,
            gender: profileData.gender || profile.gender,
            dateOfBirth: profileData.dateOfBirth || profile.dateOfBirth,
            city: profileData.address?.city || profile.city,
            contactNumber: profileData.mobileNo || profile.contactNumber,
            gstin: profileData.GSTIN || profile.gstin,
          });
        }
        return { success: true, message: 'Profile updated successfully' };
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An error occurred while updating profile' 
      };
    }
  };

  const fetchProjects = async (userId: string, isOtherUser: boolean) => {
    console.log("fetchProjects", userId, isOtherUser);
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) throw new Error('No user token found');
      const endpoint = `project/get-project?userId=${userId}&page=1&limit=24`
      const response = await get(endpoint, {}, userToken);
      console.log("fetchProjects response", response);
      if (response?.projects) {
        const mapped: Project[] = response.projects.map((p: any) => ({
          _id: p._id,
          projectTitle: p.projectTitle || '',
          caption: p.caption || '',
          description: p.description || '',
          contentType: p.contentType || 'project',
          contentUrl: Array.isArray(p.contentUrl) ? p.contentUrl : [],
          status: p.status || '',
          location: p.location || '',
          likes: p.likes || 0,
          isLiked: p.isLiked || false,
          isSaved: p.isSaved || false,
          commentsCount: p.commentsCount || 0,
          tags: p.tags || [],
          draft: p.draft || false,
          posterDetails: {
            _id: p.posterDetails?._id || '',
            userId: p.posterDetails?.userId || '',
            username: p.posterDetails?.username || '',
            firstName: p.posterDetails?.firstName || '',
            lastName: p.posterDetails?.lastName || '',
            businessName: p.posterDetails?.businessName || '',
            profilePic: p.posterDetails?.profilePic || '',
            isPaid: p.posterDetails?.isPaid || false,
            accountType: p.posterDetails?.accountType || '',
            isFollowed: p.posterDetails?.isFollowed || false,
          },
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
          __v: p.__v || 0,
          flags: p.flags || {},
          isFollowed: p.isFollowed || false,
          isMentioned: p.isMentioned || false,
          isTagged: p.isTagged || false,
          likedBy: p.likedBy || [],
          link: p.link || '',
          mentionedUsers: p.mentionedUsers || [],
          mentionedUsersDetails: p.mentionedUsersDetails || [],
          taggedUsers: p.taggedUsers || [],
          taggedUsersDetails: p.taggedUsersDetails || [],
          updatedBy: p.updatedBy || '',
          userId: p.userId || '',
          visibility: p.visibility || 'public',
          comments: p.comments || []
        }));

        // Initialize Redux state for likes
        dispatch(initializeLikes(response.projects.map((project: any) => ({
          _id: project._id,
          isLiked: project.isLiked || false,
          likes: project.likes || 0
        }))));

        // Initialize Redux state for saved posts
        dispatch(initializeSavedPosts(response.projects.map((project: any) => ({
          _id: project._id,
          isSaved: project.isSaved || false
        }))));

        // Initialize Redux state for comment counts
        dispatch(initializeCommentCounts(response.projects.map((project: any) => ({
          _id: project._id,
          commentCount: project.commentsCount || 0
        }))));

        setProjects(mapped);
      } else {
        setProjects([]);
      }
    } catch (error) {
      setProjectsError(error instanceof Error ? error.message : 'An error occurred');
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchCatalogs = async (userId: string, isOtherUser: boolean) => {
    try {
      setCatalogsLoading(true);
      setCatalogsError(null);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) throw new Error('No user token found');
      const endpoint = `catalog/get-catalogs?userId=${userId}&page=1&limit=24`
      const response = await get(endpoint, {}, userToken);
      console.log("fetchCatalogs response", response);
      if (response?.catalogs) {
        const mapped: Catalog[] = response.catalogs.map((c: any) => ({
          _id: c._id,
          image: c.image || '',
          pdfUrl: c.contentUrl || '',
          title: c.title || '',
        }));
        setCatalogs(mapped);
      } else {
        setCatalogs([]);
      }
    } catch (error) {
      setCatalogsError(error instanceof Error ? error.message : 'An error occurred');
      setCatalogs([]);
    } finally {
      setCatalogsLoading(false);
    }
  };

  const deleteCatalog = async (catalogId: string) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) throw new Error('No user token found');

      const response = await post('catalog/delete-catalog', { catalogId }, userToken);
      
      if (response.status === 200) {
        // Update local state by removing the deleted catalog
        setCatalogs(prevCatalogs => prevCatalogs.filter(catalog => catalog._id !== catalogId));
        return { success: true, message: 'Catalog deleted successfully' };
      } else {
        throw new Error('Failed to delete catalog');
      }
    } catch (error) {
      console.error('Error deleting catalog:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An error occurred while deleting catalog' 
      };
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      loading, 
      error, 
      fetchProfile,
      posts,
      fetchPosts,
      loadMorePosts,
      postsLoading,
      postsError,
      hasMorePosts,
      currentPage,
      savedCollections,
      fetchSavedCollections,
      savedLoading,
      savedError,
      togglePostLike,
      handleSavePress,
      handleSaveToCollection,
      selectedPost,
      isBottomSheetVisible,
      setIsBottomSheetVisible,
      followers,
      following,
      followersLoading,
      followingLoading,
      followersError,
      followingError,
      fetchFollowersFollowing,
      toggleFollow,
      updateProfile,
      projects,
      fetchProjects,
      projectsLoading,
      projectsError,
      catalogs,
      fetchCatalogs,
      catalogsLoading,
      catalogsError,
      deleteCatalog,
      resetContext, 
    }}>
      {children}
    </ProfileContext.Provider>
  );
};
