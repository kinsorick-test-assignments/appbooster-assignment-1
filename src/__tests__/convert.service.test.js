import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── We need to reset the singleton between tests ────────────────────────────
// ConvertService uses a static `instance` field, so we reimport the module
// fresh for each test via vi.resetModules().
let convertService;

beforeEach(async () => {
    vi.resetModules();
    // Grab a fresh module (new singleton) every test
    const mod = await import('../src/convert.service.js');
    convertService = mod.default;
});

afterEach(() => {
    vi.restoreAllMocks();
});

// ─── Helpers ────────────────────────────────────────────────────────────────
const mockFetchSuccess = (rates) => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ usd: { usd: 1, eur: 0.92, gbp: 0.79, rub: 92.5 }, rub: { usd: 0.0108, eur: 0.0099, gbp: 0.0085, rub: 1 }, ...rates }),
    });
};

const mockFetchFailure = (status = 500) => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status,
        json: async () => ({}),
    });
};

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('ConvertService', () => {
    describe('Singleton pattern', () => {
        it('should always return the same instance', async () => {
            const modA = await import('../src/convert.service.js');
            const modB = await import('../src/convert.service.js');
            expect(modA.default).toBe(modB.default);
        });

        it('should be frozen (immutable public API)', () => {
            expect(Object.isFrozen(convertService)).toBe(true);
        });
    });

    describe('convert()', () => {
        it('should return a string with the converted amount', async () => {
            mockFetchSuccess({ usd: { usd: 1, eur: 0.92, gbp: 0.79, rub: 92.5 } });
            const result = await convertService.convert('usd', 10, 'rub');
            expect(result).toBe('925.00');
        });

        it('should be case-insensitive for currency codes', async () => {
            mockFetchSuccess({ usd: { usd: 1, eur: 0.92, gbp: 0.79, rub: 92.5 } });
            const lowerResult = await convertService.convert('usd', 1, 'rub');
            const upperResult = await convertService.convert('USD', 1, 'RUB');
            expect(lowerResult).toBe(upperResult);
        });

        it('should return null when the target currency is not in rates', async () => {
            mockFetchSuccess({ usd: { usd: 1, eur: 0.92, gbp: 0.79, rub: 92.5 } });
            const result = await convertService.convert('usd', 1, 'jpy');
            expect(result).toBeNull();
        });

        it('should return null when fetch fails', async () => {
            mockFetchFailure(503);
            const result = await convertService.convert('usd', 1, 'rub');
            expect(result).toBeNull();
        });

        it('should return null when fetch throws a network error', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
            const result = await convertService.convert('usd', 1, 'rub');
            expect(result).toBeNull();
        });

        it('should return result fixed to 2 decimal places', async () => {
            // 1 usd = 92.555555 rub (long decimal)
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ usd: { usd: 1, eur: 0, gbp: 0, rub: 92.555555 } }),
            });
            const result = await convertService.convert('usd', 1, 'rub');
            expect(result).toBe('92.56');
        });

        it('should convert fractional amounts correctly', async () => {
            mockFetchSuccess({ usd: { usd: 1, eur: 0.92, gbp: 0.79, rub: 100 } });
            const result = await convertService.convert('usd', 0.5, 'rub');
            expect(result).toBe('50.00');
        });
    });

    describe('fetch behavior', () => {
        it('should call fetch with the correct URL for the source currency', async () => {
            mockFetchSuccess({ eur: { usd: 1.09, eur: 1, gbp: 0.86, rub: 101 } });
            await convertService.convert('eur', 1, 'usd');
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/eur.json')
            );
        });
    });
});
