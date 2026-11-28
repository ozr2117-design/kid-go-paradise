import { PuzzleData } from '../types/go';
import { ADVENTURE_STAGES } from './stages';
import { AUTHENTIC_101_PUZZLES_BANK } from './puzzles-101-bank';

// Only keep intermediate/advanced stages (Stage 3+: tesuji, liberties, eyes, life-and-death, teacher cuts).
// Basic capture stages (0: pre-match edge, 1: double atari, 2: basic 5 captures) are retired from daily drills.
const FOCUSED_STAGE_PUZZLES: PuzzleData[] = ADVENTURE_STAGES
  .filter((stage) => stage.id >= 3)
  .flatMap((stage) => stage.puzzles);

const FOCUSED_101_PUZZLES: PuzzleData[] = AUTHENTIC_101_PUZZLES_BANK.filter(
  (p) => p.category !== 'capture' || p.id.startsWith('101-teacher-')
);

// Additional classic 10K-5K curated life-and-death & tesuji puzzles
export const SUPPLEMENTARY_DAILY_PUZZLES: PuzzleData[] = [
  // 1. 经典角部死活：一路立做活（角上一子顶三子）
  {
    id: 'daily-c1',
    title: '一路立下·扎实做活',
    category: 'life-and-death',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '黑棋在角落被白棋包围！关键时刻，下在角上一路沉下去（一路立），利用棋盘边线做活！',
    voicePrompt: '角落有悬崖！黑棋沉着往一路立下一子，两只真眼稳稳做成！',
    hint: '往一路下沉立在 (1, 0)，白棋两边无法入气！',
    initialBoard: {
      black: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
      ],
      white: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 3, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 0 },
      isCorrect: true,
      comment: '太棒了！角上一路立，白棋两边都不能入气，黑棋顺利做活！',
    },
  },

  // 2. 经典死活：点杀刀五急所
  {
    id: 'daily-c2',
    title: '刀五急所·直刺要害',
    category: 'life-and-death',
    difficulty: 'hard',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋的大眼形像一把菜刀（刀五）！中间最关键的刀把位置是死活要害，黑棋抢先点杀进去！',
    voicePrompt: '白棋的大眼像把小菜刀！快抢占最关键的刀把要害点！',
    hint: '正中点在 (2, 2)，破坏白棋成活！',
    initialBoard: {
      black: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 1 },
        { x: 4, y: 1 },
        { x: 0, y: 2 },
        { x: 4, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
      ],
      white: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 1, y: 2 },
        { x: 3, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 2 },
      isCorrect: true,
      comment: '精准命中！刀五急所被占领，白棋再也无法做出两只活眼！',
    },
  },

  // 3. 经典手筋：滚打包收
  {
    id: 'daily-c3',
    title: '滚打包收·包成大汤圆',
    category: 'tactics',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋形状散乱，黑棋先断打，逼白棋提子，然后连续叫吃，把它打成一团死肉！',
    voicePrompt: '果断断打！逼它走成重重的死疙瘩！',
    hint: '在 (3, 2) 果断分断打吃！',
    initialBoard: {
      black: [
        { x: 2, y: 1 },
        { x: 4, y: 1 },
        { x: 2, y: 3 },
        { x: 4, y: 3 },
      ],
      white: [
        { x: 3, y: 1 },
        { x: 2, y: 2 },
        { x: 4, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 2 },
      isCorrect: true,
      comment: '绝妙断打！白棋被分断成两团，陷入滚打包收的绝境！',
    },
  },

  // 4. 对杀比气：先紧外气
  {
    id: 'daily-c4',
    title: '对杀秘诀·沉着紧外气',
    category: 'liberties',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '双方都在对杀！千万不要急着往公气里撞，从外围收紧白棋的外气！',
    voicePrompt: '先紧外气是铁律！从外围收紧它！',
    hint: '下在 (4, 1) 收紧白棋外气！',
    initialBoard: {
      black: [
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
      white: [
        { x: 3, y: 2 },
        { x: 4, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 5, y: 2 },
      isCorrect: true,
      comment: '先紧外气！白棋只剩一口气，下回合必死无疑！',
    },
  },

  // 5. 破假眼手筋：扑入破眼
  {
    id: 'daily-c5',
    title: '弃子陷阱·扑入破假眼',
    category: 'life-and-death',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋眼看就要做成两只眼了！黑棋送一颗子进虎口“扑”，瞬间把它的眼变成假眼！',
    voicePrompt: '大胆送进去一颗！破掉它的假眼！',
    hint: '下在 (2, 2) 扑进去破眼！',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 1, y: 3 },
        { x: 3, y: 3 },
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
      comment: '妙手扑入！白棋虎口被破，假眼一戳即破！',
    },
  },

  // 6. 夹吃手筋
  {
    id: 'daily-c6',
    title: '两头夹击·神妙夹吃',
    category: 'tactics',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋想从边线滑走，黑棋左右两面夹住它，让它动弹不得！',
    voicePrompt: '在边线左右夹攻，让白棋寸步难行！',
    hint: '在 (2, 0) 夹住白棋！',
    initialBoard: {
      black: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 3, y: 1 },
      ],
      white: [
        { x: 1, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 0 },
      isCorrect: true,
      comment: '精彩夹吃！白棋被夹在边路，怎么逃都是撞气！',
    },
  },

  // 7. 胀死牛：接不归绝杀
  {
    id: 'daily-c7',
    title: '胀死牛·吃大亏的反杀',
    category: 'life-and-death',
    difficulty: 'hard',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋以为连上就能活，但一连上自己反而没气了！黑棋果断紧气！',
    voicePrompt: '逼它把肚子吃得太饱，最后一口气直接憋死！',
    hint: '在 (2, 1) 叫吃要害！',
    initialBoard: {
      black: [
        { x: 1, y: 0 },
        { x: 3, y: 0 },
        { x: 1, y: 2 },
        { x: 3, y: 2 },
      ],
      white: [
        { x: 2, y: 0 },
        { x: 2, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 1 },
      isCorrect: true,
      comment: '胀死牛！白棋两子被紧紧卡在中间，插翅难飞！',
    },
  },

  // 8. 倒脱靴启蒙：断打回提
  {
    id: 'daily-c8',
    title: '神奇回提·倒脱靴雏形',
    category: 'life-and-death',
    difficulty: 'hard',
    boardSize: 9,
    initialTurn: 'black',
    description: '送给白棋吃四颗子，等白棋提掉之后，黑棋立马反手断打回提！',
    voicePrompt: '先送它吃，等它提完我们再反身一刀断打！',
    hint: '在 (1, 1) 反手断打！',
    initialBoard: {
      black: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 2 },
        { x: 2, y: 2 },
      ],
      white: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 2, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 1 },
      isCorrect: true,
      comment: '倒脱靴回提！出其不意反戈一击，白棋全军覆没！',
    },
  },

  // 9. 直四分眼做活
  {
    id: 'daily-c9',
    title: '直四分眼·两眼成活',
    category: 'life-and-death',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '黑棋的大眼形排成一条直四！抢占中间关键点，一分为二，做成两只明亮的大真眼！',
    voicePrompt: '直四两边通！抢占中间核心点，分成两只活眼！',
    hint: '在 (2, 1) 点分两半！',
    initialBoard: {
      black: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
        { x: 0, y: 1 },
        { x: 5, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
      ],
      white: [],
    },
    solutionTree: {
      move: { x: 2, y: 1 },
      isCorrect: true,
      comment: '直四分眼中！两只大真眼稳稳做成，黑棋净活！',
    },
  },

  // 10. 跨断分断要害
  {
    id: 'daily-c10',
    title: '跨断要害·分断对手',
    category: 'tactics',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋两颗子连得不结实！黑棋瞅准中间缝隙一刀切入，分断白棋！',
    voicePrompt: '看准白棋的虚弱缝隙，一刀跨断切开它！',
    hint: '在 (3, 2) 跨断切入！',
    initialBoard: {
      black: [
        { x: 2, y: 1 },
        { x: 4, y: 3 },
      ],
      white: [
        { x: 3, y: 1 },
        { x: 2, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 2 },
      isCorrect: true,
      comment: '跨断漂亮！白棋联络被彻底切断，两边不能相顾！',
    },
  },

  // 11. 虎口点杀破眼
  {
    id: 'daily-c11',
    title: '虎口点眼·致命一击',
    category: 'life-and-death',
    difficulty: 'hard',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋想在角落做眼，黑棋抢先点入白棋虎口，破坏白棋眼位！',
    voicePrompt: '直插白棋心脏！抢先点入虎口破眼！',
    hint: '在 (1, 1) 直点要害！',
    initialBoard: {
      black: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 1 },
        { x: 2, y: 2 },
      ],
      white: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 1 },
      isCorrect: true,
      comment: '虎口点杀！正中要害，白棋眼形瞬间化为乌有！',
    },
  },

  // 12. 有眼杀无眼
  {
    id: 'daily-c12',
    title: '有眼杀无眼·大破僵局',
    category: 'liberties',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '双方都在对杀！黑棋有一只完整的真眼，白棋没有眼！黑棋沉着收白棋外气！',
    voicePrompt: '有眼杀无眼是铁律！从外围收紧白棋的外气！',
    hint: '在 (4, 1) 收白棋外气！',
    initialBoard: {
      black: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ],
      white: [
        { x: 2, y: 0 },
        { x: 3, y: 1 },
        { x: 2, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 1 },
      isCorrect: true,
      comment: '有眼杀无眼！白棋气短无法入公气，黑棋大获全胜！',
    },
  },

  // 13. 课上实战真题 1：角部分断吃
  {
    id: 'daily-cut-1',
    title: '课上真题·角部分断吃',
    category: 'tactics',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '【昨日课后真题第1题】白棋大龙在角上露出致命断点！找准分断白棋的关键断点，一子落下直接提吃带△的三颗白棋！',
    voicePrompt: '看准白棋连接的断裂口！下在二三断点，一口气提掉带三角的三颗白棋！',
    hint: '找到断点 (2, 3)，分断白棋并完成叫吃提子！',
    initialBoard: {
      black: [
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 2, y: 6 },
        { x: 3, y: 6 },
        { x: 4, y: 5 },
        { x: 4, y: 4 },
        { x: 4, y: 3 },
        { x: 3, y: 3 },
      ],
      white: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 3 },
      isCorrect: true,
      comment: '漂亮！精准切断白棋大龙，三颗白棋瞬间被黑棋全部提吃！',
    },
  },

  // 14. 课上实战真题 2：边路横排冲断吃
  {
    id: 'daily-cut-2',
    title: '课上真题·边路横排冲断吃',
    category: 'tactics',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '【昨日课后真题第2题】上方黑棋筑起高墙！中间白棋三子想往外连接，果断冲入断点，直接提吃整排白棋！',
    voicePrompt: '白棋横排三子露出断点！果断冲下去分断，整排白棋全部吃掉！',
    hint: '下在断点 (4, 3)，封锁白棋外逃通道！',
    initialBoard: {
      black: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 5, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 5, y: 2 },
      ],
      white: [
        { x: 4, y: 4 },
        { x: 5, y: 3 },
        { x: 5, y: 4 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 3 },
      isCorrect: true,
      comment: '神机妙算！下在断点切断白棋，横排三颗白子全部落入囊中！',
    },
  },

  // 15. 课上实战真题 3：长龙关节分断吃
  {
    id: 'daily-cut-3',
    title: '课上真题·长龙关节分断吃',
    category: 'tactics',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '【昨日课后真题第3题】黑棋像长城一样包围白棋大龙！白棋关节连接处出现致命破绽，一子断开，整条白龙瞬间被提吃！',
    voicePrompt: '白棋大长龙关节裂开啦！一子直刺断点，四颗白棋大丰收！',
    hint: '刺入断点 (4, 2)，斩断白棋大龙与救兵的连接！',
    initialBoard: {
      black: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 4, y: 4 },
        { x: 5, y: 3 },
      ],
      white: [
        { x: 5, y: 2 },
        { x: 6, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 3 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 2 },
      isCorrect: true,
      comment: '太厉害了！长龙关节被黑棋精准切断，四颗白棋束手就擒！',
    },
  },

  // 16. 课上实战真题 4：腹部扭断一步杀
  {
    id: 'daily-cut-4',
    title: '课上真题·腹部扭断一步杀',
    category: 'tactics',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '【昨日课后真题第4题】腹部扭断大作战！识破白棋的假连接，下在最关键的断点，吃掉带△的白子！',
    voicePrompt: '扭羊头不如先找断点！下在十字交叉口，直接提吃两颗白棋！',
    hint: '下在十字断点 (3, 2)，直接提吃两颗白子！',
    initialBoard: {
      black: [
        { x: 2, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 4, y: 3 },
      ],
      white: [
        { x: 4, y: 2 },
        { x: 4, y: 1 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 2 },
      isCorrect: true,
      comment: '一击必杀！下在十字断点，直接提吃两颗要子！',
    },
  },

  // 17. 课上实战真题 5：双壁夹攻冲断吃
  {
    id: 'daily-cut-5',
    title: '课上真题·双壁夹攻冲断吃',
    category: 'tactics',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '【昨日课后真题第5题】白棋三颗子冲进黑棋夹壁深处！下在头部门户断点，彻底关门封死，整排白棋束手就擒！',
    voicePrompt: '关门大吉！在两堵黑墙正中间断下去，三颗白棋立刻全部提吃！',
    hint: '在 (2, 2) 正面分断，切断白棋退路！',
    initialBoard: {
      black: [
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 2, y: 6 },
      ],
      white: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 2, y: 5 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 2 },
      isCorrect: true,
      comment: '关门捉贼！断点一封，中间三颗白棋插翅难逃！',
    },
  },

  // 18. 课上实战真题 6：角部虎口致命分断
  {
    id: 'daily-cut-6',
    title: '课上真题·角部虎口致命分断',
    category: 'tactics',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '【昨日课后真题第6题】角部星位经典常型！白棋连接薄弱，黑棋果断刺入断点，角上带△白子全部被吃！',
    voicePrompt: '致命断点现身！刺入白棋虎口软肋，把包围圈里的两颗白棋提起来！',
    hint: '点在 (2, 6) 致命断点上！',
    initialBoard: {
      black: [
        { x: 2, y: 4 },
        { x: 1, y: 5 },
        { x: 0, y: 6 },
        { x: 1, y: 7 },
        { x: 3, y: 7 },
        { x: 2, y: 8 },
        { x: 3, y: 5 },
      ],
      white: [
        { x: 3, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 1, y: 6 },
        { x: 2, y: 5 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 6 },
      isCorrect: true,
      comment: '太神勇了！刺破虎口软肋，包围圈内的白子全部被吃！',
    },
  },
];

