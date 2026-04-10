import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface InfiniteSliderOptions {
  setAmount: (value: number | ((prev: number) => number)) => void;
  accelBase?: number;
  multiplier?: number;
  safeZoneWidth?: number;
  tickRate?: number;
  calcSpeed?: (distance: number) => number;
}

export interface InfiniteSliderProps extends InfiniteSliderOptions {
  className?: string;
  amount: number;
  showPrediction?: boolean;
}

const useInfiniteSlider = ({
  setAmount,
  accelBase = 100000,
  multiplier = 0.0001,
  safeZoneWidth = 0.00,
  tickRate = 25,
  calcSpeed
}: InfiniteSliderOptions) => {
  const [thumbPos, setThumbPos] = React.useState(0.5);
  const [isActivelyMoving, setIsActivelyMoving] = React.useState(false);
  const [prediction, setPrediction] = React.useState(0);

  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const startThumbPos = React.useRef(0.5);
  const speedRef = React.useRef(0);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (speedRef.current !== 0) {
        setAmount(prev => {
          const nextVal = Math.max(0, prev + speedRef.current);
          const ticksAhead = 500 / tickRate;
          setPrediction(nextVal + (speedRef.current * ticksAhead));
          return nextVal;
        });
      }
    }, tickRate);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [tickRate, setAmount]);

  const handleStart = React.useCallback((clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
    startThumbPos.current = thumbPos;
  }, [thumbPos]);

  const handleMove = React.useCallback((clientX: number, sliderWidth: number) => {
    if (!isDragging.current) return;
    const deltaX = clientX - startX.current;
    const deltaPercent = deltaX / sliderWidth;
    const newThumbPos = Math.max(0, Math.min(1, startThumbPos.current + deltaPercent));
    setThumbPos(newThumbPos);
    
    const dist = newThumbPos - 0.5;
    const absDist = Math.abs(dist);

    if (absDist > safeZoneWidth / 2) {
      speedRef.current = calcSpeed 
        ? calcSpeed(dist) 
        : (dist > 0 ? 1 : -1) * Math.pow(accelBase, (absDist - (safeZoneWidth / 2)) / (0.5 - (safeZoneWidth / 2))) * multiplier;

      setIsActivelyMoving(absDist > 0.25); 
    } else {
      speedRef.current = 0;
      setIsActivelyMoving(false);
    }
  }, [accelBase, multiplier, safeZoneWidth, calcSpeed]);

  const handleEnd = React.useCallback(() => {
    isDragging.current = false;
    speedRef.current = 0;
    setThumbPos(0.5);
    setIsActivelyMoving(false);
  }, []);

  return { 
    thumbPos, 
    isDragging: isDragging.current, 
    isActivelyMoving, 
    prediction, 
    handleStart, 
    handleMove, 
    handleEnd 
  };
};

const InfiniteSlider = React.forwardRef<HTMLDivElement, InfiniteSliderProps>(
  ({ className, amount, showPrediction = true, ...props }, ref) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    const { 
      thumbPos, 
      isDragging, 
      isActivelyMoving, 
      prediction, 
      handleStart, 
      handleMove, 
      handleEnd 
    } = useInfiniteSlider(props);

    const onPointerDown = (e: React.PointerEvent) => {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId);
      handleStart(e.clientX);
    };

    const onPointerMove = (e: React.PointerEvent) => {
      const el = internalRef.current || (ref as React.MutableRefObject<HTMLDivElement>)?.current
      if (el) handleMove(e.clientX, el.offsetWidth)
    }

    return (
      <div className="relative w-full">
        {showPrediction && (
          <div 
            className={cn(
              "absolute -top-16 transition-all duration-200 pointer-events-none flex flex-col z-50",
              isActivelyMoving ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95",
              thumbPos > 0.5 ? "right-0 items-end" : "left-0 items-start"
            )}
          >
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col min-w-[100px]">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Target (500ms)</span>
              <span className="text-lime-400 font-mono font-bold text-base">
                ${Math.max(0, prediction).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className={cn(
              "w-3 h-3 bg-slate-900 rotate-45 -mt-1.5",
              thumbPos > 0.5 ? "mr-4" : "ml-4"
            )} />
          </div>
        )}

        <div
          ref={internalRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={handleEnd}
          onPointerCancel={handleEnd}
          className={cn(
            "relative h-16 w-full touch-none select-none flex items-center justify-center cursor-ew-resize",
            "bg-slate-100/50 rounded-2xl border border-slate-200/60",
            className
          )}
        >
          <div className="absolute w-[90%] h-1 bg-slate-300 rounded-full pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10" />
          </div>

          <div className="absolute left-[25%] right-[25%] h-1 border-x border-slate-400/20 pointer-events-none" />

          <div className="absolute left-1/2 w-0.5 h-6 bg-slate-400 -translate-x-1/2 pointer-events-none" />

          <div
            className={cn(
              "absolute flex flex-col items-center pointer-events-none transition-transform",
              !isDragging && "duration-300 ease-out"
            )}
            style={{ 
              left: `${thumbPos * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className={cn(
              "w-0.5 h-4 mb-[-2px] transition-colors rounded-full",
              isDragging ? "bg-blue-600" : "bg-slate-800"
            )} />

            <div
              className={cn(
                "w-6 h-6 rounded-full border-[2.5px] border-white shadow-md transition-all",
                isDragging ? "bg-blue-600 scale-110 shadow-blue-100" : "bg-slate-900 shadow-slate-200"
              )}
            />
          </div>
        </div>
      </div>
    )
  }
)
InfiniteSlider.displayName = "InfiniteSlider"

export { InfiniteSlider }