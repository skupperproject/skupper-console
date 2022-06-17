/// <reference types="Cypress" />

context('Error pages', () => {
    beforeEach(() => {});

    it('Redirect to the Not found page when url not exists', () => {
        cy.visit('/#/wrong-page');
        cy.get('[data-cy=sk-not-found]').contains('Page not found').should('be.visible');
    });
});
