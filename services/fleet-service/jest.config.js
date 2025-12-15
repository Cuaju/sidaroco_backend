/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/generated/**",
    "!src/index.ts",
  ],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
};
