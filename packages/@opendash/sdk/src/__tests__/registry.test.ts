import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry, createComponentRegistry } from '../registry';
import type { Component, BriefingItem, ComponentConfig } from '../component';

const mockComponent = (id: string, items: BriefingItem[] = []): Component => ({
  id,
  name: `Component ${id}`,
  icon: '🧩',
  description: `Test component ${id}`,
  version: '1.0.0',
  author: 'Test',
  requiresConfig: false,
  fetch: async () => items,
});

const mockFailingComponent = (id: string): Component => ({
  id,
  name: `Failing Component ${id}`,
  icon: '❌',
  description: `Failing component ${id}`,
  version: '1.0.0',
  author: 'Test',
  requiresConfig: false,
  fetch: async () => {
    throw new Error(`Component ${id} failed intentionally`);
  },
});

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = createComponentRegistry();
  });

  describe('register', () => {
    it('registers a component successfully', () => {
      const component = mockComponent('test-1');
      registry.register(component);
      expect(registry.get('test-1')).toBe(component);
    });

    it('throws error when registering duplicate component ID', () => {
      const component = mockComponent('duplicate');
      registry.register(component);
      expect(() => {
        registry.register(component);
      }).toThrow('Component "duplicate" already registered');
    });

    it('allows registering multiple components', () => {
      registry.register(mockComponent('comp-1'));
      registry.register(mockComponent('comp-2'));
      registry.register(mockComponent('comp-3'));
      expect(registry.size()).toBe(3);
    });
  });

  describe('unregister', () => {
    it('removes a registered component', () => {
      const component = mockComponent('to-remove');
      registry.register(component);
      expect(registry.size()).toBe(1);
      const removed = registry.unregister('to-remove');
      expect(removed).toBe(true);
      expect(registry.size()).toBe(0);
    });

    it('returns false when removing non-existent component', () => {
      const result = registry.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('get', () => {
    it('retrieves a registered component', () => {
      const component = mockComponent('find-me');
      registry.register(component);
      const found = registry.get('find-me');
      expect(found).toBe(component);
    });

    it('returns undefined for non-existent component', () => {
      const found = registry.get('does-not-exist');
      expect(found).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('returns all registered components', () => {
      const c1 = mockComponent('c1');
      const c2 = mockComponent('c2');
      const c3 = mockComponent('c3');

      registry.register(c1);
      registry.register(c2);
      registry.register(c3);

      const all = registry.getAll();
      expect(all).toHaveLength(3);
      expect(all).toContain(c1);
      expect(all).toContain(c2);
      expect(all).toContain(c3);
    });

    it('returns empty array when no components registered', () => {
      expect(registry.getAll()).toEqual([]);
    });
  });

  describe('size', () => {
    it('returns number of registered components', () => {
      expect(registry.size()).toBe(0);
      registry.register(mockComponent('1'));
      expect(registry.size()).toBe(1);
      registry.register(mockComponent('2'));
      expect(registry.size()).toBe(2);
    });
  });

  describe('fetchAll - error isolation', () => {
    it('collects results from all components when all succeed', async () => {
      const item1: BriefingItem = {
        id: 'i1',
        priority: 'high',
        category: 'test',
        title: 'Item 1',
        detail: 'From component 1',
        time: new Date().toISOString(),
      };
      const item2: BriefingItem = {
        id: 'i2',
        priority: 'low',
        category: 'test',
        title: 'Item 2',
        detail: 'From component 2',
        time: new Date().toISOString(),
      };

      registry.register(mockComponent('c1', [item1]));
      registry.register(mockComponent('c2', [item2]));

      const config: ComponentConfig = { env: {}, lastVisited: null };
      const results = await registry.fetchAll(config);

      expect(results).toHaveLength(2);
      expect(results).toContainEqual(item1);
      expect(results).toContainEqual(item2);
    });

    it('continues when one component fails', async () => {
      const successItem: BriefingItem = {
        id: 'success',
        priority: 'high',
        category: 'test',
        title: 'Success',
        detail: 'This component worked',
        time: new Date().toISOString(),
      };

      registry.register(mockComponent('success', [successItem]));
      registry.register(mockFailingComponent('failure'));
      registry.register(mockComponent('another-success', []));

      const config: ComponentConfig = { env: {}, lastVisited: null };
      const results = await registry.fetchAll(config);

      // Should only get results from successful components
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(successItem);
    });

    it('handles multiple failing components gracefully', async () => {
      const item: BriefingItem = {
        id: 'good',
        priority: 'normal',
        category: 'test',
        title: 'Good item',
        detail: 'From working component',
        time: new Date().toISOString(),
      };

      registry.register(mockFailingComponent('fail1'));
      registry.register(mockComponent('working', [item]));
      registry.register(mockFailingComponent('fail2'));

      const config: ComponentConfig = { env: {}, lastVisited: null };
      const results = await registry.fetchAll(config);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(item);
    });

    it('all components fail - returns empty array', async () => {
      registry.register(mockFailingComponent('fail1'));
      registry.register(mockFailingComponent('fail2'));

      const config: ComponentConfig = { env: {}, lastVisited: null };
      const results = await registry.fetchAll(config);

      expect(results).toEqual([]);
    });
  });

  describe('error tracking', () => {
    it('records errors from failed components', async () => {
      registry.register(mockFailingComponent('broken'));
      registry.register(mockComponent('ok'));

      const config: ComponentConfig = { env: {}, lastVisited: null };
      await registry.fetchAll(config);

      const errors = registry.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].componentId).toBe('broken');
      expect(errors[0].error).toBeDefined();
    });

    it('clears error history', async () => {
      registry.register(mockFailingComponent('broken'));

      const config: ComponentConfig = { env: {}, lastVisited: null };
      await registry.fetchAll(config);

      expect(registry.getErrors()).toHaveLength(1);

      registry.clearErrors();
      expect(registry.getErrors()).toEqual([]);
    });

    it('replaces previous errors on each fetchAll', async () => {
      const component = mockFailingComponent('broken');
      registry.register(component);

      const config: ComponentConfig = { env: {}, lastVisited: null };

      // First fetch
      await registry.fetchAll(config);
      expect(registry.getErrors()).toHaveLength(1);

      // Second fetch - should have only 1 error, not 2
      await registry.fetchAll(config);
      expect(registry.getErrors()).toHaveLength(1);
    });
  });

  describe('validateReturnType', () => {
    it('throws error if component returns non-array', async () => {
      const badComponent: Component = {
        id: 'bad-return',
        name: 'Bad',
        icon: '❌',
        description: 'Returns non-array',
        version: '1.0.0',
        author: 'Test',
        requiresConfig: false,
        fetch: async () => {
          return { data: [] } as any; // Wrong return type
        },
      };

      registry.register(badComponent);

      const config: ComponentConfig = { env: {}, lastVisited: null };
      const results = await registry.fetchAll(config);

      // Should return empty array and record error
      expect(results).toEqual([]);
      expect(registry.getErrors()).toHaveLength(1);
      expect(registry.getErrors()[0].componentId).toBe('bad-return');
    });
  });

  describe('factory function', () => {
    it('creates a new registry instance', () => {
      const reg1 = createComponentRegistry();
      const reg2 = createComponentRegistry();

      reg1.register(mockComponent('comp1'));

      expect(reg1.size()).toBe(1);
      expect(reg2.size()).toBe(0);
    });
  });
});
