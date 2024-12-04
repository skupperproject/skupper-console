const ROOT_PROJECT = `<rootDir>`;
const SRC_PATH = `src`;
const TESTS_PATH = `${ROOT_PROJECT}/__tests__`;
const MODE_MODULES_PATH = `node_modules`;
const FILE_MOCK = 'jest.config.fileMock.ts';

const config = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleDirectories: [MODE_MODULES_PATH, SRC_PATH],
  roots: [TESTS_PATH],

  // We need to include 'd3' or 'internmap' for the @nivo/sankey library
  transformIgnorePatterns: [`${MODE_MODULES_PATH}/(?!d3|internmap)`],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true }],
    '^.+\\.svg$': `${ROOT_PROJECT}/${FILE_MOCK}`
  },
  moduleNameMapper: {
    '\\.(css|svg)$': `${ROOT_PROJECT}/${FILE_MOCK}`
  },
  coveragePathIgnorePatterns: ['API', './src/index.tsx', 'routes.tsx', './src/config', 'core/components/SkGraph']
};

export default config;
