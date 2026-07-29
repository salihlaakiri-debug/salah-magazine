"use client";

import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(
  target: number,
  duration = 400,
  decimals = 0
) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === prevTarget.current && value === target) return;
    prevTarget.current = target;

    const startValue = value;
    const startTime = performance.now();

    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * eased;

      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, decimals]);

  return value;
}
