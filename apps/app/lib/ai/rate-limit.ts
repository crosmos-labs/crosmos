import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const DAILY_MESSAGE_LIMIT = 20;

const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.fixedWindow(DAILY_MESSAGE_LIMIT, "1 d"),
	prefix: "playground:daily",
});

// Throws if Redis is unreachable — callers must fail closed.
export const checkPlaygroundLimit = (userId: string) => ratelimit.limit(userId);
