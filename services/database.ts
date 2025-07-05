import * as SQLite from 'expo-sqlite';

export interface Game {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface Session {
  id: number;
  start_time: string;
  end_time?: string;
  score: number;
  streak: number;
}

export interface GameResult {
  id: number;
  session_id: number;
  game_id: number;
  is_correct: boolean;
  time_taken: number;
  difficulty?: string;
}

export interface UserStats {
  id: number;
  total_games: number;
  longest_streak: number;
  last_played: string;
  daily_streak: number;
}

export interface WordBankItem {
  id: number;
  game_type: string;
  question: string;
  answer: string;
  options?: string;
  difficulty: number;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      console.log('Opening database...');
      this.db = await SQLite.openDatabaseAsync('wordingo.db');
      console.log('Database opened successfully');
      
      console.log('Creating tables...');
      await this.createTables();
      console.log('Tables created successfully');
      
      console.log('Seeding initial data...');
      await this.seedInitialData();
      console.log('Database initialization complete');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time TEXT NOT NULL,
        end_time TEXT,
        score INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS game_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        time_taken INTEGER NOT NULL,
        difficulty TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions (id),
        FOREIGN KEY (game_id) REFERENCES games (id)
      );

      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY,
        total_games INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_played TEXT,
        daily_streak INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS word_bank (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_type TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        options TEXT,
        difficulty INTEGER DEFAULT 1
      );
    `);

    // Add difficulty column if it doesn't exist (for existing databases)
    try {
      await this.db.execAsync(`
        ALTER TABLE game_results ADD COLUMN difficulty TEXT;
      `);
    } catch (error) {
      // Column already exists, ignore error
      console.log('Difficulty column already exists or could not be added');
    }
  }

  private async seedInitialData() {
    if (!this.db) return;

    try {
      // Check if data already exists
      const gameCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM games');
      console.log('Existing game count:', gameCount);
      
      if ((gameCount as any)?.count > 0) {
        console.log('Games already exist, skipping seed');
        return;
      }

      console.log('Seeding initial data...');

      // Insert game types using parameterized queries
      const gameTypes = [
        { name: 'Anagram Solver', description: 'Rearrange letters to form a word', type: 'anagram' },
        { name: 'Word Association', description: 'Find the opposite or related word', type: 'association' },
        { name: 'Wordle', description: 'Guess the 5-letter word', type: 'wordle' },
        { name: 'Odd One Out', description: 'Find the word that doesn\'t belong', type: 'odd_one_out' },
        { name: 'Synonym Match', description: 'Find the word with similar meaning', type: 'synonym' },
        { name: 'Spelling Bee', description: 'Spell the word correctly', type: 'spelling' }
      ];

      for (const gameType of gameTypes) {
        await this.db.runAsync(
          'INSERT INTO games (name, description, type) VALUES (?, ?, ?)',
          [gameType.name, gameType.description, gameType.type]
        );
      }

      console.log('Games inserted');

      // Initialize user stats
      await this.db.runAsync(`
        INSERT OR REPLACE INTO user_stats (id, total_games, longest_streak, daily_streak) 
        VALUES (1, 0, 0, 0)
      `);

      console.log('User stats initialized');

      // Seed word bank with sample data
      await this.seedWordBank();
      
      console.log('Word bank seeded');
    } catch (error) {
      console.error('Failed to seed initial data:', error);
      throw error;
    }
  }

  private async seedWordBank() {
    if (!this.db) return;

    const wordBankData = [
      // Anagram - Difficulty 1
      { game_type: 'anagram', question: 'LISTEN', answer: 'SILENT', difficulty: 1 },
      { game_type: 'anagram', question: 'EARTH', answer: 'HEART', difficulty: 1 },
      { game_type: 'anagram', question: 'ANGEL', answer: 'GLEAN', difficulty: 1 },
      { game_type: 'anagram', question: 'BREAD', answer: 'BEARD', difficulty: 1 },
      
      // Anagram - Difficulty 2
      { game_type: 'anagram', question: 'STRESSED', answer: 'DESSERTS', difficulty: 2 },
      { game_type: 'anagram', question: 'TEACHER', answer: 'CHEATER', difficulty: 2 },
      { game_type: 'anagram', question: 'DORMITORY', answer: 'DIRTY ROOM', difficulty: 2 },
      
      // Word Association - Difficulty 1
      { game_type: 'association', question: 'Hot', answer: 'Cold', options: JSON.stringify(['Cold', 'Warm', 'Fire', 'Ice']), difficulty: 1 },
      { game_type: 'association', question: 'Up', answer: 'Down', options: JSON.stringify(['Down', 'High', 'Top', 'Above']), difficulty: 1 },
      { game_type: 'association', question: 'Big', answer: 'Small', options: JSON.stringify(['Small', 'Large', 'Huge', 'Giant']), difficulty: 1 },
      { game_type: 'association', question: 'Fast', answer: 'Slow', options: JSON.stringify(['Slow', 'Quick', 'Rapid', 'Swift']), difficulty: 1 },
      
      // Word Association - Difficulty 2
      { game_type: 'association', question: 'Abundant', answer: 'Scarce', options: JSON.stringify(['Scarce', 'Plenty', 'Rich', 'Full']), difficulty: 2 },
      { game_type: 'association', question: 'Ancient', answer: 'Modern', options: JSON.stringify(['Modern', 'Old', 'Historic', 'Vintage']), difficulty: 2 },
      
      // Wordle - Difficulty 1
      { game_type: 'wordle', question: 'The color of grass', answer: 'green', difficulty: 1 },
      { game_type: 'wordle', question: 'A vehicle with four wheels', answer: 'car', difficulty: 1 },
      
      // Wordle - Difficulty 2
      { game_type: 'wordle', question: 'The study of living organisms', answer: 'biology', difficulty: 2 },
      { game_type: 'wordle', question: 'A person who designs buildings', answer: 'architect', difficulty: 2 },
      
      // Odd One Out - Difficulty 1
      { game_type: 'odd_one_out', question: 'Apple, Orange, Car, Banana', answer: 'Car', options: JSON.stringify(['Apple', 'Orange', 'Car', 'Banana']), difficulty: 1 },
      { game_type: 'odd_one_out', question: 'Dog, Cat, Fish, Chair', answer: 'Chair', options: JSON.stringify(['Dog', 'Cat', 'Fish', 'Chair']), difficulty: 1 },
      { game_type: 'odd_one_out', question: 'Red, Blue, Green, Book', answer: 'Book', options: JSON.stringify(['Red', 'Blue', 'Green', 'Book']), difficulty: 1 },
      
      // Odd One Out - Difficulty 2
      { game_type: 'odd_one_out', question: 'Mercury, Venus, Earth, Jupiter', answer: 'Jupiter', options: JSON.stringify(['Mercury', 'Venus', 'Earth', 'Jupiter']), difficulty: 2 },
      { game_type: 'odd_one_out', question: 'Piano, Guitar, Violin, Painting', answer: 'Painting', options: JSON.stringify(['Piano', 'Guitar', 'Violin', 'Painting']), difficulty: 2 },
      
      // Synonym Match - Difficulty 1
      { game_type: 'synonym', question: 'Happy', answer: 'Joyful', options: JSON.stringify(['Sad', 'Joyful', 'Angry', 'Tired']), difficulty: 1 },
      { game_type: 'synonym', question: 'Big', answer: 'Large', options: JSON.stringify(['Small', 'Large', 'Tiny', 'Mini']), difficulty: 1 },
      { game_type: 'synonym', question: 'Smart', answer: 'Clever', options: JSON.stringify(['Dumb', 'Clever', 'Slow', 'Lazy']), difficulty: 1 },
      
      // Synonym Match - Difficulty 2
      { game_type: 'synonym', question: 'Magnificent', answer: 'Splendid', options: JSON.stringify(['Terrible', 'Splendid', 'Awful', 'Poor']), difficulty: 2 },
      { game_type: 'synonym', question: 'Abundant', answer: 'Plentiful', options: JSON.stringify(['Scarce', 'Plentiful', 'Rare', 'Limited']), difficulty: 2 },
      
      // Spelling Bee - Difficulty 1
      { game_type: 'spelling', question: 'A large African animal with a trunk', answer: 'elephant', difficulty: 1 },
      { game_type: 'spelling', question: 'The color of grass', answer: 'green', difficulty: 1 },
      { game_type: 'spelling', question: 'A vehicle with four wheels', answer: 'car', difficulty: 1 },
      
      // Spelling Bee - Difficulty 2
      { game_type: 'spelling', question: 'The study of living organisms', answer: 'biology', difficulty: 2 },
      { game_type: 'spelling', question: 'A person who designs buildings', answer: 'architect', difficulty: 2 },
    ];

    for (const item of wordBankData) {
      await this.db.runAsync(
        'INSERT INTO word_bank (game_type, question, answer, options, difficulty) VALUES (?, ?, ?, ?, ?)',
        [item.game_type, item.question, item.answer, item.options || null, item.difficulty]
      );
    }
  }

  async getUserStats(): Promise<UserStats | null> {
    if (!this.db) return null;
    return await this.db.getFirstAsync('SELECT * FROM user_stats WHERE id = 1') as UserStats;
  }

  async updateUserStats(stats: Partial<UserStats>) {
    if (!this.db) return;
    const fields = Object.keys(stats).map(key => `${key} = ?`).join(', ');
    const values = Object.values(stats);
    await this.db.runAsync(`UPDATE user_stats SET ${fields} WHERE id = 1`, values);
  }

  async createSession(): Promise<number> {
    if (!this.db) return 0;
    const result = await this.db.runAsync(
      'INSERT INTO sessions (start_time, score, streak) VALUES (?, 0, 0)',
      [new Date().toISOString()]
    );
    return result.lastInsertRowId;
  }

  async updateSession(sessionId: number, updates: Partial<Session>) {
    if (!this.db) return;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    await this.db.runAsync(`UPDATE sessions SET ${fields} WHERE id = ?`, [...values, sessionId]);
  }

  async getGamesByType(): Promise<Game[]> {
    if (!this.db) {
      console.log('Database not initialized');
      return [];
    }
    const games = await this.db.getAllAsync('SELECT * FROM games') as Game[];
    console.log('Retrieved games from database:', games);
    return games;
  }

  async getWordBankByType(gameType: string, difficulty: number): Promise<WordBankItem[]> {
    if (!this.db) return [];
    return await this.db.getAllAsync(
      'SELECT * FROM word_bank WHERE game_type = ? AND difficulty = ? ORDER BY RANDOM()',
      [gameType, difficulty]
    ) as WordBankItem[];
  }

  async saveGameResult(sessionId: number, gameId: number, isCorrect: boolean, timeTaken: number, difficulty?: string) {
    if (!this.db) return;
    await this.db.runAsync(
      'INSERT INTO game_results (session_id, game_id, is_correct, time_taken, difficulty) VALUES (?, ?, ?, ?, ?)',
      [sessionId, gameId, isCorrect, timeTaken, difficulty || null]
    );
  }

  async getSessionResults(sessionId: number): Promise<GameResult[]> {
    if (!this.db) return [];
    return await this.db.getAllAsync(
      'SELECT * FROM game_results WHERE session_id = ?',
      [sessionId]
    ) as GameResult[];
  }

  async updateDailyStreak() {
    if (!this.db) return;
    const stats = await this.getUserStats();
    if (!stats) return;

    const today = new Date().toDateString();
    const lastPlayed = stats.last_played ? new Date(stats.last_played).toDateString() : null;
    
    let newDailyStreak = stats.daily_streak;
    
    if (lastPlayed !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastPlayed === yesterday.toDateString()) {
        newDailyStreak += 1;
      } else if (lastPlayed !== today) {
        newDailyStreak = 1;
      }
      
      await this.updateUserStats({
        last_played: new Date().toISOString(),
        daily_streak: newDailyStreak
      });
    }
  }

  // Debug method to reset database
  async resetDatabase() {
    if (!this.db) return;
    
    console.log('Resetting database...');
    
    // Drop all tables
    await this.db.execAsync(`
      DROP TABLE IF EXISTS games;
      DROP TABLE IF EXISTS sessions;
      DROP TABLE IF EXISTS game_results;
      DROP TABLE IF EXISTS user_stats;
      DROP TABLE IF EXISTS word_bank;
    `);
    
    // Recreate tables and seed data
    await this.createTables();
    await this.seedInitialData();
    
    console.log('Database reset complete');
  }
}

export const databaseService = new DatabaseService(); 