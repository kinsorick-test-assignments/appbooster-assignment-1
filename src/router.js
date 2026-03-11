import ConverterPage from './pages/ConverterPage.page.js';
import RatesPage from './pages/RatesPage.page.js';

const routes = {
    '#/': ConverterPage,
    '#/rates': RatesPage
};

let previousPath = '#/';

const render = async (page) => {
    const prevPage = routes[previousPath] || routes['#/'];
    Object.entries(prevPage).forEach(([key]) => {
        delete window[key];
    })

    const pageCommands = Object.entries(page);
    pageCommands.forEach(([key, value]) => {
        window[key] = value;
    })

    return await page.render();
}

export const router = async () => {
    // Hash-based routing prevents the server from looking for non-existent pages
    // and returning 404 errors. All routes are resolved locally on the client.
    const path = window.location.hash || '#/';
    const page = routes[path] || routes['#/'];

    const routerView = document.getElementById('router-view');
    routerView.innerHTML = await render(page);

    if (page.afterRender) {
        await page.afterRender();
    }

    previousPath = path;
};
