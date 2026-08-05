import { useEffect, useCallback, useRef } from 'react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const THROTTLE_MS = 5000; // Update local storage max every 5 seconds

export function useIdleTimeout(onTimeout, isActive = true) {
  const onTimeoutRef = useRef(onTimeout);
  const lastUpdateRef = useRef(Date.now());

  // Keep the callback ref up to date
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const updateActivity = useCallback(() => {
    if (!isActive) return;
    const now = Date.now();
    // Throttle the localStorage updates to avoid performance hits on mousemove
    if (now - lastUpdateRef.current > THROTTLE_MS) {
      localStorage.setItem('last_activity', now.toString());
      lastUpdateRef.current = now;
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    // Initialize the activity timer
    localStorage.setItem('last_activity', Date.now().toString());
    lastUpdateRef.current = Date.now();

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // Check for idle timeout every minute
    const intervalId = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('last_activity') || '0', 10);
      if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
        onTimeoutRef.current();
      }
    }, 60000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(intervalId);
    };
  }, [isActive, updateActivity]);
}
