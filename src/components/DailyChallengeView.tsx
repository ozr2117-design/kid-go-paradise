import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BoardState, Point, PuzzleData } from '../types/go';
import { GoCore } from '../engine/go-core';
import { SoundEngine } from '../engine/sound-engine';
import { ProgressStore, DailyChallengeRecord } from '../store/storage';
import { getDaily15Puzzles, DayThemeInfo } from '../data/daily-challenges';
import { GoBoard } from './GoBoard';
import {
  Sparkles,
  Trophy,
  Flame,
  Volume2,
  Lightbulb,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Award,
  Swords,
  Bot,
  Zap,
} from 'lucide-react';

interface DailyChallengeViewProps {
  showCoordinates: boolean;
  onGoToSparring?: () => void;
  onBackToAdventure?: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  showCoordinates,
  onGoToSparring,
  onBackToAdventure,
}) => {
  const { theme, puzzles } = useMemo(() => getDaily15Puzzles(), []);
  const [dailyRecord, setDailyRecord] = useState<DailyChallengeRecord>(() => ProgressStore.getDailyRecord());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);

  const currentPuzzle: PuzzleData = puzzles[currentIndex] || puzzles[0];

  // Initialize board for current puzzle
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
    setFeedback('');
  }, []);

  // When currentIndex changes, reset board
  useEffect(() => {
    if (currentPuzzle) {
      resetCurrentBoard(currentPuzzle);
    }
  }, [currentIndex, currentPuzzle, resetCurrentBoard]);

  // Read voice prompt
  const handleSpeakPrompt = () => {
    const text = currentPuzzle.voicePrompt || currentPuzzle.description;
    SoundEngine.speakText(text);
  };

  const solvedCount = dailyRecord.todaySolvedIds.length;
  const isAllSolved = solvedCount >= 15;

  // Handle player move
  const handlePlayMove = (pt: Point) => {
    if (boardState.isGameOver) return;

    const sol = currentPuzzle.solutionTree.move;
    if (!sol) return;

    if (pt.x === sol.x && pt.y === sol.y) {
      // Correct!
      const res = GoCore.playMove(boardState, pt, currentPuzzle.initialTurn);
      setBoardState(res.nextState);
      SoundEngine.playSuccessSound();
      setFeedback(currentPuzzle.solutionTree.comment || '太棒了！完全正确！');

      const { record, isNewlyCompletedAll } = ProgressStore.recordDailySolve(currentPuzzle.id);
      setDailyRecord({ ...record });

      if (isNewlyCompletedAll) {
        SoundEngine.playFanfareSound();
        setIsCompletedModalOpen(true);
      } else {
        // Auto advance to next unsolved puzzle after 1.2s
        setTimeout(() => {
          const nextUnsolved = puzzles.findIndex(
            (p, idx) => idx > currentIndex && !record.todaySolvedIds.includes(p.id)
          );
          if (nextUnsolved !== -1) {
            setCurrentIndex(nextUnsolved);
          } else {
            const firstUnsolved = puzzles.findIndex((p) => !record.todaySolvedIds.includes(p.id));
            if (firstUnsolved !== -1) {
              setCurrentIndex(firstUnsolved);
            }
          }
        }, 1200);
      }
    } else {
      // Wrong move
      SoundEngine.playErrorSound();
      setFeedback('哎呀，这里好像被白棋反击了！再仔细算算～');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-1 sm:p-2 max-w-5xl mx-auto overflow-hidden">
      {/* 1. TOP HEADER BANNER */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl px-3 py-2 shadow-md border-2 border-amber-400 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base font-cartoon tracking-wide">
                {theme.dayName} · {theme.themeTitle}
              </span>
              <span className="text-[10px] bg-yellow-300 text-amber-950 font-black px-1.5 py-0.5 rounded-full shadow-xs">
                每日15题
              </span>
            </div>
            <p className="text-[11px] text-amber-100 hidden sm:block">{theme.subtitle}</p>
          </div>
        </div>

        {/* Badges: Solved count & Streak */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-700/60 border border-amber-400/40 px-2.5 py-1 rounded-xl text-xs font-black text-yellow-300 shadow-inner">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>连续打卡 {dailyRecord.streak} 天</span>
          </div>

          <div className="flex items-center gap-1 bg-yellow-400 border border-yellow-300 px-3 py-1 rounded-xl text-xs font-black text-amber-950 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>{solvedCount} / 15 完成</span>
          </div>
        </div>
      </div>

      {/* 2. STAR TRACKER (15 DOTS / BUTTONS) */}
      <div className="w-full bg-amber-50/90 rounded-2xl p-2 border border-amber-200 shadow-xs flex items-center justify-between gap-1 overflow-x-auto my-1.5 shrink-0">
        {puzzles.map((p, idx) => {
          const isSolved = dailyRecord.todaySolvedIds.includes(p.id);
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-1 min-w-[28px] max-w-[42px] h-8 sm:h-9 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center relative ${
                isCurrent
                  ? 'bg-amber-500 text-white shadow-md scale-105 border-2 border-yellow-300'
                  : isSolved
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-200'
              }`}
              title={`第 ${idx + 1} 题${isSolved ? '（已解决）' : ''}`}
            >
              <span className="text-[10px] leading-none">{idx + 1}</span>
              {isSolved ? (
                <span className="text-[11px] leading-none text-yellow-200">★</span>
              ) : (
                <span className="text-[10px] leading-none opacity-40">○</span>
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
          />
        </div>

        {/* Right: Question prompt & Helper controls */}
        <div className="w-full md:w-80 flex flex-col justify-between gap-2 bg-white/95 rounded-2xl p-3 border-2 border-amber-300 shadow-xs h-full overflow-y-auto">
          {/* Title & Category */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                第 {currentIndex + 1} / 15 题
              </span>
              <span className="text-xs font-bold text-gray-500">
                {currentPuzzle.difficulty === 'easy' ? '🟢 基础手筋' : currentPuzzle.difficulty === 'medium' ? '🟡 进阶死活' : '🔴 破眼绝杀'}
              </span>
            </div>

            <h3 className="text-base font-black text-amber-950 mt-1 font-cartoon">
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
                className={`p-2 rounded-xl text-xs font-bold mt-2 animate-bounce flex items-center gap-1 ${
                  feedback.includes('太棒') || feedback.includes('正确') || feedback.includes('命中')
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
                onClick={() => resetCurrentBoard(currentPuzzle)}
                className="flex items-center justify-center gap-1 py-2 px-3 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-xl text-xs transition active:scale-95 border border-amber-300"
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

      {/* 4. GRAND CELEBRATION MODAL WHEN 15 PUZZLES ARE COMPLETED */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl border-4 border-yellow-400 shadow-2xl p-6 max-w-md w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-4xl shadow-lg border-4 border-white mb-3">
              🏆
            </div>

            <span className="text-xs font-black text-amber-700 bg-yellow-200 px-3 py-1 rounded-full uppercase tracking-wider">
              今日死活特训大圆满
            </span>

            <h2 className="text-2xl font-black text-amber-950 mt-2 font-cartoon">
              太棒了！今日15题全部通关！
            </h2>

            <p className="text-sm text-amber-900 mt-2 leading-relaxed">
              你已经连续坚持打卡 <span className="font-black text-orange-600 text-base">{dailyRecord.streak}</span> 天！
              眼形与杀气算力又获得了巨大提升，向业余有段位大步迈进！
            </p>

            <div className="flex flex-col gap-2 w-full mt-5">
              {onGoToSparring && (
                <button
                  onClick={() => {
                    setIsCompletedModalOpen(false);
                    onGoToSparring();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-amber-950 font-black rounded-2xl shadow-md border-2 border-yellow-300 text-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Bot className="w-4 h-4 text-amber-800" />
                  <span>带着火热手感，去 AI 全盘对弈战一局！🔥</span>
                </button>
              )}

              <button
                onClick={() => setIsCompletedModalOpen(false)}
                className="w-full py-2.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-2xl border border-amber-300 text-xs transition"
              >
                留在本页继续复盘
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
