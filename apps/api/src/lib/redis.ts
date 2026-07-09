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

const upstashConfig = getUpstashConfig();

const isLocalRedis =
  upstashConfig.redisHost === 'localhost' ||
  upstashConfig.redisHost === '127.0.0.1' ||
  upstashConfig.redisHost === '::1';

export const redisConnectionOptions: ConnectionOptions = isLocalRedis
  ? {
      host: upstashConfig.redisHost,
      port: upstashConfig.redisPort,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    }
  : {
      host: upstashConfig.redisHost,
      port: upstashConfig.redisPort,
      password: upstashConfig.restToken,
      username: 'default',
      tls: { rejectUnauthorized: true },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

export const redis = new IORedis(redisConnectionOptions as RedisOptions);
redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

export const alertQueue = new Queue('qcanary-alerts', {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 1000,
  },
});

export const upstashRestConfig = {
  url: upstashConfig.restUrl,
  token: upstashConfig.restToken,
};
