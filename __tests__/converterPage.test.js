import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConverterPage, { cleanInput } from '../src/pages/ConverterPage.page.js';
import convertService from '../src/convert.service.js';

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('../src/convert.service.js', () => ({
    default: {
        convert: vi.fn(),
    },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('ConverterPage – input parsing (cleanInput)', () => {
    describe('happy-path formats', () => {
        it('parses "15 usd in rub" into [amount, from, to]', () => {
            const [amount, from, to] = cleanInput('15 usd in rub');
            expect(amount).toBe('15');
            expect(from).toBe('usd');
            expect(to).toBe('rub');
        });

        it('parses upper-case input "100 USD in EUR"', () => {
            const [amount, from, to] = cleanInput('100 USD in EUR');
            expect(from).toBe('usd');
            expect(to).toBe('eur');
        });

        it('parses input without "in": "50 eur rub"', () => {
            const [amount, from, to] = cleanInput('50 eur rub');
            expect(amount).toBe('50');
            expect(from).toBe('eur');
            expect(to).toBe('rub');
        });

        it('strips extra whitespace', () => {
            const parts = cleanInput('  10   gbp   in   usd  ');
            expect(parts).toHaveLength(3);
        });
    });

    describe('edge cases', () => {
        it('returns empty array for empty string', () => {
            expect(cleanInput('')).toEqual([]);
        });

        it('handles decimal amounts', () => {
            const [amount] = cleanInput('0.5 usd in rub');
            expect(amount).toBe('0.5');
        });

        it('handles the word "in" appearing only once', () => {
            const parts = cleanInput('10 usd in rub');
            expect(parts).not.toContain('in');
        });
    });
});

// ─── ConverterPage DOM integration ───────────────────────────────────────────
describe('ConverterPage – DOM integration', () => {
    beforeEach(async () => {
        // Reset element state and render template
        document.body.innerHTML = await ConverterPage.render();
        vi.clearAllMocks();
    });

    it('shows error message and adds error class on bad input', async () => {
        // Set mock behavior for this specific test
        vi.mocked(convertService.convert).mockRejectedValue(new Error('API Error'));

        const input = document.getElementById('convert-input');
        const result = document.getElementById('convert-result');

        input.value = 'garbage';
        await ConverterPage.convert();

        expect(result.classList.contains('result-error')).toBe(true);
        expect(result.textContent).toContain('15 USD in RUB');
    });

    it('clears error class on successful conversion', async () => {
        // Set mock behavior for this specific test
        vi.mocked(convertService.convert).mockResolvedValue('925.00');

        const input = document.getElementById('convert-input');
        const result = document.getElementById('convert-result');

        // Pre-set error state to check if it gets cleared
        result.classList.add('result-error');
        input.value = '10 usd in rub';

        await ConverterPage.convert();

        expect(result.classList.contains('result-error')).toBe(false);
        expect(result.textContent).toBe('925.00');
    });
});
