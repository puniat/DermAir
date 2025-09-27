import Database from 'better-sqlite3';
import path from 'path';
import { mkdir } from 'fs/promises';
import type { UserProfile, DailyLog, DailyCheckInFormData, WeatherData } from '@/types';

class DatabaseService {
  private db: Database.Database | null = null;
  private initialized = false;

  constructor() {
    // Only skip during server-side rendering/build, not runtime
    if (typeof window !== 'undefined') {
      return; // Skip on client side
    }

    try {
      // Initialize database on server side
      const dbPath = path.join(process.cwd(), 'dev.db');
      
      this.db = new Database(dbPath);
      
      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
    } catch (error) {
      console.warn('Database initialization failed:', error);
      this.db = null;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure data directory exists
      if (process.env.NODE_ENV === 'production') {
        await mkdir(path.join(process.cwd(), 'data'), { recursive: true });
      }

      // Create tables
      this.createTables();
      this.initialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private createTables(): void {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        age_range TEXT,
        skin_type TEXT,
        triggers TEXT, -- JSON array
        location TEXT, -- JSON object
        preferences TEXT, -- JSON object
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Daily logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        date DATE,
        itch_score INTEGER NOT NULL,
        redness_score INTEGER NOT NULL,
        medication_used BOOLEAN DEFAULT 0,
        notes TEXT,
        photo_url TEXT,
        weather_data TEXT, -- JSON object
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Weather cache table (for performance)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        id TEXT PRIMARY KEY,
        latitude REAL,
        longitude REAL,
        data TEXT, -- JSON object
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications log table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notification_log (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        type TEXT,
        title TEXT,
        body TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs (user_id, date);
      CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs (date);
      CREATE INDEX IF NOT EXISTS idx_weather_cache_coords ON weather_cache (latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_notification_log_user ON notification_log (user_id);
    `);
  }

  // User methods
  async createUser(profile: Omit<UserProfile, 'created_at'>): Promise<UserProfile> {
    await this.initialize();
    
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, age_range, skin_type, triggers, location, preferences, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const user: UserProfile = {
      ...profile,
      created_at: new Date()
    };

    stmt.run(
      user.id,
      user.email || null,
      user.age_range || null,
      user.skin_type || null,
      JSON.stringify(user.triggers || []),
      JSON.stringify(user.location || {}),
      JSON.stringify(user.preferences || {})
    );

    return user;
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    await this.initialize();
    
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      age_range: row.age_range,
      skin_type: row.skin_type,
      triggers: JSON.parse(row.triggers || '[]'),
      severityHistory: [], // Will be populated from daily_logs
      preferences: JSON.parse(row.preferences || '{}'),
      location: JSON.parse(row.location || '{}'),
      created_at: new Date(row.created_at),
      research_opt_in: row.research_opt_in
    };
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<void> {
    await this.initialize();
    
    const stmt = this.db.prepare(`
      UPDATE users 
      SET age_range = ?, skin_type = ?, triggers = ?, location = ?, preferences = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      updates.age_range || null,
      updates.skin_type || null,
      JSON.stringify(updates.triggers || []),
      JSON.stringify(updates.location || {}),
      JSON.stringify(updates.preferences || {}),
      id
    );
  }

  // Daily log methods
  async createDailyLog(log: Omit<DailyLog, 'created_at'>): Promise<DailyLog> {
    await this.initialize();
    
    const stmt = this.db.prepare(`
      INSERT INTO daily_logs (id, user_id, date, itch_score, redness_score, medication_used, notes, photo_url, weather_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const dailyLog: DailyLog = {
      ...log,
      created_at: new Date()
    };

    stmt.run(
      dailyLog.id,
      dailyLog.user_id,
      dailyLog.date.toISOString().split('T')[0], // YYYY-MM-DD format
      dailyLog.itch_score,
      dailyLog.redness_score,
      dailyLog.medication_used ? 1 : 0,
      dailyLog.notes || null,
      dailyLog.photo_url || null,
      JSON.stringify(dailyLog.weather_data)
    );

    return dailyLog;
  }

  async getDailyLogs(userId: string, days: number = 30): Promise<DailyLog[]> {
    await this.initialize();
    
    const stmt = this.db.prepare(`
      SELECT * FROM daily_logs 
      WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
      ORDER BY date DESC
    `);

    const rows = stmt.all(userId, days) as any[];
    
    return rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      date: new Date(row.date),
      itch_score: row.itch_score,
      redness_score: row.redness_score,
      medication_used: row.medication_used === 1,
      notes: row.notes,
      photo_url: row.photo_url,
      weather_data: JSON.parse(row.weather_data),
      created_at: new Date(row.created_at)
    }));
  }

  async getDailyLogByDate(userId: string, date: Date): Promise<DailyLog | null> {
    await this.initialize();
    
    const dateStr = date.toISOString().split('T')[0];
    const stmt = this.db.prepare(`
      SELECT * FROM daily_logs 
      WHERE user_id = ? AND date = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const row = stmt.get(userId, dateStr) as any;
    if (!row) return null;

    return {
      id: row.id,
      user_id: row.user_id,
      date: new Date(row.date),
      itch_score: row.itch_score,
      redness_score: row.redness_score,
      medication_used: row.medication_used === 1,
      notes: row.notes,
      photo_url: row.photo_url,
      weather_data: JSON.parse(row.weather_data),
      created_at: new Date(row.created_at)
    };
  }

  async updateDailyLog(id: string, updates: Partial<DailyCheckInFormData>): Promise<void> {
    await this.initialize();
    
    const stmt = this.db.prepare(`
      UPDATE daily_logs 
      SET itch_score = ?, redness_score = ?, medication_used = ?, notes = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.itch_score,
      updates.redness_score,
      updates.medication_used ? 1 : 0,
      updates.notes || null,
      id
    );
  }

  // Weather cache methods
  async cacheWeatherData(lat: number, lon: number, data: WeatherData): Promise<void> {
    await this.initialize();
    
    const id = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO weather_cache (id, latitude, longitude, data, timestamp)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(id, lat, lon, JSON.stringify(data));
  }

  async getCachedWeatherData(lat: number, lon: number, maxAgeMinutes: number = 30): Promise<WeatherData | null> {
    await this.initialize();
    
    const id = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const stmt = this.db.prepare(`
      SELECT * FROM weather_cache 
      WHERE id = ? AND timestamp > datetime('now', '-' || ? || ' minutes')
    `);

    const row = stmt.get(id, maxAgeMinutes) as any;
    if (!row) return null;

    return JSON.parse(row.data);
  }

  // Notification log methods
  async logNotification(userId: string, type: string, title: string, body: string): Promise<void> {
    await this.initialize();
    
    const stmt = this.db.prepare(`
      INSERT INTO notification_log (id, user_id, type, title, body)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(`notif_${Date.now()}`, userId, type, title, body);
  }

  // Analytics methods
  async getSymptomTrends(userId: string, days: number = 30): Promise<{
    avgItch: number;
    avgRedness: number;
    medicationDays: number;
    totalDays: number;
  }> {
    await this.initialize();
    
    const stmt = this.db.prepare(`
      SELECT 
        AVG(itch_score) as avgItch,
        AVG(redness_score) as avgRedness,
        SUM(medication_used) as medicationDays,
        COUNT(*) as totalDays
      FROM daily_logs 
      WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
    `);

    const result = stmt.get(userId, days) as any;
    
    return {
      avgItch: Number(result.avgItch || 0),
      avgRedness: Number(result.avgRedness || 0),
      medicationDays: Number(result.medicationDays || 0),
      totalDays: Number(result.totalDays || 0)
    };
  }

  // Cleanup methods
  async cleanup(): Promise<void> {
    // Remove old weather cache (older than 24 hours)
    this.db.exec(`DELETE FROM weather_cache WHERE timestamp < datetime('now', '-24 hours')`);
    
    // Remove old notification logs (older than 30 days)
    this.db.exec(`DELETE FROM notification_log WHERE sent_at < datetime('now', '-30 days')`);
    
    // Vacuum database to reclaim space
    this.db.exec('VACUUM');
  }

  close(): void {
    this.db.close();
  }
}

// Singleton instance
export const db = new DatabaseService();