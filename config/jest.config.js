const {
  SRC_PATH,
  CONFIG_PATH,
  TS_CONFIG_PATH,
  SVG_TRANSFORM_FILENAME,
  FILE_MOCK_TRANSFORM_FILENAME,
  STYLE_MOCK_TRANSFORM_FILENAME,
  ENV_FILE,
  ROOT_PROJECT
} = require('./jest.config.var');

const extensionsAllowed = {
  '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/': `${CONFIG_PATH}/${FILE_MOCK_TRANSFORM_FILENAME}`,
  '\\.(css|scss)$': `${CONFIG_PATH}/${STYLE_MOCK_TRANSFORM_FILENAME}`
};

function makeModuleNameMapper(srcPath, tsconfigPath) {
  const { paths } = require(tsconfigPath).compilerOptions;
  const aliases = {};

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
  setupFiles: [ENV_FILE],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    ...makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH)
  },
  moduleDirectories: ['node_modules'],
  roots: [SRC_PATH],
  rootDir: ROOT_PROJECT,
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: `${ROOT_PROJECT}/tsconfig.json`, isolatedModules: true }],
    '^.+\\.svg$': `${CONFIG_PATH}/${SVG_TRANSFORM_FILENAME}`,
    '.+\\.(png)$': `${CONFIG_PATH}/${SVG_TRANSFORM_FILENAME}`
  }
};
