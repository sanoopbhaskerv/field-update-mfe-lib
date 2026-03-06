const BASE_URL = process.env['BASE_URL'] || 'http://localhost:4300';

module.exports = {
    default: {
        paths: ['apps/client-updater-e2e/features/**/*.feature'],
        require: [
            'apps/client-updater-e2e/src/support/hooks.ts',
            'apps/client-updater-e2e/src/steps/**/*.ts',
        ],
        requireModule: ['ts-node/register'],
        format: [
            '@cucumber/pretty-formatter',
            'json:apps/client-updater-e2e/reports/cucumber-report.json',
        ],
        formatOptions: { snippetInterface: 'async-await' },
        worldParameters: { baseUrl: BASE_URL },
        publishQuiet: true,
    },
};
