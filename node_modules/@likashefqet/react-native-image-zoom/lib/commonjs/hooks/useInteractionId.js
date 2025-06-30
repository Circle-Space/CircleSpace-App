"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useInteractionId = void 0;
var _react = require("react");
var _reactNativeReanimated = require("react-native-reanimated");
const useInteractionId = () => {
  const interactionId = (0, _reactNativeReanimated.useSharedValue)('');
  const getInteractionId = (0, _react.useCallback)(() => {
    'worklet';

    return interactionId.value;
  }, [interactionId]);
  const updateInteractionId = (0, _react.useCallback)(() => {
    interactionId.value = `${new Date().valueOf()}`;
  }, [interactionId]);
  return {
    getInteractionId,
    updateInteractionId
  };
};
exports.useInteractionId = useInteractionId;
//# sourceMappingURL=useInteractionId.js.map