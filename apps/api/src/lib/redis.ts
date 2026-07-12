import { Queue, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { logger } from './logger';

interface UpstashRedisConfig {
  restUrl: string;
  restToken: string;
  redisHost: string;
  redisPort: number;
}

function getUpstashConfig(): UpstashRedisConfig {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!restUrl) {
    throw new Error('Missing required environment variable: UPSTASH_REDIS_REST_URL');
  }

  if (!restToken) {
    throw new Error('Missing required environment variable: UPSTASH_REDIS_REST_TOKEN');
  }

  const parsed = new URL(restUrl);

  return {
    restUrl,
    restToken,
    redisHost: parsed.hostname,
    redisPort: 6379,
  };
}

// ── Lazy initialization ────────────────────────────────────
// Uses sentinel pattern (null | undefined) so importing this module never
// throws at module scope. The client is created on first access.
let _upstashConfig: UpstashRedisConfig | null | undefined;
let _redis: IORedis | null | undefined;
let _alertQueue: Queue | null | undefined;
let _upstashRestConfig: { url: string; token: string } | null | undefined;
let _connectionOptions: ConnectionOptions | null | undefined;

function getUpstashConfigLazy(): UpstashRedisConfig {
  if (_upstashConfig !== undefined) {
    if (!_upstashConfig) throw new Error('UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN are not configured');
    return _upstashConfig;
  }
  _upstashConfig = getUpstashConfig();
  return _upstashConfig;
}

function getConnectionOptions(): ConnectionOptions {
  if (_connectionOptions !== undefined) {
    if (!_connectionOptions) throw new Error('UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN are not configured');
    return _connectionOptions;
  }

  const cfg = getUpstashConfigLazy();
  const isLocalRedis = cfg.redisHost === 'localhost' || cfg.redisHost === '127.0.0.1' || cfg.redisHost === '::1';

  _connectionOptions = isLocalRedis
    ? {
        host: cfg.redisHost,
        port: cfg.redisPort,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      }
    : {
        host: cfg.redisHost,
        port: cfg.redisPort,
        password: cfg.restToken,
        username: 'default',
        tls: { rejectUnauthorized: true },
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      };

  return _connectionOptions;
}

/**
 * Lazy Redis client — created on first access. Never throws at module scope.
 */
export function getRedis(): IORedis {
  if (_redis !== undefined) {
    if (!_redis) throw new Error('Redis not initialized — check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    return _redis;
  }

  const opts = getConnectionOptions();
  _redis = new IORedis(opts as RedisOptions);
  _redis.on('error', (err: Error) => {
    logger.error({ err }, 'Redis connection error');
  });

  return _redis;
}

/**
 * Lazy alert queue — created on first access.
 */
export function getAlertQueue(): Queue {
  if (_alertQueue !== undefined) {
    if (!_alertQueue) throw new Error('Redis not initialized — cannot create alert queue');
    return _alertQueue;
  }

  _alertQueue = new Queue('qcanary-alerts', {
    connection: getConnectionOptions(),
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 1000,
    },
  });

  return _alertQueue;
}

/**
 * Lazy Upstash REST config — for rate limiter pipeline calls.
 */
export function getUpstashRestConfig(): { url: string; token: string } {
  if (_upstashRestConfig !== undefined) {
    if (!_upstashRestConfig) throw new Error('UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN are not configured');
    return _upstashRestConfig;
  }

  const cfg = getUpstashConfigLazy();
  _upstashRestConfig = { url: cfg.restUrl, token: cfg.restToken };
  return _upstashRestConfig;
}

// ── Re-export for backward compatibility ───────────────────
// Existing code that imports `redis` or `alertQueue` directly still works
// via Proxy objects that lazily delegate to the getter functions above.
export const redisConnectionOptions: ConnectionOptions = new Proxy({} as ConnectionOptions, {
  get(_target, prop) {
    return Reflect.get(getConnectionOptions(), prop);
  },
});

export const redis: IORedis = new Proxy<IORedis>({} as IORedis, {
  get(_target, prop: keyof IORedis) {
    return getRedis()[prop];
  },
});

export const alertQueue: Queue = new Proxy<Queue>({} as Queue, {
  get(_target, prop: keyof Queue) {
    return getAlertQueue()[prop];
  },
});

export const upstashRestConfig: { url: string; token: string } = new Proxy({} as { url: string; token: string }, {
  get(_target, prop: keyof { url: string; token: string }) {
    return getUpstashRestConfig()[prop];
  },
});
