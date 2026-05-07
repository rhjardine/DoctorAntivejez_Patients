import { useEffect, useRef } from 'react';

interface UseSessionTimeoutProps {
  timeoutMs: number;
  warningMs: number;
  onWarning: () => void;
  onTimeout: () => void;
  enabled: boolean;
}

export const useSessionTimeout = ({
  timeoutMs,
  warningMs,
  onWarning,
  onTimeout,
  enabled,
}: UseSessionTimeoutProps) => {
  const timeoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (!enabled) return;

    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);

    warningTimer.current = setTimeout(() => {
      onWarning();
    }, timeoutMs - warningMs);

    timeoutTimer.current = setTimeout(() => {
      onTimeout();
    }, timeoutMs);
  };

  useEffect(() => {
    if (!enabled) {
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      return;
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [enabled, timeoutMs, warningMs]);

  return { resetTimer };
};