// Combine focused puzzle sources (basic capture drills retired)
export const FULL_PUZZLE_BANK: PuzzleData[] = [
  ...FOCUSED_101_PUZZLES,
  ...FOCUSED_STAGE_PUZZLES,
  ...SUPPLEMENTARY_DAILY_PUZZLES,
];

export const DAILY_TARGET_COUNT = 8;

export interface DayThemeInfo {
  dayName: string;
  themeTitle: string;
  subtitle: string;
  targetCategory: string;
  icon: string;
}

export const WEEKLY_THEMES: Record<number, DayThemeInfo> = {
  0: { dayName: '周日', themeTitle: '实战综合特训·做活与杀气', subtitle: '真假眼、死活与断点综合演练，稳步冲向 15K！', targetCategory: 'mixed', icon: '🐲' },
  1: { dayName: '周一', themeTitle: '真假眼与两眼做活', subtitle: '练就火眼金睛，分辨真眼假眼，两眼稳稳做活！', targetCategory: 'life-and-death', icon: '👁️' },
  2: { dayName: '周二', themeTitle: '常用手筋与真假断点', subtitle: '倒扑、接不归、看清真假断点，以小博大！', targetCategory: 'tactics', icon: '⚡' },
  3: { dayName: '周三', themeTitle: '边角经典死活·直三弯三丁四', subtitle: '金角银边，一眼看穿死活急所要点！', targetCategory: 'life-and-death', icon: '🏰' },
  4: { dayName: '周四', themeTitle: '对杀法则·比气与先紧外气', subtitle: '双方包围比气多，不入公气先收外气！', targetCategory: 'liberties', icon: '⚔️' },
  5: { dayName: '周五', themeTitle: '分断与连接·扎实筑墙', subtitle: '切断对手薄弱断点，守护自家大龙连接！', targetCategory: 'tactics', icon: '🧱' },
  6: { dayName: '周六', themeTitle: '周末死活与对杀综合关', subtitle: '每日 8 题精准热身，再战一盘 AI 全盘！', targetCategory: 'mixed', icon: '🎯' },
};

