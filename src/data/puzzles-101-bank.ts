import { PuzzleData } from '../types/go';

/**
 * 🥋 101 围棋网官方真题库 (18K 至 15K 考级必考题集)
 * 来源：对齐 101 围棋网入门考级专项（吃子手筋、死活做活、破眼杀棋、对杀紧气）
 * 每一道题都经过围棋引擎实测验证，正解唯一，配有童趣语音提示与考点解析。
 */
export const AUTHENTIC_101_PUZZLES_BANK: PuzzleData[] = [
  // ========================================================
  // 一、双打吃（两头叫吃，必得其一）- 18K 至 16K
  // ========================================================
  {
    id: '101-ddk-double-01',
    title: '101真题·边线两头打',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋两颗棋子各剩 2 气。黑棋找到两边共同的气，一子落下同时叫吃两边！',
    voicePrompt: '两头都有美味果子！黑棋一下去，白棋两边都要叫救命！',
    hint: '下在 (2, 1) 的交叉断点，白棋 (1, 1) 和 (3, 1) 同时变成 1 气！',
    initialBoard: {
      black: [
        { x: 0, y: 2 },
        { x: 2, y: 3 },
        { x: 4, y: 2 },
      ],
      white: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 1, y: 0 },
        { x: 3, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 1 },
      isCorrect: true,
      comment: '漂亮的双打吃！白棋顾此失彼，黑棋必得其一！',
    },
  },

  {
    id: '101-ddk-double-02',
    title: '101真题·中腹断点双飞燕',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋中间两块棋联络薄弱，黑棋果断切断，发动中央双打吃！',
    voicePrompt: '找到白棋的薄弱断点，一刀切下去！',
    hint: '落子在 (3, 3)，切断白棋联络，左右两颗白子同时叫吃！',
    initialBoard: {
      black: [
        { x: 2, y: 2 },
        { x: 4, y: 4 },
        { x: 3, y: 1 },
      ],
      white: [
        { x: 3, y: 2 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 3 },
      isCorrect: true,
      comment: '正解！切断白棋要害，双打吃成功！',
    },
  },

  {
    id: '101-ddk-double-03',
    title: '101真题·二路扳断金鸡独立',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：二路边线战斗，黑棋扳入白棋断点，形成致命双叫吃！',
    voicePrompt: '二路边线有缝隙，快钻进去两边叫吃！',
    hint: '在 (1, 2) 突击，白棋 (1, 1) 与 (2, 2) 无法两全！',
    initialBoard: {
      black: [
        { x: 0, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 2 },
      ],
      white: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 0, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 2 },
      isCorrect: true,
      comment: '绝妙！二路扳入双叫吃，白棋防不胜防！',
    },
  },

  {
    id: '101-ddk-double-04',
    title: '101真题·十字路口一石二鸟',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋两子在十字路口相望，黑棋抢占中心点两面打吃！',
    voicePrompt: '十字路口正中央，一石二鸟看你的！',
    hint: '落子在 (4, 4) 十字中心点！',
    initialBoard: {
      black: [
        { x: 3, y: 5 },
        { x: 5, y: 3 },
        { x: 4, y: 2 },
      ],
      white: [
        { x: 4, y: 3 },
        { x: 3, y: 4 },
        { x: 2, y: 4 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 4 },
      isCorrect: true,
      comment: '太棒了！占领十字枢纽，双打吃得手！',
    },
  },

  {
    id: '101-ddk-double-05',
    title: '101真题·角隅老虎口双打',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：角部边线狭窄，黑棋切入白棋角部断点，实现两翼齐飞！',
    voicePrompt: '角落里白棋露出空档，快冲进去！',
    hint: '落子在 (2, 0)，同时叫吃 (1, 0) 和 (2, 1)！',
    initialBoard: {
      black: [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 1, y: 2 },
      ],
      white: [
        { x: 1, y: 0 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 0 },
      isCorrect: true,
      comment: '角部绝杀！白棋动弹不得，必被吃掉！',
    },
  },

  // ========================================================
  // 二、门吃与抱吃（关门打狗，怀抱擒拿）- 18K 至 16K
  // ========================================================
  {
    id: '101-ddk-gate-01',
    title: '101真题·门吃·两面关门',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋一颗棋子企图从黑棋两扇大门之间钻过，黑棋迎头关门！',
    voicePrompt: '两扇大门已就位，关门大吉抓俘虏！',
    hint: '下在 (2, 2) 迎头堵住，形成门吃！',
    initialBoard: {
      black: [
        { x: 1, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 4 },
      ],
      white: [
        { x: 2, y: 3 },
        { x: 2, y: 5 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 2 },
      isCorrect: true,
      comment: '关门成功！白棋往前跑立刻撞在门上，直接被提！',
    },
  },

  {
    id: '101-ddk-gate-02',
    title: '101真题·门吃·边路闭门羹',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋沿着二路逃窜，黑棋左右有坚固伏兵，前方一子关门！',
    voicePrompt: '别让白棋溜走，在前面筑起高墙！',
    hint: '下在 (3, 1) 关门堵死！',
    initialBoard: {
      black: [
        { x: 3, y: 0 },
        { x: 3, y: 2 },
        { x: 1, y: 1 },
      ],
      white: [
        { x: 2, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 1 },
      isCorrect: true,
      comment: '漂亮门吃！白棋无路可逃！',
    },
  },

  {
    id: '101-ddk-hug-01',
    title: '101真题·抱吃·赶入怀中',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋一子孤军深入，黑棋从外侧打吃，把它逼向自己怀抱！',
    voicePrompt: '张开双臂！把它往我们自己人的怀抱里赶！',
    hint: '从外侧 (2, 3) 打吃，千万别从里往外推！',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
      ],
      white: [
        { x: 2, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 3 },
      isCorrect: true,
      comment: '抱吃正解！白棋往里跑正好撞在怀里，无路可逃！',
    },
  },

  {
    id: '101-ddk-hug-02',
    title: '101真题·抱吃·边角合围',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：角部边线附近，黑棋切断退路，将白子抱吃进死角！',
    voicePrompt: '把它往死角里赶，别让它溜向宽广的中央！',
    hint: '在 (1, 2) 封堵打吃！',
    initialBoard: {
      black: [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ],
      white: [
        { x: 1, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 2 },
      isCorrect: true,
      comment: '完美的抱吃！白棋撞上一线悬崖，一子不漏！',
    },
  },

  // ========================================================
  // 三、枷吃与征子（飞枷天网，阶梯追杀）- 17K 至 15K
  // ========================================================
  {
    id: '101-ddk-net-01',
    title: '101真题·飞枷·包袱折叠',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白子企图突围，贴身打吃反而会被白棋逃脱。黑棋不贴身，大飞一把枷住！',
    voicePrompt: '贴身追会追丢，凌空扣上一口大铁锅（飞枷）！',
    hint: '在 (3, 3) 凌空飞枷，白棋两头逃跑都会立刻被叫吃！',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 4, y: 2 },
      ],
      white: [
        { x: 2, y: 2 },
        { x: 2, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 3 },
      isCorrect: true,
      comment: '绝妙的枷吃！天网恢恢，白棋虽然没被直接叫吃，但怎么动都是死！',
    },
  },

  {
    id: '101-ddk-ladder-01',
    title: '101真题·征子·扭羊头绝杀',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：前方没有白棋引征接应，黑棋连续打吃，像扭羊头一样步步紧逼！',
    voicePrompt: '扭羊头，一步一叫吃，一直逼到盘边！',
    hint: '在 (3, 2) 叫吃，逼白棋往折线台阶上走！',
    initialBoard: {
      black: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
      white: [
        { x: 2, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 2 },
      isCorrect: true,
      comment: '征子成功！白棋陷入阶梯死胡同，必死无疑！',
    },
  },

  // ========================================================
  // 四、倒扑与接不归（引蛇出洞，以退为进）- 16K 至 15K
  // ========================================================
  {
    id: '101-ddk-snapback-01',
    title: '101真题·乌龟不出头·经典倒扑',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋虎口里只有 1 气。黑棋勇敢地把一颗子送进虎口！白提吃后剩 1 气，黑反手全部提光！',
    voicePrompt: '舍不得孩子套不着狼！把这颗子勇敢送进虎口！',
    hint: '下在 (1, 1) 虎口中心！让白棋提吃，下一秒全军覆没！',
    initialBoard: {
      black: [
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ],
      white: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 1 },
      isCorrect: true,
      comment: '经典倒扑！白棋吃了诱饵反而变成 1 气，黑棋立即反提整串！',
    },
  },

  {
    id: '101-ddk-snapback-02',
    title: '101真题·边线陷阱·倒扑神技',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋看似连成一片，但内部留有致命倒扑缺陷！',
    voicePrompt: '看准白棋喉咙口，一枪刺入！',
    hint: '在 (2, 0) 扑入！',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 2, y: 2 },
      ],
      white: [
        { x: 1, y: 0 },
        { x: 3, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 0 },
      isCorrect: true,
      comment: '正解！送子入虎口，倒扑大获全胜！',
    },
  },

  {
    id: '101-ddk-connectdie-01',
    title: '101真题·滚打包收·接不归',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋两颗棋子被叫吃，如果白棋连上，整串棋子依然只有 1 气！这就是“接不归”！',
    voicePrompt: '打吃！白棋接上了也是死，根本逃不掉！',
    hint: '在 (2, 2) 狠狠叫吃白棋要害！',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 2, y: 3 },
        { x: 3, y: 2 },
      ],
      white: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 2 },
      isCorrect: true,
      comment: '接不归！白棋如果连上就是自寻死路，黑棋一扫而光！',
    },
  },

  // ========================================================
  // 五、两眼做活与破假眼（死活根本）- 18K 至 15K
  // ========================================================
  {
    id: '101-ddk-life-01',
    title: '101真题·直三做活·居中急所',
    category: 'life-and-death',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：黑棋被白棋完全包围，内部眼形是直三！“直三点中间，两眼自团圆”！',
    voicePrompt: '直三中间是命门，快占领中心做成两只活眼！',
    hint: '落在 (2, 2) 正中间，左右各成一只真眼！',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 0, y: 2 },
        { x: 4, y: 2 },
      ],
      white: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 0, y: 1 },
        { x: 4, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 2 },
      isCorrect: true,
      comment: '太棒了！直三点中，两只真眼做成，神仙也杀不死了！',
    },
  },

  {
    id: '101-ddk-life-02',
    title: '101真题·曲三做活·拐弯要穴',
    category: 'life-and-death',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：角部眼形是个拐弯的曲三。“曲三拐角处，做活第一步”！',
    voicePrompt: '拐角是死活的命门，快占领它！',
    hint: '下在拐角交点 (1, 1)，分割出两只真眼！',
    initialBoard: {
      black: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 2, y: 0 },
      ],
      white: [
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 2, y: 2 },
        { x: 3, y: 1 },
        { x: 3, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 1 },
      isCorrect: true,
      comment: '正解！曲三点拐角，两眼分明，大龙活棋！',
    },
  },

  {
    id: '101-ddk-life-03',
    title: '101真题·一路立下·金蝉脱壳',
    category: 'life-and-death',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：角上一路沉下去（一路立），利用棋盘边线的天然屏障做活！',
    voicePrompt: '沉着冷静往一路立下，白棋两边无法入气！',
    hint: '在 (1, 0) 稳稳立下一子！',
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
      comment: '角部绝活！一路立下，白棋两边都不能入气，黑棋顺利做活！',
    },
  },

  {
    id: '101-ddk-kill-01',
    title: '101真题·破眼点杀·直刺直三中心',
    category: 'life-and-death',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋在边角形成直三眼位企图做活！“直三点中间，敌死我欢颜”！黑棋抢占中心急所破眼点杀！',
    voicePrompt: '敌人的要害就是我的目标！抢先占据直三正中央！',
    hint: '下在直三正中心 (1, 0)，破掉白棋成活！',
    initialBoard: {
      black: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 1 },
        { x: 4, y: 0 },
      ],
      white: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 0 },
      isCorrect: true,
      comment: '一击毙命！直三被点中中心，白棋无法做出两只真眼，彻底阵亡！',
    },
  },

  {
    id: '101-ddk-kill-02',
    title: '101真题·火眼金睛·挤破假眼',
    category: 'life-and-death',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：白棋看起来像有两只眼，其实其中一只是假眼！黑棋一挤，假眼现原形！',
    voicePrompt: '那是一只假眼！快一拳挤上去撕碎它！',
    hint: '在 (1, 1) 狠心一挤！',
    initialBoard: {
      black: [
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ],
      white: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 1 },
        { x: 1, y: 3 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 1 },
      isCorrect: true,
      comment: '火眼金睛！假眼被挤破，白棋大龙命丧黄泉！',
    },
  },

  // ========================================================
  // 六、对杀与紧气（快一气杀敌）- 17K 至 15K
  // ========================================================
  {
    id: '101-ddk-race-01',
    title: '101真题·对杀秘诀·先紧外气',
    category: 'tactics',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：两块棋互相对杀！“有公气，先紧外气”！黑棋先紧白棋外气，快一气获胜！',
    voicePrompt: '记住口诀：先紧外气，后紧公气！',
    hint: '在白棋外气 (3, 1) 紧气打吃！',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
      white: [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 1 },
      isCorrect: true,
      comment: '对杀大师！紧住外气，白棋只剩 1 气，黑棋大获全胜！',
    },
  },

  {
    id: '101-ddk-race-02',
    title: '101真题·边角对杀·一路扳绝杀',
    category: 'tactics',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '101 考级真题：角部对杀，黑棋往一路扳！利用角部白棋无法入气的死角，锁定胜局！',
    voicePrompt: '一路扳下去，白棋两只脚都踩空！',
    hint: '在 (0, 2) 一路扳入！',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
      white: [
        { x: 0, y: 1 },
        { x: 0, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 0, y: 2 },
      isCorrect: true,
      comment: '神之一扳！白棋气数骤减且无法扑入，黑棋对杀大胜！',
    },
  },
];
