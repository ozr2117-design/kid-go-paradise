export interface UserProgress {
  stars: Record<string, number>; // puzzleId -> stars (1-3)
  completedPuzzles: string[];
  unlockedStageId: number;
  soundMuted: boolean;
  showCoordinates: boolean;
  battleWins: Record<string, number>; // animalId -> wins
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
};

export class ProgressStore {
  static load(): UserProgress {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...defaultProgress, ...JSON.parse(data) };
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

  static recordPuzzleSuccess(puzzleId: string, stageId: number, starsEarned: number = 3): UserProgress {
    const p = this.load();
    const prevStars = p.stars[puzzleId] || 0;
    p.stars[puzzleId] = Math.max(prevStars, starsEarned);

    if (!p.completedPuzzles.includes(puzzleId)) {
      p.completedPuzzles.push(puzzleId);
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
