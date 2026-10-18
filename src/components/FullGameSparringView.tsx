import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BoardSize,
  BoardState,
  Color,
  Point,
  AISparringLevel,
  SparringProfile,
  WinRuleMode,
  GameSettlementData,
} from '../types/go';
import { GoCore } from '../engine/go-core';
import { GoAI } from '../engine/go-ai';
import { SoundEngine } from '../engine/sound-engine';
import { GoBoard } from './GoBoard';
import { SparringSettlementModal } from './SparringSettlementModal';
import {
  RotateCcw,
  Undo2,
  CheckCircle2,
  Eye,
  Bot,
  Swords,
  Flame,
  Award,
  Sparkles,
  Zap,
  Hourglass,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';

const SPARRING_PROFILES: SparringProfile[] = [
  {
    id: 'novice',
    name: '俱乐部新秀',
    avatar: '🐤',
    rank: '15K 稳健练手',
    description: '扎实的基本战术，绝不无故自杀送子，是森森热身与练习五大吃子绝招的最佳陪练！',
  },
  {
    id: 'club',
    name: '道场尖子生',
    avatar: '🐺',
    rank: '10K 警觉高手',
    description: '全新强化！具备前瞻防守意识，能识破双打吃与反杀伏击，需要认真算路才能突破！',
  },
  {
    id: 'master',
    name: '弈林宗师',
    avatar: '🐲',
    rank: '5K~1D MCTS老手',
    description: '搭载蒙特卡洛树搜寻 (MCTS) 深度推演，算气严密、大局观强，24子长局极具压迫感！',
  },
];

interface FullGameSparringViewProps {
  showCoordinates: boolean;
}

export const FullGameSparringView: React.FC<FullGameSparringViewProps> = ({ showCoordinates }) => {
  // Game Configuration State
  const [boardSize, setBoardSize] = useState<BoardSize>(13);
  const [playerColor, setPlayerColor] = useState<Color>('black');
  const [aiLevel, setAiLevel] = useState<AISparringLevel>('club');
  const [winRule, setWinRule] = useState<WinRuleMode>('capture'); // Default to Kid-Friendly Capture Race!
  const [captureTarget, setCaptureTarget] = useState<number>(5); // Default: First to capture 5 stones wins!

  // Runtime Game State
  const [boardState, setBoardState] = useState<BoardState>(() => GoCore.createEmptyBoard(13));
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [showLiberties, setShowLiberties] = useState<boolean>(false);
  const [aiDialogue, setAiDialogue] = useState<string>('你好呀！今天我们下一盘，看谁能先达成目标！');
  const [statusMessage, setStatusMessage] = useState<string>('请在棋盘上落子开始！');
  const [settlementData, setSettlementData] = useState<GameSettlementData | null>(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState<boolean>(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>('5');

  // Interactive Replay & Review Mode (建议 3)
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [reviewStep, setReviewStep] = useState<number>(0);

  // Per-move Countdown Timer Switch (建议 5)
  const [timerMode, setTimerMode] = useState<'off' | '30s'>('off');
  const [timeLeft, setTimeLeft] = useState<number>(30);

  const activeProfile = SPARRING_PROFILES.find((p) => p.id === aiLevel) || SPARRING_PROFILES[1];
  const aiColor: Color = playerColor === 'black' ? 'white' : 'black';

  // AI Dialogue updater with automatic speech synthesis (建议 1)
  const updateAiDialogue = useCallback((text: string) => {
    setAiDialogue(text);
    SoundEngine.speakText(text);
  }, []);

  // Countdown Timer Logic
  useEffect(() => {
    if (timerMode !== '30s' || isReviewMode || boardState.isGameOver || isAiThinking || boardState.turn !== playerColor) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          SoundEngine.playErrorSound();
          updateAiDialogue('30秒思考时间到啦！深呼吸，准备好就可以随时落子哦～');
          setStatusMessage('⏳ 30秒思考时间到！准备好可随时落子');
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerMode, isReviewMode, boardState.isGameOver, isAiThinking, boardState.turn, playerColor, updateAiDialogue]);

  // Reset timer on player turn change
  useEffect(() => {
    if (boardState.turn === playerColor) {
      setTimeLeft(30);
    }
  }, [boardState.turn, playerColor]);

  // Calculate board state at review step
  const reviewState = useMemo(() => {
    if (!isReviewMode) return boardState;
    let b = GoCore.createEmptyBoard(boardSize);
    const subMoves = boardState.moveHistory.slice(0, reviewStep);
    for (const m of subMoves) {
      b = GoCore.playMove(b, { x: m.x, y: m.y }, m.color).nextState;
    }
    return b;
  }, [isReviewMode, boardState, boardSize, reviewStep]);

  // Start fresh game
  const startNewGame = useCallback(
    (
      sz: BoardSize = boardSize,
      pColor: Color = playerColor,
      lvl: AISparringLevel = aiLevel,
      rule: WinRuleMode = winRule,
      target: number = captureTarget
    ) => {
      setBoardSize(sz);
      setPlayerColor(pColor);
      setAiLevel(lvl);
      setWinRule(rule);
      setCaptureTarget(target);

      const empty = GoCore.createEmptyBoard(sz);
      setBoardState(empty);
      setIsAiThinking(false);
      setIsSettlementOpen(false);
      setSettlementData(null);
      setIsReviewMode(false);
      setReviewStep(0);
      setTimeLeft(30);

      if (rule === 'capture') {
        const msg = `本盘规则：先吃满 ${target} 颗棋子获胜！看看谁的手法更敏锐～`;
        setAiDialogue(msg);
        SoundEngine.speakText(msg);
      } else {
        const msg = '本盘规则：正规围地盘点目！金角银边，占领更多地盘就能赢！';
        setAiDialogue(msg);
        SoundEngine.speakText(msg);
      }

      if (pColor === 'white') {
        setStatusMessage('你执白后行，AI 正在思考第一手开局...');
        setIsAiThinking(true);
      } else {
        setStatusMessage('你执黑先行，请占角开局！');
      }
    },
    [boardSize, playerColor, aiLevel, winRule, captureTarget]
  );

  // Trigger End Game and generate rich settlement data
  const triggerEndGame = useCallback(
    (finalState: BoardState, reason?: string, manualWinner?: 'player' | 'ai') => {
      const est = GoCore.estimateTerritory(finalState);
      const komi = boardSize === 19 ? 7.5 : boardSize === 13 ? 5.5 : 3.5;
      const isPlayerBlack = playerColor === 'black';

      const playerCaptures = isPlayerBlack ? finalState.captures.black : finalState.captures.white;
      const aiCaptures = isPlayerBlack ? finalState.captures.white : finalState.captures.black;

      const playerTerritory = isPlayerBlack ? est.black : est.white + komi;
      const aiTerritory = isPlayerBlack ? est.white + komi : est.black;

      let winner: 'player' | 'ai' | 'draw' = 'draw';
      let titleBadge = '坚韧小棋手';
      let stars = 2;
      let finalReason = reason || '';

      if (manualWinner) {
        winner = manualWinner;
      } else if (winRule === 'capture') {
        if (playerCaptures >= captureTarget) {
          winner = 'player';
          finalReason = `🎯 率先吃满 ${captureTarget} 颗棋子，达成绝杀！`;
          titleBadge = captureTarget >= 10 ? '屠龙小神将' : '吃子小神童';
          stars = 3;
        } else if (aiCaptures >= captureTarget) {
          winner = 'ai';
          finalReason = `${activeProfile.name} 率先吃满了 ${captureTarget} 颗棋子。`;
          titleBadge = '百折不挠小健将';
          stars = 1;
        }
      } else {
        // Territory mode
        if (playerTerritory > aiTerritory) {
          winner = 'player';
          finalReason = `🏆 终局点目以 ${playerTerritory.toFixed(1)} 目领先 ${activeProfile.name} (${aiTerritory.toFixed(1)} 目)！`;
          titleBadge = '围地大领主';
          stars = 3;
        } else if (aiTerritory > playerTerritory) {
          winner = 'ai';
          finalReason = `${activeProfile.name} 最终以 ${aiTerritory.toFixed(1)} 目险胜 (${playerTerritory.toFixed(1)} 目)。`;
          titleBadge = '实战小达人';
          stars = 1;
        } else {
          winner = 'draw';
          finalReason = '双方总目数完全一致，握手言和！';
          titleBadge = '弈林和平使者';
          stars = 2;
        }
      }

      setSettlementData({
        winner,
        winReason: finalReason,
        winRule,
        playerCaptures,
        aiCaptures,
        playerTerritory,
        aiTerritory,
        totalMoves: finalState.moveHistory.length,
        titleBadge,
        stars,
      });
      setIsSettlementOpen(true);
    },
    [boardSize, playerColor, winRule, captureTarget, activeProfile.name]
  );

  // Player Move Handler
  const handlePlayerMove = (point: Point) => {
    if (boardState.isGameOver || boardState.turn !== playerColor || isAiThinking || isReviewMode) return;

    const targetRule = winRule === 'capture' ? captureTarget : undefined;
    const res = GoCore.playMove(boardState, point, playerColor, targetRule);
    if (res.error) {
      SoundEngine.playErrorSound();
      setStatusMessage(`❌ ${res.error}`);
      return;
    }

    setBoardState(res.nextState);

    // Dynamic positive audio & visual reaction
    if (res.captured.length > 0) {
      SoundEngine.playCaptureSound();
      const myCaps = playerColor === 'black' ? res.nextState.captures.black : res.nextState.captures.white;
      if (winRule === 'capture' && myCaps >= captureTarget) {
        updateAiDialogue('哇！你已经吃满目标了，太厉害了！我甘拜下风！');
        triggerEndGame(res.nextState);
        return;
      } else if (winRule === 'capture' && myCaps === captureTarget - 1) {
        updateAiDialogue('哎呀！我的大子被你提走了，你只要再吃一颗就赢了！我要拼命防守了！');
      } else {
        const reactions = [
          '哎呀！我的棋子被你吃掉了！这步吃子太漂亮了！',
          '痛痛痛！你居然看穿了我的断点！',
          '好厉害的打吃！我得小心了！',
        ];
        updateAiDialogue(reactions[Math.floor(Math.random() * reactions.length)]);
      }
      setStatusMessage(`你提掉了对方 ${res.captured.length} 颗棋子！`);
    } else {
      SoundEngine.playStoneSound();
      setStatusMessage('落子完成，等待 AI 应对...');
    }

    if (res.nextState.isGameOver) {
      triggerEndGame(res.nextState);
    }
  };

  // AI Turn Logic
  const stateRef = useRef(boardState);
  stateRef.current = boardState;

  useEffect(() => {
    if (boardState.turn === aiColor && !boardState.isGameOver && !isReviewMode) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const current = stateRef.current;
        if (current.turn !== aiColor || current.isGameOver) {
          setIsAiThinking(false);
          return;
        }

        const targetRule = winRule === 'capture' ? captureTarget : undefined;
        const aiMove = GoAI.getBestMove(current, aiColor, {
          sparringLevel: aiLevel,
          captureTarget: targetRule,
          isFullGame: winRule === 'territory',
        });

        if (aiMove) {
          const res = GoCore.playMove(current, aiMove, aiColor, targetRule);
          setBoardState(res.nextState);

          if (res.captured.length > 0) {
            SoundEngine.playCaptureSound();
            const aiCaps = aiColor === 'black' ? res.nextState.captures.black : res.nextState.captures.white;
            if (winRule === 'capture' && aiCaps >= captureTarget) {
              updateAiDialogue('嘿嘿，我吃满目标子数啦！承让承让～');
              triggerEndGame(res.nextState);
              setIsAiThinking(false);
              return;
            } else {
              updateAiDialogue('嘿嘿，我也吃到了一颗棋子，接下来换你反击啦！');
            }
            setStatusMessage(`${activeProfile.name} 提掉了你 ${res.captured.length} 颗棋子！`);
          } else {
            SoundEngine.playStoneSound();
            setStatusMessage(`${activeProfile.name} 落子于 (${aiMove.x + 1}, ${aiMove.y + 1})`);
          }

          if (res.nextState.isGameOver) {
            triggerEndGame(res.nextState);
          }
        } else {
          // AI passes
          const passed = GoCore.pass(current);
          setBoardState(passed);
          updateAiDialogue('棋局大势已定，边界已经分清，我选择停一手！');
          setStatusMessage(`${activeProfile.name} 停一手 (Pass)`);
          if (passed.isGameOver) {
            triggerEndGame(passed);
          }
        }

        setIsAiThinking(false);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [
    boardState.turn,
    boardState.isGameOver,
    isReviewMode,
    aiColor,
    aiLevel,
    winRule,
    captureTarget,
    activeProfile.name,
    triggerEndGame,
    updateAiDialogue,
  ]);

  // Player Pass
  const handlePass = () => {
    if (boardState.isGameOver || boardState.turn !== playerColor || isAiThinking) return;
    const next = GoCore.pass(boardState);
    setBoardState(next);
    setStatusMessage('你选择停一手 (Pass)');
    if (next.isGameOver) {
      triggerEndGame(next);
    }
  };

  // Undo (Take back 2 moves)
  const handleUndo = () => {
    if (boardState.moveHistory.length < 2 || isAiThinking) return;
    let reverted = GoCore.createEmptyBoard(boardSize);
    const targetRule = winRule === 'capture' ? captureTarget : undefined;
    const moves = boardState.moveHistory.slice(0, -2);
    for (const m of moves) {
      reverted = GoCore.playMove(reverted, { x: m.x, y: m.y }, m.color, targetRule).nextState;
    }
    setBoardState(reverted);
    setAiDialogue('没关系，悔棋重来，再看清气数再下！');
    setStatusMessage('已悔棋回上一个回合');
  };

  // Calculate live capture progress & energy bar
  const myCaptures = playerColor === 'black' ? boardState.captures.black : boardState.captures.white;
  const oppCaptures = playerColor === 'black' ? boardState.captures.white : boardState.captures.black;

  const territory = GoCore.estimateTerritory(boardState);
  const komi = boardSize === 19 ? 7.5 : boardSize === 13 ? 5.5 : 3.5;
  const blackScore = territory.black;
  const whiteScore = territory.white + komi;
  const totalScore = blackScore + whiteScore || 1;
  const blackPercent = Math.min(95, Math.max(5, Math.round((blackScore / totalScore) * 100)));
  const whitePercent = 100 - blackPercent;

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-stretch justify-between gap-2 p-1 sm:p-2 select-none overflow-hidden">
      {/* 1. LEFT/CENTER: FULL-HEIGHT GO BOARD (ZERO top/bottom distractions, maximum scaling) */}
      <div className="flex-1 h-full min-h-0 min-w-0 flex flex-col items-center justify-center overflow-hidden relative">
        {/* Floating Review Controller when in Replay Mode (建议 3) */}
        {isReviewMode && (
          <div className="absolute top-2 z-30 flex items-center gap-1 sm:gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border-2 border-amber-400 text-amber-950 animate-pop-in">
            <span className="text-xs font-black bg-amber-100 px-2 py-0.5 rounded-lg text-amber-900 font-cartoon">
              📖 棋盘复盘
            </span>
            <button
              onClick={() => {
                setReviewStep(0);
                SoundEngine.playStoneSound();
              }}
              disabled={reviewStep === 0}
              className="p-1 rounded-lg bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 transition"
              title="首手"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setReviewStep((s) => Math.max(0, s - 1));
                SoundEngine.playStoneSound();
              }}
              disabled={reviewStep === 0}
              className="p-1 rounded-lg bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 transition"
              title="上一手"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black min-w-16 text-center">
              第 {reviewStep} / {boardState.moveHistory.length} 手
            </span>
            <button
              onClick={() => {
                setReviewStep((s) => Math.min(boardState.moveHistory.length, s + 1));
                SoundEngine.playStoneSound();
              }}
              disabled={reviewStep === boardState.moveHistory.length}
              className="p-1 rounded-lg bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 transition"
              title="下一手"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setReviewStep(boardState.moveHistory.length);
                SoundEngine.playStoneSound();
              }}
              disabled={reviewStep === boardState.moveHistory.length}
              className="p-1 rounded-lg bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-900 transition"
              title="末手"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsReviewMode(false)}
              className="flex items-center gap-0.5 ml-1 sm:ml-2 px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-900 text-xs font-bold rounded-lg border border-red-300 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>退出复盘</span>
            </button>
          </div>
        )}

        <GoBoard
          state={isReviewMode ? reviewState : boardState}
          onPlayMove={handlePlayerMove}
          disabled={isReviewMode || boardState.turn !== playerColor || isAiThinking || boardState.isGameOver}
          showCoordinates={showCoordinates}
          showLibertiesHelper={showLiberties && !isReviewMode}
        />
      </div>

      {/* 2. RIGHT SIDEBAR: ALL STATS, CAPTURE FEEDBACK & OPTIONS */}
      <div className="w-full md:w-80 lg:w-84 xl:w-88 h-full flex flex-col justify-start gap-2.5 overflow-y-auto pr-0.5 shrink-0">
        {/* Top Section: AI Avatar, Profile & Live Dialogue */}
        <div className="bg-white/95 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-300 shadow-xs flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-400 flex items-center justify-center text-xl shadow-inner shrink-0">
              {activeProfile.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-black text-amber-950 text-xs sm:text-sm font-cartoon">
                  {activeProfile.name}
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                  {activeProfile.rank}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight truncate mt-0.5">{activeProfile.description}</p>
            </div>
          </div>

          {/* Dynamic AI speech bubble */}
          <div className="bg-amber-50/90 px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 relative">
            <div className="absolute -top-1 left-5 w-2.5 h-2.5 bg-amber-50 border-t border-l border-amber-200 transform rotate-45"></div>
            {isAiThinking ? (
              <div className="flex items-center gap-1.5 text-amber-600 animate-pulse text-xs">
                <Bot className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{activeProfile.name} 正在深度推演局势...</span>
              </div>
            ) : (
              <span className="line-clamp-2">“{aiDialogue}”</span>
            )}
          </div>

          {/* Current Move Status Banner */}
          <div className="flex items-center justify-between text-xs font-bold bg-amber-100/70 px-2.5 py-1 rounded-lg text-amber-900 border border-amber-200">
            <div className="flex items-center min-w-0">
              <span className="shrink-0 text-amber-700">提示：</span>
              <span className="text-amber-900 font-semibold truncate ml-1">{statusMessage}</span>
            </div>
            {timerMode === '30s' && !boardState.isGameOver && !isReviewMode && boardState.turn === playerColor && (
              <span
                className={`shrink-0 ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-0.5 ${
                  timeLeft <= 5
                    ? 'bg-red-500 text-white animate-pulse'
                    : timeLeft <= 10
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <Hourglass className="w-3 h-3" />
                <span>{timeLeft}s</span>
              </span>
            )}
          </div>
        </div>

        {/* Middle Section 1: Capture Status / Live Progress (吃子情况) */}
        <div className="shrink-0">
          {winRule === 'capture' ? (
            /* Capture Race Badge Tracker */
            <div className="bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 p-2.5 rounded-2xl border-2 border-amber-400 shadow-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 font-cartoon flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-amber-700" />
                  <span>吃子战况</span>
                </span>

                {/* Target badge - opens custom input modal */}
                <button
                  onClick={() => {
                    setCustomTargetInput(String(captureTarget));
                    setIsTargetModalOpen(true);
                  }}
                  className="flex items-center gap-1 bg-white hover:bg-amber-50 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-400 text-[11px] font-bold shadow-xs transition"
                  title="点击修改目标吃子数"
                >
                  <span>先吃满</span>
                  <span className="font-black text-red-600 font-cartoon text-xs">{captureTarget}</span>
                  <span>子胜 ✏️</span>
                </button>
              </div>

              {/* Progress Duel Cards */}
              <div className="grid grid-cols-2 gap-2 mt-0.5">
                {/* Player Card */}
                <div className="bg-white/90 px-2.5 py-1.5 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-black inline-block border border-gray-700 shrink-0" />
                    <span className="text-xs font-bold text-amber-950">你已吃</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-emerald-700 font-cartoon">
                    {myCaptures} <span className="text-[10px] text-gray-500 font-normal">/ {captureTarget}</span>
                  </div>
                </div>

                {/* AI Opponent Card */}
                <div className="bg-white/90 px-2.5 py-1.5 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-white inline-block border border-gray-300 shrink-0" />
                    <span className="text-xs font-bold text-amber-950">AI已吃</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-orange-700 font-cartoon">
                    {oppCaptures} <span className="text-[10px] text-gray-500 font-normal">/ {captureTarget}</span>
                  </div>
                </div>
              </div>

              {/* Match point alert if close */}
              {myCaptures >= captureTarget - 1 && myCaptures < captureTarget && (
                <div className="text-[11px] font-black text-red-600 bg-red-100 py-1 px-2 rounded-lg border border-red-300 animate-bounce flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>赛点！再吃 1 颗直接获胜！</span>
                </div>
              )}
            </div>
          ) : (
            /* Territory Live Progress */
            <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 p-2.5 rounded-2xl border-2 border-amber-400 shadow-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-black text-amber-950 px-0.5">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-black inline-block border border-gray-700" />
                  <span>黑: {blackScore} 目</span>
                </div>
                <div className="flex items-center gap-1 text-amber-800 font-cartoon text-[11px]">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
                  <span>实时地盘</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>白: {whiteScore.toFixed(1)} 目</span>
                  <span className="w-3 h-3 rounded-full bg-white inline-block border border-gray-300" />
                </div>
              </div>
              <div className="w-full h-2.5 bg-gray-300 rounded-full overflow-hidden flex shadow-inner border border-amber-300">
                <div
                  style={{ width: `${blackPercent}%` }}
                  className="h-full bg-gray-900 transition-all duration-500"
                />
                <div
                  style={{ width: `${whitePercent}%` }}
                  className="h-full bg-gray-100 transition-all duration-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Middle Section 2: Options & Settings (选项的情况) */}
        <div className="bg-white/95 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-300 shadow-xs flex flex-col gap-2 shrink-0">
          <div className="text-xs font-black text-amber-950 font-cartoon flex items-center gap-1 border-b border-amber-200 pb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>对弈设置与选项</span>
          </div>

          {/* Rule Mode Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setCustomTargetInput(String(captureTarget));
                setIsTargetModalOpen(true);
              }}
              className={`flex-1 py-1.5 px-1.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 ${
                winRule === 'capture'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-black shadow border border-amber-500'
                  : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              <Swords className="w-3 h-3" />
              <span>🎯 吃子决胜</span>
            </button>
            <button
              onClick={() => startNewGame(boardSize, playerColor, aiLevel, 'territory', captureTarget)}
              className={`flex-1 py-1.5 px-1.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 ${
                winRule === 'territory'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-black shadow border border-amber-500'
                  : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>🏰 正规点目</span>
            </button>
          </div>

          {/* Board Size & Stone Color */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {/* Size */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200 justify-between">
              <span className="text-[11px] font-bold text-amber-900">路数:</span>
              <div className="flex gap-1">
                {([13, 19] as BoardSize[]).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => startNewGame(sz, playerColor, aiLevel, winRule, captureTarget)}
                    className={`px-2 py-0.5 rounded-lg font-black text-[11px] transition ${
                      boardSize === sz
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {sz}×{sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200 justify-between">
              <span className="text-[11px] font-bold text-amber-900">执子:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => startNewGame(boardSize, 'black', aiLevel, winRule, captureTarget)}
                  className={`px-2 py-0.5 rounded-lg font-black text-[11px] transition ${
                    playerColor === 'black'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-300'
                  }`}
                >
                  ⚫黑
                </button>
                <button
                  onClick={() => startNewGame(boardSize, 'white', aiLevel, winRule, captureTarget)}
                  className={`px-2 py-0.5 rounded-lg font-black text-[11px] transition ${
                    playerColor === 'white'
                      ? 'bg-white text-gray-900 border-2 border-amber-500 shadow-xs'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  ⚪白
                </button>
              </div>
            </div>
          </div>

          {/* AI Difficulty Selection */}
          <div className="flex items-center gap-1 pt-0.5">
            {SPARRING_PROFILES.map((p) => {
              const isSelected = p.id === aiLevel;
              return (
                <button
                  key={p.id}
                  onClick={() => startNewGame(boardSize, playerColor, p.id, winRule, captureTarget)}
                  className={`flex-1 py-1.5 px-1 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow'
                      : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
          {/* Timer Switch (建议 5) */}
          <div className="flex items-center justify-between bg-amber-50 px-2 py-1 rounded-xl border border-amber-200 text-xs">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Hourglass className="w-3.5 h-3.5 text-amber-600" />
              <span>思考计时:</span>
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setTimerMode('off')}
                className={`px-2 py-0.5 rounded-lg font-black text-[10px] transition ${
                  timerMode === 'off'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                ♾️ 不限时
              </button>
              <button
                onClick={() => {
                  setTimerMode('30s');
                  setTimeLeft(30);
                }}
                className={`px-2 py-0.5 rounded-lg font-black text-[10px] transition ${
                  timerMode === '30s'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                ⏳ 30秒
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Action Controls (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-1.5 shrink-0 pt-0.5">
          <button
            onClick={handleUndo}
            disabled={boardState.moveHistory.length < 2 || isAiThinking || isReviewMode}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-white hover:bg-amber-50 disabled:opacity-40 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs shadow-xs transition active:scale-95"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>悔棋一步</span>
          </button>

          <button
            onClick={handlePass}
            disabled={boardState.turn !== playerColor || isAiThinking || isReviewMode}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-white hover:bg-amber-50 disabled:opacity-40 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs shadow-xs transition active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>停一手(Pass)</span>
          </button>

          <button
            onClick={() => setShowLiberties(!showLiberties)}
            disabled={isReviewMode}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 font-bold rounded-xl border text-xs shadow-xs transition active:scale-95 ${
              showLiberties
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>数气光点</span>
          </button>

          <button
            onClick={() => startNewGame()}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black rounded-xl border border-amber-400 text-xs shadow-xs transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重开一盘</span>
          </button>
        </div>
      </div>

      {/* 4. VISUAL SETTLEMENT MODAL */}
      <SparringSettlementModal
        isOpen={isSettlementOpen}
        data={settlementData}
        onPlayAgain={() => startNewGame()}
        onCloseReview={() => {
          setIsSettlementOpen(false);
          setIsReviewMode(true);
          setReviewStep(boardState.moveHistory.length);
        }}
        onBackToMap={() => setIsSettlementOpen(false)}
      />

      {/* 5. CUSTOM TARGET STONES INPUT MODAL */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-pop-in">
          <div className="bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400 relative">
            <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-cartoon flex items-center justify-center gap-2">
              <Swords className="w-6 h-6 text-amber-600" />
              <span>设置吃子获胜目标</span>
            </h3>
            <p className="text-xs sm:text-sm font-bold text-amber-800 mt-1 mb-4">
              你想挑战先吃几颗子获胜？请在下方直接输入：
            </p>

            {/* Input field with plus/minus buttons */}
            <div className="flex items-center justify-center gap-3 my-3">
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(customTargetInput, 10) || 1;
                  setCustomTargetInput(String(Math.max(1, current - 1)));
                }}
                className="w-10 h-10 rounded-2xl bg-white hover:bg-gray-100 border-2 border-amber-300 text-amber-950 font-black text-xl flex items-center justify-center shadow-sm active:scale-95"
              >
                -
              </button>

              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={customTargetInput}
                  onChange={(e) => setCustomTargetInput(e.target.value)}
                  className="w-24 h-12 text-center text-3xl font-black font-cartoon text-red-600 bg-white rounded-2xl border-3 border-amber-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  autoFocus
                />
                <span className="text-xs font-bold text-amber-800 block mt-1">颗棋子</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const current = parseInt(customTargetInput, 10) || 1;
                  setCustomTargetInput(String(Math.min(99, current + 1)));
                }}
                className="w-10 h-10 rounded-2xl bg-white hover:bg-gray-100 border-2 border-amber-300 text-amber-950 font-black text-xl flex items-center justify-center shadow-sm active:scale-95"
              >
                +
              </button>
            </div>

            {/* Quick recommend pills */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="text-[11px] font-bold text-gray-500">快捷预设:</span>
              {[1, 3, 5, 10].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomTargetInput(String(preset))}
                  className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-200/80 hover:bg-amber-300 text-amber-900 border border-amber-400"
                >
                  {preset}子
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const parsed = parseInt(customTargetInput, 10);
                  const valid = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, 99);
                  startNewGame(boardSize, playerColor, aiLevel, 'capture', valid);
                  setIsTargetModalOpen(false);
                }}
                className="flex-1 py-3 px-4 btn-cartoon-yellow text-amber-950 font-black rounded-2xl shadow-md text-sm sm:text-base"
              >
                确定开战
              </button>

              <button
                type="button"
                onClick={() => setIsTargetModalOpen(false)}
                className="py-3 px-4 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-2xl border-2 border-gray-300 text-sm"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
