"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BottomSheetDraggableScrollable = BottomSheetDraggableScrollable;
var _react = _interopRequireDefault(require("react"));
var _reactNativeGestureHandler = require("react-native-gesture-handler");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function BottomSheetDraggableScrollable({
  scrollableGesture,
  children
}) {
  if (scrollableGesture) {
    return /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureDetector, {
      gesture: scrollableGesture
    }, children);
  }
  return children;
}
//# sourceMappingURL=BottomSheetDraggableScrollable.js.map