import React, { useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { GESTURE_SOURCE } from '../../constants';
import { BottomSheetGestureHandlersContext } from '../../contexts';
import { useBottomSheetInternal, useGestureEventsHandlersDefault, useGestureHandler } from '../../hooks';
const BottomSheetGestureHandlersProvider = ({
  gestureEventsHandlersHook: useGestureEventsHandlers = useGestureEventsHandlersDefault,
  children
}) => {
  //#region variables
  const animatedGestureSource = useSharedValue(GESTURE_SOURCE.UNDETERMINED);
  //#endregion

  //#region hooks
  const {
    animatedContentGestureState,
    animatedHandleGestureState
  } = useBottomSheetInternal();
  const {
    handleOnStart,
    handleOnChange,
    handleOnEnd,
    handleOnFinalize
  } = useGestureEventsHandlers();
  //#endregion

  //#region gestures
  const contentPanGestureHandler = useGestureHandler(GESTURE_SOURCE.CONTENT, animatedContentGestureState, animatedGestureSource, handleOnStart, handleOnChange, handleOnEnd, handleOnFinalize);
  const handlePanGestureHandler = useGestureHandler(GESTURE_SOURCE.HANDLE, animatedHandleGestureState, animatedGestureSource, handleOnStart, handleOnChange, handleOnEnd, handleOnFinalize);
  //#endregion

  //#region context
  const contextValue = useMemo(() => ({
    contentPanGestureHandler,
    handlePanGestureHandler,
    animatedGestureSource
  }), [contentPanGestureHandler, handlePanGestureHandler, animatedGestureSource]);
  //#endregion
  return /*#__PURE__*/React.createElement(BottomSheetGestureHandlersContext.Provider, {
    value: contextValue
  }, children);
};
export default BottomSheetGestureHandlersProvider;
//# sourceMappingURL=BottomSheetGestureHandlersProvider.js.map