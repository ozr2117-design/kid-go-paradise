import React from 'react';
import { ADVENTURE_STAGES } from '../data/stages';
import { PuzzleData, StageInfo } from '../types/go';
import { Star, Lock, Play, Award } from 'lucide-react';

interface AdventureMapProps {
  unlockedStageId: number;
  completedPuzzles: string[];
  starsMap: Record<string, number>;
  onSelectPuzzle: (puzzle: PuzzleData, stage: StageInfo) => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  unlockedStageId,
  completedPuzzles,
  starsMap,
  onSelectPuzzle,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6">
      {/* Adventure Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 rounded-3xl p-5 shadow-lg border-4 border-yellow-500 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-950 font-cartoon flex items-center gap-2">
            <span>🏝️</span>
            <span>森森少儿围棋启蒙岛</span>
          </h1>
          <p className="text-sm sm:text-base font-bold text-amber-900 mt-1">
            一步一步闯关摘星星，掌握从吃子到做眼的围棋绝招！
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-center bg-white/70 px-4 py-2 rounded-2xl border border-amber-300">
          <Award className="w-8 h-8 text-amber-600" />
          <span className="text-xs font-bold text-amber-900 mt-1">启蒙成就</span>
        </div>
      </div>

      {/* Stages List */}
      <div className="flex flex-col gap-5">
        {ADVENTURE_STAGES.map((stage, sIdx) => {
          const isUnlocked = stage.id <= unlockedStageId;

          return (
            <div
              key={stage.id}
              className={`rounded-3xl border-4 transition-all duration-300 overflow-hidden shadow-md ${
                isUnlocked
                  ? 'bg-white border-amber-300 hover:border-amber-400'
                  : 'bg-gray-100/90 border-gray-300 opacity-75'
              }`}
            >
              {/* Stage Title Bar */}
              <div
                className={`p-4 flex items-center justify-between bg-gradient-to-r ${stage.themeColor} text-white`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow">{stage.icon}</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-wide font-cartoon">
                      {stage.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-medium opacity-90">{stage.subtitle}</p>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full text-xs font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>未解锁</span>
                  </div>
                )}
              </div>

              {/* Puzzle Level Cards Grid */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stage.puzzles.map((puzzle, pIdx) => {
                  const isDone = completedPuzzles.includes(puzzle.id);
                  const stars = starsMap[puzzle.id] || 0;
                  // First puzzle in unlocked stage or if previous puzzle completed
                  const puzzleUnlocked =
                    isUnlocked && (pIdx === 0 || completedPuzzles.includes(stage.puzzles[pIdx - 1].id));

                  return (
                    <button
                      key={puzzle.id}
                      disabled={!puzzleUnlocked}
                      onClick={() => onSelectPuzzle(puzzle, stage)}
                      className={`text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between h-28 relative ${
                        puzzleUnlocked
                          ? 'bg-amber-50/70 hover:bg-amber-100/90 border-amber-300 hover:scale-[1.02] shadow-sm active:scale-95 cursor-pointer'
                          : 'bg-gray-200/50 border-gray-300 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          第 {pIdx + 1} 关
                        </span>
                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= stars
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-amber-950 text-sm line-clamp-1 mt-1">
                          {puzzle.title}
                        </h3>
                        <p className="text-xs text-amber-800/80 line-clamp-1">{puzzle.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-amber-700">
                        <span>{puzzle.boardSize}×{puzzle.boardSize} 盘</span>
                        {puzzleUnlocked && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <span>开始</span>
                            <Play className="w-3 h-3 fill-current" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
