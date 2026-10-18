import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BoardSize, BoardState, Color, Point, AISparringLevel, SparringProfile } from '../types/go';
import { GoCore } from '../engine/go-core';
import { GoAI } from '../engine/go-ai';
import { GoBoard } from './GoBoard';
import { WinModal } from './WinModal';
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
} from 'lucide-react';

const SPARRING_PROFILES: SparringProfile[] = [
  {
    id: 'novice',
    name: '启蒙小棋童',
    avatar: '🐤',
    rank: '18K 基础对弈',
    description: '刚开始练习全盘对弈，懂得基本占角和防守，偶尔会露破绽给你抓！',
  },
  {
    id: 'club',
    name: '冲段少年',
    avatar: '🐺',
    rank: '10K 棋院骨干',
    description: '精通金角银边开局，敏锐捕捉切断弱点，注重死活做眼！',
  },
  {
    id: 'master',
    name: '弈林小霸王',
    avatar: '🐲',
    rank: '3K~1D 顶级高手',
    description: '两手深度前瞻推演，大局观开阔，杀气严密，你能战胜它吗？',
  },
];

interface FullGameSparringViewProps {
  showCoordinates: boolean;
}

export const FullGameSparringView: React.FC<FullGameSparringViewProps> = ({ showCoordinates }) => {
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [playerColor, setPlayerColor] = useState<Color>('black');
  const [aiLevel, setAiLevel] = useState<AISparringLevel>('club');
  const [boardState, setBoardState] = useState<BoardState>(() => GoCore.createEmptyBoard(9));
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [showLiberties, setShowLiberties] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('对局开始！请在棋盘上落子。');
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [gameOverResult, setGameOverResult] = useState<{ title: string; subtitle: string; stars: number }>({
    title: '',
    subtitle: '',
    stars: 3,
  });

  const activeProfile = SPARRING_PROFILES.find((p) => p.id === aiLevel) || SPARRING_PROFILES[1];

  // Start a fresh game
  const startNewGame = useCallback(
    (sz: BoardSize = boardSize, pColor: Color = playerColor, lvl: AISparringLevel = aiLevel) => {
      setBoardSize(sz);
      setPlayerColor(pColor);
      setAiLevel(lvl);
      const emptyBoard = GoCore.createEmptyBoard(sz);
      setBoardState(emptyBoard);
      setIsAiThinking(false);
      setIsGameOverModalOpen(false);

      if (pColor === 'white') {
        setStatusMessage('你执白后行，AI 正在思考第一手开局...');
        setIsAiThinking(true);
      } else {
        setStatusMessage('你执黑先行，请占角开局！');
      }
    },
    [boardSize, playerColor, aiLevel]
  );

  // AI Turn Trigger
  const stateRef = useRef(boardState);
  stateRef.current = boardState;

  useEffect(() => {
    const aiColor: Color = playerColor === 'black' ? 'white' : 'black';

    if (boardState.turn === aiColor && !boardState.isGameOver) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const current = stateRef.current;
        if (current.turn !== aiColor || current.isGameOver) {
          setIsAiThinking(false);
          return;
        }

        const aiMove = GoAI.getBestMove(current, aiColor, {
          sparringLevel: aiLevel,
          isFullGame: true,
        });

        if (aiMove) {
          const res = GoCore.playMove(current, aiMove, aiColor);
          setBoardState(res.nextState);
          setStatusMessage(
            res.captured.length > 0
              ? `${activeProfile.name} 落子 (${aiMove.x + 1}, ${aiMove.y + 1}) 并提掉了 ${res.captured.length} 子！`
              : `${activeProfile.name} 落子于 (${aiMove.x + 1}, ${aiMove.y + 1})`
          );

          if (res.nextState.isGameOver) {
            handleEndGame(res.nextState);
          }
        } else {
          // AI passes
          const passed = GoCore.pass(current);
          setBoardState(passed);
          setStatusMessage(`${activeProfile.name} 认为大局已定，选择停一手 (Pass)！`);
          if (passed.isGameOver) {
            handleEndGame(passed);
          }
        }

        setIsAiThinking(false);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [boardState.turn, boardState.isGameOver, playerColor, aiLevel, activeProfile.name]);

  // Handle End Game summary
  const handleEndGame = (state: BoardState) => {
    const est = GoCore.estimateTerritory(state);
    const komi = boardSize === 19 ? 7.5 : boardSize === 13 ? 5.5 : 3.5;
    const totalBlack = est.black;
    const totalWhite = est.white + komi;

    const isPlayerBlack = playerColor === 'black';
    const playerTotal = isPlayerBlack ? totalBlack : totalWhite;
    const aiTotal = isPlayerBlack ? totalWhite : totalBlack;

    if (playerTotal > aiTotal) {
      setGameOverResult({
        title: '🏆 恭喜大获全胜！',
        subtitle: `你的总目数 (${playerTotal.toFixed(1)} 目) 战胜了 ${activeProfile.name} (${aiTotal.toFixed(1)} 目)！`,
        stars: 3,
      });
    } else {
      setGameOverResult({
        title: '👏 顽强拼搏，再接再厉！',
        subtitle: `${activeProfile.name} 稍占优势 (${aiTotal.toFixed(1)} 目比 ${playerTotal.toFixed(1)} 目)。复盘再战吧！`,
        stars: 1,
      });
    }
    setIsGameOverModalOpen(true);
  };

  // Player Move
  const handlePlayerMove = (point: Point) => {
    if (boardState.isGameOver || boardState.turn !== playerColor || isAiThinking) return;

    const res = GoCore.playMove(boardState, point, playerColor);
    if (res.error) {
      setStatusMessage(`❌ ${res.error}`);
      return;
    }

    setBoardState(res.nextState);
    setStatusMessage(
      res.captured.length > 0 ? `你提掉了对方 ${res.captured.length} 颗棋子！` : '落子完成，等待 AI 应对...'
    );

    if (res.nextState.isGameOver) {
      handleEndGame(res.nextState);
    }
  };

  // Player Pass
  const handlePass = () => {
    if (boardState.isGameOver || boardState.turn !== playerColor || isAiThinking) return;
    const next = GoCore.pass(boardState);
    setBoardState(next);
    setStatusMessage('你选择停一手 (Pass)');
    if (next.isGameOver) {
      handleEndGame(next);
    }
  };

  // Undo (Take back 2 moves)
  const handleUndo = () => {
    if (boardState.moveHistory.length < 2 || isAiThinking) return;
    let reverted = GoCore.createEmptyBoard(boardSize);
    const moves = boardState.moveHistory.slice(0, -2);
    for (const m of moves) {
      reverted = GoCore.playMove(reverted, { x: m.x, y: m.y }, m.color).nextState;
    }
    setBoardState(reverted);
    setStatusMessage('已悔棋回上一个回合');
  };

  // Real-time dynamic territory & win-rate energy bar calculation
  const territory = GoCore.estimateTerritory(boardState);
  const komi = boardSize === 19 ? 7.5 : boardSize === 13 ? 5.5 : 3.5;
  const blackScore = territory.black;
  const whiteScore = territory.white + komi;
  const totalPoints = blackScore + whiteScore || 1;
  const blackPercent = Math.min(95, Math.max(5, Math.round((blackScore / totalPoints) * 100)));
  const whitePercent = 100 - blackPercent;

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 flex flex-col gap-4">
      {/* Game Setup Header Bar */}
      <div className="bg-white/90 p-3 sm:p-4 rounded-3xl border-3 border-amber-300 shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Board Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black text-amber-950 font-cartoon">棋盘：</span>
          {([9, 13, 19] as BoardSize[]).map((sz) => (
            <button
              key={sz}
              onClick={() => startNewGame(sz, playerColor, aiLevel)}
              className={`px-3 py-1 rounded-xl font-bold text-xs sm:text-sm transition ${
                boardSize === sz
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              {sz}×{sz}
            </button>
          ))}
        </div>

        {/* Player Color Choice */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black text-amber-950 font-cartoon">执子：</span>
          <button
            onClick={() => startNewGame(boardSize, 'black', aiLevel)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs sm:text-sm border transition ${
              playerColor === 'black'
                ? 'bg-black text-white border-black shadow'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
            }`}
          >
            <span>⚫ 执黑先行</span>
          </button>
          <button
            onClick={() => startNewGame(boardSize, 'white', aiLevel)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs sm:text-sm border transition ${
              playerColor === 'white'
                ? 'bg-white text-gray-900 border-amber-400 shadow'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
            }`}
          >
            <span>⚪ 执白后行</span>
          </button>
        </div>

        {/* AI Opponent Selector */}
        <div className="flex items-center gap-1.5">
          {SPARRING_PROFILES.map((p) => {
            const isSelected = p.id === aiLevel;
            return (
              <button
                key={p.id}
                onClick={() => startNewGame(boardSize, playerColor, p.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow scale-105'
                    : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 border border-amber-300'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Win Rate & Territory Energy Bar */}
      <div className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 p-3 rounded-2xl border-2 border-amber-400 shadow-sm">
        <div className="flex items-center justify-between text-xs font-black text-amber-950 mb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-black inline-block border border-gray-700" />
            <span>黑方: {blackScore} 目</span>
            <span className="text-gray-500 font-normal">({blackPercent}%)</span>
          </div>

          <div className="flex items-center gap-1 text-amber-800 font-cartoon">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>全局实时形势预测</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-normal">({whitePercent}%)</span>
            <span>白方: {whiteScore.toFixed(1)} 目 (含贴目)</span>
            <span className="w-3.5 h-3.5 rounded-full bg-white inline-block border border-gray-300" />
          </div>
        </div>

        {/* Dynamic Energy Bar */}
        <div className="w-full h-3.5 bg-gray-300 rounded-full overflow-hidden flex shadow-inner border border-amber-300">
          <div
            style={{ width: `${blackPercent}%` }}
            className="h-full bg-gradient-to-r from-gray-900 to-gray-700 transition-all duration-500"
          />
          <div
            style={{ width: `${whitePercent}%` }}
            className="h-full bg-gradient-to-r from-white to-gray-100 transition-all duration-500"
          />
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          <GoBoard
            state={boardState}
            onPlayMove={handlePlayerMove}
            disabled={boardState.turn !== playerColor || isAiThinking || boardState.isGameOver}
            showCoordinates={showCoordinates}
            showLibertiesHelper={showLiberties}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 mt-3 flex-wrap justify-center">
            <button
              onClick={handleUndo}
              disabled={boardState.moveHistory.length < 2 || isAiThinking}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 disabled:opacity-40 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs sm:text-sm shadow-sm"
            >
              <Undo2 className="w-4 h-4" />
              <span>悔棋一步</span>
            </button>

            <button
              onClick={handlePass}
              disabled={boardState.turn !== playerColor || isAiThinking}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 disabled:opacity-40 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs sm:text-sm shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>停一手 (Pass)</span>
            </button>

            <button
              onClick={() => setShowLiberties(!showLiberties)}
              className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl border text-xs sm:text-sm shadow-sm ${
                showLiberties
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>数气光点</span>
            </button>

            <button
              onClick={() => startNewGame()}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-xl border border-amber-300 text-xs sm:text-sm shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重开一盘</span>
            </button>
          </div>
        </div>

        {/* AI Opponent Status & Game Tips Card */}
        <div className="w-full lg:w-72 flex flex-col gap-3">
          {/* Opponent Card */}
          <div className="bg-white rounded-3xl p-4 shadow-md border-3 border-amber-300 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner">
                {activeProfile.avatar}
              </div>
              <div>
                <h3 className="font-black text-amber-950 text-base font-cartoon">
                  {activeProfile.name}
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {activeProfile.rank}
                </span>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{activeProfile.description}</p>
              </div>
            </div>

            {/* Current status display */}
            <div className="mt-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950">
              {isAiThinking ? (
                <div className="flex items-center gap-2 text-amber-600 animate-pulse">
                  <Bot className="w-4 h-4" />
                  <span>{activeProfile.name} 正在深度推演局势...</span>
                </div>
              ) : (
                <div>{statusMessage}</div>
              )}
            </div>
          </div>

          {/* Capture Count & Komi Information */}
          <div className="bg-white rounded-3xl p-4 shadow-md border-3 border-amber-300 flex flex-col gap-2">
            <h4 className="font-black text-amber-950 text-xs sm:text-sm font-cartoon flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>提子与规则详情</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-center mt-1">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-gray-600">黑棋提子</span>
                <div className="text-xl font-black text-amber-900 font-cartoon">
                  {boardState.captures.black} 颗
                </div>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-gray-600">白棋提子</span>
                <div className="text-xl font-black text-amber-900 font-cartoon">
                  {boardState.captures.white} 颗
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              本盘贴目：白方贴 {komi} 目
            </p>
          </div>
        </div>
      </div>

      {/* Game Over Win/Loss Modal */}
      <WinModal
        isOpen={isGameOverModalOpen}
        title={gameOverResult.title}
        subtitle={gameOverResult.subtitle}
        stars={gameOverResult.stars}
        onRetry={() => startNewGame()}
        onBackToMap={() => setIsGameOverModalOpen(false)}
        hasNext={false}
      />
    </div>
  );
};
