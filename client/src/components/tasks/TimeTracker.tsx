import React, { useState, useEffect } from 'react';
import { Clock, Play, Square } from 'lucide-react';
import { api } from '../../lib/axios';

interface TimeTrackerProps {
  taskId: string;
  estimatedHours: number;
  actualHours: number;
  onUpdate: () => void;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({
  taskId,
  estimatedHours,
  actualHours,
  onUpdate,
}) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleToggleTimer = async () => {
    if (isTimerRunning) {
      // Stop timer and log
      setIsTimerRunning(false);
      const minutes = Math.max(1, Math.round(seconds / 60));
      try {
        await api.post(`/tasks/${taskId}/time`, {
          durationMinutes: minutes,
          description: 'Timer tracking session',
        });
        setSeconds(0);
        onUpdate();
      } catch (err) {
        console.error(err);
      }
    } else {
      setIsTimerRunning(true);
    }
  };

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration = Number(manualMinutes);
    if (!duration || duration <= 0) return;
    try {
      await api.post(`/tasks/${taskId}/time`, {
        durationMinutes: duration,
        description: manualDesc || 'Manual entry',
      });
      setManualMinutes('');
      setManualDesc('');
      setShowManual(false);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-slate-50/80 dark:bg-[#111827]/70 border border-[#E6DACB]/80 dark:border-slate-800/80 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-maroon-700 dark:text-blue-300" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3B32] dark:text-slate-300">
            Time Tracking
          </h4>
        </div>
        <button
          onClick={() => setShowManual(!showManual)}
          className="text-xs text-maroon-700 dark:text-blue-300 hover:underline font-semibold cursor-pointer"
        >
          {showManual ? 'Cancel' : '+ Manual Entry'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2.5 bg-[#FFFDF9] dark:bg-[#0B0F17] rounded-xl border border-[#E6DACB]/60 dark:border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-[#7C6E65]">Estimated</span>
          <p className="text-sm font-bold text-[#2C1810] dark:text-slate-200">{estimatedHours}h</p>
        </div>
        <div className="p-2.5 bg-[#FFFDF9] dark:bg-[#0B0F17] rounded-xl border border-[#E6DACB]/60 dark:border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-[#7C6E65]">Actual</span>
          <p className="text-sm font-bold text-[#2C1810] dark:text-slate-200">{actualHours}h</p>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="font-mono text-sm font-bold text-[#4A3B32] dark:text-slate-300">
          {formatTimer(seconds)}
        </div>
        <button
          onClick={handleToggleTimer}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
            isTimerRunning
              ? 'bg-rose-600 dark:bg-blue-600 text-white hover:bg-rose-700 dark:hover:bg-blue-500'
              : 'bg-maroon-600 dark:bg-blue-600 text-white hover:bg-maroon-700 dark:hover:bg-blue-500'
          }`}
        >
          {isTimerRunning ? (
            <>
              <Square className="w-3.5 h-3.5" /> Stop & Save
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Start Timer
            </>
          )}
        </button>
      </div>

      {showManual && (
        <form onSubmit={handleManualLog} className="pt-2 border-t border-[#E6DACB] dark:border-slate-700/80 space-y-2">
          <input
            type="number"
            value={manualMinutes}
            onChange={(e) => setManualMinutes(e.target.value)}
            placeholder="Duration in minutes (e.g. 90)"
            min="1"
            className="w-full px-3 py-1.5 bg-[#FFFDF9] dark:bg-[#0B0F17] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-xs text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:ring-blue-500/30 dark:focus:border-blue-500"
          />
          <input
            type="text"
            value={manualDesc}
            onChange={(e) => setManualDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-1.5 bg-[#FFFDF9] dark:bg-[#0B0F17] border border-[#E6DACB] dark:border-slate-700 rounded-xl text-xs text-[#2C1810] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-maroon-600/30 focus:border-maroon-600 dark:focus:ring-blue-500/30 dark:focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full py-2 bg-maroon-600 hover:bg-maroon-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Log Time
          </button>
        </form>
      )}
    </div>
  );
};