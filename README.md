# ![alt text](https://user-images.githubusercontent.com/79913332/225248562-80d8f046-dba6-4b1e-94d2-75b4ece046f0.png)

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml)

## Development

> `yarn install`
> `yarn prepare`

the last command install husky to improves commits. You need to run this command just one time

## Run

Run this command using the flow collector endpoints from Skupper:

> `API_HOST_FLOW_COLLECTOR=<flows APIs url> yarn start`

### Demo mode

Run the console using a mock data example:

> `yarn start`

and open <http://localhost:3000>

**remember to enable CORS**
The flow-collector need to enable the CORS. We can do that doing ```kubectl set env <container-name> USE_CORS=yes``` .

example: ```kubectl set env deployment/skupper-flow-collector USE_CORS=yes```.

## Tests

### Unit

> `yarn test`

### Integration

> `yarn cy`

#### Development mode

> `yarn cy:open`
