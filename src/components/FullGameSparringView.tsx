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
    name: '老鸟',
    avatar: '🦅',
    rank: '业余1段 守门名宿',
    description: '扎实稳健的老手，大局平稳，算气严密，是森森热身开局、巩固赢棋信心的绝佳陪练！',
  },
  {
    id: 'club',
    name: '战灵狐',
    avatar: '🦊',
    rank: '业余2-3段 中盘刺客',
    description: '中盘肉搏极度凶狠！专咬大龙断点、敏锐猎杀孤子与制造反击，是孩子目前最关键的突破对手！',
  },
  {
    id: 'master',
    name: '麒麟',
    avatar: '🦄',
    rank: '业余4段 大局宗师',
    description: '金角银边、大局厚重！搭载神经网络策略先验，官子极度精细，冲刺国家二级前的关键硬仗！',
  },
  {
    id: 'grandmaster',
    name: '龙尊',
    avatar: '🐲',
    rank: '业余5段 国家二级神脑',
    description: '国家二级水准终极大魔王！深度卷积神经网络矩阵推演，建议开启让 4 至 6 子进行大师指导棋！',
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
  const [winRule, setWinRule] = useState<WinRuleMode>('capture'); // Default to Kid-Friendly Capture Race!
  const [captureTarget, setCaptureTarget] = useState<number>(5); // Default: First to capture 5 stones wins!
  const [timedMinutes, setTimedMinutes] = useState<number>(15); // 限时吃子：整局包干时长（分钟）
  const [timedSecondsLeft, setTimedSecondsLeft] = useState<number>(15 * 60); // 包干剩余秒数
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
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>('5');

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

  // Start fresh game
  const startNewGame = useCallback(
    (
      sz: BoardSize = boardSize,
      pColor: Color = playerColor,
      lvl: AISparringLevel = aiLevel,
      rule: WinRuleMode = winRule,
      target: number = captureTarget,
      handicap: number = handicapCount
    ) => {
      setBoardSize(sz);
      setPlayerColor(pColor);
      setAiLevel(lvl);
      setWinRule(rule);
      setCaptureTarget(target);
      setHandicapCount(handicap);

      const initialBoard = handicap > 0 ? GoCore.createHandicapBoard(sz, handicap) : GoCore.createEmptyBoard(sz);
      setBoardState(initialBoard);
      setIsAiThinking(false);
      setIsSettlementOpen(false);
      setSettlementData(null);
      setIsReviewMode(false);
      setReviewStep(0);
      setTimeLeft(30);
      setTimedSecondsLeft(timedMinutes * 60);
      setUndosRemaining(MAX_UNDOS_PER_GAME);
      setCanUndoTurn(false);
      setPlayerAttemptedPass(false);

      if (handicap > 0) {
        const msg =
          lvl === 'grandmaster'
            ? `吾乃龙尊！今日为你授业让 ${handicap} 子，若能守住大局不被我突破，便算你赢！🐲`
            : `让 ${handicap} 子对弈！黑棋稳固占领星位，看白棋如何突围～`;
        setAiDialogue(msg);
        SoundEngine.speakText(msg);
        if (pColor === 'black') {
          setStatusMessage(`让 ${handicap} 子已就位，AI（白棋）先行，正在思考...`);
          setIsAiThinking(true);
        } else {
          setStatusMessage('让子已就位，轮到白棋先行，请落子！');
        }
      } else if (rule === 'timed-capture') {
        const msg = `限时吃子大作战！整局 ${timedMinutes} 分钟，时间到谁吃得多谁赢，抓紧提子吧！⏱️`;
        setAiDialogue(msg);
        SoundEngine.speakText(msg);
        if (pColor === 'white') {
          setStatusMessage('你执白后行，AI 正在思考第一手开局...');
          setIsAiThinking(true);
        } else {
          setStatusMessage('你执黑先行，请占角开局！');
        }
      } else if (rule === 'capture') {
        const msg =
          lvl === 'grandmaster'
            ? '吾乃龙尊！吃子决战与虚实腾挪双绝，先吃满 5 颗子获胜，拿出全部实力吧！🐲'
            : lvl === 'master'
            ? '吾乃踏浪麒麟！攻防兼备，先吃满 5 颗子获胜，看看你的敏锐战术！🦄'
            : lvl === 'club'
            ? '吾乃战灵狐！中盘刺客盯紧断点，先吃满 5 颗子获胜，绝不手软！🦊'
            : `我是老鸟！本盘规则：先吃满 ${target} 颗棋子获胜！看看谁的手法更敏锐～🦅`;
        setAiDialogue(msg);
        SoundEngine.speakText(msg);
        if (pColor === 'white') {
          setStatusMessage('你执白后行，AI 正在思考第一手开局...');
          setIsAiThinking(true);
        } else {
          setStatusMessage('你执黑先行，请占角开局！');
        }
      } else {
        const msg =
          lvl === 'grandmaster'
            ? '吾乃龙尊！国家二级神级大脑！若觉得压力大可随时开启让 4 至 6 子指导棋！🐲'
            : lvl === 'master'
            ? '吾乃踏浪麒麟！金角银边、大局厚重，来一场堂堂正正的 4 段点目对决！🦄'
            : lvl === 'club'
            ? '吾乃战灵狐！中盘肉搏刺客，小心你的大龙断点被我分断哦！🦊'
            : '我是老鸟！棋局大势平稳，金角银边，占领更多地盘就能赢！🦅';
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
    [boardSize, playerColor, aiLevel, winRule, captureTarget, handicapCount, timedMinutes]
  );

  // Directly switch AI Opponent level with immediate voice and audio feedback
  const handleSelectLevel = useCallback(
    (level: AISparringLevel) => {
      SoundEngine.playStoneSound();
      setAiLevel(level);
      const profile = SPARRING_PROFILES.find((p) => p.id === level) || SPARRING_PROFILES[0];
      const isGrandmaster = level === 'grandmaster';
      const msg = isGrandmaster
        ? '吾乃龙尊！国家二级神脑！若觉得压力大可随时开启让 4 至 6 子指导棋，拿出全部实力吧！🐲'
        : `【${profile.name}】(${profile.rank.split(' ')[0]}) 已就位，请落子！`;
      setAiDialogue(msg);
      SoundEngine.speakText(msg);
      startNewGame(boardSize, playerColor, level, winRule, captureTarget, handicapCount);
    },
    [boardSize, playerColor, winRule, captureTarget, handicapCount, startNewGame]
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
      } else if (winRule === 'timed-capture') {
        // 限时吃子：时间到，比吃子数，多者胜；打平判和
        if (playerCaptures > aiCaptures) {
          winner = 'player';
          finalReason = `⏱️ 时间到！你以 ${playerCaptures} : ${aiCaptures} 的吃子数获胜！`;
          titleBadge = '限时吃子小冠军';
          stars = 3;
        } else if (aiCaptures > playerCaptures) {
          winner = 'ai';
          finalReason = `⏱️ 时间到！${activeProfile.name} 以 ${aiCaptures} : ${playerCaptures} 的吃子数获胜。`;
          titleBadge = '分秒必争小健将';
          stars = 1;
        } else {
          winner = 'draw';
          finalReason = `⏱️ 时间到！双方吃子数 ${playerCaptures} : ${aiCaptures} 打平，握手言和！`;
          titleBadge = '棋逢对手小君子';
          stars = 2;
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
    },
    [boardSize, playerColor, winRule, captureTarget, activeProfile.name, playerAttemptedPass]
  );

  // 限时吃子：整局包干倒计时（时间到按吃子数判胜负）
  useEffect(() => {
    if (winRule !== 'timed-capture' || isReviewMode || boardState.isGameOver) return;
    const interval = setInterval(() => {
      setTimedSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [winRule, isReviewMode, boardState.isGameOver]);

  // 时间到 → 锁定棋局并按吃子数判定终局
  useEffect(() => {
    if (winRule === 'timed-capture' && timedSecondsLeft === 0 && !boardState.isGameOver && !isReviewMode) {
      const finalState = GoCore.cloneState(boardState);
      finalState.isGameOver = true;
      setBoardState(finalState);
      triggerEndGame(finalState);
    }
  }, [winRule, timedSecondsLeft, boardState, isReviewMode, triggerEndGame]);

  // 限时吃子：轮到小选手却「无棋可下」（全盘已满，或只剩会被马上吃掉的死洞）时给出明确提示，
  // 否则孩子会以为是程序卡住了。此时「停一手」是可用的；AI 也会对称地停手并结算。
  useEffect(() => {
    if (winRule !== 'timed-capture' || isReviewMode || boardState.isGameOver) return;
    if (boardState.turn !== playerColor) return;
    if (GoAI.hasMeaningfulMove(boardState, playerColor)) return;
    const noLegal = GoAI.getFastLegalMoves(boardState, playerColor).length === 0;
    setStatusMessage(
      noLegal
        ? '棋盘已经填满了，没有能落子的点了 —— 点【停一手】把先手让给对手'
        : '剩下的都是会被马上吃掉的死洞，别填了 —— 点【停一手】把先手让给对手'
    );
  }, [winRule, isReviewMode, boardState, playerColor]);

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
    setCanUndoTurn(true);

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

        // 限时吃子：AI 用吃子策略（传 captureTarget 走吃子体系），但 playMove 不传 captureTarget，
        // 避免「吃满 N 子提前终局」——限时模式胜负只看时间到时的吃子数。
        const playTarget = winRule === 'capture' ? captureTarget : undefined;
        const aiTarget = winRule === 'capture' || winRule === 'timed-capture' ? captureTarget : undefined;
        const aiMove = GoAI.getBestMove(current, aiColor, {
          sparringLevel: aiLevel,
          captureTarget: aiTarget,
          isFullGame: winRule === 'territory',
        });

        if (aiMove) {
          const res = GoCore.playMove(current, aiMove, aiColor, playTarget);
          setBoardState(res.nextState);

          // 🛡️ 双脑协同：若小选手上一手试图停一手，AI 绝境打入并进行心理施压
          if (current.consecutivePasses > 0) {
            const isDragon = aiLevel === 'grandmaster';
            const antiPassText = AiSensei.getAntiPassSpeech(activeProfile.name, isDragon);
            updateAiDialogue(antiPassText);
            setStatusMessage(`🔥 【胜负手打入】${activeProfile.name} 识破停一手，落子于 (${aiMove.x + 1}, ${aiMove.y + 1}) 强势反扑！`);
          } else if (res.captured.length > 0) {
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
          // AI 没有合法的非真眼可下之步
          if (winRule === 'timed-capture') {
            // 限时吃子：比赛规则是「15 分钟到点比吃子数」，停一手绝不能提前终结棋局。
            // 否则孩子只要吃子领先，停一手就能直接判赢——这正是他能靠停手打掉龙尊的原因。
            // 这里让 AI 停手只把先手还给小选手，不累加 pass、不终局。
            const passed = GoCore.pass(current);
            passed.consecutivePasses = 0;
            passed.isGameOver = false;
            updateAiDialogue('我这里没有能下的有效棋了，先让给你！');
            setStatusMessage(`${activeProfile.name} 停一手 (Pass)`);
            // 双方都无棋可下才结算：AI 无棋可下（getBestMove 返回 null 才走到这），
            // 小选手这边若也只是「送子手/眼位」而无有意义落点，棋局就到此为止，按吃子数结算。
            if (!GoAI.hasMeaningfulMove(passed, playerColor)) {
              const finished = GoCore.cloneState(passed);
              finished.isGameOver = true;
              triggerEndGame(finished);
            } else {
              setBoardState(passed);
            }
          } else if (winRule === 'capture') {
            // 吃子/限时吃子模式：不按围空判负，AI 直接停一手（双 pass 由 triggerEndGame 按吃子规则判定）
            const passed = GoCore.pass(current);
            setBoardState(passed);
            updateAiDialogue('这里没有能下的有效棋了，我停一手！');
            setStatusMessage(`${activeProfile.name} 停一手 (Pass)`);
            if (passed.isGameOver) {
              triggerEndGame(passed);
            }
          } else {
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
    playerColor,
    triggerEndGame,
    updateAiDialogue,
  ]);

  // Player Pass
  const handlePass = () => {
    if (boardState.isGameOver || boardState.turn !== playerColor || isAiThinking || isReviewMode) return;

    // 限时吃子：允许停一手（真实比赛也允许 pass），但停手绝不终局、不冻结计时、不改吃子数，
    // 只把先手交给对手。这样既不会「棋盘填满后无处落子」卡死，也仍然堵死「靠停手提前判胜」的漏洞。
    if (winRule === 'timed-capture') {
      const passed = GoCore.pass(boardState);
      passed.consecutivePasses = 0;
      passed.isGameOver = false;
      setPlayerAttemptedPass(true);
      setCanUndoTurn(true);
      setBoardState(passed);
      setStatusMessage('你停一手 (Pass)，把先手让给对手（比赛规则：15 分钟到点才比吃子数）');
      return;
    }

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
    const targetRule = winRule === 'capture' ? captureTarget : undefined;
    const moves = boardState.moveHistory.slice(0, -2);
    for (const m of moves) {
      reverted = GoCore.playMove(reverted, { x: m.x, y: m.y }, m.color, targetRule).nextState;
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

  // Calculate live capture progress & energy bar
  const myCaptures = playerColor === 'black' ? boardState.captures.black : boardState.captures.white;
  const oppCaptures = playerColor === 'black' ? boardState.captures.white : boardState.captures.black;
  const timedDisplay = `${Math.floor(timedSecondsLeft / 60)}:${String(timedSecondsLeft % 60).padStart(2, '0')}`;

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

        {/* Middle Section 1: Capture Status / Live Progress (吃子情况) */}
        <div className="shrink-0">
          {winRule === 'capture' || winRule === 'timed-capture' ? (
            /* Capture Race Badge Tracker (含限时吃子) */
            <div className="bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 p-2 rounded-2xl border-2 border-amber-400 shadow-xs flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 font-cartoon flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-amber-700" />
                  <span>{winRule === 'timed-capture' ? '限时吃子战况' : '吃子战况'}</span>
                </span>

                {winRule === 'timed-capture' ? (
                  /* 限时吃子：显示包干倒计时 */
                  <span
                    className={`flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-md border border-amber-400 text-[10px] font-bold shadow-xs ${
                      timedSecondsLeft <= 30 ? 'text-red-600 border-red-400 animate-pulse' : 'text-amber-950'
                    }`}
                  >
                    <Hourglass className="w-3 h-3" />
                    <span className="font-black font-cartoon text-xs">{timedDisplay}</span>
                  </span>
                ) : (
                  /* Target badge - opens custom input modal */
                  <button
                    onClick={() => {
                      setCustomTargetInput(String(captureTarget));
                      setIsTargetModalOpen(true);
                    }}
                    className="flex items-center gap-0.5 bg-white hover:bg-amber-50 text-amber-950 px-1.5 py-0.5 rounded-md border border-amber-400 text-[10px] font-bold shadow-xs transition"
                    title="点击修改目标吃子数"
                  >
                    <span>先吃满</span>
                    <span className="font-black text-red-600 font-cartoon text-xs">{captureTarget}</span>
                    <span>子胜 ✏️</span>
                  </button>
                )}
              </div>

              {/* Progress Duel Cards */}
              <div className="grid grid-cols-2 gap-1.5">
                {/* Player Card */}
                <div className="bg-white/90 px-2 py-1 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-black inline-block border border-gray-700 shrink-0" />
                    <span className="text-[11px] font-bold text-amber-950">你已吃</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-emerald-700 font-cartoon">
                    {myCaptures}
                    {winRule !== 'timed-capture' && <span className="text-[9px] text-gray-500 font-normal">/ {captureTarget}</span>}
                  </div>
                </div>

                {/* AI Opponent Card */}
                <div className="bg-white/90 px-2 py-1 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-white inline-block border border-gray-300 shrink-0" />
                    <span className="text-[11px] font-bold text-amber-950">AI已吃</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-orange-700 font-cartoon">
                    {oppCaptures}
                    {winRule !== 'timed-capture' && <span className="text-[9px] text-gray-500 font-normal">/ {captureTarget}</span>}
                  </div>
                </div>
              </div>

              {/* Match point alert if close */}
              {winRule === 'capture' && myCaptures >= captureTarget - 1 && myCaptures < captureTarget && (
                <div className="text-[10px] font-black text-red-600 bg-red-100 py-0.5 px-1.5 rounded-md border border-red-300 animate-bounce flex items-center justify-center gap-1">
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  <span>赛点！再吃 1 颗直接获胜！</span>
                </div>
              )}
            </div>
          ) : (
            /* Territory Live Progress */
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
          )}
        </div>

        {/* Middle Section 2: Options & Settings (选项的情况) */}
        <div className="bg-white/95 rounded-2xl p-1.5 sm:p-2 border-2 border-amber-300 shadow-xs flex flex-col gap-1.5 shrink-0">
          <div className="text-xs font-black text-amber-950 font-cartoon flex items-center gap-1 border-b border-amber-200 pb-0.5">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>对弈设置与选项</span>
          </div>

          {/* Rule Mode Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setCustomTargetInput(String(captureTarget));
                setIsTargetModalOpen(true);
              }}
              className={`flex-1 py-1 px-1 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1 ${
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
              className={`flex-1 py-1 px-1 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1 ${
                winRule === 'territory'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-black shadow border border-amber-500'
                  : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>🏰 正规点目</span>
            </button>
            <button
              onClick={() => startNewGame(boardSize, playerColor, aiLevel, 'timed-capture', captureTarget)}
              className={`flex-1 py-1 px-1 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1 ${
                winRule === 'timed-capture'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-black shadow border border-amber-500'
                  : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              <Hourglass className="w-3 h-3" />
              <span>⏱️ 限时吃子</span>
            </button>
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
                    onClick={() => startNewGame(sz, playerColor, aiLevel, winRule, captureTarget)}
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
                  onClick={() => startNewGame(boardSize, 'black', aiLevel, winRule, captureTarget)}
                  className={`px-1.5 py-0.5 rounded-md font-black text-[10px] transition ${
                    playerColor === 'black'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-300'
                  }`}
                >
                  ⚫黑
                </button>
                <button
                  onClick={() => startNewGame(boardSize, 'white', aiLevel, winRule, captureTarget)}
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
                  onClick={() => startNewGame(boardSize, playerColor, aiLevel, winRule, captureTarget, h)}
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
            title={
              winRule === 'timed-capture'
                ? '停一手：把先手让给对手。限时吃子到点才比吃子数，停手不会提前结束，也不会改变比分'
                : '放弃本手（停一手）'
            }
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
                当前对局已经下了 <span className="text-red-600 font-black">{boardState.moveHistory.length}</span> 手
                {(winRule === 'capture' || winRule === 'timed-capture') && (
                  <>，你已经吃了 <span className="text-emerald-700 font-black">{myCaptures}</span> 颗棋子</>
                )}！<br />
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
