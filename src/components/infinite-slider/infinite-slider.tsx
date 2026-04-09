import * as React from "react"
import { useInfiniteSlider, type InfiniteSliderOptions } from "./use-infinite-slider"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Standard shadcn helper
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
          "relative h-20 w-full touch-none select-none flex items-center justify-center cursor-ew-resize",
          className
        )}
      >
        {/* Track */}
        <div className="absolute w-full h-1 bg-slate-100 rounded-full pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-transparent to-red-400 opacity-20" />
        </div>

        {/* Midway Marker */}
        <div className="absolute left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2 pointer-events-none" />

        {/* Thumb Assembly */}
        <div
          className={cn(
            "absolute flex flex-col items-center pointer-events-none transition-transform",
            !isDragging && "duration-200 ease-out"
          )}
          style={{ 
            left: `${thumbPos * 100}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="w-px h-10 bg-slate-950 mb-[-12px]" />
          <div
            className={cn(
              "w-10 h-10 rounded-full border-[3px] border-white shadow-lg transition-colors",
              isDragging ? "bg-blue-600 scale-105" : "bg-slate-950"
            )}
          />
        </div>
      </div>
    )
  }
)
InfiniteSlider.displayName = "InfiniteSlider"

export { InfiniteSlider }