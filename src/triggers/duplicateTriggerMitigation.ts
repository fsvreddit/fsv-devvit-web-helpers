import { redis } from "@devvit/web/server";
import { addDays } from "date-fns";
import { expireKeyAt } from "../redis";

interface TriggerLockOptions {
    expiration?: Date;
    verboseLogs?: boolean;
}

export async function hasTriggerBeenHandled (identifier: string, opts?: TriggerLockOptions): Promise<boolean> {
    const redisKey = `triggerLock:${identifier}`;
    const expiration = opts?.expiration ?? addDays(new Date(), 1);

    const newVal = await redis.incrBy(redisKey, 1);
    await expireKeyAt(redisKey, expiration);

    return newVal > 1;
}
