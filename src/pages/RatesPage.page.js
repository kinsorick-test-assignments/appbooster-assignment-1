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
    afterRender: async () => {
        const ratesToFetch = ['usd', 'eur', 'gbp', 'rub'];
        const ratesList = document.getElementById('rates-list');

        stateManager.subscribe((state) => {
            ratesList.innerHTML = '';

        });
    },
    refreshCurrencies: () => {
        ratesToFetch.forEach((rateInput) => {
            convertService.convert(rateInput, 1, state.baseCurrency).then((rate) => {
                ratesList.innerHTML += createCurrencyCard(rateInput, rate);
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
