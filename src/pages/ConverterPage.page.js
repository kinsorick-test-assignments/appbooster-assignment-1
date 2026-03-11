import convertService from "../convert.service.js";

export const cleanInput = (input) =>
    input.replace('in', '').toLowerCase().trim().split(' ').filter((item) => item !== '');

export default {
    render: async () => {
        return `
            <div class="page">
                <h2>Конвертер валют</h2>
                <p>Введите сумму и валюты для перевода (например, "15 usd in rub").</p>
                
                <div class="converter-form">
                    <input type="text" id="convert-input" placeholder="15 usd in rub" autocomplete="off">
                    <button onclick="convert()" id="convert-btn">Конвертировать</button>
                    <div id="convert-result"></div>
                </div>
            </div>
        `;
    },
    convert: async () => {

        const input = document.getElementById('convert-input').value;
        const result = document.getElementById('convert-result');

        const [amount, from, to] = cleanInput(input);
        try {
            result.classList.remove('result-error');
            const convertedAmount = await convertService.convert(from, amount, to);
            result.textContent = convertedAmount;
        } catch (err) {
            result.classList.add('result-error');
            result.textContent = 'Пожалуйста, используйте формат: 15 USD in RUB';
        }
    }
};
