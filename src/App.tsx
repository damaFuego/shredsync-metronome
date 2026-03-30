import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Play, 
  Square, 
  Timer, 
  List, 
  Brain, 
  Plus,
  Minus,
  Activity,
  Zap,
  ChevronRight,
  Trash2,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMetronome, MetronomeConfig } from './hooks/useMetronome';

interface Routine extends MetronomeConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const METERS = ['2/4', '3/4', '4/4', '6/8', '9/8', '12/8'];

const ROUTINES: Routine[] = [
  {
    id: 'spider-walk',
    title: "Spider Walk Warmup",
    startTempo: 60,
    targetTempo: 120,
    increment: 5,
    triggerBars: 4,
    timeSignature: '4/4',
    subdivision: 'quarter',
    icon: <Activity className="w-6 h-6 text-primary" />,
  },
  {
    id: 'sweep-picking',
    title: "Sweep Picking Arpeggios",
    startTempo: 140,
    targetTempo: 180,
    increment: 2,
    triggerBars: 2,
    timeSignature: '4/4',
    subdivision: 'sixteenth',
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
];

const MINDSET_QUOTES = [
  "Don't practice until you get it right. Practice until you can't get it wrong.",
  "Amateurs practice until they get it right; professionals practice until they can't get it wrong.",
  "The only way to get better is to push yourself past your comfort zone.",
  "Slow practice is fast progress.",
  "Discipline is choosing between what you want now and what you want most."
];

const RoutineCard: React.FC<{ 
  routine: Routine; 
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}> = ({ routine, onClick, onEdit, onDelete }) => {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="w-full bg-surface-low p-5 rounded-2xl border border-white/5 flex items-center gap-5 text-left transition-colors hover:border-primary/30 group relative overflow-hidden cursor-pointer"
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
          onClick={onEdit}
          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button 
          onClick={onDelete}
          className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

function ControlCard({ 
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

function NavButton({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-full w-14 h-14 transition-all duration-300 ${
        active 
          ? 'bg-primary text-black scale-110 shadow-lg shadow-primary/20' 
          : 'text-on-surface-variant hover:text-primary'
      }`}
    >
      {icon}
    </button>
  );
}

export default function App() {
  const [config, setConfig] = useState<MetronomeConfig>({
    startTempo: 60,
    targetTempo: 140,
    increment: 5,
    triggerBars: 4,
    timeSignature: '4/4',
    subdivision: 'quarter',
  });

  const { 
    bpm, 
    isPlaying, 
    togglePlay, 
    currentBeat, 
    currentBar 
  } = useMetronome(config);

  const [activeTab, setActiveTab] = useState('metronome');
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('shredsync_routines');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Re-hydrate React nodes to prevent render crashes
      return parsed.map((r: any) => ({
        ...r,
        subdivision: r.subdivision || 'quarter',
        icon: r.id === 'sweep-picking' ? <Zap className="w-6 h-6 text-primary" /> : <Activity className="w-6 h-6 text-primary" />
      }));
    }
    return ROUTINES;
  });

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('shredsync_stats');
    if (saved) {
      return JSON.parse(saved);
    }
    return { totalSessions: 0, highestBpm: 0 };
  });

  const [quoteOfTheDay, setQuoteOfTheDay] = useState('');

  useEffect(() => {
    setQuoteOfTheDay(MINDSET_QUOTES[Math.floor(Math.random() * MINDSET_QUOTES.length)]);
  }, []);

  useEffect(() => {
    const routinesToSave = routines.map(({ icon, ...rest }) => rest);
    localStorage.setItem('shredsync_routines', JSON.stringify(routinesToSave));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('shredsync_stats', JSON.stringify(stats));
  }, [stats]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setStats((prev: { totalSessions: number; highestBpm: number }) => ({
        totalSessions: prev.totalSessions + 1,
        highestBpm: Math.max(prev.highestBpm, bpm)
      }));
    }
    togglePlay();
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [newRoutine, setNewRoutine] = useState<{
    title: string;
    startTempo: number | '';
    targetTempo: number | '';
    increment: number | '';
    triggerBars: number | '';
    timeSignature: string;
    subdivision: 'quarter' | 'eighth' | 'triplet' | 'sixteenth';
  }>({
    title: '',
    startTempo: 60,
    targetTempo: 120,
    increment: 5,
    triggerBars: 4,
    timeSignature: '4/4',
    subdivision: 'quarter',
  });

  const handleDeleteRoutine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoutines(routines.filter(r => r.id !== id));
  };

  const handleEditRoutine = (routine: Routine, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewRoutine({
      title: routine.title,
      startTempo: routine.startTempo,
      targetTempo: routine.targetTempo,
      increment: routine.increment,
      triggerBars: routine.triggerBars,
      timeSignature: routine.timeSignature || '4/4',
      subdivision: routine.subdivision || 'quarter',
    });
    setEditingId(routine.id);
    setIsAddingRoutine(true);
  };

  const handleSelectRoutine = (routine: Routine) => {
    setConfig({
      startTempo: routine.startTempo,
      targetTempo: routine.targetTempo,
      increment: routine.increment,
      triggerBars: routine.triggerBars,
      timeSignature: routine.timeSignature || '4/4',
      subdivision: routine.subdivision || 'quarter',
    });
    setActiveTab('metronome');
  };

  const beatsPerBar = parseInt(config.timeSignature.split('/')[0], 10);

  return (
    <div className="min-h-screen bg-background text-white font-body pb-32 selection:bg-primary selection:text-black">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-6 h-16 border-b border-white/5">
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-white/10">
          <User className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-primary tracking-widest uppercase font-headline">
          ShredSync
        </h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors">
          <Settings className="w-6 h-6 text-primary" />
        </button>
      </header>

      <main className="pt-24 px-6 max-w-md mx-auto flex flex-col gap-8">
        <AnimatePresence mode="wait">
          {activeTab === 'metronome' ? (
            <motion.div
              key="metronome"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-8"
            >
              {/* Metronome Visualizer */}
              <section className="relative flex flex-col items-center justify-center py-4">
                <div className="relative w-72 h-72 flex items-center justify-center">
                  {/* Lightweight GPU Pulse Ring */}
                  <div 
                    className="absolute inset-0 w-full h-full rounded-full border-[6px]"
                    style={{
                      borderColor: currentBeat === 0 ? '#81ecff' : 'rgba(255, 255, 255, 0.05)',
                      transform: currentBeat === 0 ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: currentBeat === 0 
                        ? '0 0 30px rgba(129,236,255,0.3), inset 0 0 30px rgba(129,236,255,0.3)' 
                        : 'none'
                    }}
                  />

                  {/* BPM Display */}
                  <div className="text-center z-10">
                    <motion.span 
                      className="block text-[5rem] font-headline font-bold leading-none tracking-tighter"
                    >
                      {bpm}
                    </motion.span>
                    <span className="text-primary font-headline font-bold tracking-[0.2em] uppercase text-sm">
                      BPM
                    </span>
                  </div>

                  {/* Beat Indicators */}
                  <div className="absolute -bottom-6 flex gap-3">
                    {Array.from({ length: beatsPerBar }).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-3 h-3 rounded-full ${currentBeat === i ? 'bg-[#81ecff] scale-125 shadow-[0_0_15px_#81ecff]' : 'bg-[#262626] scale-100'}`}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Training Stats (Visible when playing) */}
              <div className="h-12">
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex justify-center gap-8 text-sm font-headline font-bold uppercase tracking-widest text-primary/60"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px]">Bar</span>
                        <span className="text-white text-xl">{currentBar + 1}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px]">Target</span>
                        <span className="text-white text-xl">{config.targetTempo}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Control Grid */}
              <section className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-surface-low p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                  <span className="text-primary font-headline font-bold text-[10px] uppercase tracking-widest opacity-80">
                    Subdivision
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    {[
                      { value: 'quarter', label: '1/4' },
                      { value: 'eighth', label: '1/8' },
                      { value: 'triplet', label: '3' },
                      { value: 'sixteenth', label: '1/16' }
                    ].map((sub) => (
                      <button
                        key={sub.value}
                        onClick={() => setConfig(prev => ({ ...prev, subdivision: sub.value as any }))}
                        className={`flex-1 py-2 rounded-lg font-headline font-bold transition-all ${
                          (config.subdivision || 'quarter') === sub.value
                            ? 'bg-primary text-black shadow-lg shadow-primary/20'
                            : 'bg-surface text-on-surface-variant hover:text-white'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-low p-4 rounded-xl border border-white/5 flex flex-col gap-2 group relative overflow-hidden">
                  <span className="text-primary font-headline font-bold text-[10px] uppercase tracking-widest opacity-80">
                    Time Sig
                  </span>
                  <div className="flex items-center justify-between">
                    <select
                      value={config.timeSignature}
                      onChange={(e) => setConfig(prev => ({ ...prev, timeSignature: e.target.value }))}
                      className="bg-transparent text-2xl font-headline font-bold text-white focus:outline-none appearance-none cursor-pointer w-full"
                    >
                      {METERS.map(meter => (
                        <option key={meter} value={meter} className="bg-surface text-base">
                          {meter}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <ControlCard 
                  label="Start Tempo" 
                  value={config.startTempo} 
                  unit="BPM" 
                  min={20}
                  onChange={(val) => setConfig(prev => ({ ...prev, startTempo: val }))}
                  onIncrement={() => setConfig(prev => ({ ...prev, startTempo: prev.startTempo + 1 }))}
                  onDecrement={() => setConfig(prev => ({ ...prev, startTempo: Math.max(20, prev.startTempo - 1) }))}
                />
                <ControlCard 
                  label="Target Tempo" 
                  value={config.targetTempo} 
                  unit="BPM" 
                  min={config.startTempo}
                  onChange={(val) => setConfig(prev => ({ ...prev, targetTempo: val }))}
                  onIncrement={() => setConfig(prev => ({ ...prev, targetTempo: prev.targetTempo + 1 }))}
                  onDecrement={() => setConfig(prev => ({ ...prev, targetTempo: Math.max(config.startTempo, prev.targetTempo - 1) }))}
                />
                <ControlCard 
                  label="Increment" 
                  value={config.increment} 
                  unit="BPM" 
                  prefix="+"
                  min={1}
                  onChange={(val) => setConfig(prev => ({ ...prev, increment: val }))}
                  onIncrement={() => setConfig(prev => ({ ...prev, increment: prev.increment + 1 }))}
                  onDecrement={() => setConfig(prev => ({ ...prev, increment: Math.max(1, prev.increment - 1) }))}
                />
                <ControlCard 
                  label="Trigger" 
                  value={config.triggerBars} 
                  unit="BARS"
                  min={1}
                  onChange={(val) => setConfig(prev => ({ ...prev, triggerBars: val }))}
                  onIncrement={() => setConfig(prev => ({ ...prev, triggerBars: prev.triggerBars + 1 }))}
                  onDecrement={() => setConfig(prev => ({ ...prev, triggerBars: Math.max(1, prev.triggerBars - 1) }))}
                />
              </section>

              {/* Start Button */}
              <section className="mt-4">
                <button 
                  onClick={handleTogglePlay}
                  className={`w-full h-24 rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-all duration-300 shadow-2xl ${
                    isPlaying 
                      ? 'bg-red-500 shadow-red-500/40' 
                      : 'bg-gradient-to-br from-secondary to-orange-700 shadow-secondary/40'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-10 h-10 fill-white" />
                      <span className="font-headline font-black text-2xl tracking-widest uppercase">Stop Session</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-10 h-10 fill-white" />
                      <span className="font-headline font-black text-2xl tracking-widest uppercase">Start Session</span>
                    </>
                  )}
                </button>
              </section>
            </motion.div>
          ) : activeTab === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight">
                  Practice Routines
                </h2>
                <p className="text-on-surface-variant text-sm">
                  Select a routine to update your practice settings.
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                {routines.map(routine => (
                  <RoutineCard 
                    key={routine.id} 
                    routine={routine} 
                    onClick={() => handleSelectRoutine(routine)} 
                    onEdit={(e) => handleEditRoutine(routine, e)}
                    onDelete={(e) => handleDeleteRoutine(routine.id, e)}
                  />
                ))}

                <AnimatePresence mode="wait">
                  {isAddingRoutine ? (
                    <motion.div
                      key="add-form"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-surface-low p-6 rounded-2xl border border-white/10 flex flex-col gap-4"
                    >
                      <h3 className="font-headline font-bold text-xl text-white">New Routine</h3>
                      
                      <div className="flex flex-col gap-3">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Name</span>
                          <input 
                            type="text" 
                            value={newRoutine.title}
                            onChange={e => setNewRoutine({...newRoutine, title: e.target.value})}
                            className="bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Alternate Picking"
                          />
                        </label>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex flex-col gap-1">
                            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Start (BPM)</span>
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={newRoutine.startTempo}
                              onChange={e => setNewRoutine({...newRoutine, startTempo: e.target.value === '' ? '' : Number(e.target.value)})}
                              onFocus={e => e.target.select()}
                              className="bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Target (BPM)</span>
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={newRoutine.targetTempo}
                              onChange={e => setNewRoutine({...newRoutine, targetTempo: e.target.value === '' ? '' : Number(e.target.value)})}
                              onFocus={e => e.target.select()}
                              className="bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Increment</span>
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={newRoutine.increment}
                              onChange={e => setNewRoutine({...newRoutine, increment: e.target.value === '' ? '' : Number(e.target.value)})}
                              onFocus={e => e.target.select()}
                              className="bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Trigger Bars</span>
                            <input 
                              type="text" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={newRoutine.triggerBars}
                              onChange={e => setNewRoutine({...newRoutine, triggerBars: e.target.value === '' ? '' : Number(e.target.value)})}
                              onFocus={e => e.target.select()}
                              className="bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Time Signature</span>
                            <select 
                              value={newRoutine.timeSignature}
                              onChange={e => setNewRoutine({...newRoutine, timeSignature: e.target.value})}
                              className="bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                            >
                              {METERS.map(meter => (
                                <option key={meter} value={meter}>{meter}</option>
                              ))}
                            </select>
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Subdivision</span>
                            <select 
                              value={newRoutine.subdivision}
                              onChange={e => setNewRoutine({...newRoutine, subdivision: e.target.value as any})}
                              className="bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                            >
                              <option value="quarter">1/4</option>
                              <option value="eighth">1/8</option>
                              <option value="triplet">3</option>
                              <option value="sixteenth">1/16</option>
                            </select>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-2">
                        <button 
                          onClick={() => {
                            setIsAddingRoutine(false);
                            setEditingId(null);
                          }}
                          className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold tracking-widest uppercase text-sm hover:bg-white/5 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            if (newRoutine.title.trim()) {
                              const routineData = {
                                title: newRoutine.title,
                                startTempo: newRoutine.startTempo === '' ? 60 : newRoutine.startTempo,
                                targetTempo: newRoutine.targetTempo === '' ? 120 : newRoutine.targetTempo,
                                increment: newRoutine.increment === '' ? 5 : newRoutine.increment,
                                triggerBars: newRoutine.triggerBars === '' ? 4 : newRoutine.triggerBars,
                                timeSignature: newRoutine.timeSignature || '4/4',
                                subdivision: newRoutine.subdivision || 'quarter',
                              };

                              if (editingId) {
                                setRoutines(routines.map(r => r.id === editingId ? { ...r, ...routineData } : r));
                              } else {
                                setRoutines([...routines, {
                                  ...routineData,
                                  id: Date.now().toString(),
                                  icon: <Activity className="w-6 h-6 text-primary" />
                                }]);
                              }
                              
                              setIsAddingRoutine(false);
                              setEditingId(null);
                              setNewRoutine({
                                title: '',
                                startTempo: 60,
                                targetTempo: 120,
                                increment: 5,
                                triggerBars: 4,
                                timeSignature: '4/4',
                                subdivision: 'quarter',
                              });
                            }
                          }}
                          className="flex-1 py-3 rounded-xl bg-primary text-black font-bold tracking-widest uppercase text-sm hover:bg-primary/90 transition-colors"
                        >
                          {editingId ? 'Update Routine' : 'Save Routine'}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="add-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsAddingRoutine(true)}
                      className="w-full py-6 rounded-2xl border-2 border-dashed border-white/20 text-on-surface-variant font-headline font-bold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create Custom Routine
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : activeTab === 'psychology' ? (
            <motion.div
              key="psychology"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight">
                  Training Insights
                </h2>
                <p className="text-on-surface-variant text-sm">
                  Track your progress and stay motivated.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-low p-5 rounded-2xl border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                  <span className="text-primary font-headline font-bold text-[10px] uppercase tracking-widest opacity-80">
                    Total Sessions
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-headline font-black text-white">{stats.totalSessions}</span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 opacity-5">
                    <Timer className="w-24 h-24" />
                  </div>
                </div>

                <div className="bg-surface-low p-5 rounded-2xl border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                  <span className="text-primary font-headline font-bold text-[10px] uppercase tracking-widest opacity-80">
                    All-Time Top Speed
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-headline font-black text-white">{stats.highestBpm}</span>
                    <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">BPM</span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 opacity-5">
                    <Zap className="w-24 h-24" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Mindset
                </h3>
                <div className="bg-surface-low p-6 rounded-2xl border border-white/5 relative">
                  <div className="absolute top-4 left-4 text-primary/20 text-6xl font-serif leading-none">"</div>
                  <p className="relative z-10 text-lg font-medium text-white/90 italic pl-6 pt-2">
                    {quoteOfTheDay}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="other"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-on-surface-variant italic"
            >
              <User className="w-12 h-12 mb-4 opacity-20" />
              <p>Profile coming soon...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-background/70 backdrop-blur-xl border-t border-white/5 rounded-t-[32px]">
        <NavButton 
          active={activeTab === 'metronome'} 
          onClick={() => setActiveTab('metronome')}
          icon={<Timer className="w-6 h-6" />}
        />
        <NavButton 
          active={activeTab === 'list'} 
          onClick={() => setActiveTab('list')}
          icon={<List className="w-6 h-6" />}
        />
        <NavButton 
          active={activeTab === 'psychology'} 
          onClick={() => setActiveTab('psychology')}
          icon={<Brain className="w-6 h-6" />}
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
          icon={<User className="w-6 h-6" />}
        />
      </nav>
    </div>
  );
}
