import Redis from "ioredis";

/**
 * Configuração do Redis para BullMQ
 */
export const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
};

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
