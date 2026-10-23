import React, { useState, useEffect, useMemo } from 'react';
import { GameMode, PuzzleData, StageInfo } from './types/go';
import { ADVENTURE_STAGES } from './data/stages';
import { ProgressStore, UserProgress } from './store/storage';
import { SoundEngine } from './engine/sound-engine';
import { KidNavbar } from './components/KidNavbar';
import { AdventureMap } from './components/AdventureMap';
import { CaptureBattleView } from './components/CaptureBattleView';
import { FullGameSparringView } from './components/FullGameSparringView';
import { PuzzleView } from './components/PuzzleView';
import { FreePlayView } from './components/FreePlayView';

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>('adventure');
  const [progress, setProgress] = useState<UserProgress>(() => ProgressStore.load());
  const [activeStage, setActiveStage] = useState<StageInfo>(ADVENTURE_STAGES[0]);
  const [activePuzzle, setActivePuzzle] = useState<PuzzleData>(ADVENTURE_STAGES[0].puzzles[0]);

  // Sync initial sound state
  useEffect(() => {
    SoundEngine.setMuted(progress.soundMuted);
  }, [progress.soundMuted]);

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

  // Handle selecting a puzzle from adventure map
  const handleSelectPuzzle = (puzzle: PuzzleData, stage: StageInfo) => {
    setActivePuzzle(puzzle);
    setActiveStage(stage);
    setCurrentMode('puzzle');
  };

  // Handle puzzle completion
  const handlePuzzleComplete = (puzzleId: string, stageId: number, starsEarned: number) => {
    const updated = ProgressStore.recordPuzzleSuccess(puzzleId, stageId, starsEarned);
    setProgress(updated);
  };

  // Handle battle victory
  const handleBattleWin = (animalId: string) => {
    const updated = ProgressStore.recordBattleWin(animalId);
    setProgress(updated);
  };

  // Puzzle navigation helpers
  const currentPuzzleIndex = activeStage.puzzles.findIndex((p) => p.id === activePuzzle.id);
  const hasNextPuzzle = currentPuzzleIndex < activeStage.puzzles.length - 1;
  const hasPrevPuzzle = currentPuzzleIndex > 0;

  const handleNextPuzzle = () => {
    if (hasNextPuzzle) {
      setActivePuzzle(activeStage.puzzles[currentPuzzleIndex + 1]);
    }
  };

  const handlePrevPuzzle = () => {
    if (hasPrevPuzzle) {
      setActivePuzzle(activeStage.puzzles[currentPuzzleIndex - 1]);
    }
  };

  return (
    <div className="h-screen max-h-screen bg-[#fdfaf5] flex flex-col select-none overflow-hidden">
      {/* Top Navbar */}
      <KidNavbar
        currentMode={currentMode}
        onSelectMode={(mode) => {
          if (mode === 'adventure' && currentMode === 'puzzle') {
            setCurrentMode('adventure');
          } else {
            setCurrentMode(mode);
          }
        }}
        totalStars={totalStars}
        soundMuted={progress.soundMuted}
        onToggleSound={handleToggleSound}
        showCoordinates={progress.showCoordinates}
        onToggleCoordinates={handleToggleCoordinates}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full min-h-0 ${currentMode === 'adventure' ? 'overflow-y-auto py-2 px-2 sm:px-4' : 'p-1 overflow-hidden flex flex-col items-center justify-center'}`}>
        {currentMode === 'adventure' && (
          <div className="flex flex-col items-center w-full">
            <AdventureMap
              unlockedStageId={progress.unlockedStageId}
              completedPuzzles={progress.completedPuzzles}
              starsMap={progress.stars}
              mistakePuzzles={progress.mistakePuzzles}
              onSelectPuzzle={handleSelectPuzzle}
            />
            {/* Footer Encouragement Note */}
            <footer className="text-center py-4 text-xs font-bold text-amber-800/60 border-t border-amber-200 bg-amber-50/50 w-full mt-4">
              棋虽小道，品德最尊 · 森森围棋基地
            </footer>
          </div>
        )}

        {currentMode === 'battle' && (
          <CaptureBattleView
            onWinRecord={handleBattleWin}
            showCoordinates={progress.showCoordinates}
          />
        )}

        {currentMode === 'sparring' && (
          <FullGameSparringView showCoordinates={progress.showCoordinates} />
        )}

        {currentMode === 'puzzle' && (
          <PuzzleView
            puzzle={activePuzzle}
            stage={activeStage}
            onPuzzleComplete={handlePuzzleComplete}
            onPuzzleMistake={() => setProgress(ProgressStore.load())}
            onNextPuzzle={handleNextPuzzle}
            onPrevPuzzle={handlePrevPuzzle}
            onBackToMap={() => setCurrentMode('adventure')}
            showCoordinates={progress.showCoordinates}
            hasNext={hasNextPuzzle}
            hasPrev={hasPrevPuzzle}
          />
        )}

        {currentMode === 'sandbox' && (
          <FreePlayView showCoordinates={progress.showCoordinates} />
        )}
      </main>
    </div>
  );
};

export default App;
