import { redis } from "@devvit/web/server";
import { addHours } from "date-fns";
import { expireKeyAt } from "../redis/index.js";

interface TriggerLockOptions {
    expiration?: Date;
    verboseLogs?: boolean;
}

export async function hasEventBeenHandled (identifier: string, opts?: TriggerLockOptions): Promise<boolean> {
    const redisKey = `triggerLock:${identifier}`;
    const expiration = opts?.expiration ?? addHours(new Date(), 6);

    const newVal = await redis.incrBy(redisKey, 1);
    await expireKeyAt(redisKey, expiration);

    return newVal > 1;
}

/**
 * @deprecated Use `hasEventBeenHandled` instead.
 */
export async function hasTriggerBeenHandled (identifier: string, opts?: TriggerLockOptions): Promise<boolean> {
    return hasEventBeenHandled(identifier, opts);
}