export interface DailyCategorySummaryItem {
  label: string;
  total: number;
  cleanCount: number;
  mistakeCount: number;
}

export interface DailyPracticeSummary {
  items: DailyCategorySummaryItem[];
  headline: string;
  advice: string;
}

export function getPuzzleCategoryLabel(puzzle: PuzzleData): string {
  if (puzzle.id.startsWith('101-teacher-') || puzzle.id.startsWith('daily-cut-')) {
    return '真假断点与切断';
  }
  if (puzzle.category === 'life-and-death') {
    return '真假眼与做活死活';
  }
  if (puzzle.category === 'liberties') {
    return '对杀与比气';
  }
  return '常用手筋与攻防';
}

export function summarizeDailyPractice(
  puzzles: PuzzleData[],
  mistakeIds: string[]
): DailyPracticeSummary {
  const mistakeSet = new Set(mistakeIds);
  const map = new Map<string, DailyCategorySummaryItem>();

  for (const p of puzzles) {
    const label = getPuzzleCategoryLabel(p);
    const existing = map.get(label) || { label, total: 0, cleanCount: 0, mistakeCount: 0 };
    existing.total += 1;
    if (mistakeSet.has(p.id)) {
      existing.mistakeCount += 1;
    } else {
      existing.cleanCount += 1;
    }
    map.set(label, existing);
  }

  const items = Array.from(map.values()).sort((a, b) => b.total - a.total);
  const weakItems = items.filter((i) => i.mistakeCount > 0).sort((a, b) => b.mistakeCount - a.mistakeCount);

  if (weakItems.length === 0) {
    return {
      items,
      headline: `今日 ${puzzles.length} 题全部一次过关！`,
      advice: '手感非常火热，直接进入第 2 步去 AI 全盘实战里检验吧！',
    };
  }

  const weakText = weakItems.map((w) => `「${w.label}」`).join('、');
  return {
    items,
    headline: `今日 ${puzzles.length} 题全部拿下！`,
    advice: `其中 ${weakText} 遇到一点小挑战，明天继续巩固会更稳！`,
  };
}

