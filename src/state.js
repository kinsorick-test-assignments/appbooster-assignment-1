class StateManager {
  #state;
  #listeners = new Set();

  constructor(initialState = {}) {
    this.#state = this.#createProxy(initialState);
  }

  #createProxy(obj) {
    const self = this;
    return new Proxy(obj, {
      set(target, key, value) {
        if (target[key] === value) return true;

        target[key] = value;
        self.#notify();
        return true;
      },
      get(target, key) {
        const value = target[key];
        if (typeof value === 'object' && value !== null) {
          return self.#createProxy(value);
        }
        return value;
      }
    });
  }

  #notify() {
    this.#listeners.forEach(listener => listener(this.#state));
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    listener(this.#state);

    return () => this.#listeners.delete(listener);
  }

  get store() {
    return this.#state;
  }
}

const initialState = {
  baseCurrency: 'RUB',
  isLoading: false,
};

const stateManager = new StateManager(initialState);

export default stateManager;
