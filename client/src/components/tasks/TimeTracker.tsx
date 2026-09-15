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
    <div className="p-4 bg-slate-50/80 dark:bg-[#111827]/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue- dark:text-blue-" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Time Tracking
          </h4>
        </div>
        <button
          onClick={() => setShowManual(!showManual)}
          className="text-xs text-blue- dark:text-blue- hover:underline font-semibold cursor-pointer"
        >
          {showManual ? 'Cancel' : '+ Manual Entry'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2.5 bg-white dark:bg-[#0B0F17] rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400">Estimated</span>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{estimatedHours}h</p>
        </div>
        <div className="p-2.5 bg-white dark:bg-[#0B0F17] rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400">Actual</span>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{actualHours}h</p>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
          {formatTimer(seconds)}
        </div>
        <button
          onClick={handleToggleTimer}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
            isTimerRunning
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-blue- text-white hover:bg-blue-'
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
        <form onSubmit={handleManualLog} className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
          <input
            type="number"
            value={manualMinutes}
            onChange={(e) => setManualMinutes(e.target.value)}
            placeholder="Duration in minutes (e.g. 90)"
            min="1"
            className="w-full px-3 py-1.5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-/40"
          />
          <input
            type="text"
            value={manualDesc}
            onChange={(e) => setManualDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-1.5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-/40"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue- hover:bg-blue- text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Log Time
          </button>
        </form>
      )}
    </div>
  );
};