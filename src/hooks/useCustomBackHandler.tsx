import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Custom hook to manage the Android hardware back button action.
 * @param {Function} onBackPress - Callback function to execute on back press.
 * @param {Array} dependencies - Dependencies for which the hook should re-run.
 */
function useCustomBackHandler(onBackPress:any, dependencies:any = []) {
    useEffect(() => {
        // Add event listener for the Android back button
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        // Cleanup function to remove the event listener
        return () => backHandler.remove();
    }, [onBackPress, ...dependencies]);  // Spread dependencies into the dependency array
}

export default useCustomBackHandler;
