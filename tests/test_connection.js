import tap from 'tap';
import Redis from 'ioredis';
import RateLimiter from '../src/index';

tap.test('test_connection', async (t) => {
  const redisClient = new Redis({ enableOfflineQueue: false, lazyConnect: true });
  const key = `test-${Date.now()}`;

  await redisClient.connect();
  const context = { logger: console };
  const config = {
    instances: {
      default: {
        points: 10,
        duration: 1,
        blockDuration: 1,
      },
    },
  };
  const limiter = new RateLimiter(context, {
    client: redisClient,
    ...config,
  });
  await limiter.start(context);
  t.ok(limiter.default, 'Should configure and start with a client instance');
  let status = await limiter.default.get(key);
  t.ok(Number.isNaN(status.remainingPoints), 'Should start empty');
  status = await limiter.default.consume(key);
  t.strictEquals(status.remainingPoints, 9, 'Should take one');
  status = await limiter.default.get(key);
  t.strictEquals(status.remainingPoints, 9, 'Should still have 9');
  status = await limiter.default.consume(key, 9);
  t.strictEquals(status.remainingPoints, 0, 'Should have 0 points');

  status = await limiter.default.consume(key)
    .catch(error => ({ error }));
  t.ok(status.error, 'Should reject the consumption');

  const l2 = new RateLimiter(context, config);
  await l2.start(context, { redis: redisClient });
  t.ok(l2.default, 'Should configure and start with a client reference');

  redisClient.quit();
});
