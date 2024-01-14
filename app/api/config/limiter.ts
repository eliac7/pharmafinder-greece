import { RateLimiter } from "limiter";

export const limiter = new RateLimiter({
  tokensPerInterval: 50,
  interval: "minute",
  fireImmediately: true,
});
