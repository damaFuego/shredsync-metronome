import { useState, useEffect } from 'react';

export interface PracticeLog {
  date: string;
  routineName: string;
  bpm: number;
}

export function usePracticeStats() {
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('shredsync_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        totalSessions: parsed.totalSessions || 0,
        highestBpm: parsed.highestBpm || 0,
        history: parsed.history || []
      };
    }
    return { totalSessions: 0, highestBpm: 0, history: [] as PracticeLog[] };
  });

  const [graphFilter, setGraphFilter] = useState<string>('All');

  useEffect(() => {
    localStorage.setItem('shredsync_stats', JSON.stringify(stats));
  }, [stats]);

  const logSession = (routineName: string, bpm: number) => {
    setStats((prev: any) => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      highestBpm: Math.max(prev.highestBpm, bpm),
      history: [
        { date: new Date().toISOString(), routineName, bpm },
        ...(prev.history || [])
      ]
    }));
  };

  const resetStats = () => {
    setStats({ totalSessions: 0, highestBpm: 0, history: [] });
  };

  // Data Processing for Chart
  const uniqueRoutines = Array.from(new Set(stats.history.map((log: PracticeLog) => log.routineName)));
  
  const chartData = stats.history
    .filter((log: PracticeLog) => graphFilter === 'All' || log.routineName === graphFilter)
    .sort((a: PracticeLog, b: PracticeLog) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((log: PracticeLog) => {
      const d = new Date(log.date);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return { ...log, date: `${monthNames[d.getMonth()]} ${d.getDate()}` };
    });

  // Streak Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const hasLog = stats.history.some((log: PracticeLog) => {
      const logDate = new Date(log.date);
      return logDate.getFullYear() === d.getFullYear() && logDate.getMonth() === d.getMonth() && logDate.getDate() === d.getDate();
    });
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return { dateObj: d, dayName: dayNames[d.getDay()], hasLog };
  });

  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const hasLog = stats.history.some((log: PracticeLog) => {
      const logDate = new Date(log.date);
      return logDate.getFullYear() === d.getFullYear() && logDate.getMonth() === d.getMonth() && logDate.getDate() === d.getDate();
    });
    if (hasLog) { currentStreak++; } 
    else if (i === 0) { continue; } 
    else { break; }
  }

  const improvement = chartData.length >= 2 ? chartData[chartData.length - 1].bpm - chartData[0].bpm : 0;

  return { stats, graphFilter, setGraphFilter, logSession, resetStats, uniqueRoutines, chartData, last7Days, currentStreak, improvement };
}
