import assert from 'assert';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const CLIENT = Symbol('Redis client for Rate Limiter');
const INSTANCES = Symbol('Instance details for Rate Limiter');

export default class RateLimiter {
  constructor(context, config) {
    Object.defineProperty(this, CLIENT, {
      value: config.client || 'redis',
      enumerable: false,
      writable: true,
    });
    Object.defineProperty(this, INSTANCES, {
      value: config.instances,
      enumerable: false,
    });
    assert(this[INSTANCES], 'Must have instance definitions for the rate limiter');
  }

  async start(context, objects) {
    // If it's a string, expect it to be a configured connection,
    // if not, it better be a client
    if (typeof this[CLIENT] === 'string') {
      this[CLIENT] = await Promise.resolve(objects[this[CLIENT]]);
    }

    Object.entries(this[INSTANCES]).forEach(([name, spec]) => {
      const { prefix, ...rest } = spec;
      this[name] = new RateLimiterRedis({
        storeClient: this[CLIENT],
        keyPrefix: `rlimit_${spec.prefix || name}`,
        ...rest,
      });
    });
  }
}
