import { PuzzleData } from '../types/go';
import { ADVENTURE_STAGES } from './stages';

// Flatten all adventure stage puzzles as our primary base pool
const ALL_STAGE_PUZZLES: PuzzleData[] = ADVENTURE_STAGES.flatMap((stage) => stage.puzzles);

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

// Combine all puzzle sources
export const FULL_PUZZLE_BANK: PuzzleData[] = [...ALL_STAGE_PUZZLES, ...SUPPLEMENTARY_DAILY_PUZZLES];

export interface DayThemeInfo {
  dayName: string;
  themeTitle: string;
  subtitle: string;
  targetCategory: string;
  icon: string;
}

export const WEEKLY_THEMES: Record<number, DayThemeInfo> = {
  0: { dayName: '周日', themeTitle: '实战综合手筋·大龙突围战', subtitle: '精选全套死活，磨砺大局与算力！', targetCategory: 'mixed', icon: '🐲' },
  1: { dayName: '周一', themeTitle: '真假眼与眼形要害', subtitle: '练就火眼金睛，两眼活棋绝不马虎！', targetCategory: 'life-and-death', icon: '👁️' },
  2: { dayName: '周二', themeTitle: '五大吃子绝招·闪电出击', subtitle: '双打、门吃、抱吃、枷吃、征吃大练兵！', targetCategory: 'capture', icon: '⚡' },
  3: { dayName: '周三', themeTitle: '边角经典死活·一路立与妙手', subtitle: '金角银边，角上一子顶三子！', targetCategory: 'life-and-death', icon: '🏰' },
  4: { dayName: '周四', themeTitle: '对杀法则·沉着比气与先紧外气', subtitle: '双方包围比气多，不入公气先收外气！', targetCategory: 'liberties', icon: '⚔️' },
  5: { dayName: '周五', themeTitle: '分断与连接·扎实筑墙', subtitle: '切断对手大龙，连接自家营地！', targetCategory: 'tactics', icon: '🧱' },
  6: { dayName: '周六', themeTitle: '周末死活极速挑战', subtitle: '快速一眼识别，10分钟限时挑战！', targetCategory: 'mixed', icon: '🎯' },
};

/**
 * Get deterministic 15 puzzles for today based on date string (YYYY-MM-DD)
 */
export function getDaily15Puzzles(dateStr?: string): { theme: DayThemeInfo; puzzles: PuzzleData[] } {
  const date = dateStr ? new Date(dateStr) : new Date();
  const dayOfWeek = date.getDay(); // 0 - 6
  const theme = WEEKLY_THEMES[dayOfWeek];

  // Simple deterministic seed based on year, month, date
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Try to prioritize theme matching puzzles first
  const matching = FULL_PUZZLE_BANK.filter((p) => {
    if (theme.targetCategory === 'mixed') return true;
    return p.category === theme.targetCategory;
  });

  const others = FULL_PUZZLE_BANK.filter((p) => !matching.includes(p));

  // Rotate based on dayOfYear so each week is slightly rotated and fresh
  const rotatedMatching = rotateArray(matching, dayOfYear % Math.max(1, matching.length));
  const rotatedOthers = rotateArray(others, (dayOfYear * 3) % Math.max(1, others.length));

  // Prioritize recently synchronized classroom test puzzles at the top
  const cutPuzzles = SUPPLEMENTARY_DAILY_PUZZLES.filter((p) => p.id.startsWith('daily-cut-'));
  const pool = [...cutPuzzles, ...rotatedMatching, ...rotatedOthers];

  // Return exactly 15 unique puzzles
  const selected: PuzzleData[] = [];
  const seenIds = new Set<string>();

  for (const p of pool) {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      selected.push(p);
      if (selected.length === 15) break;
    }
  }

  // Fallback in case pool is small
  while (selected.length < 15 && pool.length > 0) {
    const nextP = pool[selected.length % pool.length];
    selected.push({ ...nextP, id: `${nextP.id}_${selected.length}` });
  }

  return { theme, puzzles: selected.slice(0, 15) };
}

function rotateArray<T>(arr: T[], steps: number): T[] {
  if (arr.length === 0) return arr;
  const s = steps % arr.length;
  return [...arr.slice(s), ...arr.slice(0, s)];
}