export interface DailyPipelineState {
  date: string;
  step1SolvedIds: string[];
  step1MistakeIds: string[];
  step1ReviewClearedIds: string[];
  step1Completed: boolean;
  step2Completed: boolean;
  step2GamesCount: number;
}

interface MistakeQueueEntry {
  puzzleId: string;
  addedDate: string; // YYYY-MM-DD
  missCount: number;
}

const DAILY_PIPELINE_KEY = 'weiqi_daily_pipeline_v1';
const MISTAKE_QUEUE_KEY = 'weiqi_mistake_queue_v1';
const MAX_REVENGE_PER_DAY = 3;

export function getTodayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadMistakeQueue(): MistakeQueueEntry[] {
  try {
    const raw = localStorage.getItem(MISTAKE_QUEUE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

function saveMistakeQueue(entries: MistakeQueueEntry[]): void {
  try {
    localStorage.setItem(MISTAKE_QUEUE_KEY, JSON.stringify(entries.slice(0, 40)));
  } catch {
    // ignore storage errors
  }
}

export function enqueueMistakeForNextDay(puzzleId: string, today: string = getTodayDateStr()): void {
  const queue = loadMistakeQueue();
  const idx = queue.findIndex((e) => e.puzzleId === puzzleId);
  if (idx !== -1) {
    queue[idx] = {
      ...queue[idx],
      addedDate: today,
      missCount: queue[idx].missCount + 1,
    };
  } else {
    queue.unshift({ puzzleId, addedDate: today, missCount: 1 });
  }
  saveMistakeQueue(queue);
}

export function graduateMistakeFromQueue(puzzleId: string): void {
  const queue = loadMistakeQueue();
  const next = queue.filter((e) => e.puzzleId !== puzzleId);
  if (next.length !== queue.length) {
    saveMistakeQueue(next);
  }
}

export function getDueRevengePuzzleIds(
  today: string = getTodayDateStr(),
  maxCount: number = MAX_REVENGE_PER_DAY
): string[] {
  const queue = loadMistakeQueue();
  return queue
    .filter((e) => e.addedDate < today)
    .slice(0, maxCount)
    .map((e) => e.puzzleId);
}

export function loadDailyPipeline(): DailyPipelineState {
  const today = getTodayDateStr();
  try {
    const raw = localStorage.getItem(DAILY_PIPELINE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyPipelineState;
      if (parsed && parsed.date === today) {
        return {
          date: today,
          step1SolvedIds: Array.isArray(parsed.step1SolvedIds) ? parsed.step1SolvedIds : [],
          step1MistakeIds: Array.isArray(parsed.step1MistakeIds) ? parsed.step1MistakeIds : [],
          step1ReviewClearedIds: Array.isArray(parsed.step1ReviewClearedIds)
            ? parsed.step1ReviewClearedIds
            : [],
          step1Completed: !!parsed.step1Completed,
          step2Completed: !!parsed.step2Completed,
          step2GamesCount: typeof parsed.step2GamesCount === 'number' ? parsed.step2GamesCount : 0,
        };
      }
    }
  } catch {
    // ignore storage errors
  }
  return {
    date: today,
    step1SolvedIds: [],
    step1MistakeIds: [],
    step1ReviewClearedIds: [],
    step1Completed: false,
    step2Completed: false,
    step2GamesCount: 0,
  };
}

export function saveDailyPipeline(state: DailyPipelineState): DailyPipelineState {
  try {
    localStorage.setItem(DAILY_PIPELINE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
  return state;
}

export function recordPipelinePuzzleSolve(
  puzzleId: string,
  targetCount: number = DAILY_TARGET_COUNT
): {
  state: DailyPipelineState;
  isNewlyCompletedStep1: boolean;
  enteringImmediateReview: boolean;
} {
  const cur = loadDailyPipeline();
  const wasCompleted = cur.step1Completed;
  if (!cur.step1SolvedIds.includes(puzzleId)) {
    cur.step1SolvedIds = [...cur.step1SolvedIds, puzzleId];
  }

  let enteringImmediateReview = false;
  if (cur.step1SolvedIds.length >= targetCount) {
    const pendingReview = cur.step1MistakeIds.filter(
      (id) => !cur.step1ReviewClearedIds.includes(id)
    );
    if (pendingReview.length === 0) {
      cur.step1Completed = true;
    } else {
      enteringImmediateReview = true;
    }
  }
  saveDailyPipeline(cur);
  return {
    state: cur,
    isNewlyCompletedStep1: !wasCompleted && cur.step1Completed,
    enteringImmediateReview,
  };
}

export function recordPipelineReviewSolve(
  puzzleId: string,
  targetCount: number = DAILY_TARGET_COUNT
): {
  state: DailyPipelineState;
  isNewlyCompletedStep1: boolean;
} {
  const cur = loadDailyPipeline();
  const wasCompleted = cur.step1Completed;
  if (!cur.step1ReviewClearedIds.includes(puzzleId)) {
    cur.step1ReviewClearedIds = [...cur.step1ReviewClearedIds, puzzleId];
  }
  const pendingReview = cur.step1MistakeIds.filter(
    (id) => !cur.step1ReviewClearedIds.includes(id)
  );
  if (cur.step1SolvedIds.length >= targetCount && pendingReview.length === 0) {
    cur.step1Completed = true;
  }
  saveDailyPipeline(cur);
  return {
    state: cur,
    isNewlyCompletedStep1: !wasCompleted && cur.step1Completed,
  };
}

export function recordPipelinePuzzleMistake(puzzleId: string): DailyPipelineState {
  const cur = loadDailyPipeline();
  if (!cur.step1MistakeIds.includes(puzzleId)) {
    cur.step1MistakeIds = [...cur.step1MistakeIds, puzzleId];
    saveDailyPipeline(cur);
  }
  // Also persist into cross-day mistake queue so tomorrow's drill mixes it in
  enqueueMistakeForNextDay(puzzleId, cur.date);
  return cur;
}

export function recordPipelineStep2GameComplete(): {
  state: DailyPipelineState;
  isNewlyCompletedAll: boolean;
} {
  const cur = loadDailyPipeline();
  const wasAllDone = cur.step1Completed && cur.step2Completed;
  cur.step2GamesCount += 1;
  cur.step2Completed = true;
  saveDailyPipeline(cur);
  return {
    state: cur,
    isNewlyCompletedAll: !wasAllDone && cur.step1Completed && cur.step2Completed,
  };
}

function selectDailyPuzzles(
  count: number,
  dateStr?: string,
  includeRevenge: boolean = false
): { theme: DayThemeInfo; puzzles: PuzzleData[]; revengeIds: string[] } {
  const date = dateStr ? new Date(dateStr) : new Date();
  const dayOfWeek = date.getDay(); // 0 - 6
  const theme = WEEKLY_THEMES[dayOfWeek];
  const todayStr = dateStr || getTodayDateStr();

  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Split into 3 balanced buckets so every day covers eyes/life-and-death, liberties/tesuji, and teacher cuts
  const lifeAndDeath = FULL_PUZZLE_BANK.filter((p) => p.category === 'life-and-death');
  const liberties = FULL_PUZZLE_BANK.filter((p) => p.category === 'liberties');
  const teacherAndTactics = FULL_PUZZLE_BANK.filter(
    (p) => p.category !== 'life-and-death' && p.category !== 'liberties'
  );

  const rotLD = rotateArray(lifeAndDeath, (dayOfYear * 2) % Math.max(1, lifeAndDeath.length));
  const rotLib = rotateArray(liberties, dayOfYear % Math.max(1, liberties.length));
  const rotTac = rotateArray(teacherAndTactics, (dayOfYear * 3) % Math.max(1, teacherAndTactics.length));

  // Interleave according to today's theme for balanced variety
  const pool: PuzzleData[] = [];
  const maxLen = Math.max(rotLD.length, rotLib.length, rotTac.length);
  for (let i = 0; i < maxLen; i++) {
    if (theme.targetCategory === 'liberties') {
      if (rotLib[i]) pool.push(rotLib[i]);
      if (rotLD[i]) pool.push(rotLD[i]);
      if (rotTac[i]) pool.push(rotTac[i]);
    } else if (theme.targetCategory === 'tactics') {
      if (rotTac[i]) pool.push(rotTac[i]);
      if (rotLD[i]) pool.push(rotLD[i]);
      if (rotLib[i]) pool.push(rotLib[i]);
    } else {
      if (rotLD[i]) pool.push(rotLD[i]);
      if (rotTac[i]) pool.push(rotTac[i]);
      if (rotLib[i]) pool.push(rotLib[i]);
    }
  }

  // Mix up to 3 cross-day revenge puzzles from previous days' mistakes
  const revengePuzzles: PuzzleData[] = [];
  const revengeIds: string[] = [];
  const seenIds = new Set<string>();

  if (includeRevenge) {
    const dueIds = getDueRevengePuzzleIds(todayStr, MAX_REVENGE_PER_DAY);
    for (const rid of dueIds) {
      const found = FULL_PUZZLE_BANK.find((p) => p.id === rid);
      if (found && !seenIds.has(found.id)) {
        seenIds.add(found.id);
        revengePuzzles.push(found);
        revengeIds.push(found.id);
      }
    }
  }

  const freshNeeded = Math.max(0, count - revengePuzzles.length);
  const freshPuzzles: PuzzleData[] = [];
  for (const p of pool) {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      freshPuzzles.push(p);
      if (freshPuzzles.length === freshNeeded) break;
    }
  }

  // Interleave revenge puzzles among fresh puzzles (so they feel naturally mixed in)
  const selected: PuzzleData[] = [];
  let rIdx = 0;
  let fIdx = 0;
  for (let slot = 0; slot < count; slot++) {
    // Place revenge puzzles at slots 1, 4, 6 (0-indexed) when available
    const shouldPlaceRevenge = (slot === 1 || slot === 4 || slot === 6) && rIdx < revengePuzzles.length;
    if (shouldPlaceRevenge) {
      selected.push(revengePuzzles[rIdx++]);
    } else if (fIdx < freshPuzzles.length) {
      selected.push(freshPuzzles[fIdx++]);
    } else if (rIdx < revengePuzzles.length) {
      selected.push(revengePuzzles[rIdx++]);
    }
  }

  while (selected.length < count && pool.length > 0) {
    const nextP = pool[selected.length % pool.length];
    selected.push({ ...nextP, id: `${nextP.id}_${selected.length}` });
  }

  return { theme, puzzles: selected.slice(0, count), revengeIds };
}

/**
 * Get deterministic daily training puzzles (8 focused puzzles, mixing in up to 3 cross-day revenge puzzles)
 */
export function getDailyTrainingPuzzles(
  dateStr?: string
): { theme: DayThemeInfo; puzzles: PuzzleData[]; revengeIds: string[] } {
  return selectDailyPuzzles(DAILY_TARGET_COUNT, dateStr, true);
}

/**
 * Backward-compatible 15-puzzle selector (from the focused bank)
 */
export function getDaily15Puzzles(dateStr?: string): { theme: DayThemeInfo; puzzles: PuzzleData[] } {
  const { theme, puzzles } = selectDailyPuzzles(15, dateStr, false);
  return { theme, puzzles };
}

function rotateArray<T>(arr: T[], steps: number): T[] {
  if (arr.length === 0) return arr;
  const s = steps % arr.length;
  return [...arr.slice(s), ...arr.slice(0, s)];
}
