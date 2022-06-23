# Skupper console

## Development

> `yarn install`
> `yarn prepare`

the last command install husky to improves commits. You need to run this command just one time

To develop the console type in the terminal

> `yarn start`

and open <http://localhosst:3000> from the browser

To develop the console using external APIs from a skupper network

> `API_HOST=<APIs url> API_HOST_FLOW_COLLECTOR=<flows APIs url> yarn start`

**remember to enable CORS from the APIs side**

## Tests

### Unit

> `yarn test`

### Integration

#### Development mode

> `yarn start`
> `yarn cy:open`

#### ci mode

> `yarn cy-test`

#### build

Everytime you create a build we can pass ENV_VARIABLES:

> `ENABLE_MOCK_SERVER=true` - the app run use mock data
> `API_HOST=<APIs url> API_HOST_FLOW_COLLECTOR=<flows APIs url> yarn build`  - the app run use data from remote endpoints
