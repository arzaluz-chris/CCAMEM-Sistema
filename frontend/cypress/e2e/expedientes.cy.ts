describe('Gestión de Expedientes', () => {
  beforeEach(() => {
    // Login antes de cada test
    cy.visit('/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Navegar a expedientes
    cy.contains('Expedientes').click();
    cy.url().should('include', '/expedientes');
  });

  it('debe listar expedientes', () => {
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length.at.least', 1);
  });

  it('debe filtrar expedientes por búsqueda', () => {
    cy.get('input[placeholder*="Buscar"]').type('EXP-2025-001');
    cy.get('tbody tr').should('have.length.at.most', 5);
  });

  it('debe abrir formulario de nuevo expediente', () => {
    cy.contains('button', 'Nuevo Expediente').click();
    cy.get('dialog').should('be.visible');
    cy.contains('Crear Expediente').should('be.visible');
  });

  it('debe crear un nuevo expediente', () => {
    cy.contains('button', 'Nuevo Expediente').click();

    // Llenar formulario
    cy.get('input[name="numeroExpediente"]').type('TEST-E2E-001');
    cy.get('input[name="nombreExpediente"]').type('Expediente Test E2E');
    cy.get('textarea[name="asunto"]').type('Expediente de prueba para tests e2e');

    // Seleccionar unidad, sección, serie
    cy.get('select[name="unidadAdministrativaId"]').select(1);
    cy.get('select[name="seccionId"]').select(1);
    cy.get('select[name="serieId"]').select(1);

    // Datos numéricos
    cy.get('input[name="totalLegajos"]').clear().type('1');
    cy.get('input[name="totalDocumentos"]').clear().type('10');
    cy.get('input[name="totalFojas"]').clear().type('25');

    // Fecha de apertura
    cy.get('input[name="fechaApertura"]').type('2025-01-15');

    // Guardar
    cy.contains('button', 'Crear').click();

    // Verificar mensaje de éxito
    cy.contains('Expediente creado exitosamente').should('be.visible');
  });

  it('debe ver detalle de expediente', () => {
    cy.get('tbody tr').first().click();
    cy.url().should('match', /\/expedientes\/[a-f0-9-]+$/);
    cy.contains('Información General').should('be.visible');
  });

  it('debe solicitar préstamo de expediente', () => {
    cy.get('tbody tr').first().click();
    cy.contains('button', 'Solicitar Préstamo').click();

    cy.get('dialog').should('be.visible');
    cy.contains('Solicitar Préstamo').should('be.visible');

    // Llenar formulario
    cy.get('textarea[name="motivo"]').type('Revisión de documentos para auditoría');

    cy.contains('button', 'Solicitar').click();

    cy.contains('Solicitud de préstamo enviada').should('be.visible');
  });

  it('debe paginarse correctamente', () => {
    cy.get('[aria-label="Go to next page"]').click();
    cy.url().should('include', 'page=2');
  });
});
