"use client";

import { useRef, useCallback } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 0.3;

export function useSwipe(handlers: SwipeHandlers) {
  const startRef = useRef({ x: 0, y: 0, time: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startRef.current.x;
    const dy = touch.clientY - startRef.current.y;
    const dt = Date.now() - startRef.current.time;
    const velocity = Math.sqrt(dx * dx + dy * dy) / dt;

    if (velocity < SWIPE_VELOCITY && Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > SWIPE_THRESHOLD) handlers.onSwipeRight?.();
      else if (dx < -SWIPE_THRESHOLD) handlers.onSwipeLeft?.();
    } else {
      if (dy > SWIPE_THRESHOLD) handlers.onSwipeDown?.();
      else if (dy < -SWIPE_THRESHOLD) handlers.onSwipeUp?.();
    }
  }, [handlers]);

  return { onTouchStart, onTouchEnd };
}
