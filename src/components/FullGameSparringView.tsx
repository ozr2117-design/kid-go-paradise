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
import { AiSensei } from '../engine/ai-sensei';
import { SoundEngine } from '../engine/sound-engine';
import { saveGameRecord, GameRecord } from '../engine/game-recorder';
import { uploadGameRecord } from '../engine/cloud-recorder';
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
  Map,
} from 'lucide-react';

const SPARRING_PROFILES: SparringProfile[] = [
  {
    id: 'novice',
    name: '18K 呆萌机',
    avatar: '🤖',
    rank: '18K 启蒙小助手',
    description: '101 围棋经典呆萌机！棋风温和呆萌，专注基础落子与基本死活，冲刺吃子战信心的第一站！',
  },
  {
    id: 'club',
    name: '17K 巡逻机',
    avatar: '🚁',
    rank: '17K 巡逻侦察兵',
    description: '101 围棋天梯巡逻兵！对局注重地盘边界与近身缠斗，会主动发起叫吃，考验你的防守专注度！',
  },
  {
    id: 'master',
    name: '16K 哨兵机',
    avatar: '🛡️',
    rank: '16K 防线铁哨兵',
    description: '101 围棋硬核铁哨兵！棋形扎实、算气严密，绝不轻易弃守大龙，是突破级位硬战的实战试金石！',
  },
  {
    id: 'grandmaster',
    name: '15K 冲锋机',
    avatar: '⚔️',
    rank: '15K 锐利冲锋官',
    description: '101 围棋冲段先锋！KataGo Human-SL 神经网络直觉，短兵相接杀气凶悍，大龙绝境死守！',
  },
];

interface FullGameSparringViewProps {
  showCoordinates: boolean;
}

