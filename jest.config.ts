const ROOT = process.cwd();

const ROOT_PROJECT = `${ROOT}`;
const SRC_PATH = `${ROOT_PROJECT}/src`;
const MOCKS_PATH = `${ROOT_PROJECT}/mocks`;
const TS_CONFIG_PATH = './tsconfig.paths.json';
const SVG_TRANSFORM_FILENAME = 'jest.config.svgTransform.ts';
const FILE_MOCK_TRANSFORM_FILENAME = 'jest.config.fileMock.ts';
const STYLE_MOCK_TRANSFORM_FILENAME = 'jest.config.styleMock.ts';

const extensionsAllowed = {
  '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/': `${MOCKS_PATH}/${FILE_MOCK_TRANSFORM_FILENAME}`,
  '\\.(css|scss)$': `${MOCKS_PATH}/${STYLE_MOCK_TRANSFORM_FILENAME}`
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

module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH),
  moduleDirectories: [`${ROOT_PROJECT}/node_modules`, `${ROOT_PROJECT}/src`],
  roots: [SRC_PATH],
  transformIgnorePatterns: [`${ROOT_PROJECT}/node_modules/(?!d3|d3-timer)`],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true }],
    '^.+\\.svg$': `${MOCKS_PATH}/${SVG_TRANSFORM_FILENAME}`,
    '.+\\.(png)$': `${MOCKS_PATH}/${SVG_TRANSFORM_FILENAME}`
  },
  coveragePathIgnorePatterns: [
    '^.*\\.enum\\.[t]s?$',
    '^.*\\.interfaces\\.[t]s?$',
    '^.*\\.constants\\.[t]s?$',
    'API',
    'index.tsx',
    'routes.tsx',
    'core/components/Graph',
    'layout/RouteContainer.tsx',
    'config',
    'typings.d.ts',
    'pages/shared/Metrics/Filters.tsx'
  ]
};
