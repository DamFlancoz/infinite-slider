import { useState } from "react";
import { InfiniteSlider } from "./components/infinite-slider/infinite-slider";

/**
 * This App component serves as the documentation demo.
 * It shows how to integrate the InfiniteSlider with a 
 * formatted currency display.
 */
export default function App() {
  const [amount, setAmount] = useState(0);

  // Formatting utility for a clean financial look
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-12 text-center">

        <header className="space-y-2">
          <h1 className="text-sm font-bold tracking-[0.2em] text-slate-400 uppercase">
            Physics Input Demo
          </h1>
          <div className="text-5xl font-medium tracking-tight tabular-nums">
            {formatCurrency(amount)}
          </div>
        </header>

        <section className="bg-slate-50/50 rounded-3xl p-10 border border-slate-100 shadow-sm">
          <InfiniteSlider 
            amount={amount} 
            setAmount={setAmount}
            accelBase={100000}
            multiplier={0.0001}
          />
          
          <div className="mt-8 grid grid-cols-3 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="text-left">Decrease</div>
            <div className="text-center text-blue-500">Hold to Shuttle</div>
            <div className="text-right">Increase</div>
          </div>
        </section>

        <footer className="space-y-4 pt-4">
          <p className="text-sm text-slate-500 leading-relaxed">
            Drag the shuttle away from the center to adjust the value. 
            The further you pull, the faster the numbers climb.
          </p>
          
          <div className="flex justify-center gap-2">
            <button 
              onClick={() => setAmount(0)}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              Reset to $0.00
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}