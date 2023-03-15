# Skupper console

[![Tests](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml/badge.svg)](https://github.com/skupperproject/skupper-console/actions/workflows/skupper-console.yml)

## Installation in Skupper

The skupper console is installed when skupper is initialized using

> `skupper init --enable-console`

note: You should enable the console only for one installation to avoid more traffic load for redundant collections.

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

## Tests

### Unit

> `yarn test`

### Integration

> `yarn cy`

#### Development mode

> `yarn cy:open`
