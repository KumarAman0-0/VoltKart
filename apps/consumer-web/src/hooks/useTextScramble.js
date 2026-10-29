import { useState, useRef, useCallback } from 'react';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!@#$%^&*()_+-=~';

export const useTextScramble = (finalText = '', options = {}) => {
  const { speed = 30, chance = 0.3 } = options;
  const [displayText, setDisplayText] = useState(finalText);
  const [isScrambling, setIsScrambling] = useState(false);
  const animRef = useRef(null);

  const triggerScramble = useCallback((targetText = finalText) => {
    if (isScrambling) return;
    setIsScrambling(true);

    const length = targetText.length;
    let iteration = 0;

    clearInterval(animRef.current);

    animRef.current = setInterval(() => {
      const result = targetText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration) {
            return targetText[index];
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');

      setDisplayText(result);

      if (iteration >= length) {
        clearInterval(animRef.current);
        setDisplayText(targetText);
        setIsScrambling(false);
      }

      iteration += 1 / 2;
    }, speed);
  }, [finalText, isScrambling, speed]);

  return { displayText, isScrambling, triggerScramble };
};

export default useTextScramble;
