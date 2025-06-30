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
export const limits = {
  right,
  left,
  top,
  bottom
};
//# sourceMappingURL=limits.js.map