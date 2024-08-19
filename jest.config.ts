const ROOT = process.cwd();

const ROOT_PROJECT = `${ROOT}`;
const SRC_PATH = `${ROOT_PROJECT}/src`;
const TESTS_PATH = `${ROOT_PROJECT}/__tests__`;
const MODE_MODULES_PATH = `${ROOT_PROJECT}/node_modules`;
const TS_CONFIG_PATH = './tsconfig.paths.json';
const FILE_MOCK = 'jest.config.fileMock.ts';

const extensionsAllowed = {
  '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/': `${TESTS_PATH}/${FILE_MOCK}`,
  '\\.(css|scss)$': `${TESTS_PATH}/${FILE_MOCK}`
};

function makeModuleNameMapper(srcPath: string, tsconfigPath: string) {
  const { paths } = require(tsconfigPath).compilerOptions;
  const aliases: { [key: string]: string } = {};

  Object.keys(paths).forEach((item) => {
    const key = item.replace('/*', '/(.*)');
    const path = paths[item][0].replace('/*', '/$1');

    aliases[key] = `${srcPath}/${path}`;
  });

  return { ...extensionsAllowed, ...aliases };
}

const config = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH),
  moduleDirectories: [MODE_MODULES_PATH, SRC_PATH],
  roots: [TESTS_PATH],
  // We need to include 'd3' or 'internmap' for the @nivo/sankey library
  transformIgnorePatterns: [`${MODE_MODULES_PATH}/(?!d3|internmap)`],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true }],
    '^.+\\.svg$': `${TESTS_PATH}/${FILE_MOCK}`,
    '.+\\.(png)$': `${TESTS_PATH}/${FILE_MOCK}`
  },
  modulePathIgnorePatterns: [`${TESTS_PATH}/${FILE_MOCK}`],
  coveragePathIgnorePatterns: ['API', './src/index.tsx', 'routes.tsx', './src/config', 'core/components/SkGraph']
};

export default config;
