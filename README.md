<div style="display:flex; align-items:center; justify-content:center"><img src="https://skupper.io/images/skupper-logo.svg" height="60">&nbsp;&nbsp;&nbsp;&nbsp;<h1>Skupper console</h1></div>


## Installation

The skupper console is installed when skupper is initialized using

> `skupper init --enable-console`

## Securing the console

When you run skupper init you can specify the --console-user and --console-password, otherwise they will be generated (admin and a random password held in secrets/skupper-console-users).

You can also disable authentication by specifying

> `--console-auth unsecured`

## Development

> `yarn install`
> `yarn prepare`

the last command install husky to improves commits. You need to run this command just one time

To run the console in develop mode using a mock data example, type in the terminal

> `yarn start`

and open <http://localhost:3000>

You can also run the console using external endpoints for the skupper collector:

> `API_HOST_FLOW_COLLECTOR=<flows APIs url> yarn start`

**remember to enable CORS**
The flow-collector need to enable the CORS. We can do that doing ```kubectl set env <container-name> USE_CORS=yes``` .  

ie in openshift: ```kubectl set env deployment/skupper-vflow-collector USE_CORS=yes```.

You can install and activate this plugin in firefox <https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/> or in chrome <https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino>

## Tests

### Unit

> `yarn test`

### Integration

#### Development mode

> `yarn start`
> `yarn cy:open`
