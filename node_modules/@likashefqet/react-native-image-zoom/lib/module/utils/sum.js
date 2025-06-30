export const sum = function () {
  'worklet';

  for (var _len = arguments.length, animatedValues = new Array(_len), _key = 0; _key < _len; _key++) {
    animatedValues[_key] = arguments[_key];
  }
  return animatedValues.reduce((result, animatedValue) => result + animatedValue.value, 0);
};
//# sourceMappingURL=sum.js.map