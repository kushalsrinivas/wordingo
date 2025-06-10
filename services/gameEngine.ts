import { databaseService, Game, WordBankItem } from './database';

export interface GameSession {
  sessionId: number;
  currentRound: number;
  currentStreak: number;
  gamesPlayedInRound: string[];
  availableGames: Game[];
  startTime: number;
  isActive: boolean;
}

export interface CurrentGame {
  game: Game;
  question: WordBankItem;
  startTime: number;
}

class GameEngine {
  private currentSession: GameSession | null = null;
  private currentGame: CurrentGame | null = null;

  async startNewSession(): Promise<GameSession> {
    const sessionId = await databaseService.createSession();
    const availableGames = await databaseService.getGamesByType();
    
    console.log('Available games:', availableGames);
    
    if (availableGames.length === 0) {
      throw new Error('No games available in database');
    }
    
    this.currentSession = {
      sessionId,
      currentRound: 1,
      currentStreak: 0,
      gamesPlayedInRound: [],
      availableGames,
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

    console.log('Current session:', this.currentSession);

    // Check if all games in current round have been played
    if (this.currentSession.gamesPlayedInRound.length >= this.currentSession.availableGames.length) {
      // Start new round
      this.currentSession.currentRound++;
      this.currentSession.gamesPlayedInRound = [];
      
      await databaseService.updateSession(this.currentSession.sessionId, {
        round: this.currentSession.currentRound
      });
    }

    // Get available games for this round (not yet played)
    const availableGameTypes = this.currentSession.availableGames.filter(
      game => !this.currentSession!.gamesPlayedInRound.includes(game.type)
    );

    console.log('Available game types for this round:', availableGameTypes);
    console.log('Games played in round:', this.currentSession.gamesPlayedInRound);

    if (availableGameTypes.length === 0) {
      console.log('No available game types');
      return null;
    }

    // Randomly select a game type
    const randomIndex = Math.floor(Math.random() * availableGameTypes.length);
    const selectedGame = availableGameTypes[randomIndex];

    console.log('Selected game:', selectedGame);

    // Get difficulty based on current round
    const difficulty = Math.min(this.currentSession.currentRound, 3); // Cap at difficulty 3

    console.log('Difficulty level:', difficulty);

    // Get a random question for this game type and difficulty
    const questions = await databaseService.getWordBankByType(selectedGame.type, difficulty);
    
    console.log(`Questions for ${selectedGame.type} at difficulty ${difficulty}:`, questions.length);
    
    if (questions.length === 0) {
      // Fallback to difficulty 1 if no questions found for current difficulty
      const fallbackQuestions = await databaseService.getWordBankByType(selectedGame.type, 1);
      console.log(`Fallback questions for ${selectedGame.type} at difficulty 1:`, fallbackQuestions.length);
      
      if (fallbackQuestions.length === 0) {
        console.log('No questions found even at difficulty 1');
        return null;
      }
      const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      this.currentGame = {
        game: selectedGame,
        question: randomQuestion,
        startTime: Date.now()
      };
    } else {
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      this.currentGame = {
        game: selectedGame,
        question: randomQuestion,
        startTime: Date.now()
      };
    }

    // Mark this game type as played in current round
    this.currentSession.gamesPlayedInRound.push(selectedGame.type);

    console.log('Selected question:', this.currentGame.question);

    return this.currentGame;
  }

  async submitAnswer(answer: string): Promise<{ isCorrect: boolean; correctAnswer: string; timeTaken: number }> {
    if (!this.currentSession || !this.currentGame) {
      throw new Error('No active game session');
    }

    const timeTaken = Date.now() - this.currentGame.startTime;
    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswer = this.currentGame.question.answer.toLowerCase().trim();
    const isCorrect = normalizedAnswer === correctAnswer;

    // Store the correct answer before potentially clearing currentGame
    const correctAnswerToReturn = this.currentGame.question.answer;

    // Save game result
    await databaseService.saveGameResult(
      this.currentSession.sessionId,
      this.currentGame.game.id,
      isCorrect,
      timeTaken
    );

    if (isCorrect) {
      // Update streak
      this.currentSession.currentStreak++;
      await databaseService.updateSession(this.currentSession.sessionId, {
        streak: this.currentSession.currentStreak,
        score: this.currentSession.currentStreak
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
      correctAnswer: correctAnswerToReturn,
      timeTaken
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