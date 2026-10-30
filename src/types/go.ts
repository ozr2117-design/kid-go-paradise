export type Color = 'black' | 'white';
export type BoardSize = 7 | 9 | 13 | 19;

export interface Point {
  x: number;
  y: number;
}

export interface Move {
  x: number;
  y: number;
  color: Color;
}

export interface StoneGroup {
  color: Color;
  points: Point[];
  liberties: Point[]; // Unique liberty points
}

export interface BoardState {
  size: BoardSize;
  grid: (Color | null)[][]; // grid[y][x]
  turn: Color;
  captures: {
    black: number; // captured by black
    white: number; // captured by white
  };
  lastMove: Move | null;
  koPoint: Point | null; // Point that cannot be played due to simple Ko rule
  moveHistory: Move[];
  consecutivePasses: number;
  isGameOver: boolean;
  winner?: Color | 'draw' | null;
  winReason?: string;
}

export type GameMode = 'adventure' | 'battle' | 'sparring' | 'puzzle' | 'sandbox' | 'daily';

export type WinRuleMode = 'capture' | 'territory' | 'timed-capture';

export type AISparringLevel = 'novice' | 'club' | 'master' | 'grandmaster';

export interface SparringProfile {
  id: AISparringLevel;
  name: string;
  avatar: string;
  rank: string;
  description: string;
}

export interface SenseiReviewData {
  headline: string;
  stageAnalysis: string[];
  criticalAdvice: string;
  tacticalScore: number;
}

export interface GameSettlementData {
  winner: 'player' | 'ai' | 'draw';
  winReason: string;
  winRule: WinRuleMode;
  playerCaptures: number;
  aiCaptures: number;
  playerTerritory: number;
  aiTerritory: number;
  totalMoves: number;
  titleBadge: string;
  stars: number;
  senseiReview?: SenseiReviewData;
}


export interface PuzzleNode {
  comment?: string;
  move?: Point; // Expected next move in this branch
  isCorrect?: boolean;
  children?: PuzzleNode[];
}

export interface PuzzleData {
  id: string;
  title: string;
  category: 'liberties' | 'capture' | 'ko' | 'life-and-death' | 'tactics';
  difficulty: 'easy' | 'medium' | 'hard';
  boardSize: BoardSize;
  initialTurn: Color;
  description: string;
  voicePrompt?: string; // Kid-friendly colloquial voice reading text
  hint: string;
  initialBoard: {
    black: Point[];
    white: Point[];
  };
  solutionTree: PuzzleNode; // Solution tree with variations
}

export interface StageInfo {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  themeColor: string;
  puzzles: PuzzleData[];
}

export interface AnimalOpponent {
  id: string;
  name: string;
  avatar: string;
  rank: string; // e.g. "1D~2D 强力鹰王"
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master' | 'grandmaster';
  boardSize: BoardSize;
  captureTarget: number; // e.g. first to 5, 8, 12, 15, 20 captures
  intro: string;
  taunts: string[];
  praises: string[];
}
