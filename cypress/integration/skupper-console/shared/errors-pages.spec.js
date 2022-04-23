/// <reference types="Cypress" />

context('Error pages', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('Redirect to the Not found page when url not exists', () => {
        cy.visit('/#/wrong-page');
        cy.get('[data-cy=sk-not-found]').contains('NotFound').should('be.visible');
    });

    it('Redirect to error-server page after receiving an HTTP status 500', () => {
        cy.intercept('**/flows/*', { statusCode: 500, body: [] }).as('getFlowsApis');
        cy.wait('@getFlowsApis');
        cy.location('hash', { timeout: 30000 }).should('include', 'error-server');
    });

    it('Redirect to the error-connection page when a response delay 4 secs and retry 3 times', () => {
        cy.intercept('**/flows/*', (req) => {
            req.on('response', (res) => {
                res.setDelay(4000);
            });
        }).as('getFlowsApis');

        cy.wait('@getFlowsApis');
        cy.location('hash', { timeout: 30000 }).should('include', 'error-connection');
    });
});
