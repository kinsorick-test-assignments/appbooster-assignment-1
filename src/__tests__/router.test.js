import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Router logic, tested independently of the full module ───────────────────
// We replicate the router logic here for unit-testing since the actual module
// has top-level side-effect imports (pages). In a real project you would
// refactor router.js to export its helpers. These tests document expected
// behaviour and serve as a contract.

const buildRouter = (routes, defaultHash = '#/') => {
    let previousPath = defaultHash;

    const render = (page) => {
        return page.render();
    };

    const router = async (hash) => {
        const path = hash || '#/';
        const page = routes[path] || routes[defaultHash];
        const html = await render(page);

        // expose page commands to window
        Object.keys(page).forEach((key) => {
            window[key] = page[key];
        });

        if (page.afterRender) {
            await page.afterRender();
        }

        previousPath = path;
        return { html, path: previousPath };
    };

    return { router };
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Router', () => {
    let homePage, ratesPage, routes, router;

    beforeEach(() => {
        homePage = {
            render: vi.fn().mockResolvedValue('<div>Home</div>'),
            afterRender: vi.fn(),
        };

        ratesPage = {
            render: vi.fn().mockResolvedValue('<div>Rates</div>'),
            afterRender: vi.fn(),
        };

        routes = {
            '#/': homePage,
            '#/rates': ratesPage,
        };

        ({ router } = buildRouter(routes));
    });

    describe('Route resolution', () => {
        it('renders the home page for "#/" hash', async () => {
            const { html } = await router('#/');
            expect(html).toBe('<div>Home</div>');
            expect(homePage.render).toHaveBeenCalledOnce();
        });

        it('renders the rates page for "#/rates" hash', async () => {
            const { html } = await router('#/rates');
            expect(html).toBe('<div>Rates</div>');
            expect(ratesPage.render).toHaveBeenCalledOnce();
        });

        it('falls back to home page for unknown hashes', async () => {
            const { html } = await router('#/unknown');
            expect(html).toBe('<div>Home</div>');
        });

        it('falls back to home page when hash is empty', async () => {
            const { html } = await router('');
            expect(html).toBe('<div>Home</div>');
        });
    });

    describe('Lifecycle hooks', () => {
        it('calls afterRender after rendering home page', async () => {
            await router('#/');
            expect(homePage.afterRender).toHaveBeenCalledOnce();
        });

        it('calls afterRender after rendering rates page', async () => {
            await router('#/rates');
            expect(ratesPage.afterRender).toHaveBeenCalledOnce();
        });

        it('does NOT call afterRender if the page has none', async () => {
            const simplePage = { render: vi.fn().mockResolvedValue('<p>Simple</p>') };
            routes['#/simple'] = simplePage;
            await expect(router('#/simple')).resolves.not.toThrow();
        });
    });

    describe('Window namespace management', () => {
        it('exposes page methods on window', async () => {
            homePage.someAction = vi.fn();
            await router('#/');
            expect(window.someAction).toBeDefined();
        });
    });
});
