# ![alt text](https://user-images.githubusercontent.com/79913332/225248562-80d8f046-dba6-4b1e-94d2-75b4ece046f0.png)

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/build.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/build.yml) [![codecov](https://codecov.io/github/skupperproject/skupper-console/graph/badge.svg?token=42RWX7XAHH)](https://codecov.io/github/skupperproject/skupper-console) [![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Network console V2

- [Enable the console from Skupper](#enable-the-console-from-skupper)
- [Development](#development)
  - [Quick start](#quick-start)
  - [Run the Console with external routes](#run-the-console-with-external-routes)
  - [Testing](#testing)
- [ENV variables](#env-variables)
- [Supported Browsers](#supported-browsers)

![alt text](https://github.com/user-attachments/assets/9644516c-bbdc-4dc7-9760-5e9da9fdd09f)

![alt text](https://github.com/user-attachments/assets/91b284f6-a1b3-4ee1-83cd-656d0b65b0d0)

![alt text](https://github.com/user-attachments/assets/b5c7941f-bc4d-4f72-875a-d12890c1e9a7)

![alt text](https://github.com/user-attachments/assets/ba57d9ce-369c-4ada-b41c-993fba830350)

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

### Local integration and e2e

To run local integration tests, use the following command:

```bash
yarn cy
```

To run the e2e tests, you'll need to configure the following environment variables:

- `CYPRESS_BASE_URL`: This variable is used to specify the base URL of the application under test.
- `CYPRESS_USERNAME` and `CYPRESS_PASSWORD`: If your application requires Basic Authentication.

## Env variables

- `OBSERVER_URL`: The console uses a real network observer.
- `API_VERSION`: Part of the url api. **Note**: Do not include a leading slash (/) in the value of API_VERSION.
- `BRAND_APP_LOGO`: Customize the logo for the build.
- `BRAND_FAVICON`: Customize the favicon for the build.
- `USE_MOCK_SERVER`: Use predefined static data to display the console. (ie: USE_MOCK_SERVER=true yarn build)
- `MOCK_RESPONSE_DELAY`: It simulates a delay (milliseconds) in the response when using the mock server.
- `MOCK_ITEM_COUNT`: It generates X random resources (processes, sites, links, etc.)

## Supported browsers

We support the last two versions of Firefox and Chrome

## Project Structure

The project has the following directory structure:

- `tests`: Contains the unit and snapshot tests code using jest library.
- `build`: Contains the output of the production build, which is the compiled and optimized version of the application that can be deployed to a server.
- `config`: Contains the configuration files for the main blocks of the application such as an entry point for styles, prometheus , react queries general styles and api.
- `cypress`: Contains the integration testing code using Cypress framework, which is used to test the application's user interface and user interactions.
- `mocks`: Contains a mock server that runs on a static dataset to simulate a basic network, which is useful for testing the application's data handling and network requests.
- `index.html`: Entry point of the application.
- `src`: Contains the source and test code of the application, including all the React components, utility functions, and data models.
  - `API`: Contains the Api, which is responsible for handling all the network requests and data fetching for the application.
  - `assets`: Contains images and other assets used in the application, such as icons, logos, and background images.
  - `core/components`: Contains generic and reusable React components, such as Navbar, topology graph, and table, that can be used throughout the application.
  - `core/utils`: Contains generic app functionalities such as date and formatting utilities that are used throughout the application.
  - `layout`: Contains the components that form the foundation of the application's structure, such as the header, footer, and navigation menu.
  - `pages`: Contains the components that are displayed within the container, which represent the different pages or views of the application.
    - `<page>/components`: Contains the components of a particular view, such as the list and details.
    - `<page>/services`: Contains data utilities for a specific page, such as filtering or sorting the products on the product list page.
    - `<page>/views`: Contains a collection of views for a particular page, such as the list view or details view.
  - `types`: Includes interfaces.
  - `providers`: Contains the providers for app routing and UI API queries.
  - `routes`: Contains the aggregation of page routes, which define the mapping between URLs and components/views in the application.

### Page sections

Please note that the `services` folder contains utilities for data normalization, sanitization, and manipulation for a specific page, while other generic app functionalities such as date and formatting utilities can be found in the `core/utils` folder.
