import { StageInfo } from '../types/go';

export const ADVENTURE_STAGES: StageInfo[] = [
  {
    id: 1,
    title: '第一章：气的秘密与吃子',
    subtitle: '认识棋子的呼吸，学习把对手的棋子吃掉！',
    icon: '🌱',
    themeColor: 'from-emerald-400 to-green-600',
    puzzles: [
      {
        id: '1-1',
        title: '角上的白棋只有最后一口气',
        category: 'capture',
        difficulty: 'easy',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋在角上已经被黑棋堵住了，黑棋走哪一步能直接吃掉白棋？',
        hint: '看一看白棋上下左右哪一个交叉点还是空的！',
        initialBoard: {
          black: [{ x: 1, y: 0 }],
          white: [{ x: 0, y: 0 }],
        },
        solutionTree: {
          move: { x: 0, y: 1 },
          isCorrect: true,
          comment: '太棒了！下在 (0,1) 紧住最后一口气，成功把角上的白棋吃掉！',
        },
      },
      {
        id: '1-2',
        title: '边上单子打吃提子',
        category: 'capture',
        difficulty: 'easy',
        boardSize: 13,
        initialTurn: 'black',
        description: '边上的白棋被包围了两侧，只剩下唯一的向内气口，黑棋走哪里能把它吃掉？',
        hint: '堵住白棋剩下的唯一气口 (3,1)！',
        initialBoard: {
          black: [
            { x: 2, y: 0 },
            { x: 4, y: 0 },
          ],
          white: [{ x: 3, y: 0 }],
        },
        solutionTree: {
          move: { x: 3, y: 1 },
          isCorrect: true,
          comment: '漂亮！下在 (3,1) 堵住了白棋在边线上的最后一口气！',
        },
      },
      {
        id: '1-3',
        title: '危机时刻！小黑棋快快逃跑',
        category: 'liberties',
        difficulty: 'easy',
        boardSize: 13,
        initialTurn: 'black',
        description: '中间的小黑棋被白棋包围了三面，马上就要被吃了！快帮小黑棋找到逃跑的长气点！',
        hint: '看看小黑棋上下左右哪个方向没有白棋拦路？',
        initialBoard: {
          black: [{ x: 3, y: 3 }],
          white: [
            { x: 3, y: 2 },
            { x: 3, y: 4 },
            { x: 2, y: 3 },
          ],
        },
        solutionTree: {
          move: { x: 4, y: 3 },
          isCorrect: true,
          comment: '成功逃脱！往右边 (4,3) 一长，小黑棋连成了两颗子，气变多了！',
        },
      },
    ],
  },
  {
    id: 2,
    title: '第二章：趣味吃子小战术',
    subtitle: '学会“双打吃”与“抱吃”，做吃子小高手！',
    icon: '⚡',
    themeColor: 'from-amber-400 to-orange-500',
    puzzles: [
      {
        id: '2-1',
        title: '神奇的双打吃（一石二鸟）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '两颗白棋靠得很近但没有连在一起，黑棋走哪一步能同时让两颗白棋都只剩一口气？',
        hint: '找到两颗白棋正中间的交叉点！',
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
          comment: '完美的双打吃！落子在 (3,2)，两边的白棋同时被打吃，无论对方救哪一颗，你都能吃到另一颗！',
        },
      },
      {
        id: '2-2',
        title: '关门吃（门吃）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋想往下面逃跑，但前面已经有两颗黑棋像门柱一样守着了，黑棋怎样关上大门把它吃掉？',
        hint: '挡在白棋想要前进的正前方，关上大门！',
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
          comment: '砰！门关上啦！白棋无路可逃，被直接提掉！',
        },
      },
    ],
  },
  {
    id: 3,
    title: '第三章：安全禁区与打劫',
    subtitle: '认清老虎的嘴巴，不要自己送上门！',
    icon: '🛡️',
    themeColor: 'from-blue-400 to-indigo-600',
    puzzles: [
      {
        id: '3-1',
        title: '千万别进老虎嘴（禁着点与虎口）',
        category: 'ko',
        difficulty: 'medium',
        boardSize: 13,
        initialTurn: 'black',
        description: '白棋掉进了黑棋的三面虎口里，黑棋一口把它吞掉吧！',
        hint: '下在三颗黑棋包围的正中间！',
        initialBoard: {
          black: [
            { x: 3, y: 2 },
            { x: 2, y: 3 },
            { x: 4, y: 3 },
          ],
          white: [{ x: 3, y: 3 }],
        },
        solutionTree: {
          move: { x: 3, y: 4 },
          isCorrect: true,
          comment: '虎口大合拢！白棋被彻底吃掉啦！',
        },
      },
    ],
  },
  {
    id: 4,
    title: '第四章：做眼与死活',
    subtitle: '两只完整的眼睛才能真正活棋！',
    icon: '👑',
    themeColor: 'from-purple-400 to-pink-500',
    puzzles: [
      {
        id: '4-1',
        title: '关键一子：分成两只真眼',
        category: 'life-and-death',
        difficulty: 'hard',
        boardSize: 13,
        initialTurn: 'black',
        description: '黑棋的大房子需要中间隔开一堵墙，才能变成两间独立的房间（两只眼），走在哪里能让黑棋活棋？',
        hint: '找到中间那个能把大眼分成左右两间小眼的要点！',
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
          comment: '做眼成功！这步棋分成了两只清澈完整的真眼，白棋再也吃不掉你了！',
        },
      },
    ],
  },
];
