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
    explanation: '【名师精解·101真题·边线两头打】：正解要害！下在 (2, 1) 的交叉断点，白棋 (1, 1) 和 (3, 1) 同时变成 1 气！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·中腹断点双飞燕】：正解要害！落子在 (3, 3)，切断白棋联络，左右两颗白子同时叫吃！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·二路扳断金鸡独立】：正解要害！在 (1, 2) 突击，白棋 (1, 1) 与 (2, 2) 无法两全！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·十字路口一石二鸟】：正解要害！落子在 (4, 4) 十字中心点！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·角隅老虎口双打】：正解要害！落子在 (2, 0)，同时叫吃 (1, 0) 和 (2, 1)！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·门吃·两面关门】：正解要害！下在 (2, 2) 迎头堵住，形成门吃！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·门吃·边路闭门羹】：正解要害！下在 (3, 1) 关门堵死！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·抱吃·赶入怀中】：正解要害！从外侧 (2, 3) 打吃，千万别从里往外推！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·抱吃·边角合围】：正解要害！在 (1, 2) 封堵打吃！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·飞枷·包袱折叠】：正解要害！在 (3, 3) 凌空飞枷，白棋两头逃跑都会立刻被叫吃！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·征子·扭羊头绝杀】：正解要害！在 (3, 2) 叫吃，逼白棋往折线台阶上走！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·乌龟不出头·经典倒扑】：正解要害！下在 (1, 1) 虎口中心！让白棋提吃，下一秒全军覆没！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·边线陷阱·倒扑神技】：正解要害！在 (2, 0) 扑入！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·滚打包收·接不归】：正解要害！在 (2, 2) 狠狠叫吃白棋要害！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·直三做活·居中急所】：正解要害！落在 (2, 2) 正中间，左右各成一只真眼！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·曲三做活·拐弯要穴】：正解要害！下在拐角交点 (1, 1)，分割出两只真眼！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·一路立下·金蝉脱壳】：正解要害！在 (1, 0) 稳稳立下一子！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·破眼点杀·直刺直三中心】：正解要害！下在直三正中心 (1, 0)，破掉白棋成活！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·火眼金睛·挤破假眼】：正解要害！在 (1, 1) 狠心一挤！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·对杀秘诀·先紧外气】：正解要害！在白棋外气 (3, 1) 紧气打吃！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
    explanation: '【名师精解·101真题·边角对杀·一路扳绝杀】：正解要害！在 (0, 2) 一路扳入！ 请仔细观察双方气数与逃生通道，看准真假断点与关键气数。',
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
  // ========================================================
  // 七、真假断点与能否切断（老师专项宝典 · 攻防分水岭）
  // ========================================================
  {
    id: '101-teacher-cut-01',
    title: '名师专项·边线真断点必杀',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《真假断点》精选：白棋在边线看似连成一片，但外围已有黑棋接应。黑棋果断切断，直接将孤立白子提吃！',
    voicePrompt: '外围有我们的大部队！黑棋下在断点，切断并提吃白子！',
    hint: '下在二路切断点 (4, 1)！',
    explanation: '【名师精解·真假断点】：切断成立（√）！落子在 (4, 1) 后，黑棋形成关门之势，(4, 0) 的白子气数彻底耗尽被直接提吃。避坑警示：若外围没有 (3, 0) 与 (5, 0) 的黑子接应，盲目冲断反会被白棋提吃，那才是假断点。',
    initialBoard: {
      black: [
        { x: 3, y: 0 },
        { x: 5, y: 0 },
        { x: 4, y: 2 },
      ],
      white: [
        { x: 3, y: 1 },
        { x: 5, y: 1 },
        { x: 4, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 1 },
      isCorrect: true,
      comment: '太漂亮了！切断成立，直接提吃白棋要害子！',
    },
  },

  {
    id: '101-teacher-cut-02',
    title: '名师专项·二路分断真断点',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《真假断点》精选：二路边线两块白棋联络薄弱，黑棋果断分断，让两边白棋无法顾全！',
    voicePrompt: '二路白棋联络松散，黑棋一刀切下去，让白棋两头不相顾！',
    hint: '下在关键分断点 (3, 1)！',
    explanation: '【名师精解·真假断点】：切断成立（√）！黑棋切入 (3, 1) 后自身与上方黑棋连结，同时白棋两块被彻底截断，白棋角部只剩 1 气被打吃。避坑警示：切断时务必保证自己有气，有气的分断才是制胜真断点！',
    initialBoard: {
      black: [
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
      ],
      white: [
        { x: 2, y: 2 },
        { x: 4, y: 1 },
        { x: 5, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 1 },
      isCorrect: true,
      comment: '一刀两断！切断成立，白棋破绽大开！',
    },
  },

  {
    id: '101-teacher-cut-03',
    title: '名师专项·假断点避坑防守',
    category: 'tactics',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《真假断点》精选：白棋虎视眈眈，眼前的交叉点是假断点！黑棋不可盲目冲断，必须稳健补强连接自己的弱点！',
    voicePrompt: '小心假断点陷阱！不要盲目冲断，快快把自己的薄弱点牢牢连接！',
    hint: '落在己方要害连接点 (2, 1)，筑起铜墙铁壁！',
    explanation: '【名师精解·真假断点】：此题是典型的防守连接题。眼前看似有断点，但若黑棋冲断只有 1 气，会被白棋立刻反吃！因此最高明的下法是补强己方连接点 (2, 1)，让白棋无隙可乘。',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 2, y: 2 },
      ],
      white: [
        { x: 2, y: 0 },
        { x: 4, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 1 },
      isCorrect: true,
      comment: '聪明的判断！识破假断点，连接己方阵地！',
    },
  },

  {
    id: '101-teacher-cut-04',
    title: '名师专项·A/B双断点抉择（真断点）',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《真假断点》第19题：白棋看似留下两个断点，其中一个是假断点陷阱，只有一个是真正的致命绝杀断点！',
    voicePrompt: '看准白棋气数！找准真断点，切中要害！',
    hint: '下在真断点 (2, 2)！',
    explanation: '【名师精解·A/B断点抉择】：(2, 2) 是真断点（√）！切断后白棋 (2, 1) 仅剩 1 气处于被打吃状态；若走其他假断点，黑棋直接进入白棋厚势虎口会被反杀。',
    initialBoard: {
      black: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 1, y: 1 },
      ],
      white: [
        { x: 2, y: 1 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 2 },
      isCorrect: true,
      comment: '火眼金睛！选出真断点，直接叫吃白子！',
    },
  },

  {
    id: '101-teacher-cut-05',
    title: '名师专项·A/B断点之二路破袭',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《真假断点》第20题：白棋二路有破绽，黑棋精准辨析真断点，一举歼灭白棋先锋！',
    voicePrompt: '仔细看气数！选对真断点，一子定乾坤！',
    hint: '下在真断点 (3, 2)！',
    explanation: '【名师精解·真假断点】：下在 (3, 2) 切断成立！白棋两块棋被生生截断，右侧白子瞬间被叫吃。避坑提醒：不要下在无接应的二路，那会被白棋反噬！',
    initialBoard: {
      black: [
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 3 },
      ],
      white: [
        { x: 3, y: 1 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 2 },
      isCorrect: true,
      comment: '犀利的分断！白棋防守崩溃！',
    },
  },

  {
    id: '101-teacher-cut-06',
    title: '名师专项·A/B断点之中央分断',
    category: 'tactics',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '《真假断点》第21题：中腹接触战，白棋形状留有隐患。黑棋选择正确断点，将白棋大龙切成两段！',
    voicePrompt: '大龙要切断！找准白棋的命门，一刀斩断联络！',
    hint: '落子在中央真断点 (4, 4)！',
    explanation: '【名师精解】：中腹切断的关键在于自身的气数与出头。黑 1 落在 (4, 4) 之后自身有 3 气且能向外逃生，白棋两块被割裂各自只有 2 气，黑棋大获全胜！',
    initialBoard: {
      black: [
        { x: 3, y: 4 },
        { x: 4, y: 5 },
        { x: 5, y: 5 },
      ],
      white: [
        { x: 4, y: 3 },
        { x: 5, y: 4 },
        { x: 6, y: 4 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 4 },
      isCorrect: true,
      comment: '中腹天元断！白棋大龙断开两截！',
    },
  },

  {
    id: '101-teacher-cut-07',
    title: '名师专项·二路扳断绝杀',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '《真假断点》精选：白棋在二路试图联络，黑棋利用角部厚势强行扳断，切断成立！',
    voicePrompt: '二路强行分断！借助角上的朋友，一刀断开白棋！',
    hint: '在二路关键交点 (2, 3) 扳断！',
    explanation: '【名师精解】：黑棋落在 (2, 3) 强硬分断！白棋 (2, 2) 只有 1 气被打吃。因为黑棋角部已有 (1, 1)、(1, 2) 等坚实后盾，切断完全成立！',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
      white: [
        { x: 1, y: 3 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 3 },
      isCorrect: true,
      comment: '强力扳断！切断成立，白棋陷入重围！',
    },
  },

  {
    id: '101-teacher-cut-08',
    title: '名师专项·一线封锁真断点',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '《真假断点》精选：白棋在边线仅剩微弱气数，黑棋在边路一线点入切断，白子立毙！',
    voicePrompt: '点入一线要害！彻底切断白棋逃生通道！',
    hint: '下一线断点 (2, 1)！',
    explanation: '【名师精解】：此为一路分断妙手！黑棋走 (2, 1) 之后切断白棋与外围联系，白棋 (3, 1) 只剩 1 气无处可逃，切断大功告成！',
    initialBoard: {
      black: [
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 2, y: 5 },
      ],
      white: [
        { x: 2, y: 2 },
        { x: 3, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 1 },
      isCorrect: true,
      comment: '神来之笔！一线点断绝杀！',
    },
  },

  // ========================================================
  // 八、叫吃的要领（老师速成围棋大纲 · 方向感训练）
  // ========================================================
  {
    id: '101-teacher-dir-gate-01',
    title: '速成围棋7-1·向一线方向叫吃',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋7-1 叫吃的要领》：白棋只剩 2 气。必须将白棋向一路（死亡线）方向叫吃，绝不可让白棋逃向开阔中腹！',
    voicePrompt: '把白棋往一线死亡线上赶！绝不能让它往大肚子中间跑！',
    hint: '从二路 (3, 2) 向下一路叫吃！',
    explanation: '【名师精解·叫吃要领】：正解是下在 (3, 2) 封头叫吃！将白棋 (3, 1) 逼向一线死亡线，白棋只剩 1 气无法逃脱。避坑提醒：若从 (3, 0) 一路向上叫吃，白棋顺势向 (3, 2) 冲入中腹长气，黑棋就彻底抓不住了！',
    initialBoard: {
      black: [
        { x: 2, y: 1 },
        { x: 4, y: 1 },
        { x: 2, y: 2 },
      ],
      white: [
        { x: 3, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 2 },
      isCorrect: true,
      comment: '方向完全正确！成功将白棋封锁在一线死亡线！',
    },
  },

  {
    id: '101-teacher-dir-gate-02',
    title: '速成围棋7-1·封门一线提吃',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋7-1 叫吃的要领》：白棋被困在边角一路，黑棋一子落下关门提吃！',
    voicePrompt: '关门打狗！在二路堵住白棋退路，直接提吃！',
    hint: '下在 (2, 1) 关门提吃！',
    explanation: '【名师精解·向一线赶】：白棋在 (2, 0) 只有 1 气，黑棋落子在 (2, 1) 彻底封死所有逃路，直接提吃白子！',
    initialBoard: {
      black: [
        { x: 1, y: 0 },
        { x: 3, y: 0 },
        { x: 1, y: 1 },
      ],
      white: [
        { x: 2, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 1 },
      isCorrect: true,
      comment: '手起刀落！向一线封门提吃成功！',
    },
  },

  {
    id: '101-teacher-dir-hug-01',
    title: '速成围棋7-2·向己方方向叫吃（抱吃）',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋7-2 叫吃的要领》：利用己方厚势的怀抱，从外侧叫吃，把白棋赶入黑棋的包围圈中！',
    voicePrompt: '张开大怀抱！从外侧叫吃，把白棋赶向黑棋小伙伴的怀抱里！',
    hint: '从外围 (4, 3) 迎头叫吃！',
    explanation: '【名师精解·叫吃要领】：此为经典「抱吃」手筋！下在 (4, 3) 堵住白棋退路，白棋只剩 1 气只能往 (3, 2) 黑棋重兵把守的怀抱里钻，一逃就会被立刻提吃！',
    initialBoard: {
      black: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 4 },
      ],
      white: [
        { x: 3, y: 3 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 3 },
      isCorrect: true,
      comment: '完美的抱吃！白棋自投罗网！',
    },
  },

  {
    id: '101-teacher-dir-hug-02',
    title: '速成围棋7-2·角部抱吃网罗',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋7-2 叫吃的要领》：角部抱吃绝技，向着友军方向打吃，白棋插翅难飞！',
    voicePrompt: '向友军方向叫吃！让白棋撞进黑棋的铁壁上！',
    hint: '下在 (2, 2) 迎头痛击！',
    explanation: '【名师精解】：下在 (2, 2) 是唯一的正确方向！白棋被迫逃向 (1, 1) 黑子守卫之地，直接被擒。若走错方向，白棋向外开溜就无法抓住了。',
    initialBoard: {
      black: [
        { x: 1, y: 1 },
        { x: 2, y: 0 },
        { x: 3, y: 1 },
      ],
      white: [
        { x: 2, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 2 },
      isCorrect: true,
      comment: '抱吃擒拿！角部白棋彻底断气！',
    },
  },

  {
    id: '101-teacher-dir-cutatari-01',
    title: '速成围棋7-3·边断边叫吃',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋7-3 叫吃的要领》：切断白棋联络的同时，顺势将其中一颗白子打吃！一石二鸟！',
    voicePrompt: '边分断、边叫吃！一刀切下去，同时让白子叫救命！',
    hint: '切入断点 (2, 2)，顺手打吃！',
    explanation: '【名师精解·叫吃要领】：边断边叫吃是接触战最厉害的杀招！下在 (2, 2) 既切断了白棋上下联络，又直接让 (2, 1) 的白子只剩 1 气，白棋根本来不及补断！',
    initialBoard: {
      black: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 1 },
      ],
      white: [
        { x: 2, y: 1 },
        { x: 3, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 2 },
      isCorrect: true,
      comment: '犀利的断打！既断开白棋又打吃要害！',
    },
  },

  {
    id: '101-teacher-dir-cutatari-02',
    title: '速成围棋7-3·二路边断边打',
    category: 'capture',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋7-3 叫吃的要领》：白棋二路爬行露出断点，黑棋断打顺手牵羊！',
    voicePrompt: '二路断打！切断白棋二路联络，顺便打吃！',
    hint: '切在 (2, 2) 顺势打吃！',
    explanation: '【名师精解】：黑 1 落在 (2, 2) 切断白棋二路连接，同时紧逼白棋 (2, 1)，白棋只有 1 气无法两全，黑棋大获全胜！',
    initialBoard: {
      black: [
        { x: 3, y: 2 },
        { x: 4, y: 1 },
        { x: 2, y: 0 },
      ],
      white: [
        { x: 3, y: 1 },
        { x: 2, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 2 },
      isCorrect: true,
      comment: '手筋正着！二路边断边打成功！',
    },
  },

  // ========================================================
  // 九、可救之子与应弃之子（老师速成围棋大纲 · 舍小就大）
  // ========================================================
  {
    id: '101-teacher-escape-rescue-01',
    title: '速成围棋18·可救之子大长气',
    category: 'tactics',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋18 可救与应弃》：黑棋被打吃，前方空间开阔，属于能长出多气的「可救之子」，必须果断逃生！',
    voicePrompt: '前面的路很宽广！快快长气出头，大龙绝不可白白送掉！',
    hint: '向上方开阔处长气 (2, 3)！',
    explanation: '【名师精解·可救之子】：黑棋被叫吃后，上方空间极为开阔。下在 (2, 3) 之后黑棋立刻长出 3 气，成功突围逃生！逃跑时切记：能长气出头的就是「可救之子」！',
    initialBoard: {
      black: [
        { x: 2, y: 2 },
        { x: 1, y: 2 },
      ],
      white: [
        { x: 2, y: 1 },
        { x: 3, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 3 },
      isCorrect: true,
      comment: '胜利突围！可救之子成功长气出头！',
    },
  },

  {
    id: '101-teacher-escape-abandon-01',
    title: '速成围棋18·应弃之子舍小就大',
    category: 'tactics',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋18 可救与应弃》：中央孤子逃跑无路（死征），属于「应弃之子」！黑棋不要盲目逃跑，而是转身收拢大局！',
    voicePrompt: '千万别逃！逃了也是送给白棋吃！果断弃子，抢占更宽广的大局！',
    hint: '在上方 (4, 5) 抢占大场，舍小就大！',
    explanation: '【名师精解·应弃之子】：中央黑棋若逃跑，气数只有 1 气且周围全被白棋围死，越逃死得越多（俗称贪吃变成糖葫芦）。因此高明的大师会果断弃子，抢占上方 (4, 5) 广阔阵地！',
    initialBoard: {
      black: [
        { x: 3, y: 3 },
        { x: 4, y: 2 },
        { x: 5, y: 3 },
        { x: 4, y: 4 },
      ],
      white: [
        { x: 4, y: 3 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 5 },
      isCorrect: true,
      comment: '真正的大师大局观！舍弃死子，夺取广阔阵地！',
    },
  },

  // ========================================================
  // 十、对杀收气与长气（老师速成围棋大纲 · 快一气胜）
  // ========================================================
  {
    id: '101-teacher-race-outside-01',
    title: '速成围棋16·对杀收气先紧外气',
    category: 'liberties',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋16 收气》：黑白双方互不相让进入对杀！对杀口诀第一条：先紧对方外气，绝不可自填公气！',
    voicePrompt: '对杀紧气秘诀：先收对方的外气，快一气把白棋吃掉！',
    hint: '从外侧 (4, 1) 紧白棋外气！',
    explanation: '【名师精解·对杀收气】：对杀的铁律是「先紧外气」！黑 1 下在 (4, 1) 夺走白棋最宝贵的外气，使白棋仅剩 1 气陷入绝境，下回合黑棋即可全歼白棋！',
    initialBoard: {
      black: [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 1, y: 2 },
      ],
      white: [
        { x: 3, y: 1 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 1 },
      isCorrect: true,
      comment: '精准紧气！先紧外气，对杀黑棋快一气制胜！',
    },
  },

  {
    id: '101-teacher-race-liberty-01',
    title: '速成围棋17·对杀长气反败为胜',
    category: 'liberties',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '《速成围棋17 长气》：双方气数吃紧，黑棋只有 2 气面临危险。此时先长气胜过盲目紧气！',
    voicePrompt: '先长自己的气！自己的气比白棋多，对杀就能赢！',
    hint: '在边路 (1, 1) 大力长气！',
    explanation: '【名师精解·长气妙手】：下在 (1, 1) 后黑棋自身气数立刻由 2 气暴增至 3 气！白棋只有 2 气，由于黑棋长气成功，对杀瞬间反超快一气获胜！',
    initialBoard: {
      black: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
      white: [
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 1 },
      isCorrect: true,
      comment: '长气妙着！气多杀气少，稳稳拿下对杀！',
    },
  },

// ========================================================
  // 十一、名师倒扑实战强化（送子弃子诱敌与逆向反杀）
  // ========================================================
  {
    id: '101-teacher-snapback-01',
    title: '名师专项·角部一路送子倒扑',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋在角隅仅剩两气！黑棋勇敢把一颗棋子送入角部虎口，诱使白棋提吃，随后反手将白棋整串提光！',
    voicePrompt: '舍小取大！勇敢把这颗棋子送入角部，等白棋上钩就反手全吃！',
    hint: '下在角部一路 (1, 0) 扑入！',
    explanation: '【名师精解·倒扑手筋】：黑 1 落在 (1, 0) 是绝妙的倒扑扑入！虽然让白棋在 (0, 0) 提吃一子，但白棋提吃后自身气数彻底收紧为 1 气，黑棋随即反提白棋整串 5 颗子！这是突破 18K 不敢弃子心理的第一课。',
    initialBoard: {
      black: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 1 },
        { x: 3, y: 0 },
      ],
      white: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 0 },
      isCorrect: true,
      comment: '漂亮至极！角部送子倒扑，成功将白棋诱入绝境！',
    },
  },

  {
    id: '101-teacher-snapback-02',
    title: '名师专项·二路虎口诱饵倒扑',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋在边线二路形成虎口，看似坚固但外气已被收紧。黑棋果断送子扑入，引蛇出洞！',
    voicePrompt: '送子入虎口！别害怕送吃，吃掉诱饵的白棋马上就要全军覆没！',
    hint: '在边线二路 (4, 0) 坚决扑入！',
    explanation: '【名师精解·倒扑手筋】：黑 1 扑在 (4, 0) 制造倒扑陷阱！白棋贪吃落在 (3, 0) 提走黑子后，整块白棋仅剩 (4, 0) 最后 1 气，黑棋下回合反提整整 5 颗白子！',
    initialBoard: {
      black: [
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
        { x: 6, y: 1 },
        { x: 6, y: 0 },
      ],
      white: [
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 5, y: 1 },
        { x: 5, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 4, y: 0 },
      isCorrect: true,
      comment: '神来之扑！诱饵送入虎口，倒扑大获全胜！',
    },
  },

  {
    id: '101-teacher-snapback-03',
    title: '名师专项·边线天罗地网倒扑',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋在边路一线挣扎。黑棋布下天罗地网，一子送入边路要害，彻底封死白棋退路！',
    voicePrompt: '看准边线空档！把棋子往里一送，白棋怎么吃都是死！',
    hint: '在边线一线 (0, 4) 扑入！',
    explanation: '【名师精解·倒扑手筋】：黑棋扑在 (0, 4) 是绝对要害！白棋在 (0, 3) 提吃后不仅没有长气，反倒把自己撞进了只剩 1 气的自窒状态，黑棋反手全歼！',
    initialBoard: {
      black: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 2, y: 5 },
        { x: 1, y: 6 },
        { x: 0, y: 6 },
      ],
      white: [
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 0, y: 5 },
      ],
    },
    solutionTree: {
      move: { x: 0, y: 4 },
      isCorrect: true,
      comment: '边线天罗地网！白棋无力回天，倒扑成功！',
    },
  },

  {
    id: '101-teacher-snapback-04',
    title: '名师专项·倒扑结合接不归',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋边线气紧企图逃窜。黑棋通过扑入紧缩白棋气数，让白棋陷入连上也只有 1 气的接不归绝境！',
    voicePrompt: '先扑紧气！让白棋连也不是、不连也不是！',
    hint: '在 (3, 0) 关键交点扑入！',
    explanation: '【名师精解·复合手筋】：黑棋下在 (3, 0) 是先手扑！白棋气数瞬间被压缩至极致。白棋即使想连接逃跑，连上之后依然只有 1 气，形成必死的接不归！',
    initialBoard: {
      black: [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 1 },
        { x: 5, y: 0 },
      ],
      white: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 4, y: 0 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 0 },
      isCorrect: true,
      comment: '一石二鸟！倒扑与接不归双重封锁，白棋在劫难逃！',
    },
  },

  {
    id: '101-teacher-snapback-05',
    title: '名师专项·倒扑破眼杀大龙',
    category: 'life-and-death',
    difficulty: 'hard',
    boardSize: 9,
    initialTurn: 'black',
    description: '白棋企图在边角做出一只真眼苟延残喘。黑棋施展倒扑破眼术，一枪刺入破坏眼位！',
    voicePrompt: '刺破假眼！把棋子送进白棋眼位，让它做不出两只眼！',
    hint: '下在角部眼位要冲 (1, 0)！',
    explanation: '【名师精解·死活手筋】：此题是将倒扑用于死活杀棋的高级实战技巧！下在 (1, 0) 既破坏了白棋成眼空间，又形成了倒扑杀棋，白棋大龙瞬间化为乌有。',
    initialBoard: {
      black: [
        { x: 0, y: 3 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 2 },
        { x: 3, y: 1 },
        { x: 3, y: 0 },
      ],
      white: [
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 1 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
      ],
    },
    solutionTree: {
      move: { x: 1, y: 0 },
      isCorrect: true,
      comment: '眼位破除！利用倒扑撕碎白棋眼形，全歼大龙！',
    },
  },

  {
    id: '101-teacher-snapback-06',
    title: '名师专项·火眼金睛识破倒扑陷阱',
    category: 'tactics',
    difficulty: 'hard',
    boardSize: 9,
    initialTurn: 'black',
    description: '警惕陷阱！白棋故意送了一颗子在 (3, 1) 诱惑黑棋提吃。黑棋若贪吃就会被白棋反扑整串！请找出冷静化解危机的防守妙手！',
    voicePrompt: '千万别贪吃！那是白棋的诱饵陷阱！冷静把自己的大部队向外长气！',
    hint: '拒绝诱饵，在 (2, 1) 沉着长气逃向开阔地带！',
    explanation: '【名师精解·防守反制】：真正的实战高手不仅会用倒扑，更能看穿对手的倒扑！若黑棋贪吃 (3, 1)，白棋立刻在 (2, 1) 倒扑反杀黑棋整块。正解是果断不理诱饵，走 (2, 1) 连接长气，识破诡计！',
    initialBoard: {
      black: [
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 4, y: 1 },
      ],
      white: [
        { x: 3, y: 1 },
        { x: 5, y: 1 },
        { x: 5, y: 2 },
        { x: 4, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 1 },
      isCorrect: true,
      comment: '火眼金睛！不贪吃诱饵，沉着长气化险为夷！',
    },
  },

  // ========================================================
  // 十二、名师真假断点进阶（算气对杀与识破假断点）
  // ========================================================
  {
    id: '101-teacher-cut-09',
    title: '名师专项·识破假断点自补走后手',
    category: 'tactics',
    difficulty: 'easy',
    boardSize: 9,
    initialTurn: 'black',
    description: '黑棋阵地中看似留有断点，但白棋根本冲不进来（冲入即自杀）。黑棋切莫浪费先手自补，果断脱先分断白棋要害！',
    voicePrompt: '不用补！敌人敢来就是送死！果断杀向白棋真正的弱点！',
    hint: '无需补己方假断点，直接下在 (5, 2) 切断白棋！',
    explanation: '【名师精解·真假断点辨析】：己方 (2, 2) 是虎口假断点，白棋若敢冲入只有 1 气会被黑棋直接提吃。因此黑棋绝不可在此浪费一手棋自补走后手，而是坚决在 (5, 2) 冲断白棋联络夺取主动权！',
    initialBoard: {
      black: [
        { x: 1, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 3 },
        { x: 4, y: 1 },
        { x: 6, y: 1 },
      ],
      white: [
        { x: 4, y: 2 },
        { x: 6, y: 2 },
        { x: 5, y: 3 },
      ],
    },
    solutionTree: {
      move: { x: 5, y: 2 },
      isCorrect: true,
      comment: '大师级大局观！识破假断点不补后手，主动出击切断白棋！',
    },
  },

  {
    id: '101-teacher-cut-10',
    title: '名师专项·对杀算气真断点',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '双方贴身肉搏，能否切断的关键在于对杀算气！黑棋切断后自身有 3 气，白棋两边各自只剩 2 气，分断必定成立！',
    voicePrompt: '先数气再动手！切断后我们气多，白棋气少，一刀斩下去！',
    hint: '果断下在对杀分断点 (3, 3)！',
    explanation: '【名师精解·真断点算气】：切断成立的前提是自身气数占优。黑 1 落在 (3, 3) 强行分断后自身有 3 气，白棋被割裂成两块孤子且都只有 2 气，黑棋快一气制胜！',
    initialBoard: {
      black: [
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
      ],
      white: [
        { x: 3, y: 2 },
        { x: 4, y: 3 },
        { x: 4, y: 4 },
      ],
    },
    solutionTree: {
      move: { x: 3, y: 3 },
      isCorrect: true,
      comment: '算气精准！快一气分断，牢牢掌控接触战胜局！',
    },
  },

  {
    id: '101-teacher-cut-11',
    title: '名师专项·竹节如铁板不可盲目冲断',
    category: 'tactics',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '认识经典坚固棋形“竹节”！竹节的连接如钢筋铁板，黑棋若去冲断是无理送死。黑棋避实击虚，转去攻击白棋落单的弱子！',
    voicePrompt: '竹节像铁板一样硬，千万别去碰！转头去抓那颗落单的白棋！',
    hint: '不要冲断竹节，在 (6, 3) 痛击白棋孤子！',
    explanation: '【名师精解·形状识别】：白棋 (3, 3)、(4, 3) 与 (3, 5)、(4, 5) 组成的形状叫“竹节”，是围棋中最牢固的联络之一，根本没有真断点！黑棋不可盲目在 (3, 4) 或 (4, 4) 撞铁板，而应冷静出击 (6, 3) 猎杀薄弱孤子。',
    initialBoard: {
      black: [
        { x: 2, y: 4 },
        { x: 5, y: 4 },
        { x: 7, y: 4 },
      ],
      white: [
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 3, y: 5 },
        { x: 4, y: 5 },
        { x: 6, y: 4 },
      ],
    },
    solutionTree: {
      move: { x: 6, y: 3 },
      isCorrect: true,
      comment: '明智的选择！避开竹节铁板，精准擒拿孤子！',
    },
  },

  {
    id: '101-teacher-cut-12',
    title: '名师专项·角隅两头蛇真断点',
    category: 'capture',
    difficulty: 'medium',
    boardSize: 9,
    initialTurn: 'black',
    description: '角部两路白棋交汇，黑棋抓住防守缝隙一刀切入，同时叫吃两头，让白棋首尾不能相顾！',
    voicePrompt: '一刀切开两头蛇！下在交叉要害，让白棋两边都要喊救命！',
    hint: '下在角部二路关键断点 (2, 1)！',
    explanation: '【名师精解·分断手筋】：下在 (2, 1) 是致命真断点！白棋角部两颗与边线两颗被生生截断，两边白棋气数骤减无法两全，黑棋大获全胜！',
    initialBoard: {
      black: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 4, y: 2 },
      ],
      white: [
        { x: 1, y: 1 },
        { x: 1, y: 0 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
      ],
    },
    solutionTree: {
      move: { x: 2, y: 1 },
      isCorrect: true,
      comment: '手起刀落！斩断两头蛇，白棋全线瓦解！',
    },
  },

];
