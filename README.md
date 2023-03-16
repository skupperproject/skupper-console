# ![alt text](https://user-images.githubusercontent.com/79913332/225248562-80d8f046-dba6-4b1e-94d2-75b4ece046f0.png)

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml)

## Development

```bash
yarn install
yarn prepare
```

the last command install husky to improves commits. You need to run this command just one time

## Run the console standalone

The console must work with the *flow collector* module enabled in Skupper. In case you want to run the console standalone you need to expose this url and set the following env variables (you can combine them).

### Enable the Flow collector

```bash
API_HOST_FLOW_COLLECTOR=<flows APIs url> yarn start
```

### Enable Prometheus

```bash
PROMETHEUS_URL=<prometheus server url> yarn start
```

### Demo mode

Run the console using a mock data example:

```bash
yarn start
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
