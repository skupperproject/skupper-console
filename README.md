# Skupper console

## Development

> `yarn install`
> `yarn prepare`

the last command install husky to improves commits. You need to run this command just one time

To develop the console type in the terminal

> `yarn start`

and open <http://localhosst:3000> from the browser

To develop the console using external APIs from a skupper network

> `API_HOST=<url root apis> yarn start`

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

To build the console using mock data type  in the terminal

> `ENABLE_MOCK_SERVER=true yarn build`

To build the console using external APIs

> `API_HOST=<url root apis> ENABLE_MOCK_SERVER=true yarn build`
