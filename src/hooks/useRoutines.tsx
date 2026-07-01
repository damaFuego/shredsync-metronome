import React, { useState, useEffect } from 'react';
import { Activity, Zap } from 'lucide-react';
import { MetronomeConfig } from './useMetronome';

export interface Routine extends MetronomeConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  tabData?: string;
}

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'spider-walk',
    title: "Spider Walk Warmup",
    startTempo: 60,
    targetTempo: 120,
    increment: 5,
    triggerBars: 4,
    timeSignature: '4/4',
    subdivision: 'quarter',
    icon: <Activity className="w-6 h-6 text-[#81ecff]" />,
    tabData: `e|-----------------------------------------1-2-3-4-|
B|---------------------------------1-2-3-4---------|
G|-------------------------1-2-3-4-----------------|
D|-----------------1-2-3-4-------------------------|
A|---------1-2-3-4---------------------------------|
E|-1-2-3-4-----------------------------------------|`
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
    icon: <Zap className="w-6 h-6 text-[#81ecff]" />,
  },
];

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('shredsync_routines');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((r: any) => {
        const defaultRoutine = DEFAULT_ROUTINES.find(dr => dr.id === r.id);
        return {
          ...r,
          tabData: defaultRoutine?.tabData || r.tabData,
          subdivision: r.subdivision || 'quarter',
          icon: r.id === 'sweep-picking' ? <Zap className="w-6 h-6 text-[#81ecff]" /> : <Activity className="w-6 h-6 text-[#81ecff]" />
        };
      });
    }
    return DEFAULT_ROUTINES;
  });

  useEffect(() => {
    const routinesToSave = routines.map(({ icon, ...rest }) => rest);
    localStorage.setItem('shredsync_routines', JSON.stringify(routinesToSave));
  }, [routines]);

  const addRoutine = (routineData: Omit<Routine, 'id' | 'icon'>) => {
    setRoutines(prev => [...prev, {
      ...routineData,
      id: Date.now().toString(),
      icon: <Activity className="w-6 h-6 text-[#81ecff]" />
    }]);
  };

  const updateRoutine = (id: string, routineData: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...routineData } : r));
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  return { routines, addRoutine, updateRoutine, deleteRoutine };
}
