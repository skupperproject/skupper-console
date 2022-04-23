/// <reference types="Cypress" />

import { loadMockServer } from '../../../../public/mocks/server';

context('Navigation', () => {
    let server;

    beforeEach(() => {
        server = loadMockServer();
        cy.visit('/');
    });

    afterEach(() => {
        server.shutdown();
    });

    it('Redirect to the Overview section when the app is loaded', () => {
        cy.location('hash').should('include', 'network');
    });

    it('Navigate to the Sites section', () => {
        cy.get('[data-cy=sk-nav-bar]').contains('Sites').click({ force: true });
        cy.location('hash').should('include', 'sites');
    });

    it('Navigate to the Services section', () => {
        cy.get('[data-cy=sk-nav-bar]').contains('Services').click({ force: true });
        cy.location('hash').should('include', 'services');
    });

    it('Navigate to the Deployments section', () => {
        cy.get('[data-cy=sk-nav-bar]').contains('Deployments').click({ force: true });
        cy.location('hash').should('include', 'deployments');
    });

    it('Navigate to the Monitoring section', () => {
        cy.get('[data-cy=sk-nav-bar]').contains('Monitoring').click({ force: true });
        cy.location('hash').should('include', 'monitoring');
    });

    it('Navigate to the Monitoring/service-bar section', () => {
        cy.get('[data-cy=sk-nav-bar]').contains('Monitoring').click({ force: true });
        cy.location('hash').should('include', 'monitoring');

        cy.get('[data-cy=sk-monitoring-services]').contains('service-bar').click({ force: true });
        cy.location('hash').should('include', 'monitoring/connections/service-bar');
    });

    it('Redirect to the Not found page when url not exists', () => {
        cy.visit('/#/wrong-page');
        cy.get('[data-cy=sk-not-found]').contains('NotFound').should('be.visible');
    });

    it("Go back or forward in the browser's history", () => {
        cy.get('[data-cy=sk-nav-bar]').contains('Sites').click({ force: true });
        cy.get('[data-cy=sk-nav-bar]').contains('Monitoring').click({ force: true });

        cy.go('back');
        cy.location('hash').should('not.include', 'monitoring');

        cy.go('forward');
        cy.location('hash').should('include', 'monitoring');

        // clicking back
        cy.go(-1);
        cy.location('hash').should('not.include', 'monitoring');

        // clicking forward
        cy.go(1);
        cy.location('hash').should('include', 'monitoring');
    });

    it('Reload the page and stay on the last page selected', () => {
        cy.get('[data-cy=sk-nav-bar]').contains('Sites').click({ force: true });
        cy.reload();
        cy.location('hash').should('include', 'sites');

        // reload the page without using the cache
        cy.reload(true);
        cy.get('[data-cy=sk-nav-bar]').contains('Services').click({ force: true });
        cy.location('hash').should('include', 'services');
    });
});
