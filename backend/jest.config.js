/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
<<<<<<< HEAD
  preset:           'ts-jest',
  testEnvironment:  'node',
  rootDir:          'src',
  testMatch:        ['**/tests/**/*.test.ts'],
  clearMocks:       true,
  testTimeout:      30000,
=======
  preset:             "ts-jest",
  testEnvironment:    "node",
  testMatch:          ["**/*.test.ts"],
  collectCoverageFrom:["src/**/*.ts", "!src/server.ts"],
  coverageDirectory:  "coverage",
  setupFilesAfterFramework: [],
  globals: {
    "ts-jest": { tsconfig: "tsconfig.json" },
  },
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
};
