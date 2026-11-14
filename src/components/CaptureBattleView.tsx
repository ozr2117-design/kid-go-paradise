import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimalOpponent, BoardState, Point } from '../types/go';
import { ANIMAL_OPPONENTS } from '../data/animals';
import { GoCore } from '../engine/go-core';
import { GoAI } from '../engine/go-ai';
import { SoundEngine } from '../engine/sound-engine';
import { GoBoard } from './GoBoard';
import { WinModal } from './WinModal';
import { RotateCcw, Undo2, Eye, Award, Swords, ArrowLeft, Minimize2, Trophy } from 'lucide-react';

interface CaptureBattleViewProps {
  onWinRecord: (animalId: string) => void;
  showCoordinates: boolean;
}

export const CaptureBattleView: React.FC<CaptureBattleViewProps> = ({
  onWinRecord,
  showCoordinates,
}) => {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalOpponent>(ANIMAL_OPPONENTS[0]);
  const [boardSize, setBoardSize] = useState<19 | 13>(19);
  const [customCaptureTarget, setCustomCaptureTarget] = useState<number>(ANIMAL_OPPONENTS[0].captureTarget);
  const effectiveTarget = customCaptureTarget || selectedAnimal.captureTarget;

  const [boardState, setBoardState] = useState<BoardState>(() =>
    GoCore.createEmptyBoard(19)
  );
  const [animalDialogue, setAnimalDialogue] = useState<string>(ANIMAL_OPPONENTS[0].intro);
  const [showLiberties, setShowLiberties] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);
  const [isDefeatModalOpen, setIsDefeatModalOpen] = useState<boolean>(false);

  // Fullscreen and Exit Confirmation States (针对小米平板 6 Pro 深度定制)
  const [isPlayingFullscreen, setIsPlayingFullscreen] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Undo limit rules (每局最多 3 次，每次只能悔 1 次)
  const MAX_UNDOS_PER_GAME = 3;
  const [undosRemaining, setUndosRemaining] = useState<number>(MAX_UNDOS_PER_GAME);
  const [canUndoTurn, setCanUndoTurn] = useState<boolean>(false);

  const updateDialogue = useCallback((text: string) => {
    setAnimalDialogue(text);
    SoundEngine.speakText(text);
  }, []);

  // Initialize board when changing opponent, target or size
  const initGame = useCallback(
    (animal: AnimalOpponent = selectedAnimal, targetCount?: number, size: 19 | 13 = boardSize) => {
      const nextTarget = targetCount ?? animal.captureTarget;
      setSelectedAnimal(animal);
      setCustomCaptureTarget(nextTarget);
      setBoardSize(size);
      setBoardState(GoCore.createEmptyBoard(size));
      updateDialogue(animal.intro);
      setIsWinModalOpen(false);
      setIsDefeatModalOpen(false);
      setIsAiThinking(false);
      setUndosRemaining(MAX_UNDOS_PER_GAME);
      setCanUndoTurn(false);
    },
    [selectedAnimal, boardSize, updateDialogue]
  );

  // 进入 19 路沉浸全屏对弈（纯净 CSS 视口顶格，杜绝 Chrome 底部黑条安全提示）
  const startFullscreenMatch = useCallback(() => {
    setIsPlayingFullscreen(true);
    setShowExitConfirm(false);
    if (boardState.isGameOver || boardState.moveHistory.length === 0) {
      initGame(selectedAnimal, effectiveTarget, boardSize);
    }
    SoundEngine.speakText(`比赛开始！黑棋先走，先吃满 ${effectiveTarget} 颗子获胜！`);
  }, [boardState.isGameOver, boardState.moveHistory.length, initGame, selectedAnimal, effectiveTarget, boardSize]);

  // 退出全屏对弈，返回备战大厅
  const exitFullscreenMatch = useCallback(() => {
    setIsPlayingFullscreen(false);
    setShowExitConfirm(false);
    updateDialogue('已返回备战大厅，随时可以重新开启对决！');
  }, [updateDialogue]);

  const handleSelectBoardSize = (size: 19 | 13) => {
    SoundEngine.speakText(`切换为 ${size} 路棋盘！重新开局！`);
    initGame(selectedAnimal, effectiveTarget, size);
  };

  const handleSelectTarget = (targetCount: number) => {
    setCustomCaptureTarget(targetCount);
    SoundEngine.speakText(`吃子目标调整为先吃 ${targetCount} 颗子获胜！重新开局！`);
    initGame(selectedAnimal, targetCount, boardSize);
  };

  // Handle Player (Black) Move
  const handlePlayerMove = (point: Point) => {
    if (boardState.isGameOver || boardState.turn !== 'black' || isAiThinking) return;

    // 若在备战大厅直接落子，顺畅自动切换为全屏竞技对弈
    if (!isPlayingFullscreen) {
      setIsPlayingFullscreen(true);
    }

    const result = GoCore.playMove(boardState, point, 'black', effectiveTarget);
    if (result.error) {
      SoundEngine.playErrorSound();
      return;
    }

    setBoardState(result.nextState);
    setCanUndoTurn(true);

    // If player captured stones
    if (result.captured.length > 0) {
      SoundEngine.playCaptureSound();
      const praise =
        selectedAnimal.praises[Math.floor(Math.random() * selectedAnimal.praises.length)];
      updateDialogue(praise);
    } else {
      SoundEngine.playStoneSound();
    }

    // Check game over
    if (result.nextState.isGameOver) {
      if (result.nextState.winner === 'black') {
        SoundEngine.playVictoryFanfare();
        onWinRecord(selectedAnimal.id);
        setIsWinModalOpen(true);
      }
      return;
    }

    // Trigger AI Move after short kid-friendly delay
    setIsAiThinking(true);
  };

  // AI Turn Effect
  const stateRef = useRef(boardState);
  stateRef.current = boardState;

  useEffect(() => {
    if (boardState.turn === 'white' && !boardState.isGameOver) {
      const timer = setTimeout(async () => {
        try {
          const current = stateRef.current;
          if (current.turn !== 'white' || current.isGameOver) {
            return;
          }

          const rawLevel = selectedAnimal.id.replace('robot-', '');
          const aiMove = await GoAI.getBestMoveAsync(current, 'white', {
            difficulty: selectedAnimal.difficulty,
            sparringLevel: (rawLevel as any),
            captureTarget: effectiveTarget,
          });

          if (aiMove) {
            const aiResult = GoCore.playMove(
              current,
              aiMove,
              'white',
              effectiveTarget
            );
            setBoardState(aiResult.nextState);

            if (aiResult.captured.length > 0) {
              SoundEngine.playCaptureSound();
              updateDialogue('嘿嘿，我吃到你的棋子啦！不过不要灰心哦～');
            } else {
              SoundEngine.playStoneSound();
              if (Math.random() < 0.3) {
                const taunt =
                  selectedAnimal.taunts[Math.floor(Math.random() * selectedAnimal.taunts.length)];
                updateDialogue(taunt);
              }
            }

            if (aiResult.nextState.isGameOver) {
              if (aiResult.nextState.winner === 'black') {
                SoundEngine.playVictoryFanfare();
                onWinRecord(selectedAnimal.id);
                setIsWinModalOpen(true);
              } else if (aiResult.nextState.winner === 'white') {
                SoundEngine.playErrorSound();
                setIsDefeatModalOpen(true);
                updateDialogue(`哎呀，我先吃满 ${effectiveTarget} 颗子啦！不过你包围的大龙太惊险了！`);
              }
            }
          } else {
            // AI passes
            const passed = GoCore.pass(current);
            setBoardState(passed);
            updateDialogue('我找不到合适的地方下了，这一手我虚手（Pass）～');
          }
        } finally {
          setIsAiThinking(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [boardState.turn, boardState.isGameOver, selectedAnimal, effectiveTarget, onWinRecord, updateDialogue]);

  // Undo Move (Take back 2 moves: player + AI) - 每局最多 3 次，每次只能悔 1 次
  const handleUndo = () => {
    if (
      boardState.moveHistory.length < 2 ||
      isAiThinking ||
      undosRemaining <= 0 ||
      (!canUndoTurn && !boardState.isGameOver)
    ) {
      return;
    }

    let reverted = GoCore.createEmptyBoard(boardSize);
    const movesToReplay = boardState.moveHistory.slice(0, -2);
    for (const m of movesToReplay) {
      reverted = GoCore.playMove(reverted, { x: m.x, y: m.y }, m.color, effectiveTarget).nextState;
    }
    setBoardState(reverted);
    setIsDefeatModalOpen(false);

    const nextRemaining = undosRemaining - 1;
    setUndosRemaining(nextRemaining);
    setCanUndoTurn(false);

    const msg =
      nextRemaining > 0
        ? `悔棋成功！看准大龙最后一口气，快提吃它吧！本局还剩 ${nextRemaining} 次悔棋机会～`
        : '悔棋成功！快提吃大龙！这是本局最后一次悔棋机会啦！';
    updateDialogue(msg);
  };

  // =========================================================================
  // VIEW MODE A: 沉浸式全屏对弈界面 (针对小米平板 6 Pro 16:10 宽屏顶天立地定制)
  // =========================================================================
  if (isPlayingFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F4EEE1] flex flex-col md:flex-row items-stretch justify-between p-1 sm:p-2 select-none overflow-hidden animate-pop-in">
        {/* 1. LEFT WING: OPPONENT (WHITE) & RETURN BUTTON & LIVE SPEECH */}
        <div className="w-full md:w-44 lg:w-48 xl:w-56 h-auto md:h-full flex flex-row md:flex-col justify-between items-center md:items-stretch gap-1.5 p-2 bg-white/95 rounded-2xl border-2 border-amber-300 shadow-md shrink-0">
          {/* Top Section: Back button & Opponent Card */}
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-300 transition active:scale-95 shadow-xs"
              title="退出全屏比赛回到备战大厅"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>退出比赛</span>
            </button>

            {/* Opponent Profile */}
            <div className="flex items-center md:flex-col md:items-center gap-2 pt-1">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-400 flex items-center justify-center text-3xl md:text-4xl shadow-inner shrink-0">
                {selectedAnimal.avatar}
              </div>
              <div className="text-left md:text-center min-w-0">
                <h3 className="font-black text-amber-950 text-sm md:text-base font-cartoon truncate">
                  {selectedAnimal.name}
                </h3>
                <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5">
                  {selectedAnimal.rank}
                </span>
              </div>
            </div>

            {/* White Capture Counter Card */}
            <div className="bg-amber-50/90 p-2 md:p-2.5 rounded-xl border border-amber-200 flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-white border border-gray-400 inline-block shrink-0" />
                  <span>AI吃白棋</span>
                </span>
                <span className="text-sm md:text-base font-black text-orange-700 font-cartoon">
                  {boardState.captures.white} <span className="text-[10px] text-gray-500 font-normal">/ {effectiveTarget}</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (boardState.captures.white / effectiveTarget) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Section: Speech bubble */}
          <div className="hidden md:block w-full bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 relative">
            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-amber-50 border-t border-l border-amber-200 transform rotate-45"></div>
            {isAiThinking ? (
              <span className="text-amber-600 flex items-center gap-1.5 animate-pulse">
                <span>💭 认真算气中...</span>
              </span>
            ) : (
              <span className="line-clamp-3 leading-relaxed">“{animalDialogue}”</span>
            )}
          </div>
        </div>

        {/* 2. CENTER: MAXIMIZED GO BOARD (100% HEIGHT ON TABLETS, ZERO NAVBAR WASTE) */}
        <div className="flex-1 h-full min-h-0 min-w-0 flex items-center justify-center p-0.5 overflow-hidden">
          <GoBoard
            state={boardState}
            onPlayMove={handlePlayerMove}
            onIllegalMove={(reason) => {
              if (reason.includes('打劫')) {
                updateDialogue('此处正在打劫中 🔒，请先在别处落子（找劫材）再来提回～');
              } else if (reason.includes('自杀')) {
                updateDialogue('这里没有气，属于禁着点，不能下在这里哦！');
              }
            }}
            disabled={boardState.turn !== 'black' || isAiThinking || boardState.isGameOver}
            showCoordinates={showCoordinates}
            showLibertiesHelper={showLiberties}
            captureTarget={effectiveTarget}
            isImmersiveFullscreen={true}
          />
        </div>

        {/* 3. RIGHT WING: PLAYER SCOREBOARD & ERGONOMIC TOUCH CONTROLS */}
        <div className="w-full md:w-44 lg:w-48 xl:w-56 h-auto md:h-full flex flex-row md:flex-col justify-between items-center md:items-stretch gap-1.5 p-2 bg-white/95 rounded-2xl border-2 border-amber-300 shadow-md shrink-0">
          {/* Top Section: Target & Player Score Card */}
          <div className="flex flex-col gap-2 w-full">
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-300 text-center">
              <span className="text-[11px] font-black text-amber-950 font-cartoon flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-700" />
                <span>先吃满 {effectiveTarget} 子获胜</span>
              </span>
              <p className="text-[9.5px] font-bold text-amber-800 mt-0.5">
                {boardSize}路棋院公开比赛标准
              </p>
            </div>

            {/* Black Capture Counter Card */}
            <div className="bg-emerald-50/90 p-2 md:p-2.5 rounded-xl border border-emerald-200 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-black border border-gray-600 inline-block shrink-0" />
                  <span>你已吃黑棋</span>
                </span>
                <span className="text-sm md:text-base font-black text-emerald-700 font-cartoon">
                  {boardState.captures.black} <span className="text-[10px] text-gray-500 font-normal">/ {effectiveTarget}</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (boardState.captures.black / effectiveTarget) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Section: Tactile Touch Buttons */}
          <div className="flex flex-col gap-2 w-full pt-1">
            <button
              onClick={handleUndo}
              disabled={
                boardState.moveHistory.length < 2 ||
                isAiThinking ||
                boardState.isGameOver ||
                undosRemaining <= 0 ||
                !canUndoTurn
              }
              className="w-full py-2.5 md:py-3 px-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 text-white font-black rounded-xl text-xs md:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              title={
                undosRemaining <= 0
                  ? '本局 3 次悔棋机会已用完'
                  : !canUndoTurn && boardState.moveHistory.length >= 2
                  ? '每次只能悔棋一次，请重新落子'
                  : `悔棋（本局剩 ${undosRemaining} 次）`
              }
            >
              <Undo2 className="w-4 h-4" />
              <span>悔一步棋 ({undosRemaining}/3)</span>
            </button>

            <button
              onClick={() => setShowLiberties(!showLiberties)}
              className={`w-full py-2 px-2 font-bold rounded-xl border text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 ${
                showLiberties
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>数气光点</span>
            </button>

            <button
              onClick={() => initGame(selectedAnimal, effectiveTarget, boardSize)}
              className="w-full py-2 px-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black rounded-xl border border-amber-400 text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新开局</span>
            </button>

            <button
              onClick={exitFullscreenMatch}
              className="text-[11px] text-gray-500 hover:text-gray-800 font-bold flex items-center justify-center gap-1 py-1 transition"
              title="退出全屏，返回普通备战模式"
            >
              <Minimize2 className="w-3 h-3" />
              <span>缩小窗口</span>
            </button>
          </div>
        </div>

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-pop-in">
            <div className="bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl border-4 border-amber-400">
              <div className="text-3xl mb-1">🏁</div>
              <h3 className="text-lg font-black text-amber-950 font-cartoon">
                退出当前比赛？
              </h3>
              <p className="text-xs text-amber-900 mt-2 font-bold leading-relaxed">
                退出后将返回备战大厅，可以重新挑选对手或调整吃子目标哦～
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="py-2.5 px-3 bg-white hover:bg-amber-100 text-amber-900 font-black rounded-xl border border-amber-300 text-xs shadow-sm transition active:scale-95"
                >
                  继续比赛
                </button>
                <button
                  onClick={exitFullscreenMatch}
                  className="py-2.5 px-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-black rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  确认退出
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Win Modal */}
        <WinModal
          isOpen={isWinModalOpen}
          title={`🎉 战胜了 ${selectedAnimal.name}！`}
          subtitle={`恭喜你在 ${boardSize} 路吃子大赛中率先吃满 ${effectiveTarget} 颗棋子，展现了高超的吃子技巧！`}
          stars={3}
          onRetry={() => {
            initGame(selectedAnimal, effectiveTarget, boardSize);
            setIsWinModalOpen(false);
          }}
          onBackToMap={() => {
            setIsWinModalOpen(false);
            exitFullscreenMatch();
          }}
          hasNext={false}
        />

        {/* Defeat / Game Over Modal */}
        {isDefeatModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-pop-in">
            <div className="bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-amber-400 relative overflow-hidden">
              <div className="text-4xl mb-2">🐾</div>
              <h2 className="text-2xl font-black text-amber-950 font-cartoon">
                哎呀，差一点点就翻盘啦！
              </h2>
              <div className="text-xs sm:text-sm font-bold text-amber-900 mt-2.5 px-3 py-2 bg-yellow-200/60 rounded-xl leading-relaxed text-left border border-yellow-300">
                <p>
                  {selectedAnimal.name} 率先吃满了 <strong className="text-red-600 font-cartoon text-sm">{effectiveTarget}</strong> 颗子，本局比赛结束啦！
                </p>
                <p className="mt-1.5 text-emerald-900 text-xs">
                  💡 <strong>小教练提示</strong>：你包围大龙的战术非常惊艳！只要点击【悔一步棋】，就能立刻下在空位把整条大龙一口气全部提光！
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-5">
                {undosRemaining > 0 && (
                  <button
                    onClick={handleUndo}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-md transition active:scale-95"
                  >
                    ↩️ 悔棋一步，立刻反提大龙！(剩 {undosRemaining} 次)
                  </button>
                )}
                <button
                  onClick={() => {
                    initGame(selectedAnimal, effectiveTarget, boardSize);
                    setIsDefeatModalOpen(false);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-2xl shadow-md transition active:scale-95"
                >
                  🔄 重新再战一局！
                </button>
                <button
                  onClick={() => {
                    setIsDefeatModalOpen(false);
                    exitFullscreenMatch();
                  }}
                  className="w-full py-2 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 shadow-sm transition active:scale-95"
                >
                  ⬅ 返回备战大厅
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE B: 备战大厅常规界面 (Lobby Mode)
  // =========================================================================
  return (
    <div className="w-full h-full flex flex-col md:flex-row items-stretch justify-between gap-2 p-1 sm:p-2 select-none overflow-hidden">
      {/* 1. LEFT/CENTER: FULL-HEIGHT GO BOARD PREVIEW */}
      <div className="flex-1 h-full min-h-0 min-w-0 flex items-center justify-center overflow-hidden">
        <GoBoard
          state={boardState}
          onPlayMove={handlePlayerMove}
          onIllegalMove={(reason) => {
            if (reason.includes('打劫')) {
              updateDialogue('此处正在打劫中 🔒，请先在别处落子（找劫材）再来提回～');
            } else if (reason.includes('自杀')) {
              updateDialogue('这里没有气，属于禁着点，不能下在这里哦！');
            }
          }}
          disabled={boardState.turn !== 'black' || isAiThinking || boardState.isGameOver}
          showCoordinates={showCoordinates}
          showLibertiesHelper={showLiberties}
          captureTarget={effectiveTarget}
          isImmersiveFullscreen={false}
        />
      </div>

      {/* 2. RIGHT SIDEBAR: ANIMAL SELECTOR, DIALOGUE, STATS & ACTIONS */}
      <div className="w-full md:w-80 lg:w-84 xl:w-88 h-full flex flex-col justify-start gap-2 sm:gap-2.5 overflow-y-auto pr-1 shrink-0">
        {/* Core CTA: 开始 19 路全屏比赛按钮 */}
        <button
          onClick={startFullscreenMatch}
          className="w-full py-3 px-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg border-2 border-emerald-300 transition-all active:scale-95 flex items-center justify-center gap-2 animate-bounce-short cursor-pointer"
        >
          <Swords className="w-5 h-5 text-yellow-200" />
          <span>⚔️ 开始19路全屏吃子比赛 🏆</span>
        </button>

        {/* Top: 19路吃子比赛 Header & Opponents Selector */}
        <div className="bg-white/95 rounded-2xl p-2 sm:p-2.5 border-2 border-amber-300 shadow-sm flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 font-cartoon flex items-center gap-1">
              <Swords className="w-3.5 h-3.5 text-amber-700" />
              <span>19路棋院吃子大赛备战厅</span>
            </span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
              先吃满 {effectiveTarget} 子胜
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {ANIMAL_OPPONENTS.map((animal) => {
              const isSelected = animal.id === selectedAnimal.id;
              const rankCode = animal.rank.split(' ')[0] || animal.name.slice(0, 3);
              const nickname = animal.name.replace(/^[0-9]+K\s*/i, '');
              return (
                <button
                  key={animal.id}
                  onClick={() => {
                    SoundEngine.playStoneSound();
                    initGame(animal, animal.captureTarget, boardSize);
                  }}
                  className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-xl font-bold transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-[1.03] ring-2 ring-amber-300'
                      : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                  title={`${animal.name} (${animal.rank})`}
                >
                  <span className="text-base sm:text-lg leading-none">{animal.avatar}</span>
                  <span className="text-[11px] font-cartoon font-black mt-0.5 leading-none">
                    {rankCode}
                  </span>
                  <span className="text-[9.5px] font-bold opacity-90 leading-tight mt-0.5 whitespace-nowrap">
                    {nickname}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Board Size Switcher */}
          <div className="bg-amber-50/90 px-2 py-1.5 rounded-xl border border-amber-200 flex items-center justify-between gap-1 mt-0.5">
            <span className="text-[11px] font-black text-amber-950 font-cartoon shrink-0">🏟️ 比赛棋盘：</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSelectBoardSize(19)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition active:scale-95 ${
                  boardSize === 19
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                }`}
                title="棋院正式比赛同款 19路大棋盘"
              >
                19路 (棋院比赛)
              </button>
              <button
                onClick={() => handleSelectBoardSize(13)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition active:scale-95 ${
                  boardSize === 13
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                }`}
                title="13路练习小棋盘"
              >
                13路
              </button>
            </div>
          </div>

          {/* Quick Target Count Switcher */}
          <div className="bg-amber-50/90 px-2 py-1.5 rounded-xl border border-amber-200 flex items-center justify-between gap-1 mt-0.5">
            <span className="text-[11px] font-black text-amber-950 font-cartoon shrink-0">🎯 决胜目标：</span>
            <div className="flex items-center gap-1 overflow-x-auto">
              {[5, 8, 10, 12, 15, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => handleSelectTarget(count)}
                  className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[11px] font-black transition active:scale-95 ${
                    effectiveTarget === count
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                      : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                  title={`设定先吃满 ${count} 颗子获胜`}
                >
                  {count}子
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle 1: Opponent Avatar & Live Speech Bubble */}
        <div className="bg-white/95 rounded-2xl p-2.5 sm:p-3 shadow-sm border-2 border-amber-300 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {selectedAnimal.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-black text-amber-950 text-sm font-cartoon truncate">
                  {selectedAnimal.name}
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                  {selectedAnimal.rank}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                赛制：{boardSize}路棋盘 · 先吃 <strong className="text-red-600 font-cartoon text-xs">{effectiveTarget}</strong> 颗子获胜
              </p>
            </div>
          </div>

          {/* Dynamic Speech bubble */}
          <div className="bg-amber-50/90 p-2 sm:p-2.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 relative">
            <div className="absolute -top-1.5 left-5 w-3 h-3 bg-amber-50 border-t border-l border-amber-200 transform rotate-45"></div>
            {isAiThinking ? (
              <span className="text-amber-600 flex items-center gap-1.5 animate-pulse">
                <span>💭 {selectedAnimal.name} 正在认真算气...</span>
              </span>
            ) : (
              <span className="line-clamp-2">“{animalDialogue}”</span>
            )}
          </div>
        </div>

        {/* Middle 2: Capture Duel Scoreboard with Visual Progress Bars */}
        <div className="bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 p-2.5 rounded-2xl border-2 border-amber-400 shadow-sm flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-black text-amber-950 font-cartoon px-0.5">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>吃子进度比拼</span>
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-white/80 px-2 py-0.5 rounded-md border border-amber-300">
              先吃满 {effectiveTarget} 颗胜
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-0.5">
            {/* Player (Black) */}
            <div className="bg-white/90 p-2 rounded-xl border border-amber-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-black inline-block border border-gray-700 shrink-0" />
                  <span className="text-xs font-bold text-gray-800">你已吃</span>
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-700 font-cartoon">
                  {boardState.captures.black} <span className="text-[10px] text-gray-500 font-normal">/ {effectiveTarget}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (boardState.captures.black / effectiveTarget) * 100)}%` }}
                />
              </div>
            </div>

            {/* Opponent (White) */}
            <div className="bg-white/90 p-2 rounded-xl border border-amber-200 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-white inline-block border border-gray-300 shrink-0" />
                  <span className="text-xs font-bold text-gray-800">AI已吃</span>
                </div>
                <div className="text-sm sm:text-base font-black text-orange-700 font-cartoon">
                  {boardState.captures.white} <span className="text-[10px] text-gray-500 font-normal">/ {effectiveTarget}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (boardState.captures.white / effectiveTarget) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 shrink-0 pt-0.5 pb-1">
          <button
            onClick={handleUndo}
            disabled={
              boardState.moveHistory.length < 2 ||
              isAiThinking ||
              boardState.isGameOver ||
              undosRemaining <= 0 ||
              !canUndoTurn
            }
            className="flex items-center justify-center gap-1 py-2 px-2 bg-white hover:bg-gray-50 disabled:opacity-40 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs shadow-sm transition active:scale-95"
            title={
              undosRemaining <= 0
                ? '本局 3 次悔棋机会已用完'
                : !canUndoTurn && boardState.moveHistory.length >= 2
                ? '每次只能悔棋一次，请重新落子'
                : `悔棋（本局剩 ${undosRemaining} 次）`
            }
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>悔棋 ({undosRemaining}/3)</span>
          </button>

          <button
            onClick={() => setShowLiberties(!showLiberties)}
            className={`flex items-center justify-center gap-1 py-2 px-2 font-bold rounded-xl border text-xs shadow-sm transition active:scale-95 ${
              showLiberties
                ? 'bg-emerald-500 text-white border-emerald-600 shadow'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>数气光点</span>
          </button>

          <button
            onClick={() => initGame(selectedAnimal, effectiveTarget, boardSize)}
            className="flex items-center justify-center gap-1 py-2 px-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black rounded-xl border border-amber-400 text-xs shadow-sm transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重来</span>
          </button>
        </div>
      </div>

      {/* Win Modal */}
      <WinModal
        isOpen={isWinModalOpen}
        title={`🎉 战胜了 ${selectedAnimal.name}！`}
        subtitle={`恭喜你在 ${boardSize} 路吃子大赛中率先吃满 ${effectiveTarget} 颗棋子，展现了高超的吃子技巧！`}
        stars={3}
        onRetry={() => initGame(selectedAnimal, effectiveTarget, boardSize)}
        onBackToMap={() => setIsWinModalOpen(false)}
        hasNext={false}
      />

      {/* Defeat / Game Over Modal */}
      {isDefeatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-pop-in">
          <div className="bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-amber-400 relative overflow-hidden">
            <div className="text-4xl mb-2">🐾</div>
            <h2 className="text-2xl font-black text-amber-950 font-cartoon">
              哎呀，差一点点就翻盘啦！
            </h2>
            <div className="text-xs sm:text-sm font-bold text-amber-900 mt-2.5 px-3 py-2 bg-yellow-200/60 rounded-xl leading-relaxed text-left border border-yellow-300">
              <p>
                {selectedAnimal.name} 率先吃满了 <strong className="text-red-600 font-cartoon text-sm">{effectiveTarget}</strong> 颗子，本局比赛结束啦！
              </p>
              <p className="mt-1.5 text-emerald-900 text-xs">
                💡 <strong>小教练提示</strong>：你包围大龙的战术非常惊艳！只要点击【悔一步棋】，就能立刻下在空位把整条大龙一口气全部提光！
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-5">
              {undosRemaining > 0 && (
                <button
                  onClick={handleUndo}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-md transition active:scale-95"
                >
                  ↩️ 悔棋一步，立刻反提大龙！(剩 {undosRemaining} 次)
                </button>
              )}
              <button
                onClick={() => initGame(selectedAnimal, effectiveTarget, boardSize)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-2xl shadow-md transition active:scale-95"
              >
                🔄 重新再战一局！
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
