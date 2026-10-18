import React, { useState } from 'react';
import { BoardSize, BoardState, Point } from '../types/go';
import { GoCore } from '../engine/go-core';
import { SGFParser } from '../engine/sgf-parser';
import { GoBoard } from './GoBoard';
import { RotateCcw, Undo2, Download, Upload, BarChart2, CheckCircle2 } from 'lucide-react';

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
      next.isGameOver ? `🏁 ${next.winReason}` : `${boardState.turn === 'black' ? '黑方' : '白方'}虚手`
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

  const handleExportSGF = () => {
    const sgfContent = SGFParser.exportToSGF(boardSize, boardState.moveHistory);
    const blob = new Blob([sgfContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kid-go-${boardSize}x${boardSize}-${Date.now()}.sgf`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('✅ SGF 棋谱已成功导出！');
  };

  const handleImportSGF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          const parsed = SGFParser.parseSGFToPuzzle(content);
          setBoardSize(parsed.boardSize);
          let newBoard = GoCore.createEmptyBoard(parsed.boardSize);
          for (const b of parsed.initialBoard.black) newBoard.grid[b.y][b.x] = 'black';
          for (const w of parsed.initialBoard.white) newBoard.grid[w.y][w.x] = 'white';
          newBoard.turn = parsed.initialTurn;
          setBoardState(newBoard);
          setStatusMessage(`✅ 已成功导入 SGF 棋谱: ${parsed.title}`);
        } catch (err) {
          setStatusMessage('❌ 导入 SGF 格式解析错误');
        }
      }
    };
    reader.readAsText(file);
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

      {/* 2. RIGHT SIDEBAR: OPTIONS, STATUS & ACTIONS */}
      <div className="w-full md:w-80 lg:w-84 xl:w-88 h-full flex flex-col justify-between gap-2 overflow-y-auto pr-1 shrink-0">
        {/* Top: Size & Turn Status */}
        <div className="bg-white/95 rounded-2xl p-2.5 border-2 border-amber-300 shadow-sm flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 font-cartoon">棋盘路数：</span>
            <div className="flex gap-1">
              {([13, 19] as BoardSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => changeSize(sz)}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs transition ${
                    boardSize === sz
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                >
                  {sz}×{sz}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-amber-900 pt-1 border-t border-amber-100">
            <span>当前执子：</span>
            <span className="flex items-center gap-1.5 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
              <span
                className={`inline-block w-3.5 h-3.5 rounded-full border ${
                  boardState.turn === 'black' ? 'bg-black border-gray-700' : 'bg-white border-gray-300'
                }`}
              />
              <span>{boardState.turn === 'black' ? '黑方走' : '白方走'}</span>
            </span>
          </div>

          {statusMessage && (
            <div className="text-xs font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-300 animate-pop-in text-center">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Middle: Territory Estimation Card */}
        {territoryEstimate && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3 border-2 border-blue-300 text-xs font-bold animate-pop-in shrink-0">
            <div className="text-blue-950 font-black text-xs mb-1">📊 形势大致推算：</div>
            <div className="flex justify-between text-gray-800 py-0.5">
              <span>黑方目数 (含提子):</span>
              <span className="text-black font-black text-sm">{territoryEstimate.black} 目</span>
            </div>
            <div className="flex justify-between text-gray-800 py-0.5">
              <span>白方目数 (含提子):</span>
              <span className="text-gray-700 font-black text-sm">{territoryEstimate.white} 目</span>
            </div>
          </div>
        )}

        {/* Middle 2: Action Buttons */}
        <div className="bg-white/95 rounded-2xl p-2.5 border-2 border-amber-300 shadow-sm flex flex-col gap-1.5 shrink-0">
          <h3 className="font-black text-amber-950 text-xs font-cartoon">棋局操作</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleUndo}
              disabled={boardState.moveHistory.length === 0}
              className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs flex items-center justify-center gap-1 active:scale-95"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>悔棋一步</span>
            </button>

            <button
              onClick={handlePass}
              className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs flex items-center justify-center gap-1 active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>停一手(虚手)</span>
            </button>

            <button
              onClick={handleEstimateTerritory}
              className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-xl border border-blue-300 text-xs flex items-center justify-center gap-1 active:scale-95"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>形势判断</span>
            </button>

            <button
              onClick={() => changeSize(boardSize)}
              className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-900 font-bold rounded-xl border border-red-300 text-xs flex items-center justify-center gap-1 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>清空重摆</span>
            </button>
          </div>
        </div>

        {/* Bottom: SGF Import & Export */}
        <div className="bg-white/95 rounded-2xl p-2.5 border-2 border-amber-300 shadow-sm flex flex-col gap-1.5 shrink-0">
          <h3 className="font-black text-amber-950 text-xs font-cartoon">SGF 棋谱交换</h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={handleExportSGF}
              className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-300 text-xs flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>保存/导出棋谱 (.sgf)</span>
            </button>

            <label className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs flex items-center justify-center gap-1 cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>导入题谱 (.sgf)</span>
              <input type="file" accept=".sgf" onChange={handleImportSGF} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
