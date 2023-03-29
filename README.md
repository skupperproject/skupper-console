# ![alt text](https://user-images.githubusercontent.com/79913332/225248562-80d8f046-dba6-4b1e-94d2-75b4ece046f0.png)

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml)


Web console status: **Tech Preview**

---

Please access the Web console demo by clicking [here](https://skupper-console-vry5.vercel.app/#/topology).

This demo is synchronized with the current main branch and utilizes either the latest version of Skupper or a modified version thereof.

## Enable the console from Skupper

The Web console has been integrated into [Skupper](https://github.com/skupperproject/skupper). To facilitate access to the console, please refer to the step-by-step instructions detailed in [this guide](https://github.com/skupperproject/skupper-docs/blob/main/modules/console/pages/flow-console.adoc).

## Run the console standalone

### Installation

```bash
yarn install
yarn prepare
```

the last command install husky to improves commits. You need to run this command just one time.

### Run the console with demo routes

 These routes are associated with the boutique demo, which can be found at the following link <https://github.com/skupperproject/skupper-example-grpc>.

```bash
API_HOST_FLOW_COLLECTOR=https://flow-collector-grpc-private.vabar-vpc-cluster-153f1de160110098c1928a6c05e19444-0000.eu-gb.containers.appdomain.cloud PROMETHEUS_URL=https://prometheus-grpc-private.vabar-vpc-cluster-153f1de160110098c1928a6c05e19444-0000.eu-gb.containers.appdomain.cloud/api/v1 yarn start
```

### Run the console with Skupper

When running skupper, executing `skupper init --enable-flow-collector` will generate publicly accessible routes to the collector and Prometheus. These routes can be secured or unsecured, depending on the desired level of security.

If you intend to run the console as a standalone application, you must use the designated routes alongside the appropriate API environment variables.

### Enable the Flow collector (mandatory)

```bash
API_HOST_FLOW_COLLECTOR=<flows APIs url> yarn start
```

### Enable Prometheus (optional)

```bash
PROMETHEUS_URL=<prometheus server url/api/v1> yarn start
```

and open <http://localhost:3000>

**remember to enable CORS**
The flow-collector need to enable the CORS. We can do that doing:

```bash
kubectl set env <container-name> USE_CORS=yes
```

example:

```bash
kubectl set env deployment/skupper-flow-collector USE_CORS=yes
```

## Tests

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
