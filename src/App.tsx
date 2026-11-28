import React, { useState, useEffect, useMemo } from 'react';
import { GameMode } from './types/go';
import { ProgressStore, UserProgress } from './store/storage';
import { SoundEngine } from './engine/sound-engine';
import { syncPendingLocalRecords } from './engine/cloud-recorder';
import {
  DailyPipelineState,
  loadDailyPipeline,
  recordPipelineStep2GameComplete,
} from './data/daily-challenges';
import { KidNavbar } from './components/KidNavbar';
import { FullGameSparringView } from './components/FullGameSparringView';
import { DailyChallengeView } from './components/DailyChallengeView';

export const App: React.FC = () => {
  // 默认打开平板直达「每日打卡」训练流程：第 1 步刷题打卡 → 第 2 步全盘实战
  const [currentMode, setCurrentMode] = useState<GameMode>('daily');
  const [progress, setProgress] = useState<UserProgress>(() => ProgressStore.load());
  const [pipelineState, setPipelineState] = useState<DailyPipelineState>(() => loadDailyPipeline());

  // Sync initial sound state
  useEffect(() => {
    SoundEngine.setMuted(progress.soundMuted);
  }, [progress.soundMuted]);

  // 启动时自动同步并挽救本地未上传的历史棋谱
  useEffect(() => {
    syncPendingLocalRecords().catch(() => {});
  }, []);

  // Compute total stars
  const totalStars = useMemo(() => {
    return Object.values(progress.stars).reduce((sum, s) => sum + s, 0);
  }, [progress.stars]);

  // Toggle sound
  const handleToggleSound = () => {
    const nextMuted = !progress.soundMuted;
    SoundEngine.setMuted(nextMuted);
    const updated = { ...progress, soundMuted: nextMuted };
    setProgress(updated);
    ProgressStore.save(updated);
  };

  // Toggle coordinates
  const handleToggleCoordinates = () => {
    const nextCoord = !progress.showCoordinates;
    const updated = { ...progress, showCoordinates: nextCoord };
    setProgress(updated);
    ProgressStore.save(updated);
  };

  const handleStep2GameComplete = () => {
    const { state } = recordPipelineStep2GameComplete();
    setPipelineState({ ...state });
  };

  const todayAllDone = pipelineState.step1Completed && pipelineState.step2Completed;

  return (
    <div className="h-screen max-h-screen bg-[#fdfaf5] flex flex-col select-none overflow-hidden">
      {/* Top Navbar (2 Streamlined Tabs: 每日打卡 + 全盘陪练) */}
      <KidNavbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        totalStars={totalStars}
        soundMuted={progress.soundMuted}
        onToggleSound={handleToggleSound}
        showCoordinates={progress.showCoordinates}
        onToggleCoordinates={handleToggleCoordinates}
        todayAllDone={todayAllDone}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full min-h-0 p-1 overflow-hidden flex flex-col items-center justify-center">
        {currentMode === 'daily' && (
          <DailyChallengeView
            showCoordinates={progress.showCoordinates}
            pipelineState={pipelineState}
            onPipelineChange={setPipelineState}
            onGoToSparring={() => setCurrentMode('sparring')}
          />
        )}

        {currentMode === 'sparring' && (
          <FullGameSparringView
            showCoordinates={progress.showCoordinates}
            pipelineState={pipelineState}
            onStep2GameComplete={handleStep2GameComplete}
            onGoToDaily={() => setCurrentMode('daily')}
          />
        )}
      </main>
    </div>
  );
};

export default App;
