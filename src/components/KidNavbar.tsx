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
            // 使用时间戳参数破除浏览器和 CDN 边缘强缓存
            window.location.href = window.location.origin + window.location.pathname + '?_t=' + Date.now();
          });
        });
      });
    } else {
      window.location.href = window.location.origin + window.location.pathname + '?_t=' + Date.now();
    }
  };

  return (
    <>
      <header className="relative w-full bg-amber-500 text-white shadow-sm border-b-2 sm:border-b-4 border-amber-600 px-1.5 sm:px-2.5 py-1 flex items-center justify-between gap-1 select-none shrink-0 whitespace-nowrap overflow-x-auto">
        {/* Brand & Stars */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-600/60 px-2 sm:px-2.5 py-0.5 rounded-xl sm:rounded-2xl border border-amber-400 shadow-sm shrink-0 whitespace-nowrap">
            <span className="text-xs sm:text-sm font-black tracking-wide font-cartoon whitespace-nowrap">森森围棋基地</span>
            <button
              onClick={handleVersionClick}
              title={`当前版本：${APP_VERSION} (${APP_VERSION_TITLE})\n点击可检查并更新最新离线缓存`}
              className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-mono font-bold bg-amber-700/80 hover:bg-amber-800 text-amber-200 hover:text-white px-1 sm:px-1.5 py-0.5 rounded-md border border-amber-400/50 transition-all shadow-inner active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-2.5 h-2.5 text-amber-300" />
              <span>{APP_VERSION}</span>
            </button>
          </div>

          {/* Stars counter */}
          <div
            title="通关累计获得的星星总数（每过一关摘得2~3颗星）"
            className="flex items-center gap-1 bg-yellow-400 text-amber-900 font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-inner border border-yellow-300 shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-amber-700 fill-amber-700" />
            <span className="text-[11px] sm:text-xs font-cartoon whitespace-nowrap">{totalStars}星</span>
          </div>
        </div>

        {/* Mode navigation pills */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-amber-600/40 p-0.5 rounded-xl sm:rounded-2xl border border-amber-400/40 shrink-0 whitespace-nowrap">
          <button
            onClick={() => onSelectMode('daily')}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
              currentMode === 'daily'
                ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
                : 'hover:bg-amber-500/50 text-amber-100'
            }`}
            title="每日15题 101考级真题特训打卡"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>每日打卡</span>
          </button>

          <button
            onClick={() => onSelectMode('adventure')}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
              currentMode === 'adventure' || currentMode === 'puzzle'
                ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
                : 'hover:bg-amber-500/50 text-amber-100'
            }`}
            title="101 吃子考级手筋宝典（八大专题闯关）"
          >
            <Map className="w-3.5 h-3.5" />
            <span>101考级宝典</span>
          </button>

          <button
            onClick={() => onSelectMode('battle')}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
              currentMode === 'battle'
                ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
                : 'hover:bg-amber-500/50 text-amber-100'
            }`}
            title="棋院比赛同款 19路吃子锦标赛（先吃5子/10子获胜）"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>19路吃子比赛</span>
          </button>

          <button
            onClick={() => onSelectMode('sparring')}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
              currentMode === 'sparring'
                ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
                : 'hover:bg-amber-500/50 text-amber-100'
            }`}
            title="101 围棋网公开赛实战同款（18K至15K正规点目对弈）"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI全盘对弈</span>
          </button>

          <button
            onClick={() => onSelectMode('sandbox')}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
              currentMode === 'sandbox'
                ? 'bg-yellow-400 text-amber-950 shadow-md scale-105'
                : 'hover:bg-amber-500/50 text-amber-100'
            }`}
            title="自由摆盘复盘沙盒"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>自由沙盒</span>
          </button>
        </nav>

        {/* Utility controls */}
        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
          <button
            onClick={onToggleCoordinates}
            title="切换棋盘坐标"
            className={`px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl font-bold text-xs border transition whitespace-nowrap shrink-0 ${
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
            className="flex items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl bg-amber-600 hover:bg-amber-700 border border-amber-300 text-white font-bold text-xs shadow-sm transition whitespace-nowrap shrink-0"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline whitespace-nowrap">{isFullscreen ? '退出全屏' : '全屏'}</span>
          </button>

          <button
            onClick={onToggleSound}
            title={soundMuted ? '开启音效' : '静音'}
            className="p-1 rounded-lg sm:rounded-xl bg-amber-600 hover:bg-amber-700 border border-amber-400 transition shrink-0"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-200" /> : <Volume2 className="w-4 h-4 text-white" />}
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
              版本与离线缓存更新
            </h3>
            <p className="text-xs font-bold text-amber-800/90 mt-1">
              当前版本：<span className="font-mono text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">{APP_VERSION}</span>
            </p>
            <p className="text-xs font-bold text-amber-900 mt-2 px-3 py-2 bg-yellow-200/60 rounded-xl leading-relaxed">
              {APP_VERSION_TITLE}
            </p>
            <p className="text-[11px] text-amber-700 mt-2 leading-relaxed text-left">
              💡 提示：如果平板上界面没有立即更新，点击下方黄色按钮可强制注销旧缓存并加载最新代码。
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setVersionModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs transition active:scale-95"
              >
                我知道啦
              </button>
              <button
                onClick={handleForceRefresh}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>立即刷新升级</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
