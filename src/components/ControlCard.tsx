import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

export function ControlCard({ 
  label, 
  value, 
  unit, 
  prefix,
  min = 0,
  onIncrement, 
  onDecrement,
  onChange
}: { 
  label: string; 
  value: number; 
  unit?: string;
  prefix?: string;
  min?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange?: (val: number) => void;
}) {
  const [localVal, setLocalVal] = useState<string>(value.toString());

  useEffect(() => {
    setLocalVal(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      onChange?.(parsed);
    }
  };

  const handleBlur = () => {
    let finalVal = parseInt(localVal, 10);
    if (isNaN(finalVal) || finalVal < min) {
      finalVal = min;
    }
    setLocalVal(finalVal.toString());
    onChange?.(finalVal);
  };

  return (
    <div className="bg-surface-low p-4 rounded-xl border border-white/5 flex flex-col gap-2 group relative overflow-hidden">
      <span className="text-primary font-headline font-bold text-[10px] uppercase tracking-widest opacity-80">
        {label}
      </span>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-2xl font-headline font-bold">{prefix}</span>}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={localVal}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={(e) => e.target.select()}
            className="bg-transparent text-2xl font-headline font-bold focus:outline-none text-center p-0 m-0"
            style={{ width: `${Math.max(1, localVal.length)}ch` }}
          />
          {unit && <span className="text-on-surface-variant text-[10px] font-medium">{unit}</span>}
        </div>
        <div className="flex flex-col gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onIncrement(); }} 
            className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDecrement(); }} 
            className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
