import { apiEndpoints } from '../../src/config/api';

describe('API Endpoint Tests', () => {
  for (const [name, url] of Object.entries(apiEndpoints)) {
    it(`Should GET ${name} (${url}) and verify the response`, () => {
      cy.requestWithAuth('GET', url).as(`get${name}`);

      cy.get(`@get${name}`).then((response: any) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('count');
        expect(response.body).to.have.property('timeRangeCount');
        expect(response.body).to.have.property('results');
        expect(response).to.have.property('headers');
        expect(response.headers).to.have.property('content-type');
        expect(response.headers['content-type']).to.contain('application/json');
      });
    });
  }

  it(`Should handle the Network error for ${apiEndpoints.SITES}`, () => {
    cy.intercept('GET', apiEndpoints.SITES, { forceNetworkError: true }).as('networkError');
    cy.visitWithAuth('/');
    cy.wait('@networkError').then(() => {
      cy.get('body').contains('ERR_NETWORK').should('be.visible');
    });
  });

  it(`Should handle 500 error for ${apiEndpoints.SITES}`, () => {
    cy.intercept('GET', apiEndpoints.SITES, { statusCode: 500 }).as('serverError');
    cy.visitWithAuth('/');
    cy.wait('@serverError').its('response.statusCode').should('eq', 500);
    cy.get('body').contains('500: Internal Server Error').should('be.visible');
  });

  it(`Should handle 404 error for ${apiEndpoints.SITES}`, () => {
    cy.intercept('GET', apiEndpoints.SITES, { statusCode: 404 }).as('notFound');
    cy.visitWithAuth('/');
    cy.wait('@notFound').its('response.statusCode').should('eq', 404);
    cy.get('body').contains('404: Not Found').should('be.visible');
  });
});

describe('API Resilience Tests', () => {
  it('Should recover after temporary service unavailability, clicking on Try again button', () => {
    cy.intercept('GET', apiEndpoints.SITES, { forceNetworkError: true }).as('initialError');
    cy.visitWithAuth('/');
    cy.get('body').contains('ERR_NETWORK').should('be.visible');

    cy.intercept('GET', apiEndpoints.SITES, { forceNetworkError: false }).as('secondTry');
    cy.get('body').contains('Try again').should('be.visible').click();
    cy.wait('@secondTry').its('response.statusCode').should('eq', 200);
  });
});

describe('API Concurrency Tests', () => {
  it('Should handle multiple concurrent requests', () => {
    const endpoints = Object.values(apiEndpoints);
    const requests = endpoints.map(
      (url) =>
        new Cypress.Promise((resolve) => {
          cy.requestWithAuth('GET', url).then(resolve);
        })
    );

    cy.wrap(Promise.all(requests)).then((responses: any) => {
      responses.forEach((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
