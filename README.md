# ![alt text](https://user-images.githubusercontent.com/79913332/225248562-80d8f046-dba6-4b1e-94d2-75b4ece046f0.png)

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml)

Web console status: **Tech Preview**

Please access the Web console demo by clicking [here](https://skupper-console-vry5.vercel.app/#/topology).

This demo is synchronized with the current main branch and utilizes either the latest version of Skupper or a modified version thereof.

## Enable the console from Skupper

The Web console has been integrated into [Skupper](https://github.com/skupperproject/skupper) from the version **1.3**. To facilitate access to the console, please refer to the step-by-step instructions detailed in [this guide](https://github.com/skupperproject/skupper-docs/blob/main/modules/console/pages/flow-console.adoc).

---

## Development

We use `yarn` as the package manager, if adding dependencies to `package.json`
make sure you install them with `yarn` and commit the `yarn.lock` file.

### Quick start

```bash
yarn install
yarn prepare
yarn start
```

then open <http://localhost:3000>

*Note*:

* `yarn prepare` install husky.  run this command just one time.
* `yarn start` run the application using the data in the mocks folder. No metrics data and charts are available at the moment.

### Run the console with demo routes

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

```bash
yarn test
```

### Integration

```bash
yarn cy
```

#### Development mode

```bash
yarn cy:open
```

## Directory Structure

* `build`: Production build output
* `config`: dev tool configurations
* `cypress`: Integration testing
* `mocks`:It contains a mock server to run a static dataset representing a basic network
* `public`: Home of index.html
* `src`: Source and test code
* `src/API`: React top level component
* `src/assets`: Images and other assets
* `src/core/components`: Generic and reusable React components
* `src/core/utils`: Generic app functionalities like dates and formatting utilities
* `src/layout`: The components that form the foundation of the application's structure
* `src/pages`:The components displayed within the container
* `src/pages/<page>/components`: components of the view
* `src/pages/<page>/services`:  data normalization/sanitization/manipulation utilities for this specific page
* `src/pages/<page>/views`: Collection of views
* `src/config`: Configuration
* `src/routes`: Aggregation of page routes

Each page section includes constants, interfaces, and enums that are specific to the React views and components used in the section. If you require more generic modules or API-related items, it is recommended that you access them from the modules located in the `services` folder.
