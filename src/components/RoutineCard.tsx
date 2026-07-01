import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Pencil, Trash2 } from 'lucide-react';
import { Routine } from '../hooks/useRoutines';

export const RoutineCard: React.FC<{ 
  routine: Routine; 
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onStartShredding: () => void;
}> = ({ routine, onClick, onEdit, onDelete, onStartShredding }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    if (routine.tabData) {
      setIsFlipped(!isFlipped);
    } else {
      onClick();
    }
  };

  return (
    <div className="w-full [perspective:1000px]">
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        {/* Front of Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCardClick();
            }
          }}
          className={`w-full bg-surface-low p-5 rounded-2xl border border-white/5 flex items-center gap-5 text-left transition-all duration-300 hover:border-primary/30 group relative overflow-hidden cursor-pointer ${routine.tabData ? 'min-h-[240px]' : ''} ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
        >
          <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-colors">
            {routine.icon}
          </div>
          <div className="flex-1 pr-16">
            <h3 className="font-headline font-bold text-lg text-white group-hover:text-primary transition-colors">
              {routine.title}
            </h3>
            <div className="flex gap-3 mt-1 text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant flex-wrap">
              <span>{routine.startTempo}-{routine.targetTempo} BPM</span>
              <span className="text-primary/40">•</span>
              <span>+{routine.increment} BPM / {routine.triggerBars} BARS</span>
              <span className="text-primary/40">•</span>
              <span>{routine.timeSignature} TIME</span>
              <span className="text-primary/40">•</span>
              <span>{routine.subdivision || 'quarter'}</span>
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(e); }}
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(e); }}
              className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {routine.tabData && <span className="absolute bottom-2 right-4 text-[10px] font-bold text-primary animate-pulse tracking-widest uppercase">Tap for Tab ⤵</span>}
        </div>

        {/* Back of Card */}
        <div 
          className={`absolute inset-0 w-full h-full bg-surface-low rounded-2xl border border-primary/30 p-5 flex flex-col justify-between transition-all duration-300 ${isFlipped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="flex-1 w-full flex flex-col justify-center bg-black/50 rounded-xl border border-white/5 p-4 mb-3 overflow-auto shadow-inner custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <pre className="text-[8px] sm:text-[9px] font-mono text-[#81ecff] block leading-tight overflow-x-auto w-fit mx-auto">
              {routine.tabData}
            </pre>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onStartShredding(); }} 
            className="w-full py-3 mt-2 bg-primary text-black font-headline font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-primary/90 transition-colors"
          >
            Start Shredding
          </button>
        </div>
      </motion.div>
    </div>
  );
};
