import { useState } from "react";
import { InfiniteSlider } from "./components/infinite-slider/infinite-slider";

export default function App() {
  const [amount, setAmount] = useState(0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-[440px] relative">
        
        {/* Ambient background glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full blur-[120px] opacity-60" />

        <div className="relative bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] p-8 md:p-12 space-y-10">
          
          <header className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Physics Engine Active</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-slate-400 text-sm font-medium">Target Balance</h1>
              <div className="text-5xl font-semibold tracking-tight tabular-nums text-slate-900">
                {formatCurrency(amount)}
              </div>
            </div>
          </header>

          <section className="relative py-6">
            <InfiniteSlider
              setAmount={setAmount}
              accelBase={1000000}
              multiplier={0.0001}
            />
            
            <div className="flex justify-between items-center mt-6 px-2">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Decrease</span>
              <div className="h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Increase</span>
            </div>
          </section>

          <footer className="pt-4 border-t border-slate-50">
            <div className="flex flex-col items-center gap-6">
              <p className="text-center text-xs text-slate-400 leading-relaxed px-4">
                Pull the shuttle horizontally to adjust values. 
                Velocity scales exponentially with distance.
              </p>
              
              <button 
                onClick={() => setAmount(0)}
                className="group relative flex items-center justify-center w-12 h-12 bg-slate-900 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-200"
                title="Reset to zero"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:rotate-[-45deg] transition-transform">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
            </div>
          </footer>
        </div>
        
        <p className="text-center mt-8 text-slate-300 text-[11px] font-medium">
          Built for high-precision financial inputs
        </p>
      </div>
    </div>
  );
}