import IORedis, { Redis } from 'ioredis';

export class RedisWrapper {
    private redisClient: Redis;
    private localSet: Set<string> = new Set();
    private useRedis: boolean = true;

    constructor(redisUrl: string) {
        this.redisClient = new IORedis(redisUrl);

        this.redisClient.on('connect', () => {
            this.useRedis = true;
        });

        this.redisClient.on('error', () => {
            this.useRedis = false;
        });

        this.redisClient.on('end', () => {
            this.useRedis = false;
        });
    };

    async add(key: string, value: string, ttl: number): Promise<void> {
        if (this.useRedis) {
            await this.redisClient.multi().sadd(key, value).set(`key:${value}`, '', 'EX', ttl).exec();
        } else {
            this.localSet.add(value);
            setTimeout(() => this.localSet.delete(value), ttl * 1000);
        };
    };

    async has(key: string, value: string): Promise<boolean> {
        if (this.useRedis) {
            return !!(await this.redisClient.sismember(key, value));
        } else {
            return this.localSet.has(value);
        };
    };

    async delete(key: string, value: string): Promise<void> {
        if (this.useRedis) {
            await this.redisClient.multi().srem(key, value).del(`key:${value}`).exec();
        } else {
            this.localSet.delete(value);
        };
    };
};