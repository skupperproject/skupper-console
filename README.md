# ![alt text](https://user-images.githubusercontent.com/79913332/225248562-80d8f046-dba6-4b1e-94d2-75b4ece046f0.png)

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/build.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/build.yml) [![codecov](https://codecov.io/github/skupperproject/skupper-console/graph/badge.svg?token=42RWX7XAHH)](https://codecov.io/github/skupperproject/skupper-console) [![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Network console V2

- [Enable the console from Skupper](#enable-the-console-from-skupper)
- [Development](#development)
  - [Quick start](#quick-start)
  - [Run the Console with external routes](#run-the-console-with-external-routes)
  - [Testing](#testing)
- [ENV variables](#env-variables)

![alt text](https://github.com/user-attachments/assets/702ae1fa-a52d-4564-a9ff-3f250bb00cf3)

![alt text](https://github.com/user-attachments/assets/91b284f6-a1b3-4ee1-83cd-656d0b65b0d0)

![alt text](https://github.com/user-attachments/assets/b5c7941f-bc4d-4f72-875a-d12890c1e9a7)

![alt text](https://github.com/user-attachments/assets/862e61a3-067d-48ed-b612-bee1efd1ffc2)

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
OBSERVER_URL=<network observer console url route> yarn start
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

- `OBSERVER_URL`: The console uses a real network observer.
- `API_VERSION`: Part of the url api. **Note**: Do not include a leading slash (/) in the value of API_VERSION.
- `BRAND_APP_LOGO`: Customize the logo for the build.
- `BRAND_FAVICON`: Customize the favicon for the build.
- `USE_MOCK_SERVER`: Use predefined static data to display the console.
- `MOCK_RESPONSE_DELAY`: It simulates a delay (milliseconds) in the response when using the mock server.
- `MOCK_ITEM_COUNT`: It generates X random resources (processes, sites, links, etc.)
