function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef } from 'react';
import BottomSheetRefreshControl from '../bottomSheetRefreshControl';
import { BottomSheetDraggableScrollable } from './BottomSheetDraggableScrollable';
import { styles } from './styles';
// biome-ignore lint: to be addressed
export const ScrollableContainer = /*#__PURE__*/forwardRef(function ScrollableContainer({
  nativeGesture,
  refreshControl: _refreshControl,
  refreshing,
  progressViewOffset,
  onRefresh,
  ScrollableComponent,
  ...rest
}, ref) {
  const Scrollable = /*#__PURE__*/React.createElement(BottomSheetDraggableScrollable, {
    scrollableGesture: nativeGesture
  }, /*#__PURE__*/React.createElement(ScrollableComponent, _extends({
    ref: ref
  }, rest)));
  return onRefresh ? /*#__PURE__*/React.createElement(BottomSheetRefreshControl, {
    scrollableGesture: nativeGesture,
    refreshing: refreshing,
    progressViewOffset: progressViewOffset,
    onRefresh: onRefresh,
    style: styles.container
  }, Scrollable) : Scrollable;
});
//# sourceMappingURL=ScrollableContainer.android.js.map