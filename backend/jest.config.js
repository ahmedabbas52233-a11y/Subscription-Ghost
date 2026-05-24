/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset:             "ts-jest",
  testEnvironment:    "node",
  testMatch:          ["**/*.test.ts"],
  collectCoverageFrom:["src/**/*.ts", "!src/server.ts"],
  coverageDirectory:  "coverage",
  setupFilesAfterFramework: [],
  globals: {
    "ts-jest": { tsconfig: "tsconfig.json" },
  },
};
