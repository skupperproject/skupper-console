/// <reference types="Cypress" />
import { loadMockServer } from '../../../../public/mocks/server';

context('Monitoring service', () => {
    let server;

    beforeEach(() => {
        server = loadMockServer();
        cy.visit('/#/monitoring');
    });

    afterEach(() => {
        server.shutdown();
    });

    it('Navigate to the Monitoring/service-bar section and back to the monitor homepage', () => {
        cy.get('[data-cy=sk-monitoring-services]').contains('service-bar').click({ force: true });
        cy.location('hash').should('include', 'monitoring/connections/service-bar');

        cy.get('[data-cy=sk-monitoring-service]')
            .get('.pf-c-breadcrumb__list')
            .contains('Monitoring')
            .click({ force: true });
        cy.location('hash').should('include', 'monitoring');
    });
});
