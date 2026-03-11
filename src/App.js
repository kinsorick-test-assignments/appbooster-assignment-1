import stateManager from "./state.js";

export default {
    render: function () {
        requestAnimationFrame(() => this.afterRender());
        return `
            <header>
                <nav>
                    <a href="#/" data-link>Конвертер</a>
                    <a href="#/rates" data-link>Курсы валют</a>
                </nav>
                <div class="settings">
                    <label for="base-currency">Базовая валюта</label>
                    <select id="base-currency">
                        <option value="RUB">RUB ₽</option>
                        <option value="USD">USD $</option>
                        <option value="EUR">EUR €</option>
                    </select>
                </div>
            </header>
            <main id="router-view">

            </main>
            <footer class="credit-footer">
                <div class="credit-badge left">
                    ✨ Дизайн сгенерирован AI • Бизнес-логика реализована вручную (Vanilla JS)
                </div>
                <div class="credit-badge right">
                    Автор проекта:<br>
                    <strong>Камиль Маснавеев</strong> 
                    <a href="mailto:kmasnaveev@gmail.com">kmasnaveev@gmail.com</a>
                </div>
            </footer>
        `;
    },
    afterRender: () => {
        const baseCurrencySelect = document.getElementById('base-currency');
        baseCurrencySelect.addEventListener('change', () => {
            stateManager.store.baseCurrency = baseCurrencySelect.value;
        });
    },
};
