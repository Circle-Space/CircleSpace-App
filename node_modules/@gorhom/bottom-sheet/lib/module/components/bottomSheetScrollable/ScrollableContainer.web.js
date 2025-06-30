function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef, useCallback, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { BottomSheetDraggableScrollable } from './BottomSheetDraggableScrollable';
/**
 * Detect if the current browser is Safari or not.
 */
const isWebkit = () => {
  // @ts-ignore
  return navigator.userAgent.indexOf('Safari') > -1;
};
export const ScrollableContainer = /*#__PURE__*/forwardRef(function ScrollableContainer({
  nativeGesture,
  ScrollableComponent,
  animatedProps,
  setContentSize,
  onLayout,
  ...rest
}, ref) {
  //#region refs
  const isInitialContentHeightCaptured = useRef(false);
  //#endregion

  //#region callbacks
  const renderScrollComponent = useCallback(props => /*#__PURE__*/React.createElement(Animated.ScrollView, _extends({}, props, {
    animatedProps: animatedProps
  })), [animatedProps]);

  /**
   * A workaround a bug in React Native Web [#1502](https://github.com/necolas/react-native-web/issues/1502),
   * where the `onContentSizeChange` won't be call on initial render.
   */
  const handleOnLayout = useCallback(event => {
    if (onLayout) {
      onLayout(event);
    }
    if (!isInitialContentHeightCaptured.current) {
      isInitialContentHeightCaptured.current = true;
      if (!isWebkit()) {
        return;
      }
      // @ts-ignore
      window.requestAnimationFrame(() => {
        // @ts-ignore
        setContentSize(event.nativeEvent.target.clientHeight);
      });
    }
  }, [onLayout, setContentSize]);
  //#endregion
  return /*#__PURE__*/React.createElement(BottomSheetDraggableScrollable, {
    scrollableGesture: nativeGesture
  }, /*#__PURE__*/React.createElement(ScrollableComponent, _extends({
    ref: ref
  }, rest, {
    onLayout: handleOnLayout,
    renderScrollComponent: renderScrollComponent
  })));
});
//# sourceMappingURL=ScrollableContainer.web.js.map