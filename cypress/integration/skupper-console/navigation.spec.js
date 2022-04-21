/// <reference types="cypress" />

context('Navigation', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });

    it('cy.location() - Redirect to the Overview section when the app is loaded', () => {
        cy.location('hash').should('include', 'network');
    });

    it('cy.location() - Navigate to the Sites section', () => {
        cy.get('.sk-nav-bar').contains('Sites').click({ force: true });
        cy.location('hash').should('include', 'sites');
    });

    it('cy.location() - Navigate to the Services section', () => {
        cy.get('.sk-nav-bar').contains('Services').click({ force: true });
        cy.location('hash').should('include', 'services');
    });

    it('cy.location() - Navigate to the Deployments section', () => {
        cy.get('.sk-nav-bar').contains('Deployments').click({ force: true });
        cy.location('hash').should('include', 'deployments');
    });

    it('cy.location() - Navigate to the Monitoring section', () => {
        cy.get('.sk-nav-bar').contains('Monitoring').click({ force: true });
        cy.location('hash').should('include', 'monitoring');
    });

    it('cy.location() - Navigate to the Monitoring/service-bar section', () => {
        cy.get('.sk-nav-bar').contains('Monitoring').click({ force: true });
        cy.location('hash').should('include', 'monitoring');

        cy.get('.sk-monitoring-services').contains('service-bar').click({ force: true });
        cy.location('hash').should('include', 'monitoring/connections/service-bar');
    });

    it.only("cy.go() - go back or forward in the browser's history", () => {
        cy.get('.sk-nav-bar').contains('Sites').click({ force: true });
        cy.get('.sk-nav-bar').contains('Monitoring').click({ force: true });

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

    it('cy.reload() - reload the page', () => {
        // https://on.cypress.io/reload
        cy.reload();

        // reload the page without using the cache
        cy.reload(true);
    });

    it('cy.visit() - visit a remote url', () => {
        // https://on.cypress.io/visit

        // Visit any sub-domain of your current domain

        // Pass options to the visit
        cy.visit('http://localhost:3000', {
            timeout: 50000, // increase total time for the visit to resolve
            onBeforeLoad(contentWindow) {
                // contentWindow is the remote page's window object
                expect(typeof contentWindow === 'object').to.be.true;
            },
            onLoad(contentWindow) {
                // contentWindow is the remote page's window object
                expect(typeof contentWindow === 'object').to.be.true;
            },
        });
    });
});
