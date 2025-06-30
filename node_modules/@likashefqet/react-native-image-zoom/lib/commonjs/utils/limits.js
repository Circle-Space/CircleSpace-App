"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.limits = void 0;
const right = (width, scale) => {
  'worklet';

  return width * (scale.value - 1) / 2;
};
const left = (width, scale) => {
  'worklet';

  return -right(width, scale);
};
const bottom = (height, scale) => {
  'worklet';

  return height * (scale.value - 1) / 2;
};
const top = (height, scale) => {
  'worklet';

  return -bottom(height, scale);
};
const limits = {
  right,
  left,
  top,
  bottom
};
exports.limits = limits;
//# sourceMappingURL=limits.js.map