import { useState, useEffect, useRef, useCallback } from 'react';

export interface MetronomeConfig {
  startTempo: number;
  targetTempo: number;
  increment: number;
  triggerBars: number;
  timeSignature: string;
  subdivision?: 'quarter' | 'eighth' | 'triplet' | 'sixteenth';
}

export function useMetronome(config: MetronomeConfig) {
  const [bpm, setBpm] = useState(config.startTempo);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentBar, setCurrentBar] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  const bpmRef = useRef(config.startTempo);
  const beatRef = useRef(0);
  const barRef = useRef(0);
  const configRef = useRef(config);
  const beatQueue = useRef<{ beat: number; bar: number; time: number; bpm: number }[]>([]);
  const requestAnimationFrameRef = useRef<number | null>(null);

  // Sync refs with state/props
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const playClick = useCallback((time: number, noteType: 'accent' | 'beat' | 'sub') => {
    if (!audioContextRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const envelope = audioContextRef.current.createGain();

    let targetVolume = 0.5;
    if (noteType === 'accent') {
      osc.frequency.value = 1200;
      targetVolume = 0.5;
    } else if (noteType === 'beat') {
      osc.frequency.value = 800;
      targetVolume = 0.5;
    } else {
      osc.frequency.value = 600;
      targetVolume = 0.25;
    }
    
    // Micro-fade-in to prevent popping
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(targetVolume, time + 0.005);
    
    // Quick decay
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(envelope);
    envelope.connect(audioContextRef.current.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }, []);

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const scheduleAheadTime = 0.25; // seconds
    const lookahead = 25.0; // milliseconds

    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      const isFirstBeat = beatRef.current === 0;

      // Handle Training Logic: Increment BPM every X bars
      if (isFirstBeat && barRef.current > 0 && barRef.current % configRef.current.triggerBars === 0) {
        const nextBpm = Math.min(bpmRef.current + configRef.current.increment, configRef.current.targetTempo);
        if (nextBpm !== bpmRef.current) {
          bpmRef.current = nextBpm;
        }
      }

      const secondsPerBeat = 60.0 / bpmRef.current;
      
      let subBeats = 1;
      switch (configRef.current.subdivision) {
        case 'eighth': subBeats = 2; break;
        case 'triplet': subBeats = 3; break;
        case 'sixteenth': subBeats = 4; break;
        default: subBeats = 1; break;
      }
      
      // Schedule audio for main beat and sub-beats
      for (let i = 0; i < subBeats; i++) {
        const subTime = nextNoteTimeRef.current + (i * secondsPerBeat / subBeats);
        const noteType = i === 0 ? (isFirstBeat ? 'accent' : 'beat') : 'sub';
        playClick(subTime, noteType);
      }
      
      // Queue UI state update
      const scheduledTime = nextNoteTimeRef.current;
      const scheduledBeat = beatRef.current;
      const scheduledBar = barRef.current;
      
      beatQueue.current.push({
        beat: scheduledBeat,
        bar: scheduledBar,
        time: scheduledTime,
        bpm: bpmRef.current
      });

      // Advance timing
      nextNoteTimeRef.current += secondsPerBeat;
      
      // Advance beat and bar
      const beatsPerBar = parseInt(configRef.current.timeSignature.split('/')[0], 10);
      beatRef.current = (beatRef.current + 1) % beatsPerBar;
      if (beatRef.current === 0) {
        barRef.current += 1;
      }
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  }, [playClick]);

  const draw = useCallback(() => {
    if (!audioContextRef.current) return;

    const currentTime = audioContextRef.current.currentTime;
    const hardwareOffset = 0.100; // 100ms early trigger
    
    let lastState = null;
    while (beatQueue.current.length > 0 && beatQueue.current[0].time <= currentTime + hardwareOffset) {
      lastState = beatQueue.current.shift();
    }
    
    if (lastState) {
      setCurrentBeat(lastState.beat);
      setCurrentBar(lastState.bar);
      setBpm(lastState.bpm);
    }

    requestAnimationFrameRef.current = requestAnimationFrame(draw);
  }, []);

  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // Reset state
      beatRef.current = 0;
      barRef.current = 0;
      bpmRef.current = configRef.current.startTempo;
      setBpm(configRef.current.startTempo);
      setCurrentBeat(0);
      setCurrentBar(0);
      
      nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
      setIsPlaying(true);
      scheduler();
      requestAnimationFrameRef.current = requestAnimationFrame(draw);
    } else {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
      if (requestAnimationFrameRef.current) {
        cancelAnimationFrame(requestAnimationFrameRef.current);
      }
      beatQueue.current = [];
      setIsPlaying(false);
    }
  }, [isPlaying, scheduler, draw]);

  useEffect(() => {
    return () => {
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
      if (requestAnimationFrameRef.current) cancelAnimationFrame(requestAnimationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return {
    bpm,
    setBpm,
    isPlaying,
    togglePlay,
    currentBeat,
    currentBar,
  };
}
