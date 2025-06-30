const handleSavePress = async () => {
  try {
    if (!currentPost) return;
    
    // Update Redux state immediately for better UX
    dispatch(toggleSave(currentPost._id));
    
    // Rest of the function remains unchanged
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      console.error('User data not found');
      dispatch(toggleSave(currentPost._id)); // Revert state change
      return;
    }
    
    const parsedUserData = JSON.parse(userData);
    if (!parsedUserData || !parsedUserData.userId) {
      console.error('Invalid user data format');
      dispatch(toggleSave(currentPost._id)); // Revert state change
      return;
    }
    
    const endpoint = currentPostSaved
      ? `${process.env.REACT_APP_API_URL}/api/collections/remove-item/`
      : `${process.env.REACT_APP_API_URL}/api/collections/add-item/`;
    
    const requestBody = {
      projectId: currentPost._id,
      userId: parsedUserData.userId
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // API call succeeded
      showLocalToast(currentPostSaved ? 'Removed from collection' : 'Added to collection');
      
      // Update post state with the latest save status
      dispatch(updatePostState({
        id: currentPost._id,
        isSaved: !currentPostSaved
      }));
    } else {
      // API call failed, revert the Redux state
      dispatch(toggleSave(currentPost._id));
      showLocalToast(data.message || 'Failed to update collection');
    }
  } catch (error) {
    console.error('Error saving post:', error);
    // Revert local state on error
    if (currentPost) {
      dispatch(toggleSave(currentPost._id));
    }
    showLocalToast('Failed to update collection. Please try again.');
  }
}; 