import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            reporter: ['text', 'html'],
            include: ['src/**/*.js'],
            exclude: ['src/main.js'],
        },
    },
});
