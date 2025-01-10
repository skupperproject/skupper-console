# ![alt text](https://user-images.githubusercontent.com/79913332/225248562-80d8f046-dba6-4b1e-94d2-75b4ece046f0.png)

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml) [![codecov](https://codecov.io/github/skupperproject/skupper-console/graph/badge.svg?token=42RWX7XAHH)](https://codecov.io/github/skupperproject/skupper-console) [![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Network console V2

- [Enable the console from Skupper](#enable-the-console-from-skupper)
- [Development](#development)
  - [Quick start](#quick-start)
  - [Run the Console with external routes](#run-the-console-with-external-routes)
  - [Testing](#testing)
- [ENV variables](#env-variables)

## Enable the console from Skupper

The network console works alongside the **network observer**. Follow the steps outlined in the [network observer setup guide](https://github.com/skupperproject/skupper/blob/v2/cmd/network-observer/resources/README.md) to configure a valid route.

## Development

We use `yarn` as the package manager, if adding dependencies to `package.json`
make sure you install them with `yarn` and commit the `yarn.lock` file.

### Quick start

To get started quickly, follow the steps below:

1. Install the required dependencies by running `yarn install`.
2. Start the application by running `yarn start`.
3. Open <http://localhost:3000> in your web browser.

### Run the Console with external routes

```bash
COLLECTOR_URL=<network observer console url route> yarn start
```

## Testing

### Unit

To run unit tests, use the following command:

```bash
yarn test
```

### Integration

To run integration tests, use the following command:

```bash
yarn cy
```

## Env variables

- `COLLECTOR_URL`: The console uses a real network observer.
- `API_VERSION`: Part of the url api. **Note**: Do not include a leading slash (/) in the value of API_VERSION.
- `BRAND_APP_LOGO`: Customize the logo for the build.
- `BRAND_FAVICON`: Customize the favicon for the build.
- `ENABLE_MOCK_SERVER`: Use predefined static data to display the console.
- `ENABLE_DELAY_RESPONSE`: It simulates a delay in the response.
- `MOCK_ITEM_COUNT`: It generates X random resources (processes, sites, links, etc.)
