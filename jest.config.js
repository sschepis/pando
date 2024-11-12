module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleNameMapper: {
    '^@ai/(.*)$': '<rootDir>/src/ai/$1',
    '^@debug/(.*)$': '<rootDir>/src/debug/$1',
    '^@extension/(.*)$': '<rootDir>/src/extension/$1',
    '^@languageServer/(.*)$': '<rootDir>/src/languageServer/$1',
    '^@parser/(.*)$': '<rootDir>/src/parser/$1',
    '^@pandoExecutionEngine/(.*)$': '<rootDir>/src/pandoExecutionEngine/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1'
  },
  setupFilesAfterEnv: [],
  rootDir: '.',
  testTimeout: 60000,
  modulePathIgnorePatterns: [
    '<rootDir>/out/',
    '<rootDir>/.vscode-test/'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/out/'
  ]
};
