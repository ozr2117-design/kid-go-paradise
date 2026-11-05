import { AnimalOpponent } from '../types/go';

export const ROBOT_OPPONENTS: AnimalOpponent[] = [
  {
    id: 'robot-18k',
    name: '18K 呆萌机',
    avatar: '🤖',
    rank: '18K 启蒙小助手',
    difficulty: 'beginner',
    boardSize: 13,
    captureTarget: 5, // 13路先吃5子获胜
    intro: '哔哔！我是 18K 呆萌机，陪你扎实练棋！先吃到 5 颗棋子就赢啦！',
    taunts: [
      '哇，我的能量模块掉了，你可别吃我的棋子哦！',
      '咦？你好像要围住我了呀！',
      '看我机械臂跳到这里～',
    ],
    praises: [
      '太厉害啦！你把我的小棋子吃掉啦！',
      '你好聪明，我的传感器都没反应过来呢！',
      '恭喜你获胜！我还要向你多学习～',
    ],
  },
  {
    id: 'robot-17k',
    name: '17K 巡逻机',
    avatar: '🚁',
    rank: '17K 巡逻侦察兵',
    difficulty: 'intermediate',
    boardSize: 13,
    captureTarget: 8, // 13路先吃8子获胜
    intro: '滴滴！我是 17K 巡逻机！侦察全盘断点，先吃 8 颗子算赢，看你能突破我的巡逻防线吗？',
    taunts: [
      '雷达锁定！我的棋子很结实，你吃不到我的～',
      '注意你的棋形，螺旋桨正在巡视断点！',
      '看我这一手巡逻飞刺！',
    ],
    praises: [
      '警报解除！防线被你攻破，连吃 8 颗棋子！',
      '你的突破太敏锐了，雷达完全被你绕过了！',
      '你已经是个合格的小棋手啦！',
    ],
  },
  {
    id: 'robot-16k',
    name: '16K 哨兵机',
    avatar: '🛡️',
    rank: '16K 防线铁哨兵',
    difficulty: 'advanced',
    boardSize: 13,
    captureTarget: 12, // 13路先吃12子获胜
    intro: '咔嚓！我是 16K 哨兵机，防守扎实、绝不轻弃大龙！先吃满 12 颗棋子获胜，敢来挑战铁壁吗？',
    taunts: [
      '铁壁装甲展开！小心掉进我的哨卡陷阱里～',
      '注意你的棋子气数，别被我打吃了！',
      '大龙死守，这一步可不好应付吧？',
    ],
    praises: [
      '居然打破了我的铁壁！你太神机妙算啦！',
      '真是一场精彩的对局，我的十二颗棋子全被你拿下了！',
      '你的水平已经具备冲锋战将的实力啦！',
    ],
  },
  {
    id: 'robot-15k',
    name: '15K 冲锋机',
    avatar: '⚔️',
    rank: '15K 锐利冲锋官',
    difficulty: 'master',
    boardSize: 13,
    captureTarget: 15, // 13路先吃15子获胜
    intro: '轰鸣！我是 15K 冲锋机！KataGo 神经网络直觉加持，短兵相接杀气凶悍！先吃满 15 颗子获胜！',
    taunts: [
      '冲锋动力全开！你的断点逃不过我的双刃剑！',
      '小心！这一招反叫吃突围你接得住吗？',
      '大龙死守到底，休想轻易拔掉我的重块！',
      '看看谁先抢到要害分界！',
    ],
    praises: [
      '太敏锐了！居然反包围了我的冲锋大龙！',
      '好沉稳的防守，连我的冲锋反击都被你化解了！',
      '佩服！你吃满了 15 颗子，真正的吃子锦标赛冲段王！',
    ],
  },
];

// 别名兼容导出，确保旧引用与测试零冲突
export const ANIMAL_OPPONENTS: AnimalOpponent[] = ROBOT_OPPONENTS;
