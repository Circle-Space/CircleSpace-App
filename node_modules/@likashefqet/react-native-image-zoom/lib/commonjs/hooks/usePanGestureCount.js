"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePanGestureCount = void 0;
var _react = require("react");
const usePanGestureCount = () => {
  const panGestureCount = (0, _react.useRef)(0);
  const isPanning = () => panGestureCount.current > 0;
  const startPan = () => panGestureCount.current++;
  const endPan = () => panGestureCount.current > 0 && panGestureCount.current--;
  return {
    isPanning,
    startPan,
    endPan
  };
};
exports.usePanGestureCount = usePanGestureCount;
//# sourceMappingURL=usePanGestureCount.js.map