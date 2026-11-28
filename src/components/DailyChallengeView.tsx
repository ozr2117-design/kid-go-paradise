import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BoardState, Point, PuzzleData } from '../types/go';
import { GoCore } from '../engine/go-core';
import { SoundEngine } from '../engine/sound-engine';
import { ProgressStore, DailyChallengeRecord } from '../store/storage';
import {
  DAILY_TARGET_COUNT,
  DailyPipelineState,
  getDailyTrainingPuzzles,
  getPuzzleCategoryLabel,
  recordPipelinePuzzleMistake,
  recordPipelinePuzzleSolve,
  summarizeDailyPractice,
} from '../data/daily-challenges';
import { GoBoard } from './GoBoard';
import {
  Sparkles,
  Flame,
  Volume2,
  Lightbulb,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bot,
  BookOpen,
  ArrowRight,
  Trophy,
  ClipboardCheck,
} from 'lucide-react';

interface DailyChallengeViewProps {
  showCoordinates: boolean;
  pipelineState: DailyPipelineState;
  onPipelineChange: (next: DailyPipelineState) => void;
  onGoToSparring?: () => void;
  onBackToAdventure?: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  showCoordinates,
  pipelineState,
  onPipelineChange,
  onGoToSparring,
}) => {
  const { theme, puzzles } = useMemo(() => getDailyTrainingPuzzles(), []);
  const [dailyRecord, setDailyRecord] = useState<DailyChallengeRecord>(() => ProgressStore.getDailyRecord());
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const firstUnsolved = puzzles.findIndex((p) => !pipelineState.step1SolvedIds.includes(p.id));
    return firstUnsolved !== -1 ? firstUnsolved : 0;
  });
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [solutionVisible, setSolutionVisible] = useState<boolean>(false);
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);

  const currentPuzzle: PuzzleData = puzzles[currentIndex] || puzzles[0];

  const [boardState, setBoardState] = useState<BoardState>(() => {
    const b = GoCore.createEmptyBoard(currentPuzzle.boardSize);
    for (const pt of currentPuzzle.initialBoard.black) {
      b.grid[pt.y][pt.x] = 'black';
    }
    for (const pt of currentPuzzle.initialBoard.white) {
      b.grid[pt.y][pt.x] = 'white';
    }
    b.turn = currentPuzzle.initialTurn;
    return b;
  });

  const resetCurrentBoard = useCallback((puzzle: PuzzleData) => {
    const b = GoCore.createEmptyBoard(puzzle.boardSize);
    for (const pt of puzzle.initialBoard.black) {
      b.grid[pt.y][pt.x] = 'black';
    }
    for (const pt of puzzle.initialBoard.white) {
      b.grid[pt.y][pt.x] = 'white';
    }
    b.turn = puzzle.initialTurn;
    setBoardState(b);
    setHintVisible(false);
    setSolutionVisible(false);
    setDemoActive(false);
    setFeedback('');
  }, []);

  useEffect(() => {
    if (currentPuzzle) {
      resetCurrentBoard(currentPuzzle);
    }
  }, [currentIndex, currentPuzzle, resetCurrentBoard]);

  const handleShowAnswerAndDemo = () => {
    const sol = currentPuzzle.solutionTree.move;
    if (!sol) return;

    if (solutionVisible) {
      setSolutionVisible(false);
      return;
    }

    if (!pipelineState.step1SolvedIds.includes(currentPuzzle.id)) {
      const updated = recordPipelinePuzzleMistake(currentPuzzle.id);
      onPipelineChange(updated);
    }

    if (!demoActive) {
      const res = GoCore.playMove(boardState, sol, currentPuzzle.initialTurn);
      setBoardState(res.nextState);
      if (res.captured.length > 0) {
        SoundEngine.playCaptureSound();
      } else {
        SoundEngine.playStoneSound();
      }
      setDemoActive(true);
    }
    setSolutionVisible(true);
    setFeedback('答案已展示：棋盘上已高亮标出正解落子！');
    const speech =
      currentPuzzle.explanation ||
      currentPuzzle.solutionTree.comment ||
      '这就是正解下法！看懂了吗？点击重新挑战自己试一次吧！';
    SoundEngine.speakText(speech);
  };

  const handleTryMyselfAfterAnswer = () => {
    resetCurrentBoard(currentPuzzle);
    SoundEngine.speakText('现在换你来下这一步！加油！');
  };

  const handleSpeakPrompt = () => {
    const text = currentPuzzle.voicePrompt || currentPuzzle.description;
    SoundEngine.speakText(text);
  };

  const solvedCount = puzzles.filter((p) => pipelineState.step1SolvedIds.includes(p.id)).length;
  const isStep1Done = pipelineState.step1Completed || solvedCount >= DAILY_TARGET_COUNT;
  const isStep2Done = pipelineState.step2Completed;
  const isAllDone = isStep1Done && isStep2Done;

  const summary = useMemo(
    () => summarizeDailyPractice(puzzles, pipelineState.step1MistakeIds),
    [puzzles, pipelineState.step1MistakeIds]
  );

  const handlePlayMove = (pt: Point) => {
    if (boardState.isGameOver) return;

    const sol = currentPuzzle.solutionTree.move;
    if (!sol) return;

    if (pt.x === sol.x && pt.y === sol.y) {
      const res = GoCore.playMove(boardState, pt, currentPuzzle.initialTurn);
      setBoardState(res.nextState);
      SoundEngine.playSuccessSound();
      setFeedback(currentPuzzle.solutionTree.comment || '太棒了！完全正确！');

      const { record } = ProgressStore.recordDailySolve(currentPuzzle.id);
      setDailyRecord({ ...record });

      const { state: nextPipeline, isNewlyCompletedStep1 } = recordPipelinePuzzleSolve(
        currentPuzzle.id,
        DAILY_TARGET_COUNT
      );
      onPipelineChange(nextPipeline);

      if (isNewlyCompletedStep1) {
        SoundEngine.playFanfareSound();
        setTimeout(() => {
          setIsSummaryModalOpen(true);
        }, 600);
      } else {
        setTimeout(() => {
          const nextUnsolved = puzzles.findIndex(
            (p, idx) => idx > currentIndex && !nextPipeline.step1SolvedIds.includes(p.id)
          );
          if (nextUnsolved !== -1) {
            setCurrentIndex(nextUnsolved);
          } else {
            const firstUnsolved = puzzles.findIndex((p) => !nextPipeline.step1SolvedIds.includes(p.id));
            if (firstUnsolved !== -1) {
              setCurrentIndex(firstUnsolved);
            }
          }
        }, 1100);
      }
    } else {
      SoundEngine.playErrorSound();
      setFeedback('哎呀，这一步被白棋防住了！再仔细看看气数和眼形！');
      const updated = recordPipelinePuzzleMistake(currentPuzzle.id);
      onPipelineChange(updated);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-1 sm:p-2 max-w-5xl mx-auto overflow-hidden">
      {/* 1. GUIDED DAILY PIPELINE STEPPER */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl px-3 py-1.5 shadow-md border-2 border-amber-400 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left: Step 1 -> Step 2 -> Done */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border transition ${
              isStep1Done
                ? 'bg-emerald-500 text-white border-emerald-300 shadow-xs'
                : 'bg-yellow-300 text-amber-950 border-yellow-200 shadow-sm'
            }`}
          >
            {isStep1Done ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-amber-950 text-yellow-300 text-[10px] flex items-center justify-center shrink-0">
                1
              </span>
            )}
            <span>第 1 步 · 刷题 ({solvedCount}/{DAILY_TARGET_COUNT})</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-amber-200 shrink-0" />

          <button
            onClick={() => onGoToSparring?.()}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border transition active:scale-95 ${
              isStep2Done
                ? 'bg-emerald-500 text-white border-emerald-300 shadow-xs'
                : isStep1Done
                ? 'bg-yellow-300 hover:bg-yellow-200 text-amber-950 border-yellow-100 shadow-md animate-pulse'
                : 'bg-white/15 hover:bg-white/25 text-amber-100 border-white/25'
            }`}
            title="点击直接进入第 2 步：AI 全盘实战"
          >
            {isStep2Done ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-amber-900/70 text-yellow-200 text-[10px] flex items-center justify-center shrink-0">
                2
              </span>
            )}
            <span>第 2 步 · 全盘实战 ({isStep2Done ? '已完成' : '1 盘'})</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-amber-200 shrink-0 hidden sm:block" />

          <div
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black border ${
              isAllDone
                ? 'bg-yellow-300 text-amber-950 border-white shadow-md'
                : 'bg-amber-700/40 text-amber-200 border-amber-400/30'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span>{isAllDone ? '今日全部达成' : '今日完成'}</span>
          </div>
        </div>

        {/* Right: Theme + Streak + Summary Button */}
        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1 bg-amber-700/50 border border-amber-400/40 px-2 py-1 rounded-xl text-[11px] font-bold text-amber-100">
            <span>{theme.dayName} · {theme.themeTitle}</span>
          </div>
          {dailyRecord.streak > 0 && (
            <div className="flex items-center gap-1 bg-amber-700/60 border border-amber-400/40 px-2 py-1 rounded-xl text-xs font-black text-yellow-300">
              <Flame className="w-3.5 h-3.5 text-orange-300 fill-orange-300" />
              <span>{dailyRecord.streak}天</span>
            </div>
          )}
          {isStep1Done && (
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="flex items-center gap-1 bg-white/95 hover:bg-white text-amber-950 px-2.5 py-1 rounded-xl text-xs font-black shadow-xs transition active:scale-95"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>今日总结</span>
            </button>
          )}
        </div>
      </div>

      {/* 1.5 NEXT-STEP ACTION STRIP WHEN STEP 1 IS ALREADY COMPLETED */}
      {isStep1Done && (
        <div
          className={`w-full mt-1 px-3 py-1.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 shrink-0 ${
            isAllDone
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-yellow-50 border-yellow-400 text-amber-950'
          }`}
        >
          <div className="text-xs font-black flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isAllDone
                ? `今日全部任务已圆满达成（刷题 ${DAILY_TARGET_COUNT} 题 + 全盘 ${pipelineState.step2GamesCount} 盘）！可自由复习或再下一局。`
                : '第 1 步今日刷题已完成！下一步去打 1 盘 AI 全盘实战，今天就收工啦！'}
            </span>
          </div>
          {onGoToSparring && (
            <button
              onClick={onGoToSparring}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-sm flex items-center gap-1 transition active:scale-95 shrink-0"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{isAllDone ? '自由再战一盘' : '进入第 2 步：AI 全盘实战 →'}</span>
            </button>
          )}
        </div>
      )}

      {/* 2. PROGRESS TRACKER (8 DOTS / BUTTONS) */}
      <div className="w-full bg-amber-50/90 rounded-2xl p-1.5 border border-amber-200 shadow-xs flex items-center justify-between gap-1.5 overflow-x-auto my-1 shrink-0">
        {puzzles.map((p, idx) => {
          const isSolved = pipelineState.step1SolvedIds.includes(p.id);
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-1 min-w-[36px] h-8 sm:h-9 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 relative ${
                isCurrent
                  ? 'bg-amber-500 text-white shadow-md scale-[1.03] border-2 border-yellow-300'
                  : isSolved
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-200'
              }`}
              title={`第 ${idx + 1} 题 · ${getPuzzleCategoryLabel(p)}${isSolved ? '（已通过）' : ''}`}
            >
              <span>第{idx + 1}题</span>
              {isSolved ? (
                <span className="text-yellow-200">★</span>
              ) : (
                <span className="opacity-40">○</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE: BOARD + SIDE PANEL */}
      <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-4 min-h-0 overflow-hidden">
        {/* Left: The Board */}
        <div className="h-full flex items-center justify-center shrink-0">
          <GoBoard
            state={boardState}
            onPlayMove={handlePlayMove}
            showCoordinates={showCoordinates}
            singleTapToPlay={true}
            highlightPoints={
              demoActive || solutionVisible
                ? currentPuzzle.solutionTree.move
                  ? [currentPuzzle.solutionTree.move]
                  : []
                : []
            }
          />
        </div>

        {/* Right: Question prompt & Helper controls */}
        <div className="w-full md:w-80 flex flex-col justify-between gap-2 bg-white/95 rounded-2xl p-3 border-2 border-amber-300 shadow-xs h-full overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                第 {currentIndex + 1} / {DAILY_TARGET_COUNT} 题
              </span>
              <span className="text-[11px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-lg">
                {getPuzzleCategoryLabel(currentPuzzle)}
              </span>
            </div>

            <h3 className="text-base font-black text-amber-950 mt-1.5 font-cartoon">
              {currentPuzzle.title}
            </h3>

            {/* Description Card */}
            <div className="bg-amber-50/80 rounded-xl p-2.5 border border-amber-200 text-xs text-amber-900 font-medium mt-2 leading-relaxed">
              <div className="flex items-start justify-between gap-1">
                <span>{currentPuzzle.description}</span>
                <button
                  onClick={handleSpeakPrompt}
                  className="p-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 shrink-0"
                  title="朗读题目"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Feedback / hint display */}
            {feedback && (
              <div
                className={`p-2 rounded-xl text-xs font-bold mt-2 flex items-center gap-1 ${
                  feedback.includes('太棒') ||
                  feedback.includes('正确') ||
                  feedback.includes('命中') ||
                  feedback.includes('答案已展示')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                <span>{feedback}</span>
              </div>
            )}

            {hintVisible && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-2.5 text-xs text-amber-900 mt-2 font-medium flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{currentPuzzle.hint}</span>
              </div>
            )}

            {/* Teacher Answer & Full Analysis Card */}
            {solutionVisible && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-400 rounded-2xl p-2.5 text-xs text-amber-950 mt-2 shadow-md">
                <div className="flex items-center justify-between pb-1.5 border-b border-orange-200">
                  <span className="font-black flex items-center gap-1 text-orange-700">
                    <BookOpen className="w-4 h-4 text-orange-600" />
                    <span>名师解答与棋理精析</span>
                  </span>
                  <button
                    onClick={() =>
                      SoundEngine.speakText(
                        currentPuzzle.explanation || currentPuzzle.solutionTree.comment || ''
                      )
                    }
                    className="p-1 rounded-md bg-orange-200 hover:bg-orange-300 text-orange-900"
                    title="朗读解析"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2 space-y-1.5 leading-relaxed font-medium">
                  <div className="bg-white/80 p-2 rounded-xl border border-orange-200">
                    <div className="text-[11px] font-black text-amber-800">正解落子：</div>
                    <div className="text-xs font-bold text-emerald-700">
                      落子在坐标 (
                      {currentPuzzle.solutionTree.move
                        ? `${currentPuzzle.solutionTree.move.x + 1}, ${
                            currentPuzzle.solutionTree.move.y + 1
                          }`
                        : '中腹'}
                      ) · {currentPuzzle.solutionTree.comment || '切中要害！'}
                    </div>
                  </div>

                  <div className="bg-white/80 p-2 rounded-xl border border-orange-200 text-amber-900">
                    <div className="text-[11px] font-black text-amber-800">棋理精析：</div>
                    <div>{currentPuzzle.explanation || currentPuzzle.description}</div>
                  </div>

                  {currentPuzzle.hint && (
                    <div className="text-[11px] text-amber-700 bg-amber-100/60 p-1.5 rounded-lg">
                      核心要诀：{currentPuzzle.hint}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleTryMyselfAfterAnswer}
                  className="w-full mt-2.5 py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>我懂了，重新挑战自己走！</span>
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5 shrink-0 pt-2 border-t border-amber-200">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHintVisible(!hintVisible)}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs transition active:scale-95 border border-amber-300"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                <span>{hintVisible ? '隐藏提示' : '老师提示'}</span>
              </button>

              <button
                onClick={handleShowAnswerAndDemo}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 font-black rounded-xl text-xs transition active:scale-95 border ${
                  solutionVisible
                    ? 'bg-orange-500 text-white border-orange-600 shadow-inner'
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-950 border-orange-300 shadow-xs'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-orange-700" />
                <span>{solutionVisible ? '收起答案' : '看答案解答'}</span>
              </button>

              <button
                onClick={() => resetCurrentBoard(currentPuzzle)}
                className="flex items-center justify-center gap-1 py-2 px-2.5 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-xl text-xs transition active:scale-95 border border-amber-300"
                title="重新摆盘"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>重摆</span>
              </button>
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-white hover:bg-amber-50 disabled:opacity-40 text-amber-900 font-bold rounded-xl text-xs transition border border-amber-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>上一题</span>
              </button>

              <button
                onClick={() => setCurrentIndex((prev) => Math.min(puzzles.length - 1, prev + 1))}
                disabled={currentIndex === puzzles.length - 1}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-40 text-amber-950 font-black rounded-xl text-xs transition shadow-xs border border-amber-500"
              >
                <span>下一题</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STEP 1 SUMMARY & NEXT-STEP MODAL */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl border-4 border-yellow-400 shadow-2xl p-5 max-w-md w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-3xl shadow-lg border-4 border-white mb-2">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-0.5 rounded-full">
              第 1 步 · 今日刷题打卡完成
            </span>

            <h2 className="text-xl font-black text-amber-950 mt-2 font-cartoon">
              {summary.headline}
            </h2>

            {/* Category Breakdown Card */}
            <div className="w-full bg-white/90 rounded-2xl border border-amber-200 p-3 mt-3 text-left space-y-2 shadow-xs">
              <div className="text-xs font-black text-amber-800 border-b border-amber-100 pb-1">
                今天练了什么（按专项汇总）：
              </div>
              {summary.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs font-bold text-amber-950"
                >
                  <span>{item.label}（{item.total} 题）</span>
                  {item.mistakeCount === 0 ? (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                      全部一次过
                    </span>
                  ) : (
                    <span className="text-orange-700 bg-orange-100 px-2 py-0.5 rounded-lg">
                      {item.mistakeCount} 题需巩固
                    </span>
                  )}
                </div>
              ))}
              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl leading-relaxed pt-1.5 border border-amber-100">
                {summary.advice}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full mt-4">
              {onGoToSparring && (
                <button
                  onClick={() => {
                    setIsSummaryModalOpen(false);
                    onGoToSparring();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-md border-2 border-emerald-300 text-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Bot className="w-4 h-4" />
                  <span>
                    {isStep2Done
                      ? '去 AI 全盘陪练再下一盘 →'
                      : '进入第 2 步：AI 全盘实战（1 盘）→'}
                  </span>
                </button>
              )}

              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="w-full py-2.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-2xl border border-amber-300 text-xs transition"
              >
                留在本页复习今日题目
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
