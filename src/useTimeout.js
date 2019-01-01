import { useRef, useCallback, useEffect } from "react";

/**
 * Return functions for starting and cancelling a timer. If the timer is started
 * when it is already active, the previous timer is cancelled. The timer is
 * automatically cancelled on unmount unless `cancelOnUnmount` is false.
 */
export default function useTimeout(cancelOnUnmount = true) {
  const timer = useRef();

  const startTimer = useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(...args);
  }, []);

  const cancelTimer = useCallback(() => {
    clearTimeout(timer.curent);
  }, []);

  useEffect(() => {
    if (cancelOnUnmount) {
      return cancelTimer;
    }
  }, []);

  return [startTimer, cancelTimer];
}
