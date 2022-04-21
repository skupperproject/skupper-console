context('Monitoring', () => {
    beforeEach(() => {
        cy.visit('/#/monitoring');
    });

    it('Navigate to the Monitoring/service-bar section and back to the monitor homepage', () => {
        cy.get('.sk-monitoring-services').contains('service-bar').click({ force: true });
        cy.location('hash').should('include', 'monitoring/connections/service-bar');

        cy.get('.sk-monitoring-service')
            .get('.pf-c-breadcrumb__list')
            .contains('Monitoring')
            .click({ force: true });
        cy.location('hash').should('include', 'monitoring');
    });
});
