import IORedis, { Redis } from 'ioredis';
import {sleep} from "./custom";

class RedisConnectionManager {
    private static instance: RedisConnectionManager;
    public redis_client: Redis;
    protected is_connected: boolean = false;
    private reconnect_attempts: number = 0;

    private constructor() {
        this.redis_client = new IORedis(process.env.REDIS_URI!, {
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });

        this.redis_client.on('connect', () => {
            this.is_connected = true;
            this.reconnect_attempts = 0;
        });

        this.redis_client.on('reconnecting', () => {
            console.log(`Attempting to reconnect to Redis (attempt ${this.reconnect_attempts + 1})...`);

            ++this.reconnect_attempts;
        });

        this.redis_client.on('error', (err) => {
            this.is_connected = false;
            console.error('Redis connection error:', err);
        });

        this.redis_client.on('end', () => {
            this.is_connected = false;
            console.log('Redis connection closed');
        });
    }

    public static getInstance(): RedisConnectionManager {
        if (!RedisConnectionManager.instance) {
            RedisConnectionManager.instance = new RedisConnectionManager();
        }

        return RedisConnectionManager.instance;
    }

    public async waitForConnection(): Promise<void> {
        while (!this.is_connected) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}

function waitForConnection(_: any, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        if ((this as RedisConnectionManager).waitForConnection) {
            await (this as RedisConnectionManager).waitForConnection();
        }

        return await originalMethod.apply(this, args);
    };

    return descriptor;
}

export class RedisKeyValueStore {
    public connection = RedisConnectionManager.getInstance();

    async get(key: string): Promise<string | null> {
        return this.connection.redis_client.get(key);
    }

    async set(key: string, value: string): Promise<void> {
        await this.connection.redis_client.set(key, value);
    }

    async delete(key: string): Promise<void> {
        await this.connection.redis_client.del(key);
    }
}

export class RedisTTLManager {
    public connection = RedisConnectionManager.getInstance();

    async set_with_ttl(key: string, value: string, ttl: number): Promise<void> {
        await this.connection.redis_client.set(key, value, 'EX', ttl);
    }

    async get_with_ttl(key: string): Promise<string | null> {
        const type = await this.connection.redis_client.type(key);
        if (type !== 'string') return null;
        return this.connection.redis_client.get(key);
    }

    async get_ttl(key: string): Promise<number> {
        return this.connection.redis_client.ttl(key);
    }

    async delete_with_ttl(key: string): Promise<void> {
        await this.connection.redis_client.del(key);
    }
}

export class RedisUniqueKeyManager {
    public connection = RedisConnectionManager.getInstance();

    async add_unique_key(key: string, value: string, ttl: number): Promise<boolean> {
        const acquired = await this.connection.redis_client.setnx(`${key}:${value}`, 1);

        if (acquired) {
            await this.connection.redis_client.expire(`${key}:${value}`, ttl);
            return true;
        }

        return false;
    }

    async check_unique_key(key: string, value: string): Promise<boolean> {
        return (await this.connection.redis_client.exists(`${key}:${value}`)) === 1;
    }

    async delete_unique_key(key: string, value: string): Promise<void> {
        await this.connection.redis_client.del(`${key}:${value}`);
    }
}

export class RedisQueueManager {
    public connection = RedisConnectionManager.getInstance();

    async addToQueue(queueName: string, item: string): Promise<void> {
        const items = await this.connection.redis_client.lrange(queueName, 0, -1);

        !items.includes(item) && await this.connection.redis_client.lpush(queueName, item);
    }

    async pickFromQueue(queueName: string): Promise<string | null> {
        const redis_unique_manager = new RedisUniqueKeyManager();
        const acquired = await redis_unique_manager.add_unique_key('system::::pickFromQueue', queueName, 4);

        if (!acquired) {
            await sleep(1000);
            return await this.pickFromQueue(queueName);
        }

        try {
            return await this.connection.redis_client.rpop(queueName);
        } finally {
            await redis_unique_manager.delete_unique_key('system::::pickFromQueue', queueName);
        }
    }

    async getQueueLength(queueName: string): Promise<number> {
        return this.connection.redis_client.llen(queueName);
    }

    async peekQueue(queueName: string): Promise<string[]> {
        return this.connection.redis_client.lrange(queueName, 0, -1);
    }
}

export class RedisPubSubManager {
    public connection = RedisConnectionManager.getInstance();
    private subscriber: Redis;

    constructor() {
        this.subscriber = new IORedis(process.env.REDIS_URI!);

        this.subscriber.on('error', (err) => {
            console.error('Redis subscriber error:', err);
        });
    }

    async publish(channel: string, message: string): Promise<number> {
        return this.connection.redis_client.publish(channel, message);
    }

    async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        this.subscriber.subscribe(channel, (err) => {
            if (err) {
                console.error(`Failed to subscribe to channel ${channel}:`, err);
                return;
            }
        });

        this.subscriber.on('message', (subscribedChannel, message) => {
            if (subscribedChannel === channel) {
                callback(message);
            }
        });
    }

    async unsubscribe(channel: string): Promise<void> {
        await this.subscriber.unsubscribe(channel);
    }
}