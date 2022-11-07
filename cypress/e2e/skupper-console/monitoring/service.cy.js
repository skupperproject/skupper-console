/// <reference types="Cypress" />

context('Monitoring service', () => {
    beforeEach(() => {
        cy.visit('/#/addresses');
    });

    it('Navigate to the Monitoring/service-bar section and back to the monitor homepage', () => {
        cy.get('[data-cy=sk-addresses]').contains('productcatalogservice').click({ force: true });
        cy.location('hash').should('include', 'addresses/flowpairs/productcatalogservice');

        cy.get('[data-cy=sk-address]')
            .get('.pf-c-breadcrumb__list')
            .contains('addresses')
            .click({ force: true });
        cy.location('hash').should('include', 'addresses');
    });
});
