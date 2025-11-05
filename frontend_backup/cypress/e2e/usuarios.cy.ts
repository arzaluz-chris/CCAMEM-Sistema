describe('Gestión de Usuarios', () => {
  beforeEach(() => {
    // Login como admin
    cy.visit('/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Navegar a usuarios (solo admin puede acceder)
    cy.visit('/admin/usuarios');
  });

  it('debe listar usuarios', () => {
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length.at.least', 1);
  });

  it('debe buscar usuarios', () => {
    cy.get('input[placeholder*="Buscar"]').type('admin');
    cy.get('tbody tr').should('contain', 'admin');
  });

  it('debe abrir formulario de nuevo usuario', () => {
    cy.contains('button', 'Nuevo Usuario').click();
    cy.get('dialog').should('be.visible');
    cy.contains('Nuevo Usuario').should('be.visible');
  });

  it('debe crear un nuevo usuario', () => {
    cy.contains('button', 'Nuevo Usuario').click();

    // Llenar formulario
    cy.get('input[name="username"]').type('usuario_test_e2e');
    cy.get('input[name="email"]').type('test_e2e@ccamem.gob.mx');
    cy.get('input[name="password"]').type('Test123!');
    cy.get('input[name="nombre"]').type('Usuario');
    cy.get('input[name="apellidoPaterno"]').type('Test');
    cy.get('input[name="apellidoMaterno"]').type('E2E');

    // Seleccionar rol
    cy.get('select[name="rol"]').select('OPERADOR');

    // Guardar
    cy.contains('button', 'Crear').click();

    // Verificar mensaje de éxito
    cy.contains('Usuario creado exitosamente').should('be.visible');
  });

  it('debe editar un usuario', () => {
    // Buscar usuario creado anteriormente
    cy.get('input[placeholder*="Buscar"]').type('usuario_test_e2e');
    cy.get('tbody tr').first().find('button[aria-label="more"]').click();
    cy.contains('Editar').click();

    cy.get('dialog').should('be.visible');
    cy.get('input[name="nombre"]').clear().type('Usuario Modificado');

    cy.contains('button', 'Actualizar').click();
    cy.contains('Usuario actualizado exitosamente').should('be.visible');
  });

  it('debe desactivar un usuario', () => {
    cy.get('input[placeholder*="Buscar"]').type('usuario_test_e2e');
    cy.get('tbody tr').first().find('button[aria-label="more"]').click();
    cy.contains('Desactivar').click();

    cy.contains('Usuario desactivado exitosamente').should('be.visible');
    cy.get('tbody tr').first().should('contain', 'Inactivo');
  });

  it('debe mostrar roles con colores diferentes', () => {
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('[data-testid="rol-chip"]').should('have.class', 'MuiChip-root');
    });
  });
});
