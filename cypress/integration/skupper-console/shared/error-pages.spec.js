/// <reference types="Cypress" />

context('Error pages', () => {
    it('Redirect to the Not found page when url not exists', () => {
        cy.visit('/#/wrong-page');
        cy.get('.sk-not-found').contains('NotFound').should('be.visible');
    });
});
