import Redis from 'ioredis';
import { promises as fs } from 'fs';
import path from 'path';

export interface CacheConfig {
  memoryTTL?: number;
  redisTTL?: number;
  diskTTL?: number;
  redisUrl?: string;
  diskPath?: string;
}

export class SmartCache<T> {
  private memoryCache: Map<string, { data: T; expiry: number }>;
  private redisClient?: Redis;
  private diskPath: string;
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.memoryCache = new Map();
    this.config = {
      memoryTTL: config.memoryTTL || 300000, // 5 minutes
      redisTTL: config.redisTTL || 3600000, // 1 hour
      diskTTL: config.diskTTL || 86400000, // 24 hours
      redisUrl: config.redisUrl || 'redis://localhost:6379',
      diskPath: config.diskPath || path.join(process.cwd(), 'cache')
    };
    this.diskPath = this.config.diskPath;
  }

  async init(): Promise<void> {
    // Initialize Redis if URL is provided
    if (this.config.redisUrl) {
      try {
        this.redisClient = new Redis(this.config.redisUrl);
      } catch (error) {
        console.warn('Redis initialization failed:', error);
      }
    }

    // Ensure disk cache directory exists
    try {
      await fs.mkdir(this.diskPath, { recursive: true });
    } catch (error) {
      console.warn('Disk cache directory creation failed:', error);
    }
  }

  async get(key: string): Promise<T | null> {
    // Check memory cache first (L1)
    const memoryResult = this.getFromMemory(key);
    if (memoryResult) return memoryResult;

    // Check Redis cache (L2)
    const redisResult = await this.getFromRedis(key);
    if (redisResult) {
      await this.setInMemory(key, redisResult);
      return redisResult;
    }

    // Check disk cache (L3)
    const diskResult = await this.getFromDisk(key);
    if (diskResult) {
      await this.setInMemory(key, diskResult);
      await this.setInRedis(key, diskResult);
      return diskResult;
    }

    return null;
  }

  async set(key: string, data: T, ttl?: number): Promise<void> {
    const memoryTTL = ttl || this.config.memoryTTL;
    const redisTTL = ttl || this.config.redisTTL;
    const diskTTL = ttl || this.config.diskTTL;

    // Set in all cache layers
    await Promise.all([
      this.setInMemory(key, data, memoryTTL),
      this.setInRedis(key, data, redisTTL),
      this.setInDisk(key, data, diskTTL)
    ]);
  }

  private getFromMemory(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.data;
  }

  private async getFromRedis(key: string): Promise<T | null> {
    if (!this.redisClient) return null;
    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis get failed:', error);
      return null;
    }
  }

  private async getFromDisk(key: string): Promise<T | null> {
    try {
      const filePath = path.join(this.diskPath, `${key}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const { value, expiry } = JSON.parse(data);
      if (Date.now() > expiry) {
        await fs.unlink(filePath);
        return null;
      }
      return value;
    } catch (error) {
      return null;
    }
  }

  private setInMemory(key: string, data: T, ttl = this.config.memoryTTL): void {
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  private async setInRedis(key: string, data: T, ttl = this.config.redisTTL): Promise<void> {
    if (!this.redisClient) return;
    try {
      await this.redisClient.set(
        key,
        JSON.stringify(data),
        'PX',
        ttl
      );
    } catch (error) {
      console.warn('Redis set failed:', error);
    }
  }

  private async setInDisk(key: string, data: T, ttl = this.config.diskTTL): Promise<void> {
    try {
      const filePath = path.join(this.diskPath, `${key}.json`);
      await fs.writeFile(
        filePath,
        JSON.stringify({
          value: data,
          expiry: Date.now() + ttl
        })
      );
    } catch (error) {
      console.warn('Disk cache write failed:', error);
    }
  }

  async cleanup(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Disconnect Redis
    if (this.redisClient) {
      await this.redisClient.quit();
    }

    // Clean expired disk cache
    try {
      const files = await fs.readdir(this.diskPath);
      await Promise.all(
        files.map(async (file) => {
          try {
            const filePath = path.join(this.diskPath, file);
            const data = await fs.readFile(filePath, 'utf-8');
            const { expiry } = JSON.parse(data);
            if (Date.now() > expiry) {
              await fs.unlink(filePath);
            }
          } catch (error) {
            console.warn(`Failed to clean cache file ${file}:`, error);
          }
        })
      );
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }
} 