import { useRef } from 'react';

const useClickOutside = (callback: () => void) => {
  const ref = useRef<any>(null);

  const handleOutsideClick = () => {
    callback();
  };

  return { ref, handleOutsideClick };
};

export default useClickOutside;