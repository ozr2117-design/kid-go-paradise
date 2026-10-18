import { AnimalOpponent } from '../types/go';

export const ANIMAL_OPPONENTS: AnimalOpponent[] = [
  {
    id: 'rabbit',
    name: '萌萌兔',
    avatar: '🐰',
    rank: '25K 启蒙萌新',
    difficulty: 'beginner',
    boardSize: 7,
    captureTarget: 1, // 先吃1子获胜！
    intro: '你好呀！我是萌萌兔，刚刚学会下棋，让我们来一场吃子小游戏吧！先吃到 1 颗棋子就赢啦！',
    taunts: [
      '哇，我的胡萝卜掉了，你可别吃我的棋子哦！',
      '咦？你好像要围住我了呀！',
      '看我跳到这里～',
    ],
    praises: [
      '太厉害啦！你把我的小棋子吃掉啦！',
      '你好聪明，我都来不及逃跑呢！',
      '恭喜你获胜！我还要向你多学习～',
    ],
  },
  {
    id: 'bear',
    name: '憨憨熊',
    avatar: '🐻',
    rank: '20K 入门小将',
    difficulty: 'intermediate',
    boardSize: 9,
    captureTarget: 3, // 先吃3子获胜！
    intro: '吼吼！我是憨憨熊，我力气大胃口也大！在 9×9 棋盘上，谁先吃满 3 颗棋子谁获胜！',
    taunts: [
      '嘿嘿，我的棋子很结实，你吃不到我的～',
      '小心哦，我正盯着你的断点呢！',
      '看我这一手大熊掌！',
    ],
    praises: [
      '好痛啊，我的小熊棋子被你连吃3颗！',
      '你的双打吃太厉害了，佩服佩服！',
      '你已经是个合格的小棋手啦！',
    ],
  },
  {
    id: 'fox',
    name: '聪聪狐',
    avatar: '🦊',
    rank: '15K 战术高手',
    difficulty: 'advanced',
    boardSize: 9,
    captureTarget: 5, // 先吃5子获胜！
    intro: '嘻嘻！我是聪聪狐，我精通各种吃子妙招与做眼战术。先吃满 5 颗棋子获胜，敢来挑战我吗？',
    taunts: [
      '小心掉进我的战术陷阱里哦～',
      '注意你的棋子气数，别被我打吃了！',
      '这一步可不好应付吧？',
    ],
    praises: [
      '居然破了我的战术！你太神机妙算啦！',
      '真是一场精彩的对局，我的五颗棋子全被你拿下了！',
      '你的水平已经可以去挑战更高难度的死活题啦！',
    ],
  },
];
