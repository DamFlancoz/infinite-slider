import { useState, useRef, useEffect } from "react";
import { InfiniteSlider } from "./components/ui/infinite-slider";

export default function App() {
  const [amount, setAmount] = useState(0);
  
  // Game State
  const [transferTime, setTransferTime] = useState<number | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);

  // 1. Logarithmic Random Generator
  // Generates a number between $10 and $1,000,000 with logarithmic probability
  const generateTarget = () => {
    const min = 10;
    const max = 10000;
    const logMin = Math.log(min);
    const logMax = Math.log(max);
    // Use the inverse transform sampling for log distribution
    const randomLog = logMin + Math.random() * (logMax - logMin);
    const target = Math.exp(randomLog);
    setTargetAmount(Number(target.toFixed(2)));
  };

  // Initialize first target
  useEffect(() => {
    generateTarget();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const handleAmountChange = (update: number | ((prev: number) => number)) => {
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
      setIsRacing(true);
    }
    setAmount(update);
  };

  const handleRelease = () => {
    if (startTimeRef.current) {
      const duration = (performance.now() - startTimeRef.current) / 1000;
      setTransferTime(duration);
      startTimeRef.current = null;
      setIsRacing(false);
    }
  };

  // 2. Dynamic Color Feedback Logic
  const getTimeColorClass = (time: number) => {
    if (time < 5) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (time <= 10) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
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
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                isRacing ? "bg-orange-500 animate-ping" : "bg-blue-500 animate-pulse"
              )} />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                {isRacing ? "Recording Time..." : "Physics Engine Active"}
              </span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-slate-400 text-sm font-medium">Target Balance</h1>
              <div className="text-5xl font-semibold tracking-tight tabular-nums text-slate-900">
                {formatCurrency(amount)}
              </div>
            </div>
          </header>

          {/* Stat Badge */}
          <div className="h-8 flex justify-center">
            {transferTime !== null && !isRacing && (
              <div className={cn(
                "animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border transition-colors",
                getTimeColorClass(transferTime)
              )}>
                <span>Your Time: {transferTime.toFixed(2)}s</span>
              </div>
            )}
          </div>

          <section className="relative py-2">
            <div onPointerUp={handleRelease} onPointerLeave={handleRelease}>
              <InfiniteSlider
                amount={amount}
                setAmount={handleAmountChange}
                accelBase={1000000}
                multiplier={0.0001}
                safeZoneWidth={0}
              />
            </div>
            
            <div className="flex justify-between items-center mt-6 px-2">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Decrease</span>
              <div className="h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Increase</span>
            </div>
          </section>

          <footer className="pt-4 border-t border-slate-50">
            <div className="flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Active Challenge</p>
                <p className="text-sm text-slate-600 font-medium">
                  Reach <span className="text-slate-900 font-bold">{formatCurrency(targetAmount)}</span> in 5s
                </p>
              </div>
              
              <button 
                onClick={() => {
                  setAmount(0);
                  setTransferTime(null);
                  generateTarget(); // Roll a new target
                }}
                className="group relative flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-slate-200"
                title="Reset and New Challenge"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:rotate-180 transition-transform duration-500">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24"/>
                  <path d="M21 3v9h-9"/>
                </svg>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}