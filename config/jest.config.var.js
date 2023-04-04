const { ROOT, path } = require('./webpack.constant');

module.exports = {
  ROOT_PROJECT: `${ROOT}`,
  SRC_PATH: `${ROOT}/src`,
  CONFIG_PATH: `${ROOT}/config`,
  TS_CONFIG_PATH: path.join(`${ROOT}/config`, '/tsconfig.paths.json'),
  SVG_TRANSFORM_FILENAME: 'jest.config.svgTransform',
  FILE_MOCK_TRANSFORM_FILENAME: 'jest.config.fileMock',
  STYLE_MOCK_TRANSFORM_FILENAME: 'jest.config.styleMock',
  ENV_FILE: 'jest.config.setEnvVars'
};
