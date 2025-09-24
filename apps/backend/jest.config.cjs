/**
 * Jest configuration for @autoflow/backend
 * Using ts-jest preset to handle TypeScript files and CommonJS test runner.
 */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    rootDir: ".",
    testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.spec.ts"],
    moduleFileExtensions: ["ts", "tsx", "js", "json"],
    transform: {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
    },
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tsconfig.json",
            isolatedModules: true,
        },
    },
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@/types(.*)$": "<rootDir>/../../../packages/types/src$1",
        "^@/config(.*)$": "<rootDir>/../../../packages/config/src$1",
    },
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    collectCoverage: false,
};
