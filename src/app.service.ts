import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getHello(): string {
    return 'Bisa di akses ya!';
  }

  async testRedis() {
    const testKey = 'test:redis:connection';
    const testValue = {
      message: 'Redis is working!',
      timestamp: new Date().toISOString(),
      random: Math.random(),
    };

    try {
      // Test 1: Set value in cache
      await this.cacheManager.set(testKey, testValue, 60000); // TTL 60 seconds

      // Test 2: Get value from cache
      const cachedValue = await this.cacheManager.get(testKey);

      // Test 3: Check if value matches
      const isWorking = JSON.stringify(cachedValue) === JSON.stringify(testValue);

      return {
        status: 'success',
        redis_connected: true,
        test_results: {
          set_operation: 'OK',
          get_operation: 'OK',
          data_integrity: isWorking ? 'OK' : 'FAILED',
        },
        cached_data: cachedValue,
        original_data: testValue,
        info: {
          key: testKey,
          ttl: '60 seconds',
          message: 'Redis cache is working properly! ✅',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        redis_connected: false,
        error: error.message,
        message: 'Failed to connect to Redis ❌',
      };
    }
  }
}
