/// <reference types="cypress" />

// Custom command para login
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command para logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.contains('Cerrar Sesión').click();
  cy.url().should('include', '/login');
});

// Custom command para crear expediente
Cypress.Commands.add('crearExpediente', (data: any) => {
  cy.visit('/expedientes');
  cy.contains('button', 'Nuevo Expediente').click();

  if (data.numeroExpediente) cy.get('input[name="numeroExpediente"]').type(data.numeroExpediente);
  if (data.nombreExpediente) cy.get('input[name="nombreExpediente"]').type(data.nombreExpediente);
  if (data.asunto) cy.get('textarea[name="asunto"]').type(data.asunto);
  if (data.unidadId) cy.get('select[name="unidadAdministrativaId"]').select(data.unidadId);
  if (data.seccionId) cy.get('select[name="seccionId"]').select(data.seccionId);
  if (data.serieId) cy.get('select[name="serieId"]').select(data.serieId);

  cy.contains('button', 'Crear').click();
  cy.contains('Expediente creado exitosamente').should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      crearExpediente(data: any): Chainable<void>;
    }
  }
}

export {};
