import { useEffect, useRef } from 'react';
import { logCheatAttempt } from '../services/examService';

export const useExamSecurity = (examId, isActive = true) => {
  const cheatCount = useRef(0);

  useEffect(() => {
    if (!isActive || !examId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cheatCount.current += 1;
        console.warn('Tab switched or minimized! Logging cheat attempt...');
        logCheatAttempt(examId, 'tab_switch').catch(err => console.error(err));
      }
    };

    const handleBlur = () => {
      cheatCount.current += 1;
      console.warn('Window lost focus! Logging cheat attempt...');
      logCheatAttempt(examId, 'window_blur').catch(err => console.error(err));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examId, isActive]);

  return { getCheatCount: () => cheatCount.current };
};

export default useExamSecurity;