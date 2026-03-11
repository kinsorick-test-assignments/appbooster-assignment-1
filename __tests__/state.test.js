import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateManager } from '../src/state.js';

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('StateManager', () => {
    let state;

    beforeEach(() => {
        state = new StateManager({ baseCurrency: 'RUB', isLoading: false });
    });

    describe('Initial state', () => {
        it('should expose the initial state via store', () => {
            expect(state.store.baseCurrency).toBe('RUB');
            expect(state.store.isLoading).toBe(false);
        });
    });

    describe('subscribe()', () => {
        it('should call the listener immediately with the current state', () => {
            const listener = vi.fn();
            state.subscribe(listener);
            expect(listener).toHaveBeenCalledOnce();
            expect(listener.mock.calls[0][0].baseCurrency).toBe('RUB');
        });

        it('should notify all subscribers on state change', () => {
            const listenerA = vi.fn();
            const listenerB = vi.fn();
            state.subscribe(listenerA);
            state.subscribe(listenerB);
            listenerA.mockClear();
            listenerB.mockClear();

            state.store.baseCurrency = 'USD';

            expect(listenerA).toHaveBeenCalledOnce();
            expect(listenerB).toHaveBeenCalledOnce();
        });

        it('should pass updated state to listeners', () => {
            const listener = vi.fn();
            state.subscribe(listener);
            listener.mockClear();

            state.store.baseCurrency = 'EUR';
            expect(listener.mock.calls[0][0].baseCurrency).toBe('EUR');
        });

        it('should return an unsubscribe function', () => {
            const listener = vi.fn();
            const unsubscribe = state.subscribe(listener);
            listener.mockClear();

            unsubscribe();
            state.store.baseCurrency = 'GBP';

            // Listener must NOT be called after unsubscribing
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('Reactivity', () => {
        it('should NOT notify if the value did not change', () => {
            const listener = vi.fn();
            state.subscribe(listener);
            listener.mockClear();

            state.store.baseCurrency = 'RUB'; // same value
            expect(listener).not.toHaveBeenCalled();
        });

        it('should react to multiple sequential changes', () => {
            const listener = vi.fn();
            state.subscribe(listener);
            listener.mockClear();

            state.store.baseCurrency = 'USD';
            state.store.baseCurrency = 'EUR';
            state.store.baseCurrency = 'GBP';

            expect(listener).toHaveBeenCalledTimes(3);
        });

        it('should allow subscribing multiple independent listeners', () => {
            const calls = [];
            state.subscribe((s) => calls.push(`A:${s.baseCurrency}`));
            state.subscribe((s) => calls.push(`B:${s.baseCurrency}`));
            // clear initial calls
            calls.length = 0;

            state.store.baseCurrency = 'USD';
            expect(calls).toContain('A:USD');
            expect(calls).toContain('B:USD');
        });

        it('should support adding dynamic keys to the state', () => {
            const listener = vi.fn();
            state.subscribe(listener);
            listener.mockClear();

            state.store.newKey = 42;
            expect(listener).toHaveBeenCalledOnce();
            expect(state.store.newKey).toBe(42);
        });
    });

    describe('Singleton (exported module)', () => {
        it('should export a singleton (same reference on every import)', async () => {
            const modA = await import('../src/state.js');
            const modB = await import('../src/state.js');
            expect(modA.default).toBe(modB.default);
        });
    });
});
