# ![alt text](https://user-images.githubusercontent.com/79913332/225248562-80d8f046-dba6-4b1e-94d2-75b4ece046f0.png)

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml) [![codecov](https://codecov.io/github/skupperproject/skupper-console/graph/badge.svg?token=42RWX7XAHH)](https://codecov.io/github/skupperproject/skupper-console) [![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Table of Contents

- [Network console V2](#network-console-v2)
- [Enable the console from Skupper](#enable-the-console-from-skupper)
- [Development](#development)
  - [Quick start](#quick-start)
  - [Run the Console with external routes](#run-the-console-with-external-routes)
  - [Testing](#testing)
- [Project structure](#project-structure)
  - [Page sections](#page-sections)
- [ENV variables](#env-variables)

## Network console V2

The Network Console is a web-based graphical user interface (GUI) designed for easy observability and monitoring of your [Skupper](https://github.com/skupperproject/skupper) network resources. With the Network Console, you can visualize your network topology, explore components and endpoints, and monitor traffic patterns to gain valuable insights into the health and performance of your Skupper infrastructure. Whether you are a developer or a network operator, Network Console makes it easy to stay on top of your Skupper network by providing an intuitive and user-friendly interface.

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

_Note_:

The running application uses the data in the mock folder.

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

#### Development mode

To run integration tests in development mode and open the Cypress test runner, use the following command:

```bash
yarn cy:open
```

Note that the above commands assume that you have the necessary dependencies installed and configured for testing.

## Project Structure

The project has the following directory structure:

- `tests`: Contains the unit tests code using jest library.
- `build`: Contains the output of the production build, which is the compiled and optimized version of the application that can be deployed to a server.
- `config`: Contains the configuration files for the development tools used in the project, such as webpack, jest, typescript paths, eslint, etc.
- `cypress`: Contains the integration testing code using Cypress framework, which is used to test the application's user interface and user interactions.
- `mocks`: Contains a mock server that runs on a static dataset to simulate a basic network, which is useful for testing the application's data handling and network requests.
- `public`: Contains the index.html file, which is the entry point of the application and serves as the shell for the application's content.
- `src`: Contains the source and test code of the application, including all the React components, utility functions, and data models.
  - `API`: Contains the Api, which is responsible for handling all the network requests and data fetching for the application.
  - `assets`: Contains images and other assets used in the application, such as icons, logos, and background images.
  - `config`: Contains the configuration files for the application, such as the environment variables, constants, or settings used throughout the application.
  - `core/components`: Contains generic and reusable React components, such as Navbar, topology graph, and table, that can be used throughout the application.
  - `core/utils`: Contains generic app functionalities such as date and formatting utilities that are used throughout the application.
  - `layout`: Contains the components that form the foundation of the application's structure, such as the header, footer, and navigation menu.
  - `pages`: Contains the components that are displayed within the container, which represent the different pages or views of the application.
    - `<page>/components`: Contains the components of a particular view, such as the list and details.
    - `<page>/services`: Contains data utilities for a specific page, such as filtering or sorting the products on the product list page.
    - `<page>/views`: Contains a collection of views for a particular page, such as the list view or details view.
  - `providers`: Holds the context providers for the application.
  - `routes`: Contains the aggregation of page routes, which define the mapping between URLs and components/views in the application..
  - `types`: Defines TypeScript interfaces.

### Page sections

Please note that the `services` folder contains utilities for data normalization, sanitization, and manipulation for a specific page, while other generic app functionalities such as date and formatting utilities can be found in the `core/utils` folder.

## Env variables

- `COLLECTOR_URL`: The console uses a real network observer.
- `API_VERSION`: Defaults to 'api/v1alpha1'. **Note**: Do not include a leading slash (/) in the value of API_VERSION.
- `BRAND_APP_LOGO`
- `BRAND_FAVICON`
- `ENABLE_MOCK_SERVER`
- `ENABLE_DELAY_RESPONSE`: It simulates a delay in the response.
- `MOCK_ITEM_COUNT`: It generates X random resources (processes, sites, links, etc.)
