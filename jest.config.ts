import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@marsidev/react-turnstile$': '<rootDir>/src/test/mocks/react-turnstile.tsx',
  },
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
        tsconfig: 'tsconfig.json',
    }],
  },
};

export default config;
