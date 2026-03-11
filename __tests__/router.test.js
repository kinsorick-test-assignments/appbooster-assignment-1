import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock page dependencies so no real fetch / DOM calls happen on import
vi.mock('../src/pages/ConverterPage.page.js', () => ({
    default: {
        render: vi.fn().mockResolvedValue('<div>Home</div>'),
        afterRender: vi.fn(),
    },
}));

vi.mock('../src/pages/RatesPage.page.js', () => ({
    default: {
        render: vi.fn().mockResolvedValue('<div>Rates</div>'),
        afterRender: vi.fn(),
    },
}));

import { router } from '../src/router.js';
import ConverterPage from '../src/pages/ConverterPage.page.js';
import RatesPage from '../src/pages/RatesPage.page.js';

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Router', () => {
    beforeEach(() => {
        // Reset call counts between tests
        vi.clearAllMocks();

        // Provide a minimal DOM that router.js needs
        document.body.innerHTML = '<div id="router-view"></div>';
    });

    describe('Route resolution', () => {
        it('renders the home page for "#/" hash', async () => {
            window.location.hash = '#/';
            await router();
            expect(ConverterPage.render).toHaveBeenCalledOnce();
            expect(document.getElementById('router-view').innerHTML).toBe('<div>Home</div>');
        });

        it('renders the rates page for "#/rates" hash', async () => {
            window.location.hash = '#/rates';
            await router();
            expect(RatesPage.render).toHaveBeenCalledOnce();
            expect(document.getElementById('router-view').innerHTML).toBe('<div>Rates</div>');
        });

        it('falls back to home page for unknown hashes', async () => {
            window.location.hash = '#/unknown';
            await router();
            expect(ConverterPage.render).toHaveBeenCalledOnce();
        });

        it('falls back to home page when hash is empty', async () => {
            window.location.hash = '';
            await router();
            expect(ConverterPage.render).toHaveBeenCalledOnce();
        });
    });

    describe('Lifecycle hooks', () => {
        it('calls afterRender after rendering home page', async () => {
            window.location.hash = '#/';
            await router();
            expect(ConverterPage.afterRender).toHaveBeenCalledOnce();
        });

        it('calls afterRender after rendering rates page', async () => {
            window.location.hash = '#/rates';
            await router();
            expect(RatesPage.afterRender).toHaveBeenCalledOnce();
        });
    });

    describe('Window namespace management', () => {
        it('exposes page methods on window', async () => {
            window.location.hash = '#/';
            await router();
            // ConverterPage mock has a `render` key — it should be on window
            expect(window.render).toBeDefined();
        });
    });
});
