const { ROOT, path } = require('./webpack.constant');

const SRC_PATH = `${ROOT}/src`;
const CONFIG_PATH = `${ROOT}/config`;
const TS_CONFIG_PATH = path.join(CONFIG_PATH, '/tsconfig.paths.json');

const SVG_TRANSFORM_FILENAME = 'jest.config.svgTransform';
const FILE_MOCK_TRANSFORM_FILENAME = 'jest.config.fileMock';
const STYLE_MOCK_TRANSFORM_FILENAME = 'jest.config.styleMock';

const extensionsAllowed = {
  '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/': `${CONFIG_PATH}/${FILE_MOCK_TRANSFORM_FILENAME}`,
  '\\.(css|scss)$': `${CONFIG_PATH}/${STYLE_MOCK_TRANSFORM_FILENAME}`,
};

function makeModuleNameMapper(srcPath, tsconfigPath) {
  const { paths } = require(tsconfigPath).compilerOptions;
  const aliases = {};
  console.log(srcPath, paths);

  Object.keys(paths).forEach((item) => {
    const key = item.replace('/*', '/(.*)');
    const path = paths[item][0].replace('/*', '/$1');

    aliases[key] = `${srcPath}/${path}`;
  });

  return { ...extensionsAllowed, ...aliases };
}

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH),
  moduleDirectories: ['node_modules'],
  roots: [SRC_PATH],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.svg$': `${CONFIG_PATH}/${SVG_TRANSFORM_FILENAME}`,
  },
};
