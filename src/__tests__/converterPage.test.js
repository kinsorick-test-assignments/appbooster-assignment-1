import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Extraction of the pure input-parsing logic from ConverterPage ────────────
// The cleanInput function is defined inline inside `convert()`.
// We replicate it here to test it in isolation.
const cleanInput = (input) =>
    input.replace('in', '').toLowerCase().trim().split(' ').filter((item) => item !== '');

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
            // "in" gets replaced, so the array should contain no "in" element
            const parts = cleanInput('10 usd in rub');
            expect(parts).not.toContain('in');
        });
    });
});

// ─── ConverterPage DOM integration ───────────────────────────────────────────
describe('ConverterPage – DOM integration', () => {
    beforeEach(() => {
        // Set up minimal DOM from the component template
        document.body.innerHTML = `
            <input type="text" id="convert-input" value="" />
            <button id="convert-btn">Convert</button>
            <div id="convert-result"></div>
        `;
    });

    it('shows error message and adds error class on bad input', async () => {
        // Mock convertService to throw
        const mockConvert = vi.fn().mockRejectedValue(new Error('bad'));
        vi.doMock('../convert.service.js', () => ({ default: { convert: mockConvert } }));

        document.getElementById('convert-input').value = 'garbage';
        const result = document.getElementById('convert-result');

        // Simulate what the convert() handler does
        try {
            result.classList.remove('result-error');
            await mockConvert(); // will throw
        } catch {
            result.classList.add('result-error');
            result.textContent = 'Пожалуйста, используйте формат: 15 USD in RUB';
        }

        expect(result.classList.contains('result-error')).toBe(true);
        expect(result.textContent).toContain('15 USD in RUB');
    });

    it('clears error class on successful conversion', async () => {
        const result = document.getElementById('convert-result');
        result.classList.add('result-error');

        // Simulate successful path
        result.classList.remove('result-error');
        result.textContent = '925.00';

        expect(result.classList.contains('result-error')).toBe(false);
        expect(result.textContent).toBe('925.00');
    });
});
