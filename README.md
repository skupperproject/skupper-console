# Skupper console

WOrk in progress.

## Development

> `yarn install`
> `yarn prepare`

the last command install husky to improves commits. You need to run this command just one time

To run the console in develop mode using a mock data example, type in the terminal

> `yarn start`

and open <http://localhosst:3000> from the browser

Alternatevely you can run the console using external endpoints for the skupper controller and skupper flow collector:

> `API_HOST=<APIs url> API_HOST_FLOW_COLLECTOR=<flows APIs url> yarn start`

**remember to enable CORS**
Both the Skupper-controller and the flow-collector need to enable the CORS. We can do that doing ```kubectl set env deployment/<deployment name> USE_CORS=yes``` for each of them.
For development scope alternatevely you can install and activate this plugin in firefox <https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/> or in chrome <https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino>

## Tests

### Unit

> `yarn test`

### Integration

#### Development mode

> `yarn start`
> `yarn cy:open`

#### ci mode

> `yarn cy-test`

## build

> `yarn build`

 you should pass (or set your host) the following ENV_VARIABLES:

> `ENABLE_MOCK_SERVER=true` - the app use mock data
> `API_HOST=<APIs url> API_HOST_FLOW_COLLECTOR=<flows APIs url>`  - the app use data from remote endpoints
