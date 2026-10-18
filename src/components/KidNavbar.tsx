import React from 'react';
import { GameMode } from '../types/go';
import { Volume2, VolumeX, Sparkles, Map, Swords, Puzzle, Grid } from 'lucide-react';

interface KidNavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  totalStars: number;
  soundMuted: boolean;
  onToggleSound: () => void;
  showCoordinates: boolean;
  onToggleCoordinates: () => void;
}

export const KidNavbar: React.FC<KidNavbarProps> = ({
  currentMode,
  onSelectMode,
  totalStars,
  soundMuted,
  onToggleSound,
  showCoordinates,
  onToggleCoordinates,
}) => {
  return (
    <header className="w-full bg-amber-500 text-white shadow-md border-b-4 border-amber-600 px-4 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
      {/* Brand & Stars */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-amber-600/60 px-3 py-1 rounded-2xl border border-amber-400">
          <span className="text-2xl animate-bounce">⚪</span>
          <span className="text-xl font-black tracking-wide font-cartoon">萌弈少儿围棋</span>
        </div>

        {/* Stars counter */}
        <div className="flex items-center gap-1.5 bg-yellow-400 text-amber-900 font-black px-3 py-1 rounded-full shadow-inner border border-yellow-300">
          <Sparkles className="w-4 h-4 text-amber-700 fill-amber-700" />
          <span className="text-base font-cartoon">⭐ {totalStars}</span>
        </div>
      </div>

      {/* Mode navigation pills */}
      <nav className="flex items-center gap-1.5 bg-amber-600/40 p-1 rounded-2xl border border-amber-400/40">
        <button
          onClick={() => onSelectMode('adventure')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${
            currentMode === 'adventure'
              ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
              : 'hover:bg-amber-500/50 text-amber-100'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>冒险闯关</span>
        </button>

        <button
          onClick={() => onSelectMode('battle')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${
            currentMode === 'battle'
              ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
              : 'hover:bg-amber-500/50 text-amber-100'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>萌宠吃子战</span>
        </button>

        <button
          onClick={() => onSelectMode('puzzle')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${
            currentMode === 'puzzle'
              ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
              : 'hover:bg-amber-500/50 text-amber-100'
          }`}
        >
          <Puzzle className="w-4 h-4" />
          <span>做题精练</span>
        </button>

        <button
          onClick={() => onSelectMode('sandbox')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${
            currentMode === 'sandbox'
              ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
              : 'hover:bg-amber-500/50 text-amber-100'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>自由棋盘</span>
        </button>
      </nav>

      {/* Utility controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleCoordinates}
          title="切换棋盘坐标"
          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs border transition ${
            showCoordinates
              ? 'bg-amber-600 border-amber-300 text-white'
              : 'bg-amber-700/60 border-amber-500/40 text-amber-300'
          }`}
        >
          坐标
        </button>

        <button
          onClick={onToggleSound}
          title={soundMuted ? '开启音效' : '静音'}
          className="p-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 border border-amber-400 transition"
        >
          {soundMuted ? <VolumeX className="w-5 h-5 text-red-200" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
      </div>
    </header>
  );
};
