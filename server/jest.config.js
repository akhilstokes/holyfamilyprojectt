module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.{js,ts}',
    'services/**/*.{js,ts}',
    'utils/**/*.{js,ts}',
    'middleware/**/*.{js,ts}',
    'billing/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  testMatch: [
    '**/__tests__/**/*.{test,spec}.{js,ts}',
    '**/?(*.)+(spec|test).{js,ts}'
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 10000,
  verbose: true,
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
