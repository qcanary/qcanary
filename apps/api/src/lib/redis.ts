import dotenv from 'dotenv';
dotenv.config();

import { Queue, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';

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

export const redisConnectionOptions: ConnectionOptions = {
  host: upstashConfig.redisHost,
  port: upstashConfig.redisPort,
  password: upstashConfig.restToken,
  username: 'default',
  tls: {},
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redis = new IORedis(redisConnectionOptions);

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
