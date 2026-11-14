import { StageInfo } from '../types/go';
import { AUTHENTIC_101_PUZZLES_BANK } from './puzzles-101-bank';

export const ADVENTURE_STAGES: StageInfo[] = [
  // ==========================================
  // 第一章：双打吃绝杀·两头捉小鸡（两头叫吃，必得其一）
  // ==========================================
  {
    id: 1,
    title: '第一章：双打吃绝杀·两头捉小鸡',
    subtitle: '掌握两头叫吃绝招！一子落下，两处白棋同时只剩一口气，顾此失彼必得其一！',
    icon: '⚡',
    themeColor: 'from-amber-400 to-orange-500',
    puzzles: [
      {
        id: '1-1',
        title: '第1关：边线两头打（入门经典）',
        category: 'tactics',
        difficulty: 'easy',
        boardSize: 9,
        initialTurn: 'black',
        description: '两颗白棋孤立在边路，中间留着致命的大断点！黑棋落子在两颗白棋中间，同时叫吃两边！',
        voicePrompt: '两颗白棋中间有个大漏洞！黑棋插进去，同时叫吃两颗白子！',
        hint: '下在两颗白棋的正中间 (2, 1)！',
        initialBoard: {
          black: [
            { x: 1, y: 0 },
            { x: 3, y: 0 },
            { x: 1, y: 2 },
            { x: 3, y: 2 },
          ],
          white: [
            { x: 1, y: 1 },
            { x: 3, y: 1 },
          ],
        },
        solutionTree: {
          move: { x: 2, y: 1 },
          isCorrect: true,
          comment: '太漂亮了！一子落下，两边白棋同时只剩一口气，双打吃成功！',
        },
      },
      {
        id: '1-2',
        title: '第2关：角部虎口双叫吃（二路分断）',
        category: 'tactics',
        difficulty: 'easy',
        boardSize: 9,
        initialTurn: 'black',
        description: '角上两颗白棋看似连结，但角上二路交叉点正是要害！黑棋切进去，两边白棋全部被叫吃！',
        voicePrompt: '角上的两颗白棋没连牢！快下在二路交叉点，两边一起打吃！',
        hint: '点在角部二路交叉点 (1, 1)！',
        initialBoard: {
          black: [
            { x: 2, y: 0 },
            { x: 0, y: 2 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
          ],
          white: [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
          ],
        },
        solutionTree: {
          move: { x: 1, y: 1 },
          isCorrect: true,
          comment: '好棋！角部虎口双打吃，白棋救左边死上边，救上边死左边！',
        },
      },
      {
        id: '1-3',
        title: '第3关：冲断一间跳（中腹双叫吃）',
        category: 'tactics',
        difficulty: 'easy',
        boardSize: 9,
        initialTurn: 'black',
        description: '白棋一间跳看似轻灵，但两旁黑棋重兵把守！黑棋果断冲进中间断开，双打吃！',
        voicePrompt: '白棋一间跳中间有断点！冲进去切断它，两颗白棋同时叫吃！',
        hint: '直接冲断在 (3, 4)！',
        initialBoard: {
          black: [
            { x: 3, y: 2 },
            { x: 2, y: 3 },
            { x: 2, y: 5 },
            { x: 3, y: 6 },
          ],
          white: [
            { x: 3, y: 3 },
            { x: 3, y: 5 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 4 },
          isCorrect: true,
          comment: '一刀两断！中间冲断双打吃，白棋大阵瓦解！',
        },
      },
      {
        id: '1-4',
        title: '第4关：十字交叉双叫吃（手筋妙着）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 9,
        initialTurn: 'black',
        description: '白棋在三四路形成十字空隙，黑棋瞄准交叉点一锤定音，同时打吃上方和下方白子！',
        voicePrompt: '白棋的十字空隙正中间是个大破绽！下在中心点双打吃！',
        hint: '下在十字核心要害 (4, 4)！',
        initialBoard: {
          black: [
            { x: 4, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 6 },
            { x: 5, y: 5 },
          ],
          white: [
            { x: 4, y: 3 },
            { x: 4, y: 5 },
          ],
        },
        solutionTree: {
          move: { x: 4, y: 4 },
          isCorrect: true,
          comment: '正中要害！十字双打吃，黑棋必提其中一颗！',
        },
      },
      {
        id: '1-5',
        title: '第5关：悬崖一路边线双打（断其归路）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 9,
        initialTurn: 'black',
        description: '白棋两颗棋子退缩到一路死亡线边缘，黑棋从二路沉下去，直接压在悬崖口双打吃！',
        voicePrompt: '白棋退到了悬崖边！黑棋沉下一子，两颗白棋同时掉进悬崖！',
        hint: '沉下一路下在 (4, 0)！',
        initialBoard: {
          black: [
            { x: 2, y: 0 },
            { x: 6, y: 0 },
            { x: 4, y: 1 },
            { x: 4, y: 2 },
          ],
          white: [
            { x: 3, y: 0 },
            { x: 5, y: 0 },
          ],
        },
        solutionTree: {
          move: { x: 4, y: 0 },
          isCorrect: true,
          comment: '精准下沉！一路悬崖双打吃，两颗白棋都无路可退！',
        },
      },
      {
        id: '1-6',
        title: '第6关：虎口借力双打吃（经典手筋）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 9,
        initialTurn: 'black',
        description: '白棋两颗子企图包夹，但内部藏着软肋！黑棋勇敢刺入两子正中，左右同时叫吃！',
        voicePrompt: '勇敢刺入白棋软肋！一子双杀，左右白棋同时只剩一口气！',
        hint: '刺在关键软肋 (3, 3)！',
        initialBoard: {
          black: [
            { x: 1, y: 3 },
            { x: 2, y: 2 },
            { x: 5, y: 3 },
            { x: 4, y: 4 },
          ],
          white: [
            { x: 2, y: 3 },
            { x: 4, y: 3 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 3 },
          isCorrect: true,
          comment: '好一手借力双打！白棋阵型被从内部爆破，双打吃大胜！',
        },
      },
      {
        id: '1-7',
        title: '第7关：破开竹节双打吃（撕裂防御）',
        category: 'tactics',
        difficulty: 'hard',
        boardSize: 9,
        initialTurn: 'black',
        description: '白棋想结成竹节防守，但连接慢了半拍！黑棋快马加鞭卡入断点，双叫吃！',
        voicePrompt: '白棋竹节还没接好！快抢先卡在断点中间，同时叫吃！',
        hint: '卡在断点 (4, 3)！',
        initialBoard: {
          black: [
            { x: 3, y: 2 },
            { x: 2, y: 3 },
            { x: 5, y: 4 },
            { x: 6, y: 3 },
            { x: 4, y: 2 },
          ],
          white: [
            { x: 3, y: 3 },
            { x: 5, y: 3 },
          ],
        },
        solutionTree: {
          move: { x: 4, y: 3 },
          isCorrect: true,
          comment: '手起刀落！竹节未成身先死，双打吃一击制胜！',
        },
      },
      {
        id: '1-8',
        title: '第8关：连环双叫吃大绝杀',
        category: 'tactics',
        difficulty: 'hard',
        boardSize: 9,
        initialTurn: 'black',
        description: '白棋大龙看似庞大，但断点暴露无遗！黑棋精准点入要害，制造连环双打吃！',
        voicePrompt: '最后的大关卡！看清白棋最致命的断点，下在要害，连环双叫吃！',
        hint: '点在中心断点 (4, 4)！',
        initialBoard: {
          black: [
            { x: 4, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 6 },
            { x: 5, y: 5 },
          ],
          white: [
            { x: 4, y: 3 },
            { x: 4, y: 5 },
          ],
        },
        solutionTree: {
          move: { x: 4, y: 4 },
          isCorrect: true,
          comment: '🎉 完美通关！这就是最具杀伤力的双打吃绝技！',
        },
      },
    ],
  },

  // ==========================================
  // 第二章：五大吃子绝招（双打、门吃、抱吃、枷吃、征吃）
  // ==========================================
  {
    id: 2,
    title: '第二章：五大吃子绝招',
    subtitle: '掌握双打吃、门吃、抱吃、枷吃与征吃，成为吃子神童！',
    icon: '⚡',
    themeColor: 'from-amber-400 to-orange-500',
    puzzles: [
      {
        id: '2-1',
        title: '绝招一：双打吃（一石二鸟）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '两颗白棋近在咫尺但未连结，黑棋走哪一步能同时让两处白棋都只剩一口气？',
        hint: '找到两颗白棋正中间的交汇点 (3, 2)！',
        initialBoard: {
          black: [
            { x: 2, y: 2 },
            { x: 4, y: 2 },
          ],
          white: [
            { x: 3, y: 1 },
            { x: 3, y: 3 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 2 },
          isCorrect: true,
          comment: '双打吃成功！落子 (3, 2)，两边同时叫吃，必得其一！',
        },
      },
      {
        id: '2-2',
        title: '绝招二：关门吃（门吃）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋想向下逃跑，两旁黑棋宛如门柱守立，黑棋怎样把门锁死直接吃掉它？',
        hint: '挡在白棋想要冲出来的正前方 (3, 3)！',
        initialBoard: {
          black: [
            { x: 2, y: 3 },
            { x: 4, y: 3 },
            { x: 3, y: 1 },
          ],
          white: [{ x: 3, y: 2 }],
        },
        solutionTree: {
          move: { x: 3, y: 3 },
          isCorrect: true,
          comment: '砰！大门关上啦！白棋插翅难飞，被当场提吃！',
        },
      },
      {
        id: '2-3',
        title: '绝招三：怀中抱吃（抱吃）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋试图向己方援军突围，黑棋如何把它一把抱进怀里吃掉？',
        hint: '从外侧往自己棋子怀里赶，下在 (4, 3)！',
        initialBoard: {
          black: [
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 2, y: 3 },
          ],
          white: [{ x: 3, y: 3 }],
        },
        solutionTree: {
          move: { x: 4, y: 3 },
          isCorrect: true,
          comment: '温暖的抱吃！白棋往自己怀里一送，轻松收下！',
        },
      },
      {
        id: '2-4',
        title: '绝招四：天罗地网（枷吃）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '不用贴身紧逼，在远处飞张开一张大网，让白棋无论走哪边都逃不掉！',
        hint: '虚罩一手，下在斜飞位置 (4, 4)！',
        initialBoard: {
          black: [
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 5, y: 3 },
          ],
          white: [{ x: 3, y: 3 }],
        },
        solutionTree: {
          move: { x: 4, y: 4 },
          isCorrect: true,
          comment: '神奇的枷吃！如影随形的大网，白棋一动就会被撞死！',
        },
      },
      {
        id: '2-5',
        title: '绝招五：扭羊头（征吃）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋想冲出包围，黑棋通过连续之字形打吃，一步步把它赶到死路！',
        hint: '下在 (4, 3) 继续迎头痛击！',
        initialBoard: {
          black: [
            { x: 2, y: 2 },
            { x: 3, y: 1 },
          ],
          white: [{ x: 3, y: 2 }],
        },
        solutionTree: {
          move: { x: 4, y: 2 },
          isCorrect: true,
          comment: '漂亮的征子！连续打吃如排山倒海，白棋无处可逃！',
        },
      },
    ],
  },

  // ==========================================
  // 第三章：常用死活手筋（倒扑、接不归、金鸡独立、乌龟不出头）
  // ==========================================
  {
    id: 3,
    title: '第三章：常用死活手筋',
    subtitle: '掌握高阶手筋，用智慧以小博大！',
    icon: '🔮',
    themeColor: 'from-blue-400 to-indigo-600',
    puzzles: [
      {
        id: '3-1',
        title: '手筋一：投桃报李·倒扑绝杀',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '看似送给白棋一颗子吃，实际白棋一吃就只剩一口气，随后全军覆没！',
        hint: '勇敢投子！直接扑入虎口 (3, 3)！',
        initialBoard: {
          black: [
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 2, y: 4 },
            { x: 4, y: 2 },
            { x: 4, y: 4 },
          ],
          white: [
            { x: 3, y: 2 },
            { x: 4, y: 3 },
            { x: 3, y: 4 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 3 },
          isCorrect: true,
          comment: '神妙的倒扑！送一子换三子，白棋大崩盘！',
        },
      },
      {
        id: '3-2',
        title: '手筋二：救兵难至·接不归',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋的一队棋子虽然连在了一起，但气太少了，就算连回家也依然是一口气！',
        hint: '切断退路，下在 (2, 2)！',
        initialBoard: {
          black: [
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 3, y: 1 },
            { x: 4, y: 2 },
          ],
          white: [
            { x: 2, y: 1 },
            { x: 3, y: 2 },
          ],
        },
        solutionTree: {
          move: { x: 2, y: 2 },
          isCorrect: true,
          comment: '这就是接不归！接上也是死，白棋只能认输！',
        },
      },
      {
        id: '3-3',
        title: '手筋三：一夫当关·金鸡独立',
        category: 'tactics',
        difficulty: 'hard',
        boardSize: 13,
        initialTurn: 'black',
        description: '黑棋如金鸡耸立在中间，白棋两边都是不入气（禁着点），寸步难行！',
        hint: '下在最中央的要害 (3, 1)！',
        initialBoard: {
          black: [
            { x: 2, y: 2 },
            { x: 4, y: 2 },
            { x: 3, y: 3 },
          ],
          white: [
            { x: 2, y: 1 },
            { x: 4, y: 1 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 1 },
          isCorrect: true,
          comment: '金鸡独立！白棋左右都进不来，只能看着自己被灭！',
        },
      },
      {
        id: '3-4',
        title: '手筋四：封锁龟壳·乌龟不出头',
        category: 'tactics',
        difficulty: 'hard',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋想从边角伸出脑袋，黑棋在拐角一扳一压，像盖子一样盖住乌龟壳！',
        hint: '迎头狠狠压住 (2, 1)！',
        initialBoard: {
          black: [
            { x: 1, y: 2 },
            { x: 3, y: 2 },
            { x: 2, y: 3 },
          ],
          white: [
            { x: 2, y: 2 },
          ],
        },
        solutionTree: {
          move: { x: 2, y: 1 },
          isCorrect: true,
          comment: '乌龟不出头！白棋被牢牢锁死在壳里，彻底阵亡！',
        },
      },
    ],
  },

  // ==========================================
  // 第四章：对杀与比气（紧外气、公气不入、有眼杀无眼）
  // ==========================================
  {
    id: 4,
    title: '第四章：对杀与比气',
    subtitle: '双方互相包围比谁的气多，学会先紧外气的制胜秘诀！',
    icon: '⚔️',
    themeColor: 'from-red-400 to-rose-600',
    puzzles: [
      {
        id: '4-1',
        title: '对杀法则一：先紧外气',
        category: 'liberties',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '黑白两块棋陷入大对杀，口诀说“先紧外气后紧内”，黑棋先收哪口气？',
        hint: '从最外面收紧白棋的外气 (4, 2)！',
        initialBoard: {
          black: [
            { x: 1, y: 2 },
            { x: 2, y: 2 },
          ],
          white: [
            { x: 3, y: 2 },
          ],
        },
        solutionTree: {
          move: { x: 4, y: 2 },
          isCorrect: true,
          comment: '先紧外气！白棋立竿见影只剩一口气，对杀黑棋大胜！',
        },
      },
      {
        id: '4-2',
        title: '对杀法则二：公气不入',
        category: 'liberties',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '中间有公用的公气，谁先填公气谁就吃亏！黑棋该走外气还是公气？',
        hint: '千万别碰中间的公气，去紧白棋的外气 (5, 3)！',
        initialBoard: {
          black: [
            { x: 2, y: 3 },
            { x: 1, y: 3 },
          ],
          white: [
            { x: 4, y: 3 },
          ],
        },
        solutionTree: {
          move: { x: 5, y: 3 },
          isCorrect: true,
          comment: '公气不入！抢先收紧对手外气，对杀轻取白棋！',
        },
      },
      {
        id: '4-3',
        title: '对杀法则三：有眼杀无眼',
        category: 'liberties',
        difficulty: 'hard',
        boardSize: 13,
        initialTurn: 'black',
        description: '黑棋已经做好了一只真眼，白棋没有眼。有眼杀无眼，黑棋怎样锁定胜局？',
        hint: '下在 (4, 1) 紧紧压缩白棋！',
        initialBoard: {
          black: [
            { x: 1, y: 1 },
            { x: 2, y: 0 },
            { x: 3, y: 1 },
            { x: 2, y: 2 },
          ],
          white: [
            { x: 4, y: 2 },
            { x: 5, y: 1 },
          ],
        },
        solutionTree: {
          move: { x: 4, y: 1 },
          isCorrect: true,
          comment: '有眼杀无眼！大眼把白棋活活闷死，黑棋大获全胜！',
        },
      },
    ],
  },

  // ==========================================
  // 第五章：真眼与假眼（辨别假眼、破眼杀棋、做眼成活）
  // ==========================================
  {
    id: 5,
    title: '第五章：真眼与假眼',
    subtitle: '学会分辨哪些是真正的安全屋，哪些是一戳就破的假眼！',
    icon: '👑',
    themeColor: 'from-purple-400 to-pink-500',
    puzzles: [
      {
        id: '5-1',
        title: '火眼金睛：识别假眼破绽',
        category: 'life-and-death',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋看似在边角做成了眼睛，但两颗白棋气数已尽，黑棋走哪一步能拔除它证明这是假眼？',
        hint: '堵住最后一口边线气口 (3, 0)！',
        initialBoard: {
          black: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 1 },
          ],
          white: [
            { x: 2, y: 0 },
            { x: 2, y: 1 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 0 },
          isCorrect: true,
          comment: '一语道破！落子 (3, 0) 提掉白棋，假眼不攻自破！',
        },
      },
      {
        id: '5-2',
        title: '致命一击：破假眼杀棋',
        category: 'life-and-death',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋想靠这只假眼蒙混过关，四周已被黑棋团团包围，黑棋直接点入中心扑杀全歼！',
        hint: '果断下在正中心 (2, 2)！',
        initialBoard: {
          black: [
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 4, y: 2 },
            { x: 2, y: 3 },
          ],
          white: [
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 3, y: 2 },
          ],
        },
        solutionTree: {
          move: { x: 2, y: 2 },
          isCorrect: true,
          comment: '破眼成功！正中点入直接提吃三子，白棋彻底阵亡！',
        },
      },
      {
        id: '5-3',
        title: '筑造堡垒：做真眼成活',
        category: 'life-and-death',
        difficulty: 'hard',
        boardSize: 13,
        initialTurn: 'black',
        description: '黑棋需要把大眼屋子从中间隔开一堵墙，变成两间互不干扰的真眼安全屋！',
        hint: '找到居中分界要害 (3, 2)！',
        initialBoard: {
          black: [
            { x: 2, y: 1 },
            { x: 4, y: 1 },
            { x: 1, y: 2 },
            { x: 5, y: 2 },
            { x: 1, y: 3 },
            { x: 5, y: 3 },
            { x: 2, y: 4 },
            { x: 4, y: 4 },
          ],
          white: [
            { x: 0, y: 2 },
            { x: 0, y: 3 },
            { x: 6, y: 2 },
            { x: 6, y: 3 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 2 },
          isCorrect: true,
          comment: '两眼做活！神仙也杀不掉的铜墙铁壁诞生了！',
        },
      },
    ],
  },

  // ==========================================
  // 第六章：经典基础死活（直三、弯三、丁四要点）
  // ==========================================
  {
    id: 6,
    title: '第六章：经典基础死活',
    subtitle: '掌握直三、弯三与丁四的死活要点，棋力突飞猛进！',
    icon: '🏰',
    themeColor: 'from-cyan-400 to-blue-600',
    puzzles: [
      {
        id: '6-1',
        title: '经典死活一：直三抢要点',
        category: 'life-and-death',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '三个眼位连成一条直线，所谓“敌之要点即我之要点”，中间那一点到底在哪？',
        hint: '抢占直线最正中的黄金点 (3, 2)！',
        initialBoard: {
          black: [
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 4, y: 1 },
            { x: 1, y: 2 },
            { x: 5, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 4, y: 3 },
          ],
          white: [],
        },
        solutionTree: {
          move: { x: 3, y: 2 },
          isCorrect: true,
          comment: '直三要点！下在正中两眼自成，白棋彻底没招！',
        },
      },
      {
        id: '6-2',
        title: '经典死活二：弯三占天元',
        category: 'life-and-death',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '眼位弯成直角形，拐弯的那个交点就是生死存亡的枢纽！走哪里能活棋？',
        hint: '就在拐弯的直角中心 (2, 2)！',
        initialBoard: {
          black: [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 1, y: 2 },
            { x: 3, y: 2 },
            { x: 1, y: 3 },
            { x: 3, y: 3 },
            { x: 2, y: 4 },
          ],
          white: [],
        },
        solutionTree: {
          move: { x: 2, y: 2 },
          isCorrect: true,
          comment: '弯三点中！抢占拐弯枢纽，两只明亮的眼睛成型！',
        },
      },
      {
        id: '6-3',
        title: '经典死活三：丁四正中点',
        category: 'life-and-death',
        difficulty: 'hard',
        boardSize: 13,
        initialTurn: 'black',
        description: '四个空位排成“丁”字形，中间那颗连结三方的刀柄之点就是黑棋的生命线！',
        hint: '落子丁字心 (3, 2)，四方通达！',
        initialBoard: {
          black: [
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 4, y: 1 },
            { x: 1, y: 2 },
            { x: 5, y: 2 },
            { x: 2, y: 3 },
            { x: 4, y: 3 },
            { x: 3, y: 4 },
          ],
          white: [],
        },
        solutionTree: {
          move: { x: 3, y: 2 },
          isCorrect: true,
          comment: '丁四正中心！一子定乾坤，两只真眼完美锁住胜局！',
        },
      },
    ],
  },
  // ==========================================
  // 第七章：名师专项·真假断点与倒扑绝技
  // ==========================================
  {
    id: 7,
    title: '第七章：名师专项·真假断点与倒扑绝技',
    subtitle: '攻防与思维分水岭！看清气数辨认真假断点，掌握舍子诱敌的倒扑反杀与叫吃方向！',
    icon: '⚔️',
    themeColor: 'from-rose-500 to-amber-600',
    puzzles: AUTHENTIC_101_PUZZLES_BANK.filter((p) => p.id.startsWith('101-teacher-')),
  },
];
