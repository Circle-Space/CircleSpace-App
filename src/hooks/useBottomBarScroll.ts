import { useCallback } from 'react';

/**
 * Hook to handle scroll events for bottom bar visibility with pull-to-refresh support
 * 
 * This hook provides scroll handling that prevents the bottom bar from hiding
 * during pull-to-refresh gestures, especially on iOS.
 * 
 * @returns {Object} An object containing:
 *   - handleScroll: Function to handle scroll events
 *   - setRefreshState: Function to manually set refresh state
 * 
 * @example
 * // Basic usage in a screen component
 * const { handleScroll, setRefreshState } = useBottomBarScroll();
 * 
 * // In your FlatList or ScrollView
 * <FlatList
 *   onScroll={handleScroll}
 *   refreshControl={
 *     <RefreshControl
 *       refreshing={refreshing}
 *       onRefresh={async () => {
 *         setRefreshState(true);
 *         try {
 *           await fetchData();
 *         } finally {
 *           setRefreshState(false);
 *         }
 *       }}
 *     />
 *   }
 * />
 * 
 * @example
 * // Alternative usage with custom refresh handler
 * const handleRefresh = useCallback(async () => {
 *   setRefreshState(true);
 *   try {
 *     await fetchData();
 *   } finally {
 *     setRefreshState(false);
 *   }
 * }, [setRefreshState]);
 */
export const useBottomBarScroll = () => {
  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    
    // Detect pull-to-refresh gesture (negative scroll values on iOS)
    const isPullToRefresh = currentScrollY < 0;
    
    // If this is a pull-to-refresh gesture, ensure bottom bar stays visible
    if (isPullToRefresh) {
      // Set refresh state to true to prevent bottom bar from hiding
      if ((global as any).setRefreshState) {
        (global as any).setRefreshState(true);
      }
    } else {
      // Reset refresh state when not pulling to refresh
      if ((global as any).setRefreshState) {
        (global as any).setRefreshState(false);
      }
    }
    
    // Call the global scroll handler if it exists
    if ((global as any).handleScrollForBottomBar) {
      (global as any).handleScrollForBottomBar(event);
    }
  }, []);

  // Function to manually set refresh state (for use in RefreshControl onRefresh)
  const setRefreshState = useCallback((refreshing: boolean) => {
    if ((global as any).setRefreshState) {
      (global as any).setRefreshState(refreshing);
    }
  }, []);

  return { handleScroll, setRefreshState };
}; 