module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__mocks__/gas-mock.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  clearMocks: true
};
