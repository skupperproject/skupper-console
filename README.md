# ![alt text](https://user-images.githubusercontent.com/79913332/225248562-80d8f046-dba6-4b1e-94d2-75b4ece046f0.png)

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml)

# Table of Contents

- [Skupper Console](#skupper-console)
  - [Status](#status)
  - [Enable the console from Skupper](#enable-the-console-from-skupper)
- [Development](#development)
  - [Quick start](#quick-start)
  - [Run the console with demo routes](#run-the-console-with-demo-routes)
  - [Run the console with Skupper (work in progress)](#run-the-console-with-skupper-work-in-progress)
  - [Testing](#testing)
  - [Project Structure](#project-structure)

Skupper Console is a web-based graphical user interface (GUI) designed for easy observability and monitoring of your [Skupper](https://github.com/skupperproject/skupper) network resources. With Skupper Console, you can visualize your network topology, explore components and endpoints, and monitor traffic patterns to gain valuable insights into the health and performance of your Skupper infrastructure. Whether you are a developer or a network operator, Skupper Console makes it easy to stay on top of your Skupper network by providing an intuitive and user-friendly interface.

## Status

Skupper Console is currently in Tech Preview. Please access the Web console demo by clicking [here](https://skupper-console-vry5.vercel.app/#/topology).

This demo is synchronized with the latest version of the Skupper or a modified version of it, using the current main branch.

## Enable the console from Skupper

To access the Web console in [Skupper](https://github.com/skupperproject/skupper) version 1.3 and above, please refer to the step-by-step instructions provided in this  [this guide](https://github.com/skupperproject/skupper-docs/blob/main/modules/console/pages/flow-console.adoc). The guide will walk you through the process of enabling the console and accessing it in your Skupper deployment.

---

## Development

We use `yarn` as the package manager, if adding dependencies to `package.json`
make sure you install them with `yarn` and commit the `yarn.lock` file.

### Quick start

To get started quickly, follow the steps below:

1. Install the required dependencies by running `yarn install`.
2. Start the application by running `yarn start`.
3. Open <http://localhost:3000> in your web browser.

*Note*:

Running `yarn start` uses the data in the mock folder, which means that no metrics data or charts will be available.

### Run the console with demo routes

To run the console with demo routes, execute the following command:

```bash
API_HOST_FLOW_COLLECTOR=https://flow-collector-grpc-private.vabar-vpc-cluster-153f1de160110098c1928a6c05e19444-0000.eu-gb.containers.appdomain.cloud PROMETHEUS_URL=https://prometheus-grpc-private.vabar-vpc-cluster-153f1de160110098c1928a6c05e19444-0000.eu-gb.containers.appdomain.cloud/api/v1 yarn start
```

 These routes are associated with the boutique demo, which can be found at the following link <https://github.com/skupperproject/skupper-example-grpc>.

### Run the console with Skupper (work in progress)

When running skupper, executing `skupper init --enable-flow-collector` will generate publicly accessible routes to the collector and Prometheus. These routes can be secured or unsecured, depending on the desired level of security.

If you intend to run the console as a standalone application, you must use the designated routes alongside the appropriate API environment variable.

#### Enable the Flow collector

```bash
API_HOST_FLOW_COLLECTOR=<skupper url> yarn start
```

**Cross-Origin Resource Sharing (CORS) issue**
 For security reasons, browsers forbid requests that come in from cross-domain sources. We need to allow the CORS manually:

```bash
kubectl set env <name of your skupper controller deployed> USE_CORS=yes
```

example:

```bash
kubectl set env deployment/skupper-service-controller USE_CORS=yes
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

* `build`: Contains the output of the production build, which is the compiled and optimized version of the application that can be deployed to a server.
* `config`: Contains the configuration files for the development tools used in the project, such as webpack, jest, typescript paths, eslint, etc.
* `cypress`: Contains the integration testing code using Cypress framework, which is used to test the application's user interface and user interactions.
* `mocks`: Contains a mock server that runs on a static dataset to simulate a basic network, which is useful for testing the application's data handling and network requests.
* `public`: Contains the index.html file, which is the entry point of the application and serves as the shell for the application's content.
* `src`: Contains the source and test code of the application, including all the React components, utility functions, and data models.
  * `API`: Contains the Api, which is responsible for handling all the network requests and data fetching for the application.
  * `assets`: Contains images and other assets used in the application, such as icons, logos, and background images.
  * `core/components`: Contains generic and reusable React components, such as Navbar, topology graph, and table, that can be used throughout the application.
  * `core/utils`: Contains generic app functionalities such as date and formatting utilities that are used throughout the application.
  * `layout`: Contains the components that form the foundation of the application's structure, such as the header, footer, and navigation menu.
  * `pages`: Contains the components that are displayed within the container, which represent the different pages or views of the application.
    * `<page>/components`: Contains the components of a particular view, such as the list and  details.
    * `<page>/services`: Contains data utilities for a specific page, such as filtering or sorting the products on the product list page.
    * `<page>/views`: Contains a collection of views for a particular page, such as the  list view or details view.
  * `config`: Contains the configuration files for the application, such as the environment variables, constants, or settings used throughout the application.
  * `routes`: Contains the aggregation of page routes, which define the mapping between URLs and components/views in the application.

### Page sections

Each page section includes constants, interfaces, and enums that are specific to the React views and components used in that section. If you require more generic modules or API-related items, we recommend accessing them from the services folder modules.

Please note that the `services` folder contains utilities for data normalization, sanitization, and manipulation for a specific page, while other generic app functionalities such as date and formatting utilities can be found in the `core/utils` folder.
