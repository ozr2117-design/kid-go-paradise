import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimalOpponent, BoardState, Point } from '../types/go';
import { ANIMAL_OPPONENTS } from '../data/animals';
import { GoCore } from '../engine/go-core';
import { GoAI } from '../engine/go-ai';
import { SoundEngine } from '../engine/sound-engine';
import { GoBoard } from './GoBoard';
import { WinModal } from './WinModal';
import { RotateCcw, Undo2, Eye, Award } from 'lucide-react';

interface CaptureBattleViewProps {
  onWinRecord: (animalId: string) => void;
  showCoordinates: boolean;
}

export const CaptureBattleView: React.FC<CaptureBattleViewProps> = ({
  onWinRecord,
  showCoordinates,
}) => {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalOpponent>(ANIMAL_OPPONENTS[0]);
  const [customCaptureTarget, setCustomCaptureTarget] = useState<number>(ANIMAL_OPPONENTS[0].captureTarget);
  const effectiveTarget = customCaptureTarget || selectedAnimal.captureTarget;

  const [boardState, setBoardState] = useState<BoardState>(() =>
    GoCore.createEmptyBoard(ANIMAL_OPPONENTS[0].boardSize)
  );
  const [animalDialogue, setAnimalDialogue] = useState<string>(ANIMAL_OPPONENTS[0].intro);
  const [showLiberties, setShowLiberties] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);
  const [isDefeatModalOpen, setIsDefeatModalOpen] = useState<boolean>(false);

  // Undo limit rules (每局最多 3 次，每次只能悔 1 次)
  const MAX_UNDOS_PER_GAME = 3;
  const [undosRemaining, setUndosRemaining] = useState<number>(MAX_UNDOS_PER_GAME);
  const [canUndoTurn, setCanUndoTurn] = useState<boolean>(false);

  const updateDialogue = useCallback((text: string) => {
    setAnimalDialogue(text);
    SoundEngine.speakText(text);
  }, []);

  // Initialize board when changing opponent or target
  const initGame = useCallback(
    (animal: AnimalOpponent = selectedAnimal, targetCount?: number) => {
      const nextTarget = targetCount ?? animal.captureTarget;
      setSelectedAnimal(animal);
      setCustomCaptureTarget(nextTarget);
      setBoardState(GoCore.createEmptyBoard(animal.boardSize));
      updateDialogue(animal.intro);
      setIsWinModalOpen(false);
      setIsDefeatModalOpen(false);
      setIsAiThinking(false);
      setUndosRemaining(MAX_UNDOS_PER_GAME);
      setCanUndoTurn(false);
    },
    [selectedAnimal, updateDialogue]
  );

  const handleSelectTarget = (targetCount: number) => {
    setCustomCaptureTarget(targetCount);
    SoundEngine.speakText(`吃子目标调整为先吃 ${targetCount} 颗子获胜！重新开局！`);
    initGame(selectedAnimal, targetCount);
  };

  // Handle Player (Black) Move
  const handlePlayerMove = (point: Point) => {
    if (boardState.isGameOver || boardState.turn !== 'black' || isAiThinking) return;

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
      const timer = setTimeout(() => {
        const current = stateRef.current;
        if (current.turn !== 'white' || current.isGameOver) {
          setIsAiThinking(false);
          return;
        }

        const aiMove = GoAI.getBestMove(current, 'white', {
          difficulty: selectedAnimal.difficulty,
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

        setIsAiThinking(false);
      }, 500);

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

    let reverted = GoCore.createEmptyBoard(selectedAnimal.boardSize);
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

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-stretch justify-between gap-2 p-1 sm:p-2 select-none overflow-hidden">
      {/* 1. LEFT/CENTER: FULL-HEIGHT GO BOARD (ZERO top/bottom distractions, maximum scaling) */}
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
        />
      </div>

      {/* 2. RIGHT SIDEBAR: ANIMAL SELECTOR, DIALOGUE, STATS & ACTIONS */}
      <div className="w-full md:w-80 lg:w-84 xl:w-88 h-full flex flex-col justify-start gap-2 sm:gap-2.5 overflow-y-auto pr-1 shrink-0">
        {/* Top: Animal Opponents Selector */}
        <div className="bg-white/95 rounded-2xl p-2 sm:p-2.5 border-2 border-amber-300 shadow-sm flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 font-cartoon">选择吃子对战伙伴：</span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
              共 5 阶段位
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {ANIMAL_OPPONENTS.map((animal) => {
              const isSelected = animal.id === selectedAnimal.id;
              return (
                <button
                  key={animal.id}
                  onClick={() => initGame(animal, animal.captureTarget)}
                  className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-[1.03] ring-2 ring-amber-300'
                      : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                  title={`${animal.name} (${animal.rank})`}
                >
                  <span className="text-lg sm:text-xl leading-none">{animal.avatar}</span>
                  <span className="text-[11px] font-cartoon mt-0.5 truncate w-full text-center leading-tight">
                    {animal.name}
                  </span>
                  <span className="text-[9px] opacity-90 truncate leading-tight font-normal">
                    {animal.rank.split(' ')[0]}
                  </span>
                </button>
              );
            })}
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
                目标：先吃 <strong className="text-red-600 font-cartoon text-xs">{effectiveTarget}</strong> 颗子获胜
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
            onClick={() => initGame(selectedAnimal, effectiveTarget)}
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
        subtitle={`你率先吃满了 ${effectiveTarget} 颗棋子，展现了高超的吃子技巧！`}
        stars={3}
        onRetry={() => initGame(selectedAnimal, effectiveTarget)}
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
                  onClick={() => {
                    setIsDefeatModalOpen(false);
                    handleUndo();
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-md text-sm active:scale-95 transition"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>悔一步棋，提掉大龙！({undosRemaining}/3)</span>
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsDefeatModalOpen(false);
                    initGame(selectedAnimal, effectiveTarget);
                  }}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black rounded-2xl shadow-xs flex items-center justify-center gap-1.5 text-xs sm:text-sm active:scale-95 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>再来一局</span>
                </button>

                <button
                  onClick={() => {
                    setIsDefeatModalOpen(false);
                    handleSelectTarget(15);
                  }}
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-orange-50 text-amber-900 font-bold rounded-2xl border-2 border-amber-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm active:scale-95 transition"
                >
                  <span>战 15 子大对决 🔥</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
