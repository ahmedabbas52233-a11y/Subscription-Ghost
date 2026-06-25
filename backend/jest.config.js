/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset:           'ts-jest',
  testEnvironment:  'node',
  rootDir:          'src',
  testMatch:        ['**/tests/**/*.test.ts'],
  clearMocks:       true,
  testTimeout:      30000,
};
