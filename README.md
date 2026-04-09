# Infinite Physics Slider

Slider for React. Designed for financial apps and complex inputs where you need to move from **$0.01** to **$1,000,000** without lifting your finger.

Unlike standard sliders that have a "start" and "end," this slider functions like a gas pedal. The further you pull it from the center, the faster the value changes.

### Why use this?

  * **Infinite Range:** You aren't limited by the width of the screen.
  * **Surgical Precision:** Move slowly near the center for tiny adjustments.
  * **Hyper-Speed:** Pull to the edges to skyrocket through large numbers.

-----

## 🛠️ Quick Start

### 1\. Install Dependencies

You'll need these common Tailwind utilities (standard in shadcn/ui projects):

```bash
npm install clsx tailwind-merge
```

### 2\. Copy the Component

Most users prefer keeping the logic and UI together. Save this as `infinite-slider.tsx`:

\<details\>
\<summary\>\<b\>Click to expand the full code block\</b\>\</summary\>

```tsx
import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Utility to merge Tailwind classes */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface InfiniteSliderOptions {
  amount: number;
  setAmount: (value: number | ((prev: number) => number)) => void;
  accelBase?: number;
  multiplier?: number;
  safeZoneWidth?: number;
  tickRate?: number;
  calcSpeed?: (distance: number) => number;
}

export interface InfiniteSliderProps extends InfiniteSliderOptions {
  className?: string
}

/** The Physics Hook */
const useInfiniteSlider = ({
  amount,
  setAmount,
  accelBase = 100000,
  multiplier = 0.0001,
  safeZoneWidth = 0.00,
  tickRate = 25,
  calcSpeed
}: InfiniteSliderOptions) => {
  const [thumbPos, setThumbPos] = React.useState(0.5);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const startThumbPos = React.useRef(0.5);
  const speedRef = React.useRef(0);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (speedRef.current !== 0) {
        setAmount(prev => Math.max(0, prev + speedRef.current));
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
    if (Math.abs(dist) > safeZoneWidth / 2) {
      if (calcSpeed) {
        speedRef.current = calcSpeed(dist);
      } else {
        const dir = dist > 0 ? 1 : -1;
        const intensity = (Math.abs(dist) - (safeZoneWidth / 2)) / (0.5 - (safeZoneWidth / 2));
        speedRef.current = dir * Math.pow(accelBase, intensity) * multiplier;
      }
    } else {
      speedRef.current = 0;
    }
  }, [accelBase, multiplier, safeZoneWidth, calcSpeed]);

  const handleEnd = React.useCallback(() => {
    isDragging.current = false;
    speedRef.current = 0;
    setThumbPos(0.5);
  }, []);

  return { thumbPos, isDragging: isDragging.current, handleStart, handleMove, handleEnd };
};

/** The UI Component */
const InfiniteSlider = React.forwardRef<HTMLDivElement, InfiniteSliderProps>(
  ({ className, ...props }, ref) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    const { thumbPos, isDragging, handleStart, handleMove, handleEnd } = useInfiniteSlider(props);

    const onPointerDown = (e: React.PointerEvent) => {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId);
      handleStart(e.clientX);
    };

    const onPointerMove = (e: React.PointerEvent) => {
      if (internalRef.current) handleMove(e.clientX, internalRef.current.offsetWidth);
    };

    return (
      <div
        ref={internalRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={handleEnd}
        onPointerCancel={handleEnd}
        className={cn(
          "relative h-24 w-full touch-none select-none flex items-center justify-center cursor-ew-resize",
          className
        )}
      >
        <div className="absolute w-full h-1 bg-slate-200/50 rounded-full pointer-events-none" />
        <div className="absolute left-1/2 w-px h-10 bg-slate-300 -translate-x-1/2 pointer-events-none" />
        <div
          className={cn(
            "absolute flex flex-col items-center pointer-events-none",
            !isDragging && "transition-all duration-300 ease-out"
          )}
          style={{ left: `${thumbPos * 100}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-0.5 h-12 bg-slate-950 mb-[-16px]" />
          <div className={cn(
            "w-10 h-10 rounded-full border-[3px] border-white shadow-xl transition-all",
            isDragging ? "bg-blue-600 scale-110 shadow-blue-200" : "bg-slate-950"
          )} />
        </div>
      </div>
    );
  }
);
InfiniteSlider.displayName = "InfiniteSlider";

export { InfiniteSlider };
```

\</details\>

-----

## 📖 Usage

Drop it into any component. You provide the `amount` state, and the slider "drives" it.

```tsx
import { useState } from "react";
import { InfiniteSlider } from "./components/infinite-slider";

export default function MyInput() {
  const [amount, setAmount] = useState(100);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">${amount.toFixed(2)}</h1>
      
      <InfiniteSlider 
        amount={amount} 
        setAmount={setAmount} 
        className="mt-8"
      />
    </div>
  );
}
```

-----

## ⚙️ For the Tinkers (API)

If the default "exponential" feel isn't quite right for your app, you can customize the physics engine.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `accelBase` | `number` | `100000` | The "Oomph" of the growth. Higher = faster acceleration at the edges. |
| `multiplier` | `number` | `0.0001` | Overall sensitivity. Use it tune sensitivity near the center |
| `calcSpeed` | `function` | `undefined` | **The Master Override.** Write your own math. Receives `dist` (from -0.5 to 0.5) and returns a speed value. |
| `tickRate` | `number` | `25` | How often the value updates in milliseconds. |

### Custom Physics Example

Want a simple linear speed instead of an exponential one?

```tsx
<InfiniteSlider 
  amount={amount} 
  setAmount={setAmount}
  calcSpeed={(dist) => dist * 10} // Linear speed based on distance
/>
```

-----

## 🧠 How the Math Works

The slider doesn't set the value based on where the thumb is. Instead, it calculates a **Velocity** ($V$) based on the distance ($d$) from the center line.

By default, we use an exponential curve:
$$V = \text{direction} \times \text{accelBase}^{\text{intensity}} \times \text{multiplier}$$

This means that near the center marker ($d \approx 0$), the speed is nearly zero, giving you fine-tuned control. As you reach the edges, the exponent takes over, allowing you to fly through massive numbers without ever letting go of the mouse.