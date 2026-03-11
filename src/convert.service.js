class ConvertService {
    #API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
    static instance = null;

    constructor() {
        if (ConvertService.instance) {
            return ConvertService.instance;
        }
        ConvertService.instance = this;
    }

    async #fetchRates(currency = 'rub') {
        const url = `${this.#API_URL}/${currency.toLowerCase()}.json`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`[Convert SERVICE -> fetchRates] HTTP error! status: ${response.status}`);

            const data = await response.json();
            const baseData = data[currency.toLowerCase()];

            return {
                usd: baseData.usd,
                eur: baseData.eur,
                gbp: baseData.gbp,
                rub: baseData.rub,
            };
        } catch (err) {
            console.error(`[ConvertService] Failed to fetch rates for ${currency}:`, err);
            return null;
        }
    }

    async convert(from, amount, to) {
        const rates = await this.#fetchRates(from);
        if (!rates || typeof rates[to.toLowerCase()] === 'undefined') {
            return null;
        }

        const result = amount * rates[to.toLowerCase()];
        return result.toFixed(2);
    }
}

const convertService = new ConvertService();
Object.freeze(convertService);

export default convertService;
