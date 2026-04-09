import * as React from "react"
import { useInfiniteSlider, type InfiniteSliderOptions } from "./use-infinite-slider"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface InfiniteSliderProps extends InfiniteSliderOptions {
  className?: string
}

const InfiniteSlider = React.forwardRef<HTMLDivElement, InfiniteSliderProps>(
  ({ className, ...props }, ref) => {
    const internalRef = React.useRef<HTMLDivElement>(null)
    const { thumbPos, isDragging, handleStart, handleMove, handleEnd } = useInfiniteSlider(props)

    const onPointerDown = (e: React.PointerEvent) => {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      handleStart(e.clientX)
    }

    const onPointerMove = (e: React.PointerEvent) => {
      const el = internalRef.current || (ref as React.MutableRefObject<HTMLDivElement>)?.current
      if (el) handleMove(e.clientX, el.offsetWidth)
    }

    return (
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
        {/* Main Track */}
        <div className="absolute w-[90%] h-1 bg-slate-300 rounded-full pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-indigo-600/20" />
        </div>

        {/* Center Zero Point */}
        <div className="absolute left-1/2 w-0.5 h-6 bg-slate-400 -translate-x-1/2 pointer-events-none" />

        {/* Thumb Assembly */}
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
          {/* Shorter, Centered Pin */}
          <div className={cn(
            "w-0.5 h-4 mb-[-2px] transition-colors rounded-full",
            isDragging ? "bg-blue-600" : "bg-slate-800"
          )} />
          
          {/* Smaller Thumb (8x8 or 6x6 equivalent) */}
          <div
            className={cn(
              "w-6 h-6 rounded-full border-[2.5px] border-white shadow-md transition-all",
              isDragging ? "bg-blue-600 scale-110 shadow-blue-100" : "bg-slate-900 shadow-slate-200"
            )}
          />
        </div>
      </div>
    )
  }
)
InfiniteSlider.displayName = "InfiniteSlider"

export { InfiniteSlider }