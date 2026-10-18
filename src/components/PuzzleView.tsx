import React, { useState, useEffect, useCallback } from 'react';
import { BoardState, Point, PuzzleData, StageInfo } from '../types/go';
import { GoCore } from '../engine/go-core';
import { GoBoard } from './GoBoard';
import { WinModal } from './WinModal';
import { Lightbulb, RotateCcw, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';

interface PuzzleViewProps {
  puzzle: PuzzleData;
  stage: StageInfo;
  onPuzzleComplete: (puzzleId: string, stageId: number, stars: number) => void;
  onNextPuzzle?: () => void;
  onPrevPuzzle?: () => void;
  onBackToMap: () => void;
  showCoordinates: boolean;
  hasNext: boolean;
  hasPrev: boolean;
}

export const PuzzleView: React.FC<PuzzleViewProps> = ({
  puzzle,
  stage,
  onPuzzleComplete,
  onNextPuzzle,
  onPrevPuzzle,
  onBackToMap,
  showCoordinates,
  hasNext,
  hasPrev,
}) => {
  const [boardState, setBoardState] = useState<BoardState>(() =>
    GoCore.createEmptyBoard(puzzle.boardSize)
  );
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [usedHint, setUsedHint] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);

  // Initialize Puzzle Board from initialBoard points
  const resetPuzzle = useCallback(() => {
    let board = GoCore.createEmptyBoard(puzzle.boardSize);
    for (const b of puzzle.initialBoard.black) {
      board.grid[b.y][b.x] = 'black';
    }
    for (const w of puzzle.initialBoard.white) {
      board.grid[w.y][w.x] = 'white';
    }
    board.turn = puzzle.initialTurn;
    setBoardState(board);
    setFeedback('');
    setIsWinModalOpen(false);
  }, [puzzle]);

  useEffect(() => {
    resetPuzzle();
    setHintVisible(false);
    setUsedHint(false);
  }, [puzzle, resetPuzzle]);

  // Handle Child's Move on Puzzle Board
  const handlePlayMove = (point: Point) => {
    if (boardState.isGameOver) return;

    // Check legality first
    const check = GoCore.isLegalMove(boardState, point, puzzle.initialTurn);
    if (!check.legal) {
      setFeedback(`❌ ${check.reason || '不能下在这里哦'}`);
      return;
    }

    // Check against expected solution
    const expected = puzzle.solutionTree.move;
    const isCorrectMove = expected && GoCore.pointsEqual(expected, point);

    // Play the move on board
    const playRes = GoCore.playMove(boardState, point, puzzle.initialTurn);
    setBoardState(playRes.nextState);

    if (isCorrectMove) {
      const praise = puzzle.solutionTree.comment || '太棒了！完全正确！';
      setFeedback(`🎉 ${praise}`);
      const starsEarned = usedHint ? 2 : 3;
      onPuzzleComplete(puzzle.id, stage.id, starsEarned);
      setTimeout(() => {
        setIsWinModalOpen(true);
      }, 400);
    } else {
      setFeedback('🤔 咦，这步棋不是最佳解法哦，再想想看！');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 flex flex-col gap-4">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between bg-white/80 p-3 rounded-2xl border border-amber-300 shadow-sm">
        <button
          onClick={onBackToMap}
          className="flex items-center gap-1 text-sm font-bold text-amber-900 hover:text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回地图</span>
        </button>

        <div className="text-center">
          <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
            {stage.title}
          </span>
          <h2 className="text-base sm:text-lg font-black text-amber-950 font-cartoon">
            {puzzle.title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevPuzzle}
            disabled={!hasPrev}
            className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 border border-amber-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextPuzzle}
            disabled={!hasNext}
            className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 border border-amber-300"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Puzzle Grid */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        {/* Go Board */}
        <div className="flex flex-col items-center">
          <GoBoard
            state={boardState}
            onPlayMove={handlePlayMove}
            disabled={boardState.isGameOver}
            showCoordinates={showCoordinates}
            showLibertiesHelper={false}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={resetPuzzle}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-300 text-sm shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新摆题</span>
            </button>

            <button
              onClick={() => {
                setHintVisible(!hintVisible);
                setUsedHint(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-black rounded-xl border border-yellow-500 text-sm shadow-sm"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{hintVisible ? '隐藏提示' : '灵感锦囊'}</span>
            </button>
          </div>
        </div>

        {/* Puzzle Description & Hint Card */}
        <div className="w-full lg:w-80 flex flex-col gap-3">
          {/* Question Goal */}
          <div className="bg-white rounded-3xl p-5 shadow-md border-3 border-amber-300">
            <h3 className="font-black text-amber-950 text-base flex items-center gap-2 font-cartoon">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>闯关任务</span>
            </h3>
            <p className="text-sm font-bold text-amber-900 mt-2 leading-relaxed bg-amber-50 p-3 rounded-2xl border border-amber-200">
              {puzzle.description}
            </p>

            {/* Real-time Feedback alert */}
            {feedback && (
              <div
                className={`mt-3 p-3 rounded-2xl text-sm font-bold animate-pop-in ${
                  feedback.includes('🎉')
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-orange-100 text-orange-950 border border-orange-300'
                }`}
              >
                {feedback}
              </div>
            )}
          </div>

          {/* Hint Card */}
          {hintVisible && (
            <div className="bg-yellow-100/90 rounded-3xl p-4 shadow-sm border-2 border-yellow-400 animate-pop-in">
              <div className="flex items-center gap-1.5 text-amber-900 font-black text-sm mb-1">
                <Lightbulb className="w-4 h-4 text-amber-700" />
                <span>老师的小锦囊：</span>
              </div>
              <p className="text-xs font-bold text-amber-800 leading-normal">{puzzle.hint}</p>
            </div>
          )}
        </div>
      </div>

      {/* Win Celebration Modal */}
      <WinModal
        isOpen={isWinModalOpen}
        title="🌟 恭喜闯关成功！"
        subtitle={puzzle.solutionTree.comment || '你走出了完美的正解！'}
        stars={usedHint ? 2 : 3}
        onNext={onNextPuzzle}
        onRetry={resetPuzzle}
        onBackToMap={onBackToMap}
        hasNext={hasNext}
      />
    </div>
  );
};
