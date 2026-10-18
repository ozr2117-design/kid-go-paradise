export interface UserProgress {
  stars: Record<string, number>; // puzzleId -> stars (1-3)
  completedPuzzles: string[];
  unlockedStageId: number;
  soundMuted: boolean;
  showCoordinates: boolean;
  battleWins: Record<string, number>; // animalId -> wins
  mistakePuzzles: string[]; // puzzleId list of mistakes to eliminate
}

const STORAGE_KEY = 'kid_go_user_progress_v1';

const defaultProgress: UserProgress = {
  stars: {},
  completedPuzzles: [],
  unlockedStageId: 1,
  soundMuted: false,
  showCoordinates: true,
  battleWins: {
    rabbit: 0,
    bear: 0,
    fox: 0,
  },
  mistakePuzzles: [],
};

export class ProgressStore {
  static load(): UserProgress {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...defaultProgress,
          ...parsed,
          mistakePuzzles: Array.isArray(parsed.mistakePuzzles) ? parsed.mistakePuzzles : [],
        };
      }
    } catch (e) {
      console.warn('Failed to load user progress:', e);
    }
    return defaultProgress;
  }

  static save(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save user progress:', e);
    }
  }

  static recordMistake(puzzleId: string): UserProgress {
    const p = this.load();
    if (!p.mistakePuzzles.includes(puzzleId)) {
      p.mistakePuzzles.push(puzzleId);
      this.save(p);
    }
    return p;
  }

  static resolveMistake(puzzleId: string): UserProgress {
    const p = this.load();
    if (p.mistakePuzzles.includes(puzzleId)) {
      p.mistakePuzzles = p.mistakePuzzles.filter((id) => id !== puzzleId);
      this.save(p);
    }
    return p;
  }

  static recordPuzzleSuccess(puzzleId: string, stageId: number, starsEarned: number = 3): UserProgress {
    const p = this.load();
    const prevStars = p.stars[puzzleId] || 0;
    p.stars[puzzleId] = Math.max(prevStars, starsEarned);

    if (!p.completedPuzzles.includes(puzzleId)) {
      p.completedPuzzles.push(puzzleId);
    }

    // Automatically eliminate from mistake notebook once solved!
    if (p.mistakePuzzles.includes(puzzleId)) {
      p.mistakePuzzles = p.mistakePuzzles.filter((id) => id !== puzzleId);
    }

    // Unlock next stage if this stage is finished
    p.unlockedStageId = Math.max(p.unlockedStageId, stageId + 1);
    this.save(p);
    return p;
  }

  static recordBattleWin(animalId: string): UserProgress {
    const p = this.load();
    p.battleWins[animalId] = (p.battleWins[animalId] || 0) + 1;
    this.save(p);
    return p;
  }
}
