import Redis, { RedisOptions } from "ioredis";

/**
 * Configuração do Redis para BullMQ
 */
const createRedisConfig = (): RedisOptions => {
    const config: RedisOptions = {
        host: process.env["REDIS_HOST"] || "localhost",
        port: parseInt(process.env["REDIS_PORT"] || "6379"),
        db: parseInt(process.env["REDIS_DB"] || "0"),
        maxRetriesPerRequest: null, // BullMQ requires this to be null
        lazyConnect: true,
    };

    // Only add password if it exists
    if (process.env["REDIS_PASSWORD"]) {
        config.password = process.env["REDIS_PASSWORD"];
    }

    return config;
};

export const redisConfig = createRedisConfig();

/**
 * Instância do Redis para BullMQ
 */
export const redis = new Redis(redisConfig);

/**
 * Instância do Redis para conexões separadas (workers)
 */
export const createRedisConnection = () => {
    return new Redis(redisConfig);
};

/**
 * Testa a conexão com Redis
 */
export const testRedisConnection = async (): Promise<boolean> => {
    try {
        await redis.ping();
        console.log("✅ Redis connection successful");
        return true;
    } catch (error) {
        console.error("❌ Redis connection failed:", error);
        return false;
    }
};

/**
 * Fecha a conexão com Redis
 */
export const closeRedisConnection = async (): Promise<void> => {
    try {
        await redis.quit();
        console.log("✅ Redis connection closed");
    } catch (error) {
        console.error("❌ Error closing Redis connection:", error);
    }
};
