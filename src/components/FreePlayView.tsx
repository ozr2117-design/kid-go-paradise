import React, { useState } from 'react';
import { BoardSize, BoardState, Point } from '../types/go';
import { GoCore } from '../engine/go-core';
import { GoBoard } from './GoBoard';
import { RotateCcw, Undo2, BarChart2, CheckCircle2, Swords, Compass } from 'lucide-react';

interface FreePlayViewProps {
  showCoordinates: boolean;
}

export const FreePlayView: React.FC<FreePlayViewProps> = ({ showCoordinates }) => {
  const [boardSize, setBoardSize] = useState<BoardSize>(13);
  const [boardState, setBoardState] = useState<BoardState>(() =>
    GoCore.createEmptyBoard(13)
  );
  const [territoryEstimate, setTerritoryEstimate] = useState<{
    black: number;
    white: number;
    neutral: number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const changeSize = (size: BoardSize) => {
    setBoardSize(size);
    setBoardState(GoCore.createEmptyBoard(size));
    setTerritoryEstimate(null);
    setStatusMessage('');
  };

  const handlePlayMove = (point: Point) => {
    const res = GoCore.playMove(boardState, point, boardState.turn);
    if (res.error) {
      setStatusMessage(`❌ ${res.error}`);
      return;
    }
    setBoardState(res.nextState);
    setTerritoryEstimate(null);
    setStatusMessage(
      res.captured.length > 0 ? `🔥 提掉了 ${res.captured.length} 颗棋子！` : ''
    );
  };

  const handlePass = () => {
    const next = GoCore.pass(boardState);
    setBoardState(next);
    setStatusMessage(
      next.isGameOver ? `🏁 ${next.winReason}` : `${boardState.turn === 'black' ? '黑方' : '白方'}停一手(虚手)`
    );
  };

  const handleUndo = () => {
    if (boardState.moveHistory.length === 0) return;
    let reverted = GoCore.createEmptyBoard(boardSize);
    const moves = boardState.moveHistory.slice(0, -1);
    for (const m of moves) {
      reverted = GoCore.playMove(reverted, { x: m.x, y: m.y }, m.color).nextState;
    }
    setBoardState(reverted);
    setTerritoryEstimate(null);
    setStatusMessage('已悔棋一步');
  };

  const handleEstimateTerritory = () => {
    const est = GoCore.estimateTerritory(boardState);
    setTerritoryEstimate(est);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-stretch justify-between gap-2 p-1 sm:p-2 select-none overflow-hidden">
      {/* 1. LEFT/CENTER: FULL-HEIGHT GO BOARD (ZERO top/bottom distractions, maximum scaling) */}
      <div className="flex-1 h-full min-h-0 min-w-0 flex items-center justify-center overflow-hidden">
        <GoBoard
          state={boardState}
          onPlayMove={handlePlayMove}
          disabled={boardState.isGameOver}
          showCoordinates={showCoordinates}
        />
      </div>

      {/* 2. RIGHT SIDEBAR: OPTIONS, STATUS & LARGER ACTIONS */}
      <div className="w-full md:w-80 lg:w-88 xl:w-92 h-full flex flex-col justify-between gap-3 p-0.5 overflow-hidden shrink-0">
        {/* Top: Board Size & Turn & Captures Card */}
        <div className="bg-white/95 rounded-2xl p-3 sm:p-3.5 border-2 border-amber-300 shadow-sm flex flex-col gap-3 shrink-0">
          {/* Header & Size switcher */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-amber-950 font-cartoon flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>棋盘路数</span>
            </span>
            <div className="flex gap-1.5">
              {([13, 19] as BoardSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => changeSize(sz)}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm transition ${
                    boardSize === sz
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                >
                  {sz}×{sz}
                </button>
              ))}
            </div>
          </div>

          {/* Current Turn Badge */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200">
            <span>当前轮到：</span>
            <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
              <span
                className={`inline-block w-4 h-4 rounded-full border shadow-inner ${
                  boardState.turn === 'black' ? 'bg-black border-gray-700' : 'bg-white border-gray-300'
                }`}
              />
              <span className="font-black text-amber-950">
                {boardState.turn === 'black' ? '黑方落子' : '白方落子'}
              </span>
            </span>
          </div>

          {/* Duel Captures Count & Move count */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-100">
            <div className="flex items-center justify-between bg-amber-100/50 px-2.5 py-1.5 rounded-xl border border-amber-200">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-black inline-block border border-gray-700" />
                <span className="text-xs font-bold text-amber-950">黑提子</span>
              </div>
              <span className="text-sm font-black text-emerald-700 font-cartoon">
                {boardState.captures.black}
              </span>
            </div>

            <div className="flex items-center justify-between bg-amber-100/50 px-2.5 py-1.5 rounded-xl border border-amber-200">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-white inline-block border border-gray-300" />
                <span className="text-xs font-bold text-amber-950">白提子</span>
              </div>
              <span className="text-sm font-black text-orange-700 font-cartoon">
                {boardState.captures.white}
              </span>
            </div>
          </div>

          {statusMessage && (
            <div className="text-xs font-bold text-amber-900 bg-amber-100/90 px-3 py-1.5 rounded-xl border border-amber-300 animate-pop-in text-center">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Middle: Territory Estimation Card (Visible when clicked) */}
        {territoryEstimate && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3 border-2 border-blue-300 text-xs font-bold animate-pop-in shrink-0 shadow-sm">
            <div className="text-blue-950 font-black text-xs sm:text-sm mb-1.5 flex items-center gap-1">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>形势大致推算结果</span>
            </div>
            <div className="flex justify-between text-gray-800 py-1 border-b border-blue-200">
              <span>黑方目数 (含提子):</span>
              <span className="text-black font-black text-sm">{territoryEstimate.black} 目</span>
            </div>
            <div className="flex justify-between text-gray-800 py-1">
              <span>白方目数 (含提子):</span>
              <span className="text-blue-900 font-black text-sm">{territoryEstimate.white} 目</span>
            </div>
          </div>
        )}

        {/* Bottom: Enlarged Action Controls */}
        <div className="bg-white/95 rounded-2xl p-3 sm:p-3.5 border-2 border-amber-300 shadow-sm flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-amber-950 text-sm font-cartoon flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-amber-600" />
              <span>棋局操作</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              第 {boardState.moveHistory.length} 手
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleUndo}
              disabled={boardState.moveHistory.length === 0}
              className="py-3 px-3 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 text-amber-950 font-bold rounded-xl border border-amber-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition"
            >
              <Undo2 className="w-4 h-4 text-amber-700" />
              <span>悔棋一步</span>
            </button>

            <button
              onClick={handlePass}
              className="py-3 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold rounded-xl border border-amber-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-700" />
              <span>停一手(虚手)</span>
            </button>

            <button
              onClick={handleEstimateTerritory}
              className="py-3 px-3 bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold rounded-xl border border-blue-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition"
            >
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>形势判断</span>
            </button>

            <button
              onClick={() => changeSize(boardSize)}
              className="py-3 px-3 bg-red-50 hover:bg-red-100 text-red-950 font-bold rounded-xl border border-red-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4 text-red-600" />
              <span>清空重摆</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
