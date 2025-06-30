function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { memo, useContext, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { SCROLLABLE_STATE } from '../../constants';
import { BottomSheetDraggableContext } from '../../contexts/gesture';
import { useBottomSheetInternal } from '../../hooks';
const AnimatedRefreshControl = Animated.createAnimatedComponent(RefreshControl);
function BottomSheetRefreshControlComponent({
  onRefresh,
  scrollableGesture,
  ...rest
}) {
  //#region hooks
  const draggableGesture = useContext(BottomSheetDraggableContext);
  const {
    animatedScrollableState,
    enableContentPanningGesture
  } = useBottomSheetInternal();
  //#endregion

  if (!draggableGesture && enableContentPanningGesture) {
    throw "'BottomSheetRefreshControl' cannot be used out of the BottomSheet!";
  }

  //#region variables
  const animatedProps = useAnimatedProps(() => ({
    enabled: animatedScrollableState.value === SCROLLABLE_STATE.UNLOCKED
  }), [animatedScrollableState.value]);
  const gesture = useMemo(() => draggableGesture ? Gesture.Native()
  // @ts-ignore
  .simultaneousWithExternalGesture(...draggableGesture.toGestureArray(), ...scrollableGesture.toGestureArray()).shouldCancelWhenOutside(true) : undefined, [draggableGesture, scrollableGesture]);

  //#endregion

  // render
  if (gesture) {
    return /*#__PURE__*/React.createElement(GestureDetector, {
      gesture: gesture
    }, /*#__PURE__*/React.createElement(AnimatedRefreshControl, _extends({}, rest, {
      onRefresh: onRefresh,
      animatedProps: animatedProps
    })));
  }
  return /*#__PURE__*/React.createElement(AnimatedRefreshControl, _extends({}, rest, {
    onRefresh: onRefresh,
    animatedProps: animatedProps
  }));
}
const BottomSheetRefreshControl = /*#__PURE__*/memo(BottomSheetRefreshControlComponent);
BottomSheetRefreshControl.displayName = 'BottomSheetRefreshControl';
export default BottomSheetRefreshControl;
//# sourceMappingURL=BottomSheetRefreshControl.android.js.map