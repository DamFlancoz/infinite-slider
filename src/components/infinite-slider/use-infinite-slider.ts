import { useState, useRef, useEffect, useCallback } from 'react';

export interface InfiniteSliderOptions {
  amount: number;
  setAmount: (value: number | ((prev: number) => number)) => void;
  accelBase?: number;
  multiplier?: number;
  safeZoneWidth?: number;
  tickRate?: number;
  calcSpeed?: (distance: number) => number;
}

export const useInfiniteSlider = ({
  amount,
  setAmount,
  accelBase = 100000,
  multiplier = 0.0001,
  safeZoneWidth = 0.00,
  tickRate = 25,
  calcSpeed
}: InfiniteSliderOptions) => {
  const [thumbPos, setThumbPos] = useState(0.5);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startThumbPos = useRef(0.5);
  const speedRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (speedRef.current !== 0) {
        setAmount(prev => Math.max(0, prev + speedRef.current));
      }
    }, tickRate);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [tickRate, setAmount]);

  const handleStart = useCallback((clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
    startThumbPos.current = thumbPos;
  }, [thumbPos]);

  const handleMove = useCallback((clientX: number, sliderWidth: number) => {
    if (!isDragging.current) return;
    const deltaX = clientX - startX.current;
    const deltaPercent = deltaX / sliderWidth;
    const newThumbPos = Math.max(0, Math.min(1, startThumbPos.current + deltaPercent));
    setThumbPos(newThumbPos);
    
    const dist = newThumbPos - 0.5;
    if (Math.abs(dist) > safeZoneWidth / 2) {
      speedRef.current = calcSpeed ? calcSpeed(dist) : (dist > 0 ? 1 : -1) * Math.pow(accelBase, (Math.abs(dist) - (safeZoneWidth / 2)) / (0.5 - (safeZoneWidth / 2))) * multiplier;
    } else {
      speedRef.current = 0;
    }
  }, [accelBase, multiplier, safeZoneWidth, calcSpeed]);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
    speedRef.current = 0;
    setThumbPos(0.5);
  }, []);

  return { thumbPos, isDragging: isDragging.current, handleStart, handleMove, handleEnd };
};