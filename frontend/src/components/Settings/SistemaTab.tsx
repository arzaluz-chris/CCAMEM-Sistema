import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import {
  Info,
  Storage,
  Security,
  Update,
  Description,
} from '@mui/icons-material';

export default function SistemaTab() {
  const systemInfo = {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    apiUrl: process.env.REACT_APP_API_URL || 'No configurado',
    buildDate: new Date().toLocaleDateString('es-MX'),
  };

  const estadisticas = {
    usuarios: 5,
    expedientes: 1172,
    unidades: 10,
    secciones: 9,
    series: 90,
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Información general del sistema y configuraciones administrativas
      </Alert>

      <Grid container spacing={3}>
        {/* Información del Sistema */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Info />
                </Box>
                <Typography variant="h6">Información del Sistema</Typography>
              </Stack>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Versión"
                    secondary={systemInfo.version}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Entorno"
                    secondary={
                      <Chip
                        label={systemInfo.environment}
                        size="small"
                        color={systemInfo.environment === 'production' ? 'success' : 'warning'}
                      />
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="URL de API"
                    secondary={systemInfo.apiUrl}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Última compilación"
                    secondary={systemInfo.buildDate}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas del Sistema */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'secondary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Storage />
                </Box>
                <Typography variant="h6">Estadísticas</Typography>
              </Stack>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Expedientes registrados"
                    secondary={estadisticas.expedientes.toLocaleString()}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Usuarios activos"
                    secondary={estadisticas.usuarios}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Unidades administrativas"
                    secondary={estadisticas.unidades}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Secciones documentales"
                    secondary={`${estadisticas.secciones} secciones, ${estadisticas.series} series`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Seguridad */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'error.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Security />
                </Box>
                <Typography variant="h6">Seguridad</Typography>
              </Stack>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Autenticación"
                    secondary="JWT (JSON Web Tokens)"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Expiración de sesión"
                    secondary="8 horas"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Encriptación de contraseñas"
                    secondary="bcrypt (10 rounds)"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Auditoría"
                    secondary="Todos los cambios son registrados"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Normatividad */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Description />
                </Box>
                <Typography variant="h6">Normatividad</Typography>
              </Stack>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Ley General de Archivos"
                    secondary="Cumplimiento de normativa nacional"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Cuadro de Clasificación Archivística"
                    secondary="9 secciones, 90 series, 21 subseries"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Clasificación de Información"
                    secondary="Pública, Reservada, Confidencial"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Archivo"
                    secondary="Trámite, Concentración, Histórico"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Acerca del Sistema */}
      <Paper sx={{ p: 3, mt: 3 }} variant="outlined">
        <Typography variant="h6" gutterBottom>
          Acerca del Sistema
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Sistema de Gestión Archivística CCAMEM</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Sistema web desarrollado para la gestión digital del registro y consulta de archivos
          de la Comisión de Conciliación y Arbitraje Médico del Estado de México (CCAMEM),
          reemplazando el proceso manual en Excel.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Tecnologías utilizadas:</strong>
        </Typography>
        <Grid container spacing={1}>
          <Grid item>
            <Chip label="React 18" size="small" />
          </Grid>
          <Grid item>
            <Chip label="TypeScript" size="small" />
          </Grid>
          <Grid item>
            <Chip label="Material-UI v5" size="small" />
          </Grid>
          <Grid item>
            <Chip label="Node.js" size="small" />
          </Grid>
          <Grid item>
            <Chip label="Express" size="small" />
          </Grid>
          <Grid item>
            <Chip label="PostgreSQL" size="small" />
          </Grid>
          <Grid item>
            <Chip label="Prisma ORM" size="small" />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
