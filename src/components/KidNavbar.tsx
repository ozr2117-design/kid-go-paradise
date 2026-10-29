import React, { useState, useEffect } from 'react';
import { GameMode } from '../types/go';
import { Volume2, VolumeX, Sparkles, Map, Swords, Grid, Bot, Maximize, Minimize, RefreshCw } from 'lucide-react';
import { APP_VERSION, APP_VERSION_TITLE } from '../version';

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

  const [versionModalOpen, setVersionModalOpen] = useState<boolean>(false);

  const handleVersionClick = () => {
    setVersionModalOpen(true);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.update().catch(() => {});
        }
      });
    }
  };

  const handleForceRefresh = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
        caches.keys().then((keys) => {
          Promise.all(keys.map((k) => caches.delete(k))).then(() => {
            window.location.reload();
          });
        });
      });
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      <header className="relative w-full bg-amber-500 text-white shadow-sm border-b-2 sm:border-b-4 border-amber-600 px-2 sm:px-3 py-1 sm:py-1.5 flex items-center justify-between gap-1.5 select-none shrink-0 overflow-x-auto">
        {/* Brand & Stars */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-600/60 px-2.5 sm:px-3 py-1 rounded-2xl border border-amber-400 shadow-sm">
            <span className="text-base sm:text-xl font-black tracking-wide font-cartoon">森森围棋基地</span>
            <button
              onClick={handleVersionClick}
              title={`当前版本：${APP_VERSION} (${APP_VERSION_TITLE})\n点击可检查并更新最新离线缓存`}
              className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold bg-amber-700/80 hover:bg-amber-800 text-amber-200 hover:text-white px-2 py-0.5 rounded-lg border border-amber-400/50 transition-all shadow-inner active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-amber-300" />
              <span>{APP_VERSION}</span>
            </button>
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
            currentMode === 'adventure' || currentMode === 'puzzle'
              ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
              : 'hover:bg-amber-500/50 text-amber-100'
          }`}
          title="冒险闯关模式（包含关卡地图与做题挑战）"
        >
          <Map className="w-4 h-4" />
          <span>冒险闯关</span>
        </button>

        <button
          onClick={() => onSelectMode('daily')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${
            currentMode === 'daily'
              ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
              : 'hover:bg-amber-500/50 text-amber-100'
          }`}
          title="每日15题死活特训打卡"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
          <span>每日打卡⭐</span>
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

    {/* Version Update & Force Refresh Center Modal */}
    {versionModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-pop-in">
        <div className="bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400 relative">
          <button
            onClick={() => setVersionModalOpen(false)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-200/80 hover:bg-amber-300 text-amber-950 flex items-center justify-center font-bold text-base transition active:scale-95"
            title="关闭"
          >
            ✕
          </button>
          <div className="text-3xl mb-1">🚀</div>
          <h3 className="text-lg font-black text-amber-950 font-cartoon">
            版本更新与离线缓存
          </h3>
          <p className="text-xs font-bold text-amber-800 mt-1 mb-2">
            当前最新版本：<span className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-amber-950 font-black">{APP_VERSION}</span>
          </p>
          <p className="text-[11px] text-gray-600 mb-4 bg-white/80 p-2.5 rounded-xl border border-amber-200 text-left leading-relaxed">
            💡 <strong>小提示</strong>：如果页面因离线缓存未显示最新界面（如对弈侧边栏已全面优化免滚动），点击下方按钮即可一键清除旧缓存并重新载入！
          </p>
          <button
            onClick={handleForceRefresh}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-950 font-black rounded-2xl shadow-lg border-2 border-yellow-300 flex items-center justify-center gap-2 text-sm transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>⚡ 立即清除缓存并载入最新版</span>
          </button>
        </div>
      </div>
    )}
  </>
  );
};
