const getAuthConfig = () =>
  cy.env(['USERNAME', 'PASSWORD']).then(({ USERNAME, PASSWORD }) => {
    if (USERNAME && PASSWORD) {
      return {
        auth: {
          username: USERNAME,
          password: PASSWORD
        }
      };
    }

    return {};
  });

Cypress.Commands.add('visitWithAuth', (url: string = '/', options = {}) => {
  getAuthConfig().then((authConfig) => {
    cy.visit(url, {
      ...authConfig,
      ...options
    });
  });
});

Cypress.Commands.add('requestWithAuth', (method: string, url: string, options = {}) => {
  getAuthConfig().then((authConfig) => {
    cy.request({
      method,
      url,
      ...authConfig,
      ...options
    }).as('requestResponse');
  });
});
