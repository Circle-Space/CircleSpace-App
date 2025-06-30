import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {ApplicationState} from '../redux/store';

const useCurrentUserId = () => {
  const userId = useSelector(
    (state: ApplicationState) => state?.chat?.currentUserId,
  );
  return userId;
};
export default useCurrentUserId;
