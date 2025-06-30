export const routeToOtherUserProfile = (
  navigation: any,
  id: string,
  isSelfProfile: boolean,
  token: string | null,
  accountType: string
) => {
  if (isSelfProfile) {
    // navigation.navigate('ProfileLayout', { id });
    navigation.navigate('BottomBar', {
      screen: 'ProfileScreen',
    });
  } else {
    if (accountType === 'professional') {
      // Navigate to business profile screen
      navigation.navigate('otherBusinessScreen', {
        userId: id,
        isSelf: false
      });
    } else {
      // Navigate to personal profile screen
      navigation.navigate('otherProfileScreen', {
        userId: id,
        isSelf: false
      });
    }
  }
  
};

export const routeToPost = (navigation: any, posts: any, currentIndex: number, token: string) => {
  const dataset = Array.isArray(posts) ? posts : [posts];
  navigation.navigate('FeedDetailExp', { 
    posts: dataset,
    currentIndex: currentIndex >= 0 ? currentIndex : 0,
    type: posts.contentType || 'post',
    projectId: posts._id,
    token: token,
  });
};

export const routeToProject = (navigation: any, item: any, accountType: string, token: string) => {
  navigation.navigate('ProjectDetailRewamped', {
    feed: item,
    accountType: accountType,
    token: token,
    pageName: 'home'
  });
  
};