export const FullGameSparringView: React.FC<FullGameSparringViewProps> = ({ showCoordinates }) => {
  // Game Configuration State - Default to 'novice' (老鸟 1D: the child's confident sparring partner)
  const [boardSize, setBoardSize] = useState<BoardSize>(13);
  const [playerColor, setPlayerColor] = useState<Color>('black');
  const [aiLevel, setAiLevel] = useState<AISparringLevel>('novice');
  const winRule: WinRuleMode = 'territory'; // 纯正 101 公开赛点目制：围地盘数子决胜
  const [handicapCount, setHandicapCount] = useState<number>(0); // 0 = even game (分先), 2, 3, 4, 9 stones
  const [showTerritoryHeatmap, setShowTerritoryHeatmap] = useState<boolean>(false); // 势力地图 / 看地盘视界

  // Runtime Game State
  const [boardState, setBoardState] = useState<BoardState>(() => GoCore.createEmptyBoard(13));
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [showLiberties, setShowLiberties] = useState<boolean>(false);
  const [aiDialogue, setAiDialogue] = useState<string>('你好呀！今天我们下一盘，看谁能先达成目标！');
  const [statusMessage, setStatusMessage] = useState<string>('请在棋盘上落子开始！');
  const [settlementData, setSettlementData] = useState<GameSettlementData | null>(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState<boolean>(false);

  // Interactive Replay & Review Mode (建议 3)
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [reviewStep, setReviewStep] = useState<number>(0);

  // Per-move Countdown Timer Switch (建议 5)
  const [timerMode, setTimerMode] = useState<'off' | '30s'>('off');
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // Restart Double-Insurance Modal (防误触双保险)
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState<boolean>(false);

  // Undo limit rules (每局最多 3 次，每次只能悔 1 次)
  const MAX_UNDOS_PER_GAME = 3;
  const [undosRemaining, setUndosRemaining] = useState<number>(MAX_UNDOS_PER_GAME);
  const [canUndoTurn, setCanUndoTurn] = useState<boolean>(false);

  // 记录小选手是否在对局中使用了停一手（用于名师复盘与投机诊断）
  const [playerAttemptedPass, setPlayerAttemptedPass] = useState<boolean>(false);

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
    let b = handicapCount > 0 ? GoCore.createHandicapBoard(boardSize, handicapCount) : GoCore.createEmptyBoard(boardSize);
    const subMoves = boardState.moveHistory.slice(0, reviewStep);
    for (const m of subMoves) {
      b = GoCore.playMove(b, { x: m.x, y: m.y }, m.color).nextState;
    }
    return b;
  }, [isReviewMode, boardState, boardSize, reviewStep, handicapCount]);

  // Start fresh game (纯正 101 公开赛标准数子点目对弈)
  const startNewGame = useCallback(
    (
      sz: BoardSize = boardSize,
      pColor: Color = playerColor,
      lvl: AISparringLevel = aiLevel,
      handicap: number = handicapCount
    ) => {
      // 📝 中途退出也上传棋谱：孩子没下完就重开/换对手，棋谱同样要记录，方便 AI 分析棋路。
      // 已结算（isGameOver）的不重复上传；刚开局（<3 手）无分析价值，跳过。
      if (boardState.moveHistory.length >= 3 && !boardState.isGameOver) {
        const myCaps = playerColor === 'black' ? boardState.captures.black : boardState.captures.white;
        const aiCaps = playerColor === 'black' ? boardState.captures.white : boardState.captures.black;
        const rec: GameRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          boardSize,
          winRule: 'territory',
          opponent: activeProfile.name,
          aiLevel,
          playerColor,
          winner: myCaps > aiCaps ? 'player' : aiCaps > myCaps ? 'ai' : 'draw',
          playerCaptures: myCaps,
          aiCaptures: aiCaps,
          totalMoves: boardState.moveHistory.length,
          moves: boardState.moveHistory.map((m) => ({ ...m })),
        };
        saveGameRecord(rec);
        uploadGameRecord(rec);
      }

      setBoardSize(sz);
      setPlayerColor(pColor);
      setAiLevel(lvl);
      setHandicapCount(handicap);

      const initialBoard = handicap > 0 ? GoCore.createHandicapBoard(sz, handicap) : GoCore.createEmptyBoard(sz);
      setBoardState(initialBoard);
      setIsAiThinking(false);
      setIsSettlementOpen(false);
      setSettlementData(null);
      setIsReviewMode(false);
      setReviewStep(0);
      setTimeLeft(30);
      setUndosRemaining(MAX_UNDOS_PER_GAME);
      setCanUndoTurn(false);
      setPlayerAttemptedPass(false);

      if (handicap > 0) {
        const msg =
          lvl === 'grandmaster'
            ? `我是 15K 冲锋机！今日为你开启让 ${handicap} 子冲段挑战，看你如何守住优势～⚔️`
            : `让 ${handicap} 子对弈！黑棋稳固占领星位，看白棋如何突围～`;
        setAiDialogue(msg);
        SoundEngine.speakText(msg);
        if (pColor === 'black') {
          setStatusMessage(`让 ${handicap} 子已就位，AI（白棋）先行，正在思考...`);
          setIsAiThinking(true);
        } else {
          setStatusMessage('让子已就位，轮到白棋先行，请落子！');
        }
      } else {
        const msg =
          lvl === 'grandmaster'
            ? '我是 15K 冲锋机！搭载 KataGo 大局直觉与点三三破空，来一场 101 高水准点目实战！⚔️'
            : lvl === 'master'
            ? '我是 16K 哨兵机！金角银边、棋形严密，来一场堂堂正正的正规点目对决！🛡️'
            : lvl === 'club'
            ? '我是 17K 巡逻机！巡逻侦察，争夺地盘，小心你的薄弱连接哦！🚁'
            : '我是 18K 呆萌机！金角银边、稳健做活，占领更多实地就能获胜！🤖';
        setAiDialogue(msg);
        SoundEngine.speakText(msg);
        if (pColor === 'white') {
          setStatusMessage('你执白后行，AI 正在思考第一手开局...');
          setIsAiThinking(true);
        } else {
          setStatusMessage('你执黑先行，请占角开局！');
        }
      }
    },
    [boardSize, playerColor, aiLevel, handicapCount, boardState, activeProfile.name]
  );

  // Directly switch AI Opponent level with immediate voice and audio feedback
  const handleSelectLevel = useCallback(
    (level: AISparringLevel) => {
      SoundEngine.playStoneSound();
      setAiLevel(level);
      const profile = SPARRING_PROFILES.find((p) => p.id === level) || SPARRING_PROFILES[0];
      const msg = `【${profile.name}】(${profile.rank.split(' ')[0]}) 已就位，请落子！`;
      setAiDialogue(msg);
      SoundEngine.speakText(msg);
      startNewGame(boardSize, playerColor, level, handicapCount);
    },
    [boardSize, playerColor, handicapCount, startNewGame]
  );

  // Handle Restart with Double-Insurance Guard (防手滑误触)
  const handleRequestRestart = () => {
    if (boardState.moveHistory.length <= 2 || boardState.isGameOver) {
      startNewGame();
    } else {
      setIsRestartConfirmOpen(true);
    }
  };

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
      } else {
        // Territory mode (101 公开赛数子点目标准)
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

      const baseSettlement: GameSettlementData = {
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
      };

      // 🧠 双脑协同：调用名师认知脑生成专业复盘评测
      const senseiReview = AiSensei.generateSenseiReview(
        baseSettlement,
        finalState,
        playerColor,
        activeProfile.name,
        playerAttemptedPass
      );

      setSettlementData({
        ...baseSettlement,
        senseiReview,
      });
      setIsSettlementOpen(true);

      // 📝 保存棋谱（供家长导出、AI 分析孩子棋路）
      const record: GameRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        boardSize,
        winRule,
        opponent: activeProfile.name,
        aiLevel,
        playerColor,
        winner,
        playerCaptures,
        aiCaptures,
        totalMoves: finalState.moveHistory.length,
        moves: finalState.moveHistory.map((m) => ({ ...m })),
      };
      saveGameRecord(record);
      // ☁️ 同步上传云端，AI 直接读表分析棋路（失败静默降级到本地，不影响对局）
      uploadGameRecord(record);
    },
    [boardSize, playerColor, activeProfile.name, playerAttemptedPass]
  );

  // Player Move Handler
  const handlePlayerMove = (point: Point) => {
    if (boardState.isGameOver || boardState.turn !== playerColor || isAiThinking || isReviewMode) return;

    const res = GoCore.playMove(boardState, point, playerColor);
    if (res.error) {
      SoundEngine.playErrorSound();
      setStatusMessage(`❌ ${res.error}`);
      return;
    }

    setBoardState(res.nextState);
    setCanUndoTurn(true);

    // Dynamic positive audio & visual reaction
    if (res.captured.length > 0) {
      SoundEngine.playCaptureSound();
      const reactions = [
        '哎呀！我的棋子被你吃掉了！这步吃子太漂亮了！',
        '痛痛痛！你居然看穿了我的断点！',
        '好厉害的打吃！我得小心了！',
      ];
      updateAiDialogue(reactions[Math.floor(Math.random() * reactions.length)]);
      setStatusMessage(`你提掉了对方 ${res.captured.length} 颗棋子！`);
    } else {
      SoundEngine.playStoneSound();
      setStatusMessage('落子完成，等待 AI 应对...');
    }

    // Check game over
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
      const timer = setTimeout(async () => {
        try {
          const current = stateRef.current;
          if (current.turn !== aiColor || current.isGameOver) {
            return;
          }

          const aiMove = await GoAI.getBestMoveAsync(current, aiColor, {
            sparringLevel: aiLevel,
            isFullGame: true,
          });

          if (aiMove) {
            const res = GoCore.playMove(current, aiMove, aiColor);
            setBoardState(res.nextState);

            // 🛡️ 双脑协同：若小选手上一手试图停一手，AI 绝境打入并进行心理施压
            if (current.consecutivePasses > 0) {
              const isDragon = aiLevel === 'grandmaster';
              const antiPassText = AiSensei.getAntiPassSpeech(activeProfile.name, isDragon);
              updateAiDialogue(antiPassText);
              setStatusMessage(`🔥 【胜负手打入】${activeProfile.name} 识破停一手，落子于 (${aiMove.x + 1}, ${aiMove.y + 1}) 强势反扑！`);
            } else if (res.captured.length > 0) {
              SoundEngine.playCaptureSound();
              updateAiDialogue('嘿嘿，我也吃到了一颗棋子，接下来换你反击啦！');
              setStatusMessage(`${activeProfile.name} 提掉了你 ${res.captured.length} 颗棋子！`);
            } else {
              SoundEngine.playStoneSound();
              setStatusMessage(`${activeProfile.name} 落子于 (${aiMove.x + 1}, ${aiMove.y + 1})`);
            }

            if (res.nextState.isGameOver) {
              triggerEndGame(res.nextState);
            }
          } else {
            // AI 没有合法的非真眼可下之步：正规点目终局处理
            const est = GoCore.estimateTerritory(current);
            const komi = current.size === 19 ? 7.5 : current.size === 13 ? 5.5 : 3.5;
            const myScore = aiColor === 'black' ? est.black : est.white + komi;
            const oppScore = aiColor === 'black' ? est.white + komi : est.black;

            if (myScore < oppScore) {
              // 劣势且全盘单官收尽：体面投子认负！
              const resignMsg = `黑棋大阵坚不可摧，防守滴水不漏！${activeProfile.name} 甘拜下风，投子认负！`;
              updateAiDialogue(resignMsg);
              setStatusMessage(`${activeProfile.name} 投子认负（中盘认输）`);
              const resignedState = GoCore.cloneState(current);
              resignedState.isGameOver = true;
              resignedState.winner = playerColor;
              resignedState.winReason = `对手【${activeProfile.name}】投子认负，中盘胜！`;
              setBoardState(resignedState);
              triggerEndGame(resignedState, resignedState.winReason, 'player');
            } else {
              // 优势且确实已终局：才选择停一手
              const passed = GoCore.pass(current);
              setBoardState(passed);
              updateAiDialogue('棋局大势已定，边界已经分清，我选择停一手！');
              setStatusMessage(`${activeProfile.name} 停一手 (Pass)`);
              if (passed.isGameOver) {
                triggerEndGame(passed);
              }
            }
          }
        } finally {
          setIsAiThinking(false);
        }
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
    activeProfile.name,
    playerColor,
    triggerEndGame,
    updateAiDialogue,
  ]);

  // 家长手动结束本局：孩子下到「无棋可下/胜负已分」但没触发自动结算（限时没到点）时，
  // 家长点一下主动按当前比分结算 + 上传棋谱 + 弹结算页。
  const handleManualEnd = () => {
    if (boardState.isGameOver || isReviewMode || boardState.moveHistory.length < 3) return;
    const finalState = GoCore.cloneState(boardState);
    finalState.isGameOver = true;
    triggerEndGame(finalState);
  };

  // Player Pass (标准 101 双 Pass 点目终局)
  const handlePass = () => {
    if (boardState.isGameOver || boardState.turn !== playerColor || isAiThinking || isReviewMode) return;

    setPlayerAttemptedPass(true);
    const next = GoCore.pass(boardState);
    setBoardState(next);
    setCanUndoTurn(true);
    setStatusMessage('你选择停一手 (Pass)，已将宝贵先手让给对手！');
    if (next.isGameOver) {
      triggerEndGame(next);
    }
  };

  // Undo (Take back 2 moves: player + AI) - 每局最多 3 次，每次只能悔 1 次
  const handleUndo = () => {
    if (
      boardState.moveHistory.length < 2 ||
      isAiThinking ||
      isReviewMode ||
      undosRemaining <= 0 ||
      !canUndoTurn
    ) {
      return;
    }

    let reverted = GoCore.createEmptyBoard(boardSize);
    const moves = boardState.moveHistory.slice(0, -2);
    for (const m of moves) {
      reverted = GoCore.playMove(reverted, { x: m.x, y: m.y }, m.color).nextState;
    }
    setBoardState(reverted);

    const nextRemaining = undosRemaining - 1;
    setUndosRemaining(nextRemaining);
    setCanUndoTurn(false); // 每次只能悔一次，重下后才能再悔

    const dialogueText =
      nextRemaining > 0
        ? `没关系，悔棋重来！本局还剩 ${nextRemaining} 次悔棋机会，看清气数再下！`
        : '没关系，悔棋重来！这是本局最后一次悔棋机会啦，接下来要仔细思考哦！';
    updateAiDialogue(dialogueText);
    setStatusMessage(`已悔棋回上一个回合 (本局还剩 ${nextRemaining} 次悔棋机会)`);
  };

  // Calculate live territory & energy bar
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
    <div className="w-full h-full flex flex-col md:flex-row items-stretch justify-between gap-1.5 sm:gap-2 p-1 sm:p-1.5 select-none overflow-hidden">
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
          onIllegalMove={(reason) => {
            setStatusMessage(`❌ ${reason}`);
            if (reason.includes('打劫')) {
              updateAiDialogue('此处正在打劫中 🔒，刚被吃不能立刻回提，请先在别处落子（找劫材）哦！');
            } else if (reason.includes('自杀')) {
              updateAiDialogue('这里落子没有气，属于自杀禁着点，不能下在这里哦！');
            }
          }}
          disabled={isReviewMode || boardState.turn !== playerColor || isAiThinking || boardState.isGameOver}
          showCoordinates={showCoordinates}
          showLibertiesHelper={showLiberties && !isReviewMode}
          showTerritoryHeatmap={showTerritoryHeatmap && !isReviewMode}
        />
      </div>

      {/* 2. RIGHT SIDEBAR: ALL STATS, CAPTURE FEEDBACK & OPTIONS */}
      <div className="w-full md:w-80 lg:w-84 xl:w-88 h-full flex flex-col justify-start gap-1.5 sm:gap-2 overflow-y-auto pr-0.5 shrink-0">
        {/* Top: 4 AI Opponents Quick Switcher (与吃子战完全统一，置顶直观可点) */}
        <div className="bg-white/95 rounded-2xl p-1.5 sm:p-2 border-2 border-amber-300 shadow-xs flex flex-col gap-1 shrink-0">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-black text-amber-950 font-cartoon flex items-center gap-1">
              <span>🥋 挑选对弈对手</span>
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-full">
              当前: {activeProfile.name} ({activeProfile.rank.split(' ')[0]})
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {SPARRING_PROFILES.map((p) => {
              const isSelected = p.id === aiLevel;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectLevel(p.id)}
                  className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl font-bold transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? p.id === 'grandmaster'
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white shadow-md scale-[1.02] ring-2 ring-yellow-400'
                        : p.id === 'master'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md scale-[1.02] ring-2 ring-teal-300'
                        : p.id === 'club'
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md scale-[1.02] ring-2 ring-orange-300'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-[1.02] ring-2 ring-amber-300'
                      : p.id === 'grandmaster'
                      ? 'bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-950 border border-purple-300'
                      : p.id === 'master'
                      ? 'bg-gradient-to-r from-teal-50 to-emerald-100 hover:from-teal-100 hover:to-emerald-200 text-teal-950 border border-teal-300'
                      : p.id === 'club'
                      ? 'bg-gradient-to-r from-orange-50 to-red-100 hover:from-orange-100 hover:to-red-200 text-orange-950 border border-orange-300'
                      : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                  title={`${p.name} (${p.rank})\n${p.description}`}
                >
                  <span className="text-base sm:text-lg leading-none">{p.avatar}</span>
                  <span className="text-[10px] font-cartoon mt-0.5 truncate w-full text-center leading-tight">
                    {p.name}
                  </span>
                  <span className="text-[9px] opacity-90 truncate leading-tight font-normal">
                    {p.rank.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Section 2: AI Avatar, Profile & Live Dialogue (紧凑优化，省去冗余大段文字，直出台词与状态) */}
        <div className="bg-white/95 rounded-2xl p-1.5 sm:p-2 border-2 border-amber-300 shadow-xs flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-400 flex items-center justify-center text-lg shadow-inner shrink-0">
              {activeProfile.avatar}
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <h3 className="font-black text-amber-950 text-xs font-cartoon truncate">
                  {activeProfile.name}
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0">
                  {activeProfile.rank}
                </span>
              </div>

              {/* Repositioned Reset Button (Double-Insurance Protected) */}
              <button
                onClick={handleRequestRestart}
                className="flex items-center gap-1 text-[10px] font-black text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-300 transition active:scale-95 shrink-0 shadow-2xs"
                title="重新开始一盘对局（带防误触确认）"
              >
                <RotateCcw className="w-2.5 h-2.5 text-amber-700" />
                <span>重开</span>
              </button>
            </div>
          </div>

          {/* Dynamic AI speech bubble */}
          <div className="bg-amber-50/90 px-2 py-1 rounded-xl border border-amber-200 text-[11px] font-bold text-amber-950 relative">
            <div className="absolute -top-1 left-4 w-2 h-2 bg-amber-50 border-t border-l border-amber-200 transform rotate-45"></div>
            {isAiThinking ? (
              <div className="flex items-center gap-1 text-amber-600 animate-pulse text-[11px]">
                <Bot className="w-3 h-3 shrink-0" />
                <span className="truncate">{activeProfile.name} 正在深度推演局势...</span>
              </div>
            ) : (
              <span className="line-clamp-2">“{aiDialogue}”</span>
            )}
          </div>

          {/* Current Move Status Banner */}
          <div className="flex items-center justify-between text-[11px] font-bold bg-amber-100/70 px-2 py-0.5 rounded-lg text-amber-900 border border-amber-200">
            <div className="flex items-center min-w-0">
              <span className="shrink-0 text-amber-700">提示：</span>
              <span className="text-amber-900 font-semibold truncate ml-1">{statusMessage}</span>
            </div>
            {timerMode === '30s' && !boardState.isGameOver && !isReviewMode && boardState.turn === playerColor && (
              <span
                className={`shrink-0 ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black flex items-center gap-0.5 ${
                  timeLeft <= 5
                    ? 'bg-red-500 text-white animate-pulse'
                    : timeLeft <= 10
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <Hourglass className="w-2.5 h-2.5" />
                <span>{timeLeft}s</span>
              </span>
            )}
          </div>
        </div>

        {/* Middle Section 1: Live Territory Progress */}
        <div className="shrink-0">
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 p-2 rounded-2xl border-2 border-amber-400 shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-black text-amber-950 px-0.5">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-black inline-block border border-gray-700" />
                <span>黑: {blackScore} 目</span>
              </div>
              <div className="flex items-center gap-1 text-amber-800 font-cartoon text-[10px]">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
                <span>实时地盘</span>
              </div>
              <div className="flex items-center gap-1">
                <span>白: {whiteScore.toFixed(1)} 目</span>
                <span className="w-2.5 h-2.5 rounded-full bg-white inline-block border border-gray-300" />
              </div>
            </div>
            <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden flex shadow-inner border border-amber-300">
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
        </div>

        {/* Middle Section 2: Options & Settings (选项的情况) */}
        <div className="bg-white/95 rounded-2xl p-1.5 sm:p-2 border-2 border-amber-300 shadow-xs flex flex-col gap-1.5 shrink-0">
          <div className="text-xs font-black text-amber-950 font-cartoon flex items-center gap-1 border-b border-amber-200 pb-0.5">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>对弈设置与选项</span>
          </div>

          {/* Tournament Standard Badge */}
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-green-600 text-white px-2.5 py-1.5 rounded-xl shadow-xs border border-emerald-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
              <div className="flex flex-col">
                <span className="font-cartoon font-black text-xs tracking-wide">101 围棋公开赛标准赛制</span>
                <span className="text-[9px] text-emerald-100 font-medium leading-none">
                  {boardSize === 19 ? '19路十九道 · 黑贴 3又3/4子 (7.5目)' : '13路十三道 · 黑贴 2又3/4子 (5.5目)'}
                </span>
              </div>
            </div>
            <span className="bg-emerald-700/80 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-400/40">
              围地盘点目
            </span>
          </div>

          {/* Board Size & Stone Color */}
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            {/* Size */}
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-200 justify-between">
              <span className="text-[10px] font-bold text-amber-900">路数:</span>
              <div className="flex gap-1">
                {([13, 19] as BoardSize[]).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => startNewGame(sz, playerColor, aiLevel, handicapCount)}
                    className={`px-1.5 py-0.5 rounded-md font-black text-[10px] transition ${
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
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-200 justify-between">
              <span className="text-[10px] font-bold text-amber-900">执子:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => startNewGame(boardSize, 'black', aiLevel, handicapCount)}
                  className={`px-1.5 py-0.5 rounded-md font-black text-[10px] transition ${
                    playerColor === 'black'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-300'
                  }`}
                >
                  ⚫黑
                </button>
                <button
                  onClick={() => startNewGame(boardSize, 'white', aiLevel, handicapCount)}
                  className={`px-1.5 py-0.5 rounded-md font-black text-[10px] transition ${
                    playerColor === 'white'
                      ? 'bg-white text-gray-900 border border-amber-500 shadow-xs'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                >
                  ⚪白
                </button>
              </div>
            </div>
          </div>

          {/* Handicap Setting (让子) */}
          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-200 justify-between text-[11px]">
            <span className="text-[10px] font-bold text-amber-900">让子:</span>
            <div className="flex gap-1">
              {[0, 2, 3, 4].concat(boardSize === 19 ? [9] : []).map((h) => (
                <button
                  key={h}
                  onClick={() => startNewGame(boardSize, playerColor, aiLevel, h)}
                  className={`px-1.5 py-0.5 rounded-md font-black text-[10px] transition ${
                    handicapCount === h
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                  title={h === 0 ? '分先（不让子）' : `让 ${h} 子对弈`}
                >
                  {h === 0 ? '分先' : `${h}子`}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Switch */}
          <div className="flex items-center justify-between bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-200 text-[11px]">
            <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
              <Hourglass className="w-3 h-3 text-amber-600" />
              <span>思考计时:</span>
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setTimerMode('off')}
                className={`px-1.5 py-0.5 rounded-md font-black text-[10px] transition ${
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
                className={`px-1.5 py-0.5 rounded-md font-black text-[10px] transition ${
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

        {/* Bottom Section: In-Game Action Controls (4 Balanced Action Buttons) */}
        <div className="grid grid-cols-4 gap-1 shrink-0 pt-0.5">
          <button
            onClick={handleUndo}
            disabled={
              boardState.moveHistory.length < 2 ||
              isAiThinking ||
              isReviewMode ||
              undosRemaining <= 0 ||
              !canUndoTurn
            }
            className="flex items-center justify-center gap-0.5 py-1.5 px-0.5 bg-white hover:bg-amber-50 disabled:opacity-40 text-amber-900 font-bold rounded-xl border border-amber-300 text-[11px] shadow-xs transition active:scale-95 cursor-pointer"
            title={
              undosRemaining <= 0
                ? '本局 3 次悔棋机会已用完'
                : !canUndoTurn && boardState.moveHistory.length >= 2
                ? '每次只能悔棋一次，请重新落子'
                : `悔棋一步（本局剩 ${undosRemaining} 次）`
            }
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate">悔棋({undosRemaining})</span>
          </button>

          <button
            onClick={handlePass}
            disabled={boardState.turn !== playerColor || isAiThinking || isReviewMode}
            className="flex items-center justify-center gap-0.5 py-1.5 px-0.5 bg-white hover:bg-amber-50 disabled:opacity-40 text-amber-900 font-bold rounded-xl border border-amber-300 text-[11px] shadow-xs transition active:scale-95 cursor-pointer"
            title="放弃本手（停一手，双方连续停一手将自动点目终局）"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>停一手</span>
          </button>

          <button
            onClick={() => setShowLiberties(!showLiberties)}
            disabled={isReviewMode}
            className={`flex items-center justify-center gap-0.5 py-1.5 px-0.5 font-bold rounded-xl border text-[11px] shadow-xs transition active:scale-95 cursor-pointer ${
              showLiberties
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="数气辅助光圈"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>数气点</span>
          </button>

          <button
            onClick={() => {
              const next = !showTerritoryHeatmap;
              setShowTerritoryHeatmap(next);
              if (next) {
                SoundEngine.playSuccessSound();
                updateAiDialogue('地盘视界已开启！绿区是你的大本营，橙区是我的地盘哦！');
              }
            }}
            disabled={isReviewMode}
            className={`flex items-center justify-center gap-0.5 py-1.5 px-0.5 font-bold rounded-xl border text-[11px] shadow-xs transition active:scale-95 cursor-pointer ${
              showTerritoryHeatmap
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title="地盘势力范围视界（绿区黑地，橙区白地）"
          >
            <Map className="w-3.5 h-3.5 shrink-0" />
            <span>看地盘</span>
          </button>
        </div>

        {/* 家长手动结束本局：下到无棋可下/胜负已分但没弹结算时，点一下主动结算+上传 */}
        <button
          onClick={handleManualEnd}
          disabled={boardState.isGameOver || isReviewMode || boardState.moveHistory.length < 3}
          className="w-full py-2 px-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 text-white font-black rounded-xl shadow-xs transition active:scale-95 text-[12px]"
          title="孩子下到无棋可下或胜负已分时，点这里主动结束并记录棋谱"
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>结束本局 · 记录棋谱</span>
        </button>
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

      {/* 6. RESTART CONFIRMATION MODAL (防误触双保险弹窗) */}
      {isRestartConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-pop-in select-none">
          <div className="bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400 relative flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-2xl mx-auto shadow-inner border border-amber-300">
              ⚠️
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-950 font-cartoon">
                正在激战中，确定重开吗？
              </h3>
              <p className="text-xs font-bold text-amber-900 mt-2 leading-relaxed bg-amber-100/80 p-3 rounded-2xl border border-amber-300">
                当前对局已经下了 <span className="text-red-600 font-black">{boardState.moveHistory.length}</span> 手，双方地盘正在激烈争夺中！<br />
                重新开局将清空当前棋盘。
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              {/* Primary button: Continue playing (Huge, Green, Safe) */}
              <button
                onClick={() => setIsRestartConfirmOpen(false)}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black rounded-2xl shadow-md text-sm active:scale-95 transition flex items-center justify-center gap-1.5 font-cartoon"
              >
                <span>🟢 继续这盘棋（不要重开）</span>
              </button>

              {/* Secondary button: Confirm restart */}
              <button
                onClick={() => {
                  setIsRestartConfirmOpen(false);
                  startNewGame();
                }}
                className="w-full py-2 px-3 bg-white hover:bg-gray-100 text-gray-600 font-bold rounded-xl border border-gray-300 text-xs active:scale-95 transition"
              >
                <span>确定清空并重新开始</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
