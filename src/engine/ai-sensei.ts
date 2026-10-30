import { BoardState, Color, GameSettlementData, Point } from '../types/go';
import { GoCore } from './go-core';

/**
 * 双脑协同体系之【认知心智与名师复盘脑】(AI Sensei Cognitive & Review Engine)
 * 
 * 核心职责：
 * 1. 实时识别小选手的投机行为（如劣势/均势下连续停一手企图蒙混过关）
 * 2. 赋予高段位对手（龙尊业5、麒麟业4、战灵狐2-3段）真实的胜负师灵魂与威严
 * 3. 终局生成专业、生动、直击痛点的《名师复盘与实战锦囊》
 */
export class AiSensei {
  /**
   * 判定小选手是否在试图“投机停一手”
   */
  static isPassExploitAttempt(
    state: BoardState,
    playerColor: Color,
    aiColor: Color
  ): { isExploit: boolean; territoryDiff: number; reason: string } {
    const est = GoCore.estimateTerritory(state);
    const komi = state.size === 19 ? 7.5 : state.size === 13 ? 5.5 : 3.5;

    const playerScore = playerColor === 'black' ? est.black : est.white + komi;
    const aiScore = aiColor === 'black' ? est.black : est.white + komi;
    const diff = playerScore - aiScore;

    // 检查棋盘上是否还有明显的单官或未收区域（neutral 较大）
    const hasUnfinishedBorders = est.neutral >= (state.size === 19 ? 8 : 4);

    if (diff > 0 && (hasUnfinishedBorders || state.moveHistory.length < (state.size === 19 ? 180 : 80))) {
      return {
        isExploit: true,
        territoryDiff: diff,
        reason: '玩家领先后企图通过提前停一手跳过官子战斗强制结算',
      };
    }

    return {
      isExploit: false,
      territoryDiff: diff,
      reason: '正常对局终局或均势',
    };
  }

  /**
   * 生成 AI 面对小选手“停一手”时的霸气回击台词与心理施压
   */
  static getAntiPassSpeech(profileName: string, isDragon: boolean): string {
    const dragonQuotes = [
      '想连续停一手直接数钱？本尊大龙未死，这一记胜负手看你如何招架！',
      '黑棋大阵空隙尚存，居然敢停一手送我先手！看我直捣黄龙破你大本营！',
      '胜负尚未盖棺定论！业余5段的尊严，绝不允许无故休战，接招吧！',
      '哼，大意了！实战中把先手拱手让人，可是会丢掉大好江山的！',
      '大阵未稳便想停一手收工？看我深入腹地点火做活！',
    ];

    const generalQuotes = [
      '哈哈，你停一手等于白送我一步棋，看我趁机打入你的地盘！',
      '边角官子还没收完呢，我可不会轻易认输，看我的厉害！',
      '既然你把机会让给我，那我可就不客气啦，接我这一招！',
    ];

    const list = isDragon ? dragonQuotes : generalQuotes;
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * 生成极具名师风范的《大宗师终局复盘报告》
   */
  static generateSenseiReview(
    settlement: GameSettlementData,
    state: BoardState,
    playerColor: Color,
    profileName: string,
    hadPassExploit: boolean
  ): {
    headline: string;
    stageAnalysis: string[];
    criticalAdvice: string;
    tacticalScore: number;
  } {
    const isPlayerWin = settlement.winner === 'player';
    const totalMoves = settlement.totalMoves;
    const margin = Math.abs(settlement.playerTerritory - settlement.aiTerritory);

    const stageAnalysis: string[] = [];

    // 1. 布局分析
    if (totalMoves >= 30) {
      if (settlement.playerTerritory >= (state.size === 19 ? 70 : 30)) {
        stageAnalysis.push('🏰 【布局筑城】开局圈地意识极强，成功构筑了大模样根据地，奠定了雄厚的目数基础。');
      } else {
        stageAnalysis.push('⚔️ 【中盘纠缠】开局双方犬牙交错，将大量精力投入在肉搏接触战中。');
      }
    }

    // 2. 吃子与战斗分析
    if (settlement.playerCaptures > settlement.aiCaptures) {
      stageAnalysis.push(`🎯 【攻防敏锐】我方提子 ${settlement.playerCaptures} 颗，战术嗅觉灵敏，多次抓住对手气紧破绽！`);
    } else {
      stageAnalysis.push(`🛡️ 【以守代攻】虽然提子较少（${settlement.playerCaptures} 颗），但通过厚实围空保持了阵地完整。`);
    }

    // 3. 终局收官与停一手痛点诊断
    let criticalAdvice = '';
    let tacticalScore = 85;

    if (hadPassExploit) {
      tacticalScore = 78;
      criticalAdvice =
        '⚠️ 【名师警示·实战避坑】本局你在优势下使用了【停一手】跳过收官。在正规业余考段赛中，这属于极其危险的行为！对手绝不会放弃，会趁机在你的薄弱处打入三三或造劫。记准铁律：“官子收尽，边界封死”，堂堂正正赢棋才是大师风范！';
    } else if (isPlayerWin) {
      tacticalScore = margin >= 20 ? 98 : 92;
      criticalAdvice =
        `🌟 【名师寄语】恭喜战胜【${profileName}】！整盘棋沉着冷静，面对对手的绝境反扑防守坚如磐石，收官扎实，已初具冲段少年的大将之风！`;
    } else {
      tacticalScore = 80;
      criticalAdvice =
        `💪 【名师寄语】虽然此局惜败，但能与【${profileName}】鏖战 ${totalMoves} 手，展现出了非凡的韧性！建议多加强中盘做活与角部死活题练习，下次必定凯旋！`;
    }

    const headline = isPlayerWin
      ? (hadPassExploit ? '🎉 险胜通关·警惕收官隐患' : '🏆 完胜大捷·名师激赏')
      : '🥋 虽败犹荣·积累冲段功力';

    return {
      headline,
      stageAnalysis,
      criticalAdvice,
      tacticalScore,
    };
  }
}
