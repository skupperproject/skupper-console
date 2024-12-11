const ROOT_PROJECT = `<rootDir>`;
const SRC_PATH = `src`;
const TESTS_PATH = `${ROOT_PROJECT}/__tests__`;
const MODE_MODULES_PATH = `node_modules`;
const TRANSFORMER = 'jest.transformer.ts';
const MOCK_ROUTER = 'jest.mock.router.ts';

const config = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom', `${ROOT_PROJECT}/${MOCK_ROUTER}`],
  moduleDirectories: [MODE_MODULES_PATH, SRC_PATH],
  roots: [TESTS_PATH],

  // We need to include 'd3' or 'internmap' for the @nivo/sankey library
  transformIgnorePatterns: [`${MODE_MODULES_PATH}/(?!d3|internmap)`],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true }],
    '^.+\\.svg$': `${ROOT_PROJECT}/${TRANSFORMER}`
  },
  moduleNameMapper: {
    '\\.(css|svg)$': `${ROOT_PROJECT}/${TRANSFORMER}`
  },
  coveragePathIgnorePatterns: [
    './src/index.tsx',
    './src/config',
    'API',
    'routes',
    'providers',
    'core/components/SkGraph'
  ]
};

export default config;
