import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  AdminPanelSettings,
  Folder,
  Group,
  Visibility,
  Edit,
} from '@mui/icons-material';

interface RolPermiso {
  nombre: string;
  descripcion: string;
  permisos: {
    expedientes: {
      crear: boolean;
      leer: boolean;
      actualizar: boolean;
      eliminar: boolean;
    };
    usuarios: {
      crear: boolean;
      leer: boolean;
      actualizar: boolean;
      eliminar: boolean;
    };
    reportes: {
      generar: boolean;
      exportar: boolean;
    };
    catalogos: {
      gestionar: boolean;
    };
    prestamos: {
      solicitar: boolean;
      autorizar: boolean;
    };
    transferencias: {
      crear: boolean;
      autorizar: boolean;
    };
  };
  ambito: string;
  color: string;
  icon: React.ReactNode;
}

export default function RolesTab() {
  const roles: RolPermiso[] = [
    {
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema. Puede gestionar usuarios, configuración y todos los expedientes.',
      permisos: {
        expedientes: { crear: true, leer: true, actualizar: true, eliminar: true },
        usuarios: { crear: true, leer: true, actualizar: true, eliminar: true },
        reportes: { generar: true, exportar: true },
        catalogos: { gestionar: true },
        prestamos: { solicitar: true, autorizar: true },
        transferencias: { crear: true, autorizar: true },
      },
      ambito: 'Todo el sistema',
      color: '#d32f2f',
      icon: <AdminPanelSettings />,
    },
    {
      nombre: 'Coordinador de Archivo',
      descripcion: 'Gestiona el archivo general. Puede ver todos los expedientes y autorizar operaciones.',
      permisos: {
        expedientes: { crear: true, leer: true, actualizar: true, eliminar: false },
        usuarios: { crear: false, leer: true, actualizar: false, eliminar: false },
        reportes: { generar: true, exportar: true },
        catalogos: { gestionar: false },
        prestamos: { solicitar: true, autorizar: true },
        transferencias: { crear: true, autorizar: true },
      },
      ambito: 'Todo el archivo',
      color: '#1976d2',
      icon: <Folder />,
    },
    {
      nombre: 'Responsable de Área',
      descripcion: 'Gestiona expedientes de su unidad administrativa. Puede autorizar préstamos.',
      permisos: {
        expedientes: { crear: true, leer: true, actualizar: true, eliminar: false },
        usuarios: { crear: false, leer: false, actualizar: false, eliminar: false },
        reportes: { generar: true, exportar: true },
        catalogos: { gestionar: false },
        prestamos: { solicitar: true, autorizar: true },
        transferencias: { crear: true, autorizar: false },
      },
      ambito: 'Su unidad administrativa',
      color: '#9c27b0',
      icon: <Group />,
    },
    {
      nombre: 'Operador',
      descripcion: 'Captura y actualiza expedientes de su unidad administrativa.',
      permisos: {
        expedientes: { crear: true, leer: true, actualizar: true, eliminar: false },
        usuarios: { crear: false, leer: false, actualizar: false, eliminar: false },
        reportes: { generar: true, exportar: false },
        catalogos: { gestionar: false },
        prestamos: { solicitar: true, autorizar: false },
        transferencias: { crear: false, autorizar: false },
      },
      ambito: 'Su unidad administrativa',
      color: '#0288d1',
      icon: <Edit />,
    },
    {
      nombre: 'Consulta',
      descripcion: 'Solo consulta expedientes de su unidad administrativa.',
      permisos: {
        expedientes: { crear: false, leer: true, actualizar: false, eliminar: false },
        usuarios: { crear: false, leer: false, actualizar: false, eliminar: false },
        reportes: { generar: true, exportar: false },
        catalogos: { gestionar: false },
        prestamos: { solicitar: false, autorizar: false },
        transferencias: { crear: false, autorizar: false },
      },
      ambito: 'Su unidad administrativa',
      color: '#757575',
      icon: <Visibility />,
    },
  ];

  const renderPermisoItem = (label: string, valor: boolean) => (
    <ListItem>
      <ListItemIcon>
        {valor ? (
          <CheckCircle color="success" fontSize="small" />
        ) : (
          <Cancel color="disabled" fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          variant: 'body2',
          color: valor ? 'text.primary' : 'text.disabled',
        }}
      />
    </ListItem>
  );

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Los roles definen los permisos y el alcance de acceso de cada usuario en el sistema.
        Los roles no son editables ya que están definidos por las políticas de gestión documental.
      </Alert>

      <Grid container spacing={3}>
        {roles.map((rol) => (
          <Grid item xs={12} key={rol.nombre}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: rol.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    {rol.icon}
                  </Box>
                  <Box flexGrow={1}>
                    <Typography variant="h6">{rol.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rol.descripcion}
                    </Typography>
                  </Box>
                  <Chip
                    label={rol.ambito}
                    size="small"
                    sx={{
                      bgcolor: `${rol.color}20`,
                      color: rol.color,
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Expedientes
                    </Typography>
                    <List dense>
                      {renderPermisoItem('Crear', rol.permisos.expedientes.crear)}
                      {renderPermisoItem('Leer', rol.permisos.expedientes.leer)}
                      {renderPermisoItem('Actualizar', rol.permisos.expedientes.actualizar)}
                      {renderPermisoItem('Eliminar', rol.permisos.expedientes.eliminar)}
                    </List>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Préstamos y Transferencias
                    </Typography>
                    <List dense>
                      {renderPermisoItem('Solicitar préstamos', rol.permisos.prestamos.solicitar)}
                      {renderPermisoItem('Autorizar préstamos', rol.permisos.prestamos.autorizar)}
                      {renderPermisoItem('Crear transferencias', rol.permisos.transferencias.crear)}
                      {renderPermisoItem('Autorizar transferencias', rol.permisos.transferencias.autorizar)}
                    </List>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sistema
                    </Typography>
                    <List dense>
                      {renderPermisoItem('Gestionar usuarios', rol.permisos.usuarios.crear)}
                      {renderPermisoItem('Generar reportes', rol.permisos.reportes.generar)}
                      {renderPermisoItem('Exportar reportes', rol.permisos.reportes.exportar)}
                      {renderPermisoItem('Gestionar catálogos', rol.permisos.catalogos.gestionar)}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }} variant="outlined">
        <Typography variant="h6" gutterBottom>
          Notas sobre permisos
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Ámbito de acceso"
              secondary="Los roles de Operador, Responsable de Área y Consulta solo pueden acceder a expedientes de su unidad administrativa asignada."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Jerarquía de autorización"
              secondary="Las autorizaciones de préstamos y transferencias requieren un rol superior (Coordinador o Administrador)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Auditoría"
              secondary="Todas las acciones son registradas en la bitácora del sistema, independientemente del rol."
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}
