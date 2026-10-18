import React, { useState } from 'react';
import { Award, Star, CheckCircle, Share2, Sparkles, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundEngine } from '../engine/sound-engine';

interface WeeklyReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  grade?: string;
  weekNumber?: number;
  totalPuzzles?: number;
  completedPuzzles?: number;
  starsCount?: number;
  maxStars?: number;
}

export const WeeklyReportCardModal: React.FC<WeeklyReportCardModalProps> = ({
  isOpen,
  onClose,
  studentName = '森森',
  grade = '幼儿园大三班',
  weekNumber = 7,
  totalPuzzles = 6,
  completedPuzzles = 6,
  starsCount = 18,
  maxStars = 18,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const handleShare = () => {
    SoundEngine.playVictoryFanfare();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-pop-in select-none">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-yellow-400 overflow-hidden flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-200/80 hover:bg-amber-300 text-amber-900 flex items-center justify-center transition active:scale-95 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Decorative Border Header */}
        <div className="text-center relative">
          <div className="flex items-center justify-center gap-1.5 text-amber-600 font-cartoon font-black text-xs tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <span>少儿围棋道场 · 每周打卡作业证书</span>
            <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-cartoon mt-1 tracking-tight">
            🎖️ 围棋小棋圣荣誉卡
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
        </div>

        {/* Student Info Box */}
        <div className="bg-white/90 rounded-2xl p-3.5 border-2 border-amber-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-2xl shadow-inner border border-yellow-200">
              👦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-amber-950">{studentName}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  {grade}
                </span>
              </div>
              <p className="text-xs text-amber-700/80 font-bold mt-0.5">
                学棋工龄：1年 · 每周 3 次精练打卡
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-amber-600">第 {weekNumber} 周作业</span>
            <div className="text-[11px] text-gray-500 font-medium">{todayStr}</div>
          </div>
        </div>

        {/* Homework Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-amber-100/80 rounded-2xl p-2.5 border border-amber-300">
            <div className="text-[11px] font-bold text-amber-800">作业完成度</div>
            <div className="text-lg font-black text-amber-950 mt-0.5">
              {completedPuzzles} / {totalPuzzles} 题
            </div>
            <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-0.5 mt-0.5">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>全对通过</span>
            </div>
          </div>

          <div className="bg-yellow-100/80 rounded-2xl p-2.5 border border-yellow-300">
            <div className="text-[11px] font-bold text-amber-800">摘星总数</div>
            <div className="text-lg font-black text-yellow-700 mt-0.5 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 inline" />
              <span>{starsCount} / {maxStars}</span>
            </div>
            <div className="text-[10px] text-amber-700 font-bold mt-0.5">三星大满贯</div>
          </div>

          <div className="bg-emerald-100/80 rounded-2xl p-2.5 border border-emerald-300">
            <div className="text-[11px] font-bold text-emerald-800">实战杀棋能力</div>
            <div className="text-lg font-black text-emerald-900 mt-0.5">100 分</div>
            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">火眼金睛</div>
          </div>
        </div>

        {/* Master Skills Learned */}
        <div className="bg-white/80 rounded-2xl p-3 border border-amber-200">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>本周掌握的围棋本领：</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              '🎯 准确数出棋子气数',
              '⚡ 一路边线紧气杀白',
              '🚪 门吃与抱吃绝招',
              '🦅 鹤之巢中央拔子',
              '👁️ 辨别真假眼弱点',
            ].map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Teacher's Praise & Official Cute Seal */}
        <div className="relative bg-gradient-to-r from-orange-100/90 to-yellow-100/90 rounded-2xl p-3 border border-orange-300 flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-amber-950 font-cartoon">👨‍🏫 围棋老师评语：</div>
            <p className="text-xs font-bold text-amber-900 mt-1 leading-snug">
              “气数算得非常敏锐！面对白棋的弱点果断出手，手筋纯熟，继续加油冲段！”
            </p>
          </div>

          {/* Red Seal */}
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-600/80 text-red-600 flex flex-col items-center justify-center shrink-0 rotate-12 bg-red-50/50 shadow-xs">
            <Award className="w-4 h-4 text-red-600" />
            <span className="text-[9px] font-black leading-none mt-0.5">打卡认证</span>
            <span className="text-[8px] font-bold scale-90">优秀学员</span>
          </div>
        </div>

        {/* Action Buttons: Screenshot hint & Share button */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleShare}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-amber-950 font-black rounded-xl border-2 border-yellow-500 shadow-md flex items-center justify-center gap-2 active:scale-95 transition text-sm font-cartoon"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? '🎉 截图准备完毕！快发老师微信吧！' : '📸 截图打卡 · 发给围棋老师'}</span>
          </button>
          <div className="text-center text-[10px] text-amber-800/70 font-bold">
            💡 提示：可以用手机/平板截屏此荣誉卡，直接发送到围棋学员微信群打卡！
          </div>
        </div>
      </div>
    </div>
  );
};
