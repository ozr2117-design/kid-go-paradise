import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimalOpponent, BoardState, Point } from '../types/go';
import { ANIMAL_OPPONENTS } from '../data/animals';
import { GoCore } from '../engine/go-core';
import { GoAI } from '../engine/go-ai';
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
  const [boardState, setBoardState] = useState<BoardState>(() =>
    GoCore.createEmptyBoard(ANIMAL_OPPONENTS[0].boardSize)
  );
  const [animalDialogue, setAnimalDialogue] = useState<string>(ANIMAL_OPPONENTS[0].intro);
  const [showLiberties, setShowLiberties] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);

  // Initialize board when changing opponent
  const initGame = useCallback((animal: AnimalOpponent) => {
    setSelectedAnimal(animal);
    setBoardState(GoCore.createEmptyBoard(animal.boardSize));
    setAnimalDialogue(animal.intro);
    setIsWinModalOpen(false);
    setIsAiThinking(false);
  }, []);

  // Handle Player (Black) Move
  const handlePlayerMove = (point: Point) => {
    if (boardState.isGameOver || boardState.turn !== 'black' || isAiThinking) return;

    const result = GoCore.playMove(boardState, point, 'black', selectedAnimal.captureTarget);
    if (result.error) return;

    setBoardState(result.nextState);

    // If player captured stones
    if (result.captured.length > 0) {
      const praise =
        selectedAnimal.praises[Math.floor(Math.random() * selectedAnimal.praises.length)];
      setAnimalDialogue(praise);
    }

    // Check game over
    if (result.nextState.isGameOver) {
      if (result.nextState.winner === 'black') {
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
          captureTarget: selectedAnimal.captureTarget,
        });

        if (aiMove) {
          const aiResult = GoCore.playMove(
            current,
            aiMove,
            'white',
            selectedAnimal.captureTarget
          );
          setBoardState(aiResult.nextState);

          if (aiResult.captured.length > 0) {
            setAnimalDialogue('嘿嘿，我吃到你的棋子啦！不过不要灰心哦～');
          } else if (Math.random() < 0.3) {
            const taunt =
              selectedAnimal.taunts[Math.floor(Math.random() * selectedAnimal.taunts.length)];
            setAnimalDialogue(taunt);
          }

          if (aiResult.nextState.isGameOver && aiResult.nextState.winner === 'black') {
            onWinRecord(selectedAnimal.id);
            setIsWinModalOpen(true);
          }
        } else {
          // AI passes
          const passed = GoCore.pass(current);
          setBoardState(passed);
          setAnimalDialogue('我找不到合适的地方下了，这一手我虚手（Pass）～');
        }

        setIsAiThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [boardState.turn, boardState.isGameOver, selectedAnimal, onWinRecord]);

  // Undo Move (Take back 2 moves: player + AI)
  const handleUndo = () => {
    if (boardState.moveHistory.length < 2 || isAiThinking) return;
    let reverted = GoCore.createEmptyBoard(selectedAnimal.boardSize);
    const movesToReplay = boardState.moveHistory.slice(0, -2);
    for (const m of movesToReplay) {
      reverted = GoCore.playMove(reverted, { x: m.x, y: m.y }, m.color, selectedAnimal.captureTarget).nextState;
    }
    setBoardState(reverted);
    setAnimalDialogue('没关系，悔一步棋再仔细想想看！');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 flex flex-col gap-4">
      {/* Animal Opponents Selector */}
      <div className="flex justify-center items-center gap-3 bg-amber-200/60 p-2 rounded-2xl border-2 border-amber-300">
        {ANIMAL_OPPONENTS.map((animal) => {
          const isSelected = animal.id === selectedAnimal.id;
          return (
            <button
              key={animal.id}
              onClick={() => initGame(animal)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-md scale-105'
                  : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              <span className="text-xl">{animal.avatar}</span>
              <span className="text-sm font-cartoon">{animal.name}</span>
              <span className="text-xs opacity-80">({animal.boardSize}×{animal.boardSize})</span>
            </button>
          );
        })}
      </div>

      {/* Main Arena Layout */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        {/* Canvas Board */}
        <div className="flex flex-col items-center">
          <GoBoard
            state={boardState}
            onPlayMove={handlePlayerMove}
            disabled={boardState.turn !== 'black' || isAiThinking || boardState.isGameOver}
            showCoordinates={showCoordinates}
            showLibertiesHelper={showLiberties}
            captureTarget={selectedAnimal.captureTarget}
          />

          {/* Arena Control Bar */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleUndo}
              disabled={boardState.moveHistory.length < 2 || isAiThinking}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-50 text-amber-900 font-bold rounded-xl border border-amber-300 text-sm shadow-sm"
            >
              <Undo2 className="w-4 h-4" />
              <span>悔棋</span>
            </button>

            <button
              onClick={() => initGame(selectedAnimal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-amber-900 font-bold rounded-xl border border-amber-300 text-sm shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新开始</span>
            </button>

            <button
              onClick={() => setShowLiberties(!showLiberties)}
              className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl border text-sm shadow-sm ${
                showLiberties
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>数气光点</span>
            </button>
          </div>
        </div>

        {/* Live Scoreboard & Opponent Speech Card */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Opponent Avatar & Speech Bubble */}
          <div className="bg-white rounded-3xl p-4 shadow-md border-3 border-amber-300 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner">
                {selectedAnimal.avatar}
              </div>
              <div>
                <h3 className="font-black text-amber-950 text-lg font-cartoon">
                  {selectedAnimal.name}
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {selectedAnimal.rank}
                </span>
                <p className="text-xs text-amber-800 mt-1">
                  目标：先吃 <strong className="text-red-600 text-sm">{selectedAnimal.captureTarget}</strong> 子获胜
                </p>
              </div>
            </div>

            {/* Speech bubble */}
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-sm font-bold text-amber-900 relative">
              <div className="absolute -top-2 left-6 w-3 h-3 bg-amber-50 border-t border-l border-amber-200 transform rotate-45"></div>
              {isAiThinking ? (
                <span className="text-amber-600 flex items-center gap-2 animate-pulse">
                  <span>💭 {selectedAnimal.name}正在认真思考中...</span>
                </span>
              ) : (
                <span>“{animalDialogue}”</span>
              )}
            </div>
          </div>

          {/* Capture Scoreboard */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-400 text-amber-950 rounded-3xl p-4 shadow-md border-3 border-yellow-500">
            <h4 className="text-center font-black text-base font-cartoon flex items-center justify-center gap-1.5 mb-3">
              <Award className="w-5 h-5 text-amber-800" />
              <span>吃子进度比拼</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-center">
              {/* Player (Black) */}
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-300">
                <span className="text-sm font-bold text-gray-800">小棋手 (你)</span>
                <div className="text-3xl font-black text-emerald-600 my-1 font-cartoon">
                  {boardState.captures.black}{' '}
                  <span className="text-sm font-normal text-gray-500">
                    / {selectedAnimal.captureTarget}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-600">已吃白子</div>
              </div>

              {/* Opponent (White) */}
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-300">
                <span className="text-sm font-bold text-gray-800">{selectedAnimal.name}</span>
                <div className="text-3xl font-black text-orange-600 my-1 font-cartoon">
                  {boardState.captures.white}{' '}
                  <span className="text-sm font-normal text-gray-500">
                    / {selectedAnimal.captureTarget}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-600">已吃黑子</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Win Modal */}
      <WinModal
        isOpen={isWinModalOpen}
        title={`🎉 战胜了 ${selectedAnimal.name}！`}
        subtitle={`你率先吃满了 ${selectedAnimal.captureTarget} 颗棋子，展现了高超的吃子技巧！`}
        stars={3}
        onRetry={() => initGame(selectedAnimal)}
        onBackToMap={() => setIsWinModalOpen(false)}
        hasNext={false}
      />
    </div>
  );
};
