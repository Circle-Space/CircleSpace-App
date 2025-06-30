import React from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
export function BottomSheetDraggableScrollable({
  scrollableGesture,
  children
}) {
  if (scrollableGesture) {
    return /*#__PURE__*/React.createElement(GestureDetector, {
      gesture: scrollableGesture
    }, children);
  }
  return children;
}
//# sourceMappingURL=BottomSheetDraggableScrollable.js.map