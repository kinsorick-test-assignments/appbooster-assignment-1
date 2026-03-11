import { router } from './router.js';
import App from './App.js';

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('app');
    root.innerHTML = App.render();

    router();

    window.addEventListener('hashchange', router);

});
