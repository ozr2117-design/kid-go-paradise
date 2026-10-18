import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameSettlementData } from '../types/go';
import { SoundEngine } from '../engine/sound-engine';
import { Star, RotateCcw, Award, CheckCircle2, Swords, Home } from 'lucide-react';

interface SparringSettlementModalProps {
  isOpen: boolean;
  data: GameSettlementData | null;
  onPlayAgain: () => void;
  onCloseReview: () => void;
  onBackToMap: () => void;
}

export const SparringSettlementModal: React.FC<SparringSettlementModalProps> = ({
  isOpen,
  data,
  onPlayAgain,
  onCloseReview,
  onBackToMap,
}) => {
  useEffect(() => {
    if (isOpen && data) {
      if (data.winner === 'player') {
        SoundEngine.playVictoryFanfare();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const isPlayerWin = data.winner === 'player';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-pop-in">
      <div className="bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex justify-center items-center gap-1.5 mb-2">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transform transition-all duration-500 scale-125 ${
                starIdx <= data.stars
                  ? 'text-yellow-400 drop-shadow-md scale-110'
                  : 'text-gray-300 opacity-60'
              }`}
            >
              <Star className="w-9 h-9 fill-current" />
            </div>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-cartoon">
          {isPlayerWin ? '🎉 战报大捷·获胜！' : '👏 顽强拼搏·惜败'}
        </h2>

        {/* Honor Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black text-sm my-2 shadow">
          <Award className="w-4 h-4 text-amber-800" />
          <span>荣获称号：【{data.titleBadge}】</span>
        </div>

        {/* Reason Banner */}
        <p className="text-xs sm:text-sm font-bold text-amber-900 bg-yellow-200/60 p-2.5 rounded-2xl border border-yellow-300/80 mb-4">
          {data.winReason}
        </p>

        {/* Visual Statistics Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-center text-xs font-bold mb-5">
          {/* Captures Card */}
          <div className="bg-white/90 p-3 rounded-2xl border border-amber-300 shadow-sm flex flex-col justify-between">
            <span className="text-gray-600 flex items-center justify-center gap-1">
              <Swords className="w-3.5 h-3.5 text-orange-500" />
              <span>吃子战果</span>
            </span>
            <div className="flex items-center justify-around my-1.5">
              <div>
                <div className="text-2xl font-black text-emerald-600 font-cartoon">
                  {data.playerCaptures}
                </div>
                <div className="text-[10px] text-gray-500">我方提子</div>
              </div>
              <span className="text-gray-400 font-normal">VS</span>
              <div>
                <div className="text-2xl font-black text-orange-600 font-cartoon">
                  {data.aiCaptures}
                </div>
                <div className="text-[10px] text-gray-500">对手提子</div>
              </div>
            </div>
            {data.winRule === 'capture' && (
              <span className="text-[10px] text-amber-800 bg-amber-100 py-0.5 rounded-md">
                吃子决胜模式
              </span>
            )}
          </div>

          {/* Territory Card */}
          <div className="bg-white/90 p-3 rounded-2xl border border-amber-300 shadow-sm flex flex-col justify-between">
            <span className="text-gray-600 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              <span>围地目数</span>
            </span>
            <div className="flex items-center justify-around my-1.5">
              <div>
                <div className="text-2xl font-black text-blue-600 font-cartoon">
                  {data.playerTerritory.toFixed(1)}
                </div>
                <div className="text-[10px] text-gray-500">我方总目</div>
              </div>
              <span className="text-gray-400 font-normal">VS</span>
              <div>
                <div className="text-2xl font-black text-purple-600 font-cartoon">
                  {data.aiTerritory.toFixed(1)}
                </div>
                <div className="text-[10px] text-gray-500">对手总目</div>
              </div>
            </div>
            <span className="text-[10px] text-gray-500">共激战 {data.totalMoves} 手棋</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-4 btn-cartoon-yellow text-amber-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-md text-base"
          >
            <RotateCcw className="w-5 h-5" />
            <span>再来一局</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onCloseReview}
              className="flex-1 py-2.5 px-3 bg-white hover:bg-gray-100 text-amber-900 font-bold rounded-2xl border-2 border-amber-300 text-xs sm:text-sm"
            >
              <span>查看棋盘复盘</span>
            </button>

            <button
              onClick={onBackToMap}
              className="flex-1 py-2.5 px-3 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-2xl border-2 border-amber-400 text-xs sm:text-sm flex items-center justify-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span>返回主页</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
