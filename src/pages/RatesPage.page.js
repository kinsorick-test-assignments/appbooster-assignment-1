import convertService from "../convert.service.js";
import stateManager from "../state.js";

export default {
    render: async () => {
        return `
            <div class="page">
                <h2>Текущие курсы</h2>
                <p id="rates-description">Актуальные котировки относительно вашей базовой валюты.</p>
                
                <div id="rates-list" class="rates-container">

                </div>
            </div>
        `;
    },
    afterRender: function () {
        const ratesList = document.getElementById('rates-list');
        const ratesToFetch = ['usd', 'eur', 'gbp', 'rub'];

        stateManager.subscribe((state) => {
            ratesList.innerHTML = '';

            ratesToFetch.forEach((rateInput) => {
                convertService.convert(rateInput, 1, state.baseCurrency).then((rate) => {
                    ratesList.innerHTML += this.createCurrencyCard(rateInput, rate);
                });
            });
        });
    },
    createCurrencyCard: (currency, rate) => {
        return `
            <div class="rate-card">
                <div class="rate-currency">${currency}</div>
                <div class="rate-value">${rate}</div>
            </div>
        `;
    }
};
