import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BoardState, Point, PuzzleData, StageInfo } from '../types/go';
import { GoCore } from '../engine/go-core';
import { SoundEngine } from '../engine/sound-engine';
import { ProgressStore } from '../store/storage';
import { GoBoard } from './GoBoard';
import { WinModal } from './WinModal';
import { WeeklyReportCardModal } from './WeeklyReportCardModal';
import {
  Lightbulb,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Eye,
  GraduationCap,
  Sparkles,
  Award,
  Layers,
  Volume2,
} from 'lucide-react';

interface PuzzleViewProps {
  puzzle: PuzzleData;
  stage: StageInfo;
  onPuzzleComplete: (puzzleId: string, stageId: number, stars: number) => void;
  onPuzzleMistake?: () => void;
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
  onPuzzleMistake,
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
  // Level 1: Hint
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [usedHint, setUsedHint] = useState<boolean>(false);
  // Level 2: Visual Weakness Insight
  const [showInsight, setShowInsight] = useState<boolean>(false);
  // Level 3: Teacher Demo
  const [isDemoing, setIsDemoing] = useState<boolean>(false);
  // Proposal 4: Board Mirroring Toggle
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  // Proposal 3: Weekly Check-in Report Card Modal
  const [isReportCardOpen, setIsReportCardOpen] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<string>('');
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);

  // Coordinate mapper for mirroring
  const mapPoint = useCallback(
    (p: Point): Point => {
      if (!isMirrored) return p;
      return { x: puzzle.boardSize - 1 - p.x, y: p.y };
    },
    [isMirrored, puzzle.boardSize]
  );

  // Active solution move (mirrored if active)
  const activeSolutionMove = useMemo<Point | undefined>(() => {
    if (!puzzle.solutionTree.move) return undefined;
    return mapPoint(puzzle.solutionTree.move);
  }, [puzzle.solutionTree.move, mapPoint]);

  // Compute vulnerable White stones in atari (for Level 2 Insight)
  const atariWhitePoints = useMemo<Point[]>(() => {
    if (!showInsight) return [];
    const points: Point[] = [];
    const size = boardState.size;
    const visited = new Set<string>();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (boardState.grid[y][x] === 'white') {
          const key = `${x},${y}`;
          if (!visited.has(key)) {
            const group = GoCore.findGroup(boardState.grid, { x, y });
            if (group) {
              for (const p of group.points) {
                visited.add(`${p.x},${p.y}`);
              }
              if (group.liberties.length === 1) {
                points.push(...group.points);
              }
            }
          }
        }
      }
    }
    return points;
  }, [showInsight, boardState]);

  // Initialize Puzzle Board from initialBoard points (applying mirror)
  const resetPuzzle = useCallback(() => {
    let board = GoCore.createEmptyBoard(puzzle.boardSize);
    for (const b of puzzle.initialBoard.black) {
      const mb = mapPoint(b);
      board.grid[mb.y][mb.x] = 'black';
    }
    for (const w of puzzle.initialBoard.white) {
      const mw = mapPoint(w);
      board.grid[mw.y][mw.x] = 'white';
    }
    board.turn = puzzle.initialTurn;
    setBoardState(board);
    setFeedback('');
    setIsWinModalOpen(false);
    setIsDemoing(false);
  }, [puzzle, mapPoint]);

  useEffect(() => {
    resetPuzzle();
    setHintVisible(false);
    setUsedHint(false);
    setShowInsight(false);
    setIsDemoing(false);

    // Auto-read puzzle question in cheerful kid tone when entering new puzzle
    const timer = setTimeout(() => {
      const speech = puzzle.voicePrompt || puzzle.description;
      SoundEngine.speakText(speech);
    }, 380);

    return () => clearTimeout(timer);
  }, [puzzle, resetPuzzle]);

  // Level 1: Toggle Hint with speech
  const handleToggleHint = () => {
    const next = !hintVisible;
    setHintVisible(next);
    setUsedHint(true);
    if (next) {
      SoundEngine.speakText(`提示：${puzzle.hint}`);
    }
  };

  // Level 2: Toggle Weakness Insight
  const handleToggleInsight = () => {
    const next = !showInsight;
    setShowInsight(next);
    setUsedHint(true);
    if (next) {
      SoundEngine.playVictoryFanfare();
      SoundEngine.speakText('透视开启！注意黄色闪光点与红色气数不足的白棋！');
      setFeedback('👁️ 弱点透视已开启：黄色为推荐落子，红色为气数垂危的白棋！');
    } else {
      setFeedback('');
    }
  };

  // Level 3: Teacher Demo & Imitation Scaffolding
  const handleTeacherDemo = () => {
    if (isDemoing || !activeSolutionMove) return;
    setIsDemoing(true);
    setUsedHint(true);

    // 1. Play the move as teacher
    const playRes = GoCore.playMove(boardState, activeSolutionMove, puzzle.initialTurn);
    setBoardState(playRes.nextState);
    if (playRes.captured.length > 0) {
      SoundEngine.playCaptureSound();
    } else {
      SoundEngine.playStoneSound();
    }

    const demoMsg = '看老师走这一步！把白棋的气全部堵死并提吃！2.5秒后复原，换你来挑战！';
    setFeedback(`👨‍🏫 老师示范中：落子于 (${activeSolutionMove.x + 1}, ${activeSolutionMove.y + 1}) 提吃白棋！`);
    SoundEngine.speakText(demoMsg);

    // 2. Hold for 2.5s, then reset board and invite child to play
    setTimeout(() => {
      resetPuzzle();
      setIsDemoing(false);
      setFeedback('👉 现在换你来走一次！记住刚才老师下的位置哦！');
      SoundEngine.speakText('现在换你来走一次！快快下子吧！');
    }, 2600);
  };

  // Proposal 4: Toggle Mirror
  const handleToggleMirror = () => {
    setIsMirrored((prev) => !prev);
    SoundEngine.playStoneSound();
    SoundEngine.speakText(isMirrored ? '已恢复标准方向' : '棋形镜像翻转，考验你的真本领！');
  };

  // Handle Child's Move on Puzzle Board
  const handlePlayMove = (point: Point) => {
    if (boardState.isGameOver || isDemoing) return;

    // Check legality first
    const check = GoCore.isLegalMove(boardState, point, puzzle.initialTurn);
    if (!check.legal) {
      SoundEngine.playErrorSound();
      setFeedback(`❌ ${check.reason || '不能下在这里哦'}`);
      SoundEngine.speakText('不能下在这里哦');
      return;
    }

    // Check against expected solution
    const isCorrectMove = activeSolutionMove && GoCore.pointsEqual(activeSolutionMove, point);

    // Play the move on board
    const playRes = GoCore.playMove(boardState, point, puzzle.initialTurn);
    setBoardState(playRes.nextState);

    if (isCorrectMove) {
      ProgressStore.resolveMistake(puzzle.id);
      if (playRes.captured.length > 0) {
        SoundEngine.playCaptureSound();
      } else {
        SoundEngine.playStoneSound();
      }
      const praise = puzzle.solutionTree.comment || '太棒了！完全正确！';
      setFeedback(`🎉 ${praise}`);
      SoundEngine.speakText(praise);
      const starsEarned = usedHint ? 2 : 3;
      onPuzzleComplete(puzzle.id, stage.id, starsEarned);
      setTimeout(() => {
        SoundEngine.playVictoryFanfare();
        setIsWinModalOpen(true);
      }, 400);
    } else {
      ProgressStore.recordMistake(puzzle.id);
      onPuzzleMistake?.();
      SoundEngine.playErrorSound();
      const retryMsg = '🤔 咦，这步棋不是最佳解法哦，再想想看！';
      setFeedback(retryMsg);
      SoundEngine.speakText('这步棋不是最佳解法哦，再想想看！');
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-stretch justify-between gap-2 p-1 sm:p-2 select-none overflow-hidden">
      {/* 1. LEFT/CENTER: FULL-HEIGHT GO BOARD */}
      <div className="flex-1 h-full min-h-0 min-w-0 flex items-center justify-center overflow-hidden relative">
        <GoBoard
          state={boardState}
          onPlayMove={handlePlayMove}
          disabled={boardState.isGameOver || isDemoing}
          showCoordinates={showCoordinates}
          showLibertiesHelper={false}
          highlightPoints={showInsight && activeSolutionMove ? [activeSolutionMove] : []}
          dangerPoints={showInsight ? atariWhitePoints : []}
          singleTapToPlay={true}
        />

        {/* Demoing Banner Overlay */}
        {isDemoing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black px-4 py-1.5 rounded-full shadow-lg border-2 border-yellow-200 text-xs sm:text-sm animate-pulse flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-white" />
            <span>👨‍🏫 老师正在示范... 稍后换你模仿跟练！</span>
          </div>
        )}
      </div>

      {/* 2. RIGHT SIDEBAR: BREADCRUMB, QUESTION & 3-TIER SCAFFOLDING */}
      <div className="w-full md:w-80 lg:w-84 xl:w-88 h-full flex flex-col justify-start gap-2 overflow-y-auto pr-1 shrink-0">
        {/* Top: Navigation & Chapter Header */}
        <div className="bg-white/95 rounded-2xl p-2.5 border-2 border-amber-300 shadow-xs flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToMap}
              className="flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300 active:scale-95 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回地图</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={onPrevPuzzle}
                disabled={!hasPrev}
                className="py-1 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-0.5 active:scale-95 transition"
                title="上一题"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>上题</span>
              </button>
              <button
                onClick={onNextPuzzle}
                disabled={!hasNext}
                className="py-1 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-0.5 active:scale-95 transition"
                title="下一题"
              >
                <span>下题</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 mt-0.5">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200 truncate">
              {stage.title}
            </span>

            {/* Proposal 4: Mirror Toggle Button */}
            <button
              onClick={handleToggleMirror}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-0.5 ${
                isMirrored
                  ? 'bg-purple-100 text-purple-900 border-purple-400 font-black'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
              title="翻转棋形，防止死记硬背"
            >
              <Layers className="w-3 h-3" />
              <span>{isMirrored ? '🪞 镜像中' : '镜像翻转'}</span>
            </button>
          </div>

          <h2 className="text-xs sm:text-sm font-black text-amber-950 font-cartoon text-center leading-snug">
            {puzzle.title}
          </h2>
        </div>

        {/* Question & Real-time Feedback Card */}
        <div className="bg-white/95 rounded-2xl p-2.5 shadow-xs border-2 border-amber-300 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-amber-950 text-xs sm:text-sm flex items-center gap-1.5 font-cartoon">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>闯关任务</span>
            </h3>

            <div className="flex items-center gap-1.5">
              {/* 🔊 语音读题 / 重听按钮（儿童无障碍） */}
              <button
                onClick={() => {
                  const speech = puzzle.voicePrompt || puzzle.description;
                  SoundEngine.speakText(speech);
                }}
                className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 border border-amber-500 shadow-xs flex items-center gap-1 active:scale-95 transition"
                title="用语音把题目读给我听"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-950" />
                <span>听题目</span>
              </button>

              {/* Proposal 3: Open Report Card Button */}
              <button
                onClick={() => setIsReportCardOpen(true)}
                className="text-[10px] font-bold px-2 py-1 rounded-xl bg-orange-100 text-orange-900 border border-orange-300 hover:bg-orange-200 flex items-center gap-0.5 active:scale-95 transition"
              >
                <Award className="w-3 h-3 text-orange-600" />
                <span>成绩单</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-amber-900 leading-relaxed bg-amber-50 p-2 rounded-xl border border-amber-200">
            {puzzle.description}
          </p>

          {feedback && (
            <div
              className={`p-2 rounded-xl text-xs font-bold animate-pop-in ${
                feedback.includes('🎉')
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : feedback.includes('👨‍🏫')
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-orange-100 text-orange-950 border border-orange-300'
              }`}
            >
              {feedback}
            </div>
          )}
        </div>

        {/* Level 1: Hint Card */}
        {hintVisible && (
          <div className="bg-yellow-100/95 rounded-2xl p-2.5 shadow-xs border-2 border-yellow-400 animate-pop-in shrink-0">
            <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs mb-0.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
              <span>💡 灵感锦囊：</span>
            </div>
            <p className="text-xs font-bold text-amber-900 leading-relaxed">{puzzle.hint}</p>
          </div>
        )}

        {/* 3-Tier Scaffolding Contingency Toolbox */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-2.5 border-2 border-amber-300 flex flex-col gap-1.5 shrink-0 shadow-xs">
          <div className="text-[11px] font-black text-amber-900 flex items-center gap-1 font-cartoon">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>三级启发式教学辅导（做不出点这里）：</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* Level 1: Hint */}
            <button
              onClick={handleToggleHint}
              className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 border transition active:scale-95 ${
                hintVisible
                  ? 'bg-yellow-400 text-amber-950 border-yellow-500'
                  : 'bg-white hover:bg-yellow-50 text-amber-900 border-amber-300'
              }`}
              title="第一级：文字与语音锦囊提示"
            >
              <Lightbulb className="w-4 h-4 text-amber-700" />
              <span className="text-[11px]">{hintVisible ? '收起提示' : '💡 锦囊'}</span>
            </button>

            {/* Level 2: Weakness Insight */}
            <button
              onClick={handleToggleInsight}
              className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 border transition active:scale-95 ${
                showInsight
                  ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-300'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
              }`}
              title="第二级：弱点透视高亮光圈"
            >
              <Eye className="w-4 h-4 text-amber-700" />
              <span className="text-[11px]">{showInsight ? '隐藏透视' : '👁️ 透视'}</span>
            </button>

            {/* Level 3: Teacher Demo */}
            <button
              onClick={handleTeacherDemo}
              disabled={isDemoing}
              className="py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-amber-950 border border-orange-400 shadow-xs transition active:scale-95 disabled:opacity-50"
              title="第三级：围棋老师示范走法与模仿跟练"
            >
              <GraduationCap className="w-4 h-4 text-amber-950" />
              <span className="text-[11px]">👨‍🏫 示范</span>
            </button>
          </div>
        </div>

        {/* Bottom: Reset Action Button */}
        <div className="pt-0.5 shrink-0">
          <button
            onClick={resetPuzzle}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs sm:text-sm shadow-xs transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>重新摆题</span>
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

      {/* Weekly Report Card Modal */}
      <WeeklyReportCardModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        studentName="森森"
        grade="大三班"
        weekNumber={7}
        totalPuzzles={stage.puzzles.length}
        completedPuzzles={stage.puzzles.length}
        starsCount={stage.puzzles.length * 3}
        maxStars={stage.puzzles.length * 3}
      />
    </div>
  );
};
