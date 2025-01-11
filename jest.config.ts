const ROOT_PROJECT = `<rootDir>`;
const SRC_PATH = `src`;
const TESTS_PATH = `${ROOT_PROJECT}/__tests__`;
const MODE_MODULES_PATH = `node_modules`;
const TRANSFORMER = 'mocks/jest.mock.transformer.ts';
const MOCK_ROUTER = 'jest.setup.ts';

const config = {
  coveragePathIgnorePatterns: ['./src/config', 'API', 'routes', 'core/components/SkGraph'],
  moduleDirectories: [MODE_MODULES_PATH, SRC_PATH],
  // Configuration for mapping module names to different paths, for mocking modules or resolving different module formats.
  moduleNameMapper: {
    '^d3-(.*)$': `${ROOT_PROJECT}/node_modules/d3-$1/dist/d3-$1.js`,
    '\\.(css)$': `${ROOT_PROJECT}/${TRANSFORMER}`
  },
  roots: [TESTS_PATH],
  setupFilesAfterEnv: ['@testing-library/jest-dom', `${ROOT_PROJECT}/${MOCK_ROUTER}`],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true }],
    '^.+\\.svg$': `${ROOT_PROJECT}/${TRANSFORMER}`
  },
  // Configuration for ignoring transformations of specific modules within node_modules.
  transformIgnorePatterns: ['/node_modules/(?!(d3-(.*)))']
};

export default config;
