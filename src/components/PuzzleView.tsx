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
    <div className="w-full h-full flex flex-col md:flex-row items-stretch justify-between gap-2 p-1 sm:p-2 select-none overflow-hidden">
      {/* 1. LEFT/CENTER: FULL-HEIGHT GO BOARD (ZERO top/bottom distractions, maximum scaling) */}
      <div className="flex-1 h-full min-h-0 min-w-0 flex items-center justify-center overflow-hidden">
        <GoBoard
          state={boardState}
          onPlayMove={handlePlayMove}
          disabled={boardState.isGameOver}
          showCoordinates={showCoordinates}
          showLibertiesHelper={false}
        />
      </div>

      {/* 2. RIGHT SIDEBAR: BREADCRUMB, QUESTION & ACTIONS */}
      <div className="w-full md:w-80 lg:w-84 xl:w-88 h-full flex flex-col justify-between gap-2 overflow-y-auto pr-1 shrink-0">
        {/* Top: Stage info & Prev/Next Navigation */}
        <div className="bg-white/95 rounded-2xl p-2.5 border-2 border-amber-300 shadow-sm flex flex-col gap-1.5 shrink-0">
          {/* Top navigation row */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToMap}
              className="flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回地图</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={onPrevPuzzle}
                disabled={!hasPrev}
                className="py-1 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-0.5 active:scale-95"
                title="上一题"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>上题</span>
              </button>
              <button
                onClick={onNextPuzzle}
                disabled={!hasNext}
                className="py-1 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-0.5 active:scale-95"
                title="下一题"
              >
                <span>下题</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Chapter title (full width, natural wrap, no truncate!) */}
          <div className="text-center mt-0.5">
            <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-100/90 px-3 py-0.5 rounded-full border border-amber-200">
              {stage.title}
            </span>
          </div>

          {/* Puzzle Title */}
          <h2 className="text-xs sm:text-sm font-black text-amber-950 font-cartoon text-center mt-0.5 leading-snug">
            {puzzle.title}
          </h2>
        </div>

        {/* Middle: Question Description & Feedback */}
        <div className="bg-white/95 rounded-2xl p-2.5 sm:p-3 shadow-sm border-2 border-amber-300 flex flex-col gap-1.5 shrink-0">
          <h3 className="font-black text-amber-950 text-xs flex items-center gap-1.5 font-cartoon">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>闯关任务</span>
          </h3>
          <p className="text-xs font-bold text-amber-900 leading-relaxed bg-amber-50 p-2 rounded-xl border border-amber-200">
            {puzzle.description}
          </p>

          {/* Real-time Feedback alert */}
          {feedback && (
            <div
              className={`p-2 rounded-xl text-xs font-bold animate-pop-in ${
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
          <div className="bg-yellow-100/95 rounded-2xl p-2.5 shadow-sm border-2 border-yellow-400 animate-pop-in shrink-0">
            <div className="flex items-center gap-1 text-amber-900 font-black text-xs mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
              <span>锦囊提示：</span>
            </div>
            <p className="text-[11px] font-bold text-amber-800 leading-normal">{puzzle.hint}</p>
          </div>
        )}

        {/* Bottom: Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 shrink-0 pt-0.5">
          <button
            onClick={resetPuzzle}
            className="flex items-center justify-center gap-1 py-2 px-2 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs shadow-sm transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重新摆题</span>
          </button>

          <button
            onClick={() => {
              setHintVisible(!hintVisible);
              setUsedHint(true);
            }}
            className="flex items-center justify-center gap-1 py-2 px-2 bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-black rounded-xl border border-yellow-500 text-xs shadow-sm transition active:scale-95"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{hintVisible ? '隐藏提示' : '灵感锦囊'}</span>
          </button>
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
