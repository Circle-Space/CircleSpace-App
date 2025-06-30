function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef } from 'react';
import { BottomSheetDraggableScrollable } from './BottomSheetDraggableScrollable';
export const ScrollableContainer = /*#__PURE__*/forwardRef(function ScrollableContainer({
  nativeGesture,
  ScrollableComponent,
  ...rest
}, ref) {
  return /*#__PURE__*/React.createElement(BottomSheetDraggableScrollable, {
    scrollableGesture: nativeGesture
  }, /*#__PURE__*/React.createElement(ScrollableComponent, _extends({
    ref: ref
  }, rest)));
});
//# sourceMappingURL=ScrollableContainer.js.map