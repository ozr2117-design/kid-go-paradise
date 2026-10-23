import { StageInfo } from '../types/go';

export const ADVENTURE_STAGES: StageInfo[] = [
  // ==========================================
  // 第一章：神奇扭羊头·走楼梯大追捕（征子与防守实战关卡）
  // ==========================================
  {
    id: 1,
    title: '第一章：扭羊头·走楼梯大追捕',
    subtitle: '看清前方有没有白棋引征救兵，判断征子是否成立！征吃成立果断追击，征子不利稳健防守！',
    icon: '🪜',
    themeColor: 'from-amber-400 to-orange-500',
    puzzles: [
      {
        id: '1-1',
        title: '第1关：空旷大草地（征吃成立）',
        category: 'tactics',
        difficulty: 'easy',
        boardSize: 9,
        initialTurn: 'black',
        description: '小黑羊包围了小白羊！前面是一大片空旷草地，没有白棋引征救兵！轮到黑棋，征吃成立！快走出关键打吃，像走楼梯一样连续征吃它！',
        voicePrompt: '小黑羊包围了小白羊！前面是一大片空草地，没有白棋救兵，征吃成立！快走楼梯追着吃吧！',
        hint: '看准白棋逃跑的方向，下在 (3, 2) 封门打吃，像走楼梯一样征吃到底！',
        initialBoard: {
          black: [
            { x: 5, y: 1 },
            { x: 4, y: 1 },
            { x: 6, y: 2 },
            { x: 5, y: 3 },
          ],
          white: [
            { x: 5, y: 2 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 2 },
          isCorrect: true,
          comment: '太棒了！像走楼梯一样一左一右连续打吃，白棋根本逃不掉，征吃大获全胜！',
        },
      },
      {
        id: '1-2',
        title: '第2关：前方白棋引征（征子不利）',
        category: 'tactics',
        difficulty: 'easy',
        boardSize: 9,
        initialTurn: 'black',
        description: '危险！快看左下方！那里坐着一颗白棋引征救兵！如果黑棋走楼梯追过去，就会撞上救兵被反杀！征子不利！黑棋必须稳健防守，扎实加固自家大门！',
        voicePrompt: '危险！快看左下方！那里有一颗白棋引征救兵在等它，追过去会撞上，征子不利！先扎实防守吧！',
        hint: '前面有白棋引征接应，千万别盲目走楼梯追打！下在 (4, 3) 扎实加固自己的大门！',
        initialBoard: {
          black: [
            { x: 5, y: 1 },
            { x: 4, y: 1 },
            { x: 6, y: 2 },
            { x: 5, y: 3 },
          ],
          white: [
            { x: 5, y: 2 },
            { x: 2, y: 4 },
          ],
        },
        solutionTree: {
          move: { x: 4, y: 3 },
          isCorrect: true,
          comment: '太聪明了！识破了白棋的引征诡计，稳稳补好自身缺陷，避免了崩盘！',
        },
      },
      {
        id: '1-3',
        title: '第3关：己方伏兵接应（征吃成立）',
        category: 'tactics',
        difficulty: 'easy',
        boardSize: 9,
        initialTurn: 'black',
        description: '哈哈！看左下方！我们黑棋的好朋友早就拉起大网在等它啦！白棋逃过去就会直接撞网上！征吃成立！放心走楼梯向前追击！',
        voicePrompt: '哈哈！看左下方，我们黑棋的好朋友在路口接应，白棋逃不掉的，征吃成立，放心走楼梯追吃吧！',
        hint: '白棋逃跑路上全是黑棋的伏兵，大胆下在 (3, 2) 走楼梯打吃！',
        initialBoard: {
          black: [
            { x: 5, y: 1 },
            { x: 4, y: 1 },
            { x: 6, y: 2 },
            { x: 5, y: 3 },
            { x: 2, y: 5 },
            { x: 3, y: 5 },
          ],
          white: [
            { x: 5, y: 2 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 2 },
          isCorrect: true,
          comment: '精准命中！白棋一头撞进黑棋的伏击网，征吃大获全胜！',
        },
      },
      {
        id: '1-4',
        title: '第4关：楼梯进行中·顺畅追击（征吃成立）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 9,
        initialTurn: 'black',
        description: '楼梯已经爬了一半啦！顺着节奏一左一右，前面畅通无阻，征吃成立！快走出下一步连续打吃，把白棋赶到死路！',
        voicePrompt: '楼梯已经搭了一半啦！顺着节奏一左一右，前面没有阻碍，征吃成立！接着连续打吃吧！',
        hint: '保持走楼梯的节奏，下在 (3, 4) 紧贴白棋继续叫吃！',
        initialBoard: {
          black: [
            { x: 5, y: 1 },
            { x: 4, y: 1 },
            { x: 6, y: 2 },
            { x: 5, y: 3 },
            { x: 3, y: 2 },
            { x: 2, y: 3 },
          ],
          white: [
            { x: 5, y: 2 },
            { x: 4, y: 2 },
            { x: 4, y: 3 },
            { x: 3, y: 3 },
          ],
        },
        solutionTree: {
          move: { x: 3, y: 4 },
          isCorrect: true,
          comment: '节奏大师！连环打吃行云流水，白棋无路可逃！',
        },
      },
      {
        id: '1-5',
        title: '第5关：半路引征接应（征子不利）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 9,
        initialTurn: 'black',
        description: '快踩刹车！仔细看楼梯旁边，不知道什么时候多了一颗白棋在接应引征！再硬追下去白棋连成一大片就要反扑啦！征子不利！我们要下在要害稳守阵地！',
        voicePrompt: '快踩刹车！仔细看楼梯旁边多了一颗白棋在接应引征，征子不利，千万不能硬追，稳守阵地！',
        hint: '白棋引征救兵就在前方，硬追自己浑身是破绽！下在 (2, 2) 稳守阵地，绝不上当！',
        initialBoard: {
          black: [
            { x: 5, y: 1 },
            { x: 4, y: 1 },
            { x: 6, y: 2 },
            { x: 5, y: 3 },
            { x: 3, y: 2 },
            { x: 2, y: 3 },
          ],
          white: [
            { x: 5, y: 2 },
            { x: 4, y: 2 },
            { x: 4, y: 3 },
            { x: 3, y: 3 },
            { x: 3, y: 5 },
          ],
        },
        solutionTree: {
          move: { x: 2, y: 2 },
          isCorrect: true,
          comment: '火眼金睛！及时刹车稳住局势，真正的围棋高手就该这么下！',
        },
      },
      {
        id: '1-6',
        title: '第6关：双白子筑起铁壁（征子不利）',
        category: 'tactics',
        difficulty: 'medium',
        boardSize: 9,
        initialTurn: 'black',
        description: '快看左下角！两颗白棋手拉手筑起了一道大铁壁！白棋跑过去就会和它们抱在一起变成大怪兽！征子不利！千万不能硬征！我们要关紧大门防守！',
        voicePrompt: '快看左下角！两颗白棋手拉手筑起了大铁壁，跑过去就会连成一大片，征子不利，先关紧大门防守！',
        hint: '白棋的铁壁太厚啦！征子不利千万不能硬征！下在 (4, 3) 关紧自家大门！',
        initialBoard: {
          black: [
            { x: 5, y: 1 },
            { x: 4, y: 1 },
            { x: 6, y: 2 },
            { x: 5, y: 3 },
          ],
          white: [
            { x: 5, y: 2 },
            { x: 2, y: 5 },
            { x: 3, y: 6 },
          ],
        },
        solutionTree: {
          move: { x: 4, y: 3 },
          isCorrect: true,
          comment: '太棒了！一眼识破白棋的坚固防线，落子沉稳防守，大师风范！',
        },
      },
      {
        id: '1-7',
        title: '第7关：一路悬崖大跳水（征吃提子）',
        category: 'tactics',
        difficulty: 'hard',
        boardSize: 9,
        initialTurn: 'black',
        description: '大决战！白棋已经被我们一路走楼梯征吃赶到了第一线悬崖边！只剩最后一步，下在最后一阶楼梯，把整条白龙一口气提吃光！',
        voicePrompt: '大决战！白棋已经被赶到悬崖边啦，走出最后一阶楼梯，把大白龙全部提光吧！',
        hint: '下在边线最后一口气 (0, 6)，大白龙瞬间被全部提吃！',
        initialBoard: {
          black: [
            { x: 3, y: 3 },
            { x: 2, y: 4 },
            { x: 1, y: 5 },
            { x: 0, y: 5 },
            { x: 2, y: 6 },
          ],
          white: [
            { x: 2, y: 5 },
            { x: 1, y: 6 },
          ],
        },
        solutionTree: {
          move: { x: 0, y: 6 },
          isCorrect: true,
          comment: '🎉 轰！大白龙全部被提吃！扭羊头征吃终极奥义大功告成！',
        },
      },
      {
        id: '1-8',
        title: '第8关：釜底抽薪·化解引征（分断要害）',
        category: 'tactics',
        difficulty: 'hard',
        boardSize: 9,
        initialTurn: 'black',
        description: '白棋以为有救兵引征很得意！看我们黑棋一招切断它的接应线，破除引征！下在关键分断要害，直接破掉白棋的引征美梦！',
        voicePrompt: '白棋以为有救兵很得意！看黑棋一招切断它的救兵，下在分断要点，破除引征！',
        hint: '下在 (2, 4) 抢先卡住白棋的接应线路！',
        initialBoard: {
          black: [
            { x: 5, y: 1 },
            { x: 4, y: 1 },
            { x: 6, y: 2 },
            { x: 5, y: 3 },
            { x: 1, y: 4 },
          ],
          white: [
            { x: 5, y: 2 },
            { x: 3, y: 4 },
          ],
        },
        solutionTree: {
          move: { x: 2, y: 4 },
          isCorrect: true,
          comment: '神来之笔！一刀两断破除引征，切断了白棋的所有希望！',
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
];
