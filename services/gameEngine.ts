import { databaseService } from './database';

export interface GameSession {
  sessionId: number;
  currentRound: number;
  currentDifficulty: DifficultyMode;
  currentStreak: number;
  score: number;
  history: RoundLog[];
  startTime: number;
  isActive: boolean;
}

export interface CurrentGame {
  secretWord: string;
  difficulty: DifficultyMode;
  jumbleClue?: string;
  maxGuesses: number;
  startTime: number;
}

// -------------------------------
// Static list of 5-letter words for Wordle rounds.
// Feel free to expand – must be valid English words.
const WORDLE_WORDS = [
  'apple',
  'crane',
  'slate',
  'ocean',
  'zesty',
  'lunar',
  'brick',
  'candy',
  'flame',
  'grind',
  'plant',
  'honey',
  'frost',
  'glass',
  'cloud',
];

type DifficultyMode = 'jumble' | 'standard' | 'sudden';

interface RoundLog {
  word: string;
  difficulty: DifficultyMode;
  won: boolean;
  guessesUsed: number;
  points: number;
}

class GameEngine {
  private currentSession: GameSession | null = null;
  private currentGame: CurrentGame | null = null;
  private wordleGameId: number | null = null;

  private readonly difficulties: DifficultyMode[] = ['jumble', 'standard', 'sudden'];

  private pickNextDifficulty(prev?: DifficultyMode): DifficultyMode {
    let next: DifficultyMode;
    do {
      next = this.difficulties[Math.floor(Math.random() * this.difficulties.length)];
    } while (next === prev);
    return next;
  }

