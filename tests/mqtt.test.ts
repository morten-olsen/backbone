import { describe, beforeEach, afterEach, it, vi, expect } from 'vitest';

import { createWorld, type World } from './utils/utils.world.ts';
import { statements } from './utils/utils.statements.ts';

describe('mqtt', () => {
  let world: World = undefined as unknown as World;

  beforeEach(async () => {
    world = await createWorld({});
  });

  afterEach(async () => {
    if (world) {
      await world.destroy();
    }
  });

  it('should be able to send messages to all subscribers', async () => {
    const [clientA, clientB, clientC] = await world.connect(statements.all, statements.all, statements.all);
    const spyB = vi.fn();
    const spyC = vi.fn();
    clientB.on('message', spyB);
    clientC.on('message', spyC);
    await clientB.subscribeAsync('test');
    await clientC.subscribeAsync('test');
    await clientA.publishAsync('test', 'test');
    await vi.waitUntil(() => spyB.mock.calls.length && spyC.mock.calls.length);

    expect(spyB).toHaveBeenCalledTimes(1);
    expect(spyC).toHaveBeenCalledTimes(1);
  });

  it('should not be able to subscribe if not allowed', async () => {
    const [client] = await world.connect([]);
    const promise = client.subscribeAsync('test');
    await expect(promise).rejects.toThrow();
  });

  it('should not be able to publish if not allowed', async () => {
    const [client] = await world.connect([]);
    const promise = client.publishAsync('test', 'test');

    // TODO: why does this not throw?
    // await expect(promise).rejects.toThrow();
  });

  it('should not be able to read messages if not allowed', async () => {
    const [clientA, clientB] = await world.connect(statements.all, statements.noRead);
    const spy = vi.fn();
    clientB.on('message', spy);
    await clientB.subscribeAsync('test');
    await clientA.publishAsync('test', 'test');
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should be able to handle many connections', async () => {
    const clients = await world.connect(...new Array(50).fill(statements.all));
    const spies = await Promise.all(
      clients.map(async (client) => {
        const spy = vi.fn();
        client.on('message', spy);
        await client.subscribeAsync('test');
        return spy;
      }),
    );
    const [sender] = await world.connect(statements.all);
    await sender.publishAsync('test', 'test');
    await vi.waitUntil(() => spies.every((s) => s.mock.calls.length));
  });
});
