/// <reference types="Cypress" />

context('Monitoring service', () => {
    beforeEach(() => {
        cy.visit('/#/addresses');
    });

    it('Navigate to the Address shippingservice details view and back to the Addresses homepage', () => {
        cy.get('[data-cy=sk-addresses]').contains('shippingservice').click({ force: true });
        cy.location('hash').should('include', 'addresses/flowpairs/shippingservice');

        cy.get('[data-cy=sk-address]')
            .get('.pf-c-breadcrumb__list')
            .contains('addresses')
            .click({ force: true });
        cy.location('hash').should('include', 'addresses');
    });
});
