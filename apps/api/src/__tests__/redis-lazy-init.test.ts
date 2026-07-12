import { describe, it, expect, beforeEach, vi } from "vitest";

function setRemoteEnv() {
  process.env.UPSTASH_REDIS_REST_URL = "https://valid-host.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "remote-token";
}

function unsetEnv() {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

beforeEach(() => {
  vi.resetModules();
  unsetEnv();
});

describe("redis lazy initialization", { timeout: 15000, retry: 3 }, () => {
  describe("module import safety", { timeout: 10000 }, () => {
    it("should not throw when importing the module with env vars missing", async () => {
      await expect(async () => {
        await import("../lib/redis");
      }).not.toThrow();
    });
  });

  describe("getRedis", { timeout: 10000 }, () => {
    it("should throw when env vars are missing", async () => {
      const { getRedis } = await import("../lib/redis");
      expect(() => getRedis()).toThrow();
    });
  });

  describe("getAlertQueue", { timeout: 10000 }, () => {
    it("should throw when env vars are missing", async () => {
      const { getAlertQueue } = await import("../lib/redis");
      expect(() => getAlertQueue()).toThrow();
    });
  });

  describe("getUpstashRestConfig", { timeout: 10000 }, () => {
    it("should throw when env vars are missing", async () => {
      const { getUpstashRestConfig } = await import("../lib/redis");
      expect(() => getUpstashRestConfig()).toThrow();
    });

    it("should return rest config when env vars are set", async () => {
      setRemoteEnv();
      const { getUpstashRestConfig } = await import("../lib/redis");
      const config = getUpstashRestConfig();
      expect(config).toHaveProperty("url");
      expect(config).toHaveProperty("token");
      expect(config.url).toBe("https://valid-host.upstash.io");
      expect(config.token).toBe("remote-token");
    });
  });

  describe("proxy exports defer errors", { timeout: 10000 }, () => {
    it("should throw on property access when env vars are missing", async () => {
      const { redis, alertQueue, upstashRestConfig } = await import("../lib/redis");
      expect(() => redis.options).toThrow();
      expect(() => alertQueue.name).toThrow();
      expect(() => upstashRestConfig.url).toThrow();
    });
  });
});
