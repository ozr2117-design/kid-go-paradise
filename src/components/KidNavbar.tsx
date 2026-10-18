import React, { useState, useEffect } from 'react';
import { GameMode } from '../types/go';
import { Volume2, VolumeX, Sparkles, Map, Swords, Puzzle, Grid, Bot, Maximize, Minimize } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
  return (
    <header className="w-full bg-amber-500 text-white shadow-sm border-b-2 sm:border-b-4 border-amber-600 px-2 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between gap-1.5 select-none shrink-0 overflow-x-auto">
      {/* Brand & Stars */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-amber-600/60 px-3 py-1 rounded-2xl border border-amber-400">
          <span className="text-lg sm:text-xl font-black tracking-wide font-cartoon">森森围棋基地</span>
        </div>

        {/* Stars counter */}
        <div
          title="通关累计获得的星星总数（每过一关摘得2~3颗星）"
          className="flex items-center gap-1.5 bg-yellow-400 text-amber-900 font-black px-2.5 py-0.5 rounded-full shadow-inner border border-yellow-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
          <span className="text-xs sm:text-sm font-cartoon">⭐ {totalStars}星</span>
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
          onClick={() => onSelectMode('sparring')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${
            currentMode === 'sparring'
              ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
              : 'hover:bg-amber-500/50 text-amber-100'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI全盘对弈</span>
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
          onClick={toggleFullscreen}
          title={isFullscreen ? '退出全屏' : '全屏下棋 (推荐平板使用)'}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 border border-amber-300 text-white font-bold text-xs shadow-sm transition"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFullscreen ? '退出全屏' : '全屏'}</span>
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
