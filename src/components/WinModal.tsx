import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SoundEngine } from '../engine/sound-engine';
import { Star, RotateCcw, ArrowRight, Home } from 'lucide-react';

interface WinModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  stars?: number;
  onNext?: () => void;
  onRetry: () => void;
  onBackToMap: () => void;
  hasNext?: boolean;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  title,
  subtitle,
  stars = 3,
  onNext,
  onRetry,
  onBackToMap,
  hasNext = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      SoundEngine.playVictoryFanfare();
      // Burst celebratory colorful confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-pop-in">
      <div className="bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
        {/* Decorative corner stars */}
        <div className="absolute top-2 left-3 text-2xl animate-spin">✨</div>
        <div className="absolute top-2 right-3 text-2xl animate-spin">✨</div>

        {/* Stars reward row */}
        <div className="flex justify-center items-center gap-2 my-2">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transform transition-all duration-500 scale-125 ${
                starIdx <= stars
                  ? 'text-yellow-400 drop-shadow-md scale-110'
                  : 'text-gray-300 opacity-60'
              }`}
            >
              <Star className="w-10 h-10 fill-current" />
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-black text-amber-900 mt-3 font-cartoon">{title}</h2>
        <p className="text-sm font-bold text-amber-800 mt-2 px-2 bg-yellow-200/60 py-2 rounded-xl">
          {subtitle}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-6">
          {hasNext && onNext && (
            <button
              onClick={onNext}
              className="w-full py-3 px-4 btn-cartoon-yellow text-amber-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-md text-base"
            >
              <span>下一关挑战</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 py-2.5 px-3 bg-white hover:bg-gray-100 text-amber-900 font-bold rounded-2xl border-2 border-amber-300 flex items-center justify-center gap-1.5 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>再练一次</span>
            </button>

            <button
              onClick={onBackToMap}
              className="flex-1 py-2.5 px-3 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-2xl border-2 border-amber-400 flex items-center justify-center gap-1.5 text-sm"
            >
              <Home className="w-4 h-4" />
              <span>关卡地图</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
