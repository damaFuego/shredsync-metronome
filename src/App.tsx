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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMetronome, MetronomeConfig } from './hooks/useMetronome';
import { ControlCard } from './components/ControlCard';
import { RoutineCard } from './components/RoutineCard';
import { usePracticeStats } from './hooks/usePracticeStats';
import { useRoutines } from './hooks/useRoutines';

const METERS = ['2/4', '3/4', '4/4', '6/8', '9/8', '12/8'];

const MINDSET_QUOTES = [
  "Don't practice until you get it right. Practice until you can't get it wrong.",
  "Amateurs practice until they get it right; professionals practice until they can't get it wrong.",
  "The only way to get better is to push yourself past your comfort zone.",
  "Slow practice is fast progress.",
  "Discipline is choosing between what you want now and what you want most."
];

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

  const [isSpeedTrainerMode, setIsSpeedTrainerMode] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSoundPackDropdownOpen, setIsSoundPackDropdownOpen] = useState(false);

  const soundPackOptions = [
    { value: 'synth', label: 'Classic Synth (Square)' },
    { value: 'wood', label: 'Wooden Tick (Triangle)' },
    { value: 'drum', label: 'Deep Thud (Sine)' }
  ];

  const [appSettings, setAppSettings] = useState<{ soundPack: 'synth'|'wood'|'drum' }>(() => {
    const saved = localStorage.getItem('shredsync_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      soundPack: parsed.soundPack || 'synth'
    };
  });

  useEffect(() => {
    localStorage.setItem('shredsync_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  const { 
    bpm, 
    isPlaying, 
    togglePlay, 
    currentBeat, 
    currentBar,
    isCountingIn
  } = useMetronome(isSpeedTrainerMode 
    ? { ...config, soundPack: appSettings.soundPack } 
    : { ...config, targetTempo: config.startTempo, increment: 0, soundPack: appSettings.soundPack }
  );

  const [activeTab, setActiveTab] = useState('metronome');
  const { routines, addRoutine, updateRoutine, deleteRoutine } = useRoutines();

  const { 
    stats, graphFilter, setGraphFilter, logSession, resetStats, 
    uniqueRoutines, chartData, last7Days, currentStreak, improvement 
  } = usePracticeStats();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logData, setLogData] = useState({ bpm: config.startTempo, routineName: routines[0]?.title || 'Custom Practice' });

  const [quoteOfTheDay, setQuoteOfTheDay] = useState('');

  const [displayBpm, setDisplayBpm] = useState<string | number>(config.startTempo);

  useEffect(() => {
    setDisplayBpm(config.startTempo);
  }, [config.startTempo]);

  useEffect(() => {
    setQuoteOfTheDay(MINDSET_QUOTES[Math.floor(Math.random() * MINDSET_QUOTES.length)]);
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (isSpeedTrainerMode) {
        setLogData({ bpm: bpm, routineName: routines[0]?.title || 'Custom Practice' });
        setShowLogModal(true);
      } else {
        // Auto-log standard practice as "Free Play" for the current BPM
        logSession("Standard Metronome", bpm);
      }
    }
    togglePlay();
  };

  const handleLogSession = () => {
    logSession(logData.routineName, logData.bpm);
    setShowLogModal(false);
  };

  const handleResetStats = () => {
    resetStats();
    setShowResetConfirm(false);
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
    deleteRoutine(id);
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

  const handleSelectRoutine = (routine: Routine, autoStart: boolean = false) => {
    setConfig({
      startTempo: routine.startTempo,
      targetTempo: routine.targetTempo,
      increment: routine.increment,
      triggerBars: routine.triggerBars,
      timeSignature: routine.timeSignature || '4/4',
      subdivision: routine.subdivision || 'quarter',
    });
    setIsSpeedTrainerMode(true);
    setActiveTab('metronome');

    if (autoStart && !isPlaying) {
      togglePlay(true, {
        startTempo: routine.startTempo,
        targetTempo: routine.targetTempo,
        increment: routine.increment,
        triggerBars: routine.triggerBars,
        timeSignature: routine.timeSignature || '4/4',
        subdivision: routine.subdivision || 'quarter'
      });
    }
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
        <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors">
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
              className="flex flex-col gap-4"
            >
              {/* Mode Toggle Pill */}
              <div className="bg-gray-800/50 p-1 rounded-full flex w-full max-w-xs mx-auto mt-2">
                <button
                  onClick={() => setIsSpeedTrainerMode(false)}
                  className={`flex-1 py-2 rounded-full font-headline font-bold text-sm transition-all ${
                    !isSpeedTrainerMode
                      ? 'bg-[#81ecff] text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setIsSpeedTrainerMode(true)}
                  className={`flex-1 py-2 rounded-full font-headline font-bold text-sm transition-all ${
                    isSpeedTrainerMode
                      ? 'bg-[#81ecff] text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Speed Trainer
                </button>
              </div>

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
                  {isCountingIn ? (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <span className="text-[8rem] font-headline font-black text-[#81ecff] drop-shadow-[0_0_30px_rgba(129,236,255,0.8)] animate-pulse">
                        {currentBeat + 1}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center z-10">
                      <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="10"
                      max="300"
                      value={isPlaying ? bpm : displayBpm}
                      onChange={(e) => {
                        if (!isPlaying) {
                          const val = e.target.value;
                          setDisplayBpm(val);
                          if (val !== '') {
                            setConfig(prev => ({ ...prev, startTempo: parseInt(val, 10) }));
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (!isPlaying) {
                          let val;
                          if (e.target.value === '') {
                            val = 100;
                          } else {
                            val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 10) val = 10;
                            if (val > 300) val = 300;
                          }
                          setDisplayBpm(val);
                          setConfig(prev => ({ ...prev, startTempo: val }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      onFocus={() => {
                        if (!isPlaying) {
                          setDisplayBpm('');
                        }
                      }}
                      readOnly={isPlaying}
                      disabled={isPlaying}
                      className="block w-full bg-transparent text-center outline-none border-none appearance-none text-[5rem] font-headline font-bold leading-none tracking-tighter [&::-webkit-inner-spin-button]:appearance-none m-0 p-0 caret-transparent"
                    />
                    <span className="text-primary font-headline font-bold tracking-[0.2em] uppercase text-sm">
                      BPM
                    </span>
                  </div>
                  )}

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
                  {isPlaying && !isCountingIn && (
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
                  label={isSpeedTrainerMode ? "Start Tempo" : "Tempo"} 
                  value={config.startTempo} 
                  unit="BPM" 
                  min={20}
                  onChange={(val) => setConfig(prev => ({ ...prev, startTempo: val }))}
                  onIncrement={() => setConfig(prev => ({ ...prev, startTempo: prev.startTempo + 1 }))}
                  onDecrement={() => setConfig(prev => ({ ...prev, startTempo: Math.max(20, prev.startTempo - 1) }))}
                />
                
                {isSpeedTrainerMode && (
                  <>
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
                  </>
                )}
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
                    onClick={() => handleSelectRoutine(routine, false)} 
                    onEdit={(e) => handleEditRoutine(routine, e)}
                    onDelete={(e) => handleDeleteRoutine(routine.id, e)}
                    onStartShredding={() => handleSelectRoutine(routine, true)}
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
                                updateRoutine(editingId, routineData);
                              } else {
                                addRoutine(routineData as any);
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

              {/* STREAK CARD */}
              <div className="bg-surface-low p-5 rounded-2xl border border-white/5 w-full mt-4">
                <h3 className="font-headline font-bold text-white uppercase tracking-widest mb-4">
                  CURRENT STREAK: {currentStreak} DAYS
                </h3>
                <div className="flex justify-between items-center">
                  {last7Days.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${day.hasLog ? 'bg-primary shadow-[0_0_15px_rgba(129,236,255,0.4)]' : 'bg-white/5'}`} />
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase">{day.dayName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {showResetConfirm ? (
                <div className="bg-surface-low p-4 rounded-xl border border-red-500/30 flex flex-col gap-3">
                  <p className="text-sm text-on-surface-variant text-center">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-2 rounded-lg border border-white/10 hover:bg-white/5 font-headline font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetStats}
                      className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-headline font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                      Yes, Reset
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-3 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500/10 font-headline font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset Stats
                </button>
              )}

              <div className="bg-surface-low p-5 rounded-2xl border border-white/5 flex flex-col gap-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline font-bold tracking-widest text-primary uppercase">Speed Progress</h3>
                  <select
                    value={graphFilter}
                    onChange={(e) => setGraphFilter(e.target.value)}
                    className="bg-surface p-2 rounded-lg border border-white/10 text-white outline-none focus:border-primary/50 text-xs font-bold uppercase tracking-widest"
                  >
                    <option value="All">All Routines</option>
                    {uniqueRoutines.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {chartData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <p className="text-on-surface-variant italic text-center">Log a Clean Run to see your progress.</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#81ecff', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="bpm" fill="#81ecff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                    {improvement > 0 ? (
                      <div className="text-green-400 font-bold tracking-wide mt-2">+{improvement} BPM Growth (Selected Routine)</div>
                    ) : improvement < 0 ? (
                      <div className="text-red-400 font-bold tracking-wide mt-2">{improvement} BPM (Slight Dip)</div>
                    ) : null}
                  </>
                )}
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

        {/* Clean Run Logging Modal */}
        <AnimatePresence>
          {showLogModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface-low p-6 rounded-3xl border border-white/10 w-11/12 max-w-sm flex flex-col gap-6"
              >
                <h2 className="font-headline font-black text-2xl text-primary text-center uppercase tracking-widest">SHRED SESSION COMPLETE</h2>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">ROUTINE</label>
                    <select
                      value={logData.routineName}
                      onChange={(e) => setLogData({ ...logData, routineName: e.target.value })}
                      className="bg-surface p-3 rounded-xl border border-white/10 text-white outline-none focus:border-primary/50"
                    >
                      {routines.map(r => (
                        <option key={r.id} value={r.title}>{r.title}</option>
                      ))}
                      <option value="Custom Practice">Custom Practice</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">TOP CLEAN SPEED (NO SLOP!)</label>
                    <div className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-white/10 focus-within:border-primary/50">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={logData.bpm}
                        onChange={(e) => setLogData({ ...logData, bpm: parseInt(e.target.value) || 0 })}
                        className="bg-transparent w-full text-white outline-none font-headline font-bold text-xl"
                      />
                      <span className="text-on-surface-variant font-bold text-sm">BPM</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-headline font-bold uppercase tracking-widest text-sm transition-colors"
                  >
                    Trash It (Sloppy)
                  </button>
                  <button
                    onClick={handleLogSession}
                    className="flex-1 py-3 rounded-xl bg-primary text-black hover:bg-[#6be0ff] font-headline font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_20px_rgba(129,236,255,0.3)]"
                  >
                    Log Clean Run
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface-low p-6 rounded-3xl border border-white/10 w-full max-w-sm flex flex-col gap-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-headline font-black text-2xl text-primary uppercase tracking-widest">Settings</h2>
                  <button onClick={() => { setIsSettingsOpen(false); setIsSoundPackDropdownOpen(false); }} className="text-on-surface-variant hover:text-white transition-colors">✕</button>
                </div>
                
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Audio Engine Profile</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsSoundPackDropdownOpen(!isSoundPackDropdownOpen)}
                        className="w-full bg-surface p-3 rounded-xl border border-white/10 text-white flex justify-between items-center hover:border-primary/50 transition-colors"
                      >
                        <span className="font-bold text-sm">
                          {soundPackOptions.find(o => o.value === appSettings.soundPack)?.label}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-on-surface-variant transition-transform duration-300 ${isSoundPackDropdownOpen ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isSoundPackDropdownOpen && (
                          <>
                            {/* Invisible click-away overlay */}
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setIsSoundPackDropdownOpen(false)} 
                            />

                            {/* Dropdown Menu */}
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                            >
                              {soundPackOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setAppSettings({ ...appSettings, soundPack: option.value as any });
                                    setIsSoundPackDropdownOpen(false);
                                  }}
                                  className={`w-full text-left p-3 text-sm transition-colors border-b border-white/5 last:border-none hover:bg-white/5 ${
                                    appSettings.soundPack === option.value ? 'text-primary font-bold' : 'text-white'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
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
