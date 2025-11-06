describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('debe mostrar el formulario de login', () => {
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('debe mostrar error con credenciales inválidas', () => {
    cy.get('input[name="username"]').type('usuarioinvalido');
    cy.get('input[name="password"]').type('passwordinvalido');
    cy.get('button[type="submit"]').click();

    cy.contains('Usuario o contraseña incorrectos').should('be.visible');
  });

  it('debe iniciar sesión con credenciales válidas', () => {
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('debe validar campos requeridos', () => {
    cy.get('button[type="submit"]').click();

    cy.get('input[name="username"]:invalid').should('exist');
    cy.get('input[name="password"]:invalid').should('exist');
  });
});