  private shuffleWord(word: string): string {
    const arr = word.split('');
    // Fisher-Yates shuffle – repeat until not identical to original
    let shuffled = word;
    while (shuffled === word) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      shuffled = arr.join('');
    }
    return shuffled.toUpperCase();
  }

  async startNewSession(): Promise<GameSession> {
    const sessionId = await databaseService.createSession();
    const games = await databaseService.getGamesByType();
    const wordleGame = games.find((g) => g.type === 'wordle');
    if (!wordleGame) throw new Error('Wordle game type not found in DB');
    this.wordleGameId = wordleGame.id;
    
    this.currentSession = {
      sessionId,
      currentRound: 1,
      currentDifficulty: 'jumble',
      currentStreak: 0,
      score: 0,
      history: [],
      startTime: Date.now(),
      isActive: true
    };

    // Update daily streak
    await databaseService.updateDailyStreak();

    return this.currentSession;
  }

  async getNextGame(): Promise<CurrentGame | null> {
    if (!this.currentSession || !this.currentSession.isActive) {
      console.log('No active session');
      return null;
    }

    // Pick next difficulty randomly (no repeat)
    const nextDifficulty = this.pickNextDifficulty(this.currentSession.currentDifficulty);
    this.currentSession.currentDifficulty = nextDifficulty;

    // Prepare round params
    const secretWord = WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
    const maxGuesses = nextDifficulty === 'sudden' ? 3 : 6;
    const jumbleClue = nextDifficulty === 'jumble' ? this.shuffleWord(secretWord) : undefined;

    this.currentGame = {
      secretWord,
      difficulty: nextDifficulty,
      jumbleClue,
      maxGuesses,
      startTime: Date.now(),
    };

    return this.currentGame;
  }

  async submitAnswer(answer: string): Promise<{ isCorrect: boolean; correctAnswer: string; timeTaken: number; points: number }> {
    if (!this.currentSession || !this.currentGame) {
      throw new Error('No active game session');
    }

    const timeTaken = Date.now() - this.currentGame.startTime;
    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswer = this.currentGame.secretWord.toLowerCase().trim();
    const isCorrect = normalizedAnswer === correctAnswer;

    // Determine points
    let basePoints = 0;
    if (this.currentGame.difficulty === 'jumble') basePoints = 75;
    else if (this.currentGame.difficulty === 'standard') basePoints = 100;
    else basePoints = 150;

    // guessesUsed will be passed separately by UI, but for DB we set 0.

    const pointsAwarded = isCorrect ? basePoints : 0;

    // Save game result
    if (this.wordleGameId) {
      await databaseService.saveGameResult(
        this.currentSession.sessionId,
        this.wordleGameId,
        isCorrect,
        timeTaken
      );
    }

    if (isCorrect) {
      // Update streak
      this.currentSession.currentStreak++;
      this.currentSession.score += pointsAwarded;
      await databaseService.updateSession(this.currentSession.sessionId, {
        streak: this.currentSession.currentStreak,
        score: this.currentSession.score
      });
      
      // Clear current game to prepare for next one
      this.currentGame = null;
    } else {
      // End session on wrong answer but keep session data for result screen
      this.currentSession.isActive = false;
      
      // Update session end time
      const endTime = new Date().toISOString();
      await databaseService.updateSession(this.currentSession.sessionId, {
        end_time: endTime
      });

      // Update user stats
      const stats = await databaseService.getUserStats();
      if (stats) {
        const newTotalGames = stats.total_games + this.currentSession.currentStreak;
        const newLongestStreak = Math.max(stats.longest_streak, this.currentSession.currentStreak);
        
        await databaseService.updateUserStats({
          total_games: newTotalGames,
          longest_streak: newLongestStreak
        });
      }
    }

    return {
      isCorrect,
      correctAnswer,
      timeTaken,
      points: pointsAwarded
    };
  }

  async endSession(completed: boolean = true): Promise<void> {
    if (!this.currentSession) return;

    const endTime = new Date().toISOString();
    await databaseService.updateSession(this.currentSession.sessionId, {
      end_time: endTime
    });

    // Update user stats
    const stats = await databaseService.getUserStats();
    if (stats) {
      const newTotalGames = stats.total_games + this.currentSession.currentStreak;
      const newLongestStreak = Math.max(stats.longest_streak, this.currentSession.currentStreak);
      
      await databaseService.updateUserStats({
        total_games: newTotalGames,
        longest_streak: newLongestStreak
      });
    }

    this.currentSession.isActive = false;
    this.currentSession = null;
    this.currentGame = null;
  }

  // Method to clean up session after viewing results
  cleanupSession(): void {
    this.currentSession = null;
    this.currentGame = null;
  }

  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  getCurrentGame(): CurrentGame | null {
    return this.currentGame;
  }

  async getSessionSummary(sessionId: number) {
    const results = await databaseService.getSessionResults(sessionId);
    const gamesByType = await databaseService.getGamesByType();
    
    const summary = {
      totalGames: results.length,
      correctAnswers: results.filter(r => r.is_correct).length,
      incorrectAnswers: results.filter(r => !r.is_correct).length,
      averageTime: results.length > 0 ? results.reduce((sum, r) => sum + r.time_taken, 0) / results.length : 0,
      gameBreakdown: gamesByType.map(game => {
        const gameResults = results.filter(r => r.game_id === game.id);
        return {
          gameName: game.name,
          played: gameResults.length,
          correct: gameResults.filter(r => r.is_correct).length,
          averageTime: gameResults.length > 0 ? 
            gameResults.reduce((sum, r) => sum + r.time_taken, 0) / gameResults.length : 0
        };
      }).filter(g => g.played > 0)
    };

    return summary;
  }

  // Helper method to validate answers for different game types
  validateAnswer(gameType: string, userAnswer: string, correctAnswer: string, options?: string[]): boolean {
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();

    switch (gameType) {
      case 'anagram':
        // For anagrams, check if the letters match (ignoring spaces and case)
        const userLetters = normalizedUser.replace(/\s/g, '').split('').sort().join('');
        const correctLetters = normalizedCorrect.replace(/\s/g, '').split('').sort().join('');
        return userLetters === correctLetters && normalizedUser === normalizedCorrect;
      
      case 'association':
      case 'synonym':
      case 'odd_one_out':
        // For multiple choice, exact match required
        return normalizedUser === normalizedCorrect;
      
      case 'fill_blanks':
      case 'spelling':
      case 'wordle':
        // For text input, exact match required
        return normalizedUser === normalizedCorrect;
      
      default:
        return normalizedUser === normalizedCorrect;
    }
  }

  // Helper method to shuffle array (for randomizing options)
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const gameEngine = new GameEngine(); 