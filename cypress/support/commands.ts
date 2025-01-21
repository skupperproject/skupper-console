const getAuthConfig = () => {
  const username = Cypress.env('USERNAME');
  const password = Cypress.env('PASSWORD');

  if (username && password) {
    return {
      auth: {
        username,
        password
      }
    };
  }

  return {};
};

Cypress.Commands.add('visitWithAuth', (url: string = '/', options = {}) => {
  cy.visit(url, {
    ...getAuthConfig(),
    ...options
  });
});

Cypress.Commands.add('requestWithAuth', (method: string, url: string, options = {}) => {
  const authConfig = getAuthConfig();
  cy.request({
    method,
    url,
    ...authConfig,
    ...options
  }).as('requestResponse');
});
