import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack,
  Edit,
  Print,
  SwapHoriz,
  History,
  Info,
  CheckCircle,
  Description,
  CalendarToday,
  Folder,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { Expediente } from '../../types';
import expedientesService from '../../services/expedientes.service';
import dayjs from 'dayjs';
import BitacoraTab from '../../components/expedientes/BitacoraTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ExpedienteDetailExpanded() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      loadExpediente();
    }
  }, [id]);

  const loadExpediente = async () => {
    try {
      setLoading(true);
      const data = await expedientesService.getById(id!);
      setExpediente(data);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Error al cargar expediente', {
        variant: 'error',
      });
      navigate('/expedientes');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const estadosMap: Record<string, any> = {
      ACTIVO: 'success',
      CERRADO: 'default',
      PRESTADO: 'warning',
      TRANSFERIDO: 'info',
      BAJA: 'error',
    };
    return estadosMap[estado] || 'default';
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!expediente) {
    return (
      <Box>
        <Alert severity="error">Expediente no encontrado</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con acciones */}
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/expedientes')}>
          Volver
        </Button>
        <Box flexGrow={1} />
        <Button startIcon={<Print />} variant="outlined">
          Imprimir
        </Button>
        <Button startIcon={<SwapHoriz />} variant="outlined" color="primary">
          Solicitar Préstamo
        </Button>
        <Button
          startIcon={<Edit />}
          variant="contained"
          onClick={() => navigate(`/expedientes/${id}/editar`)}
        >
          Editar
        </Button>
      </Stack>

      {/* Título y estado */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {expediente.nombreExpediente}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {expediente.numeroExpediente} • {expediente.formulaClasificadora}
            </Typography>
          </Box>
          <Chip label={expediente.estado} color={getEstadoColor(expediente.estado)} size="medium" />
        </Stack>

        {/* Resumen rápido */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={1}>
          <Box sx={{ flex: 1 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Folder color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Legajos
                    </Typography>
                    <Typography variant="h6">{expediente.totalLegajos || 0}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Description color="secondary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Documentos
                    </Typography>
                    <Typography variant="h6">{expediente.totalDocumentos || 0}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Description color="info" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fojas
                    </Typography>
                    <Typography variant="h6">{expediente.totalFojas || 0}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarToday color="success" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Apertura
                    </Typography>
                    <Typography variant="body2">
                      {dayjs(expediente.fechaApertura).format('DD/MM/YYYY')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Paper>

      {/* Tabs con información detallada */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="expediente tabs">
          <Tab icon={<Info />} iconPosition="start" label="Información General" />
          <Tab icon={<Description />} iconPosition="start" label="Legajos" />
          <Tab icon={<SwapHoriz />} iconPosition="start" label="Préstamos" />
          <Tab icon={<History />} iconPosition="start" label="Bitácora" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 0: Información General */}
          <TabPanel value={tabValue} index={0}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* Columna izquierda */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Clasificación Archivística
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Unidad Administrativa
                    </Typography>
                    <Typography variant="body1">
                      {expediente.unidadAdministrativa?.nombre || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Sección
                    </Typography>
                    <Typography variant="body1">
                      {expediente.seccion?.nombre || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Serie
                    </Typography>
                    <Typography variant="body1">
                      {expediente.serie?.nombre || 'N/A'}
                    </Typography>
                  </Box>
                  {expediente.subserie && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Subserie
                      </Typography>
                      <Typography variant="body1">{expediente.subserie.nombre}</Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Valores Documentales
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {expediente.valorDocumental && expediente.valorDocumental.includes('administrativo') && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Administrativo"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {expediente.valorDocumental && expediente.valorDocumental.includes('legal') && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Legal"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  {expediente.valorDocumental && expediente.valorDocumental.includes('contable') && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Contable"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {expediente.valorDocumental && expediente.valorDocumental.includes('fiscal') && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Fiscal"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>

              {/* Columna derecha */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Datos Adicionales
                </Typography>
                <Stack spacing={2}>
                  {expediente.asunto && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Asunto
                      </Typography>
                      <Typography variant="body1">{expediente.asunto}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Clasificación de Información
                    </Typography>
                    <Chip
                      label={expediente.clasificacionInformacion || 'publica'}
                      color={
                        expediente.clasificacionInformacion === 'reservada'
                          ? 'warning'
                          : expediente.clasificacionInformacion === 'confidencial'
                          ? 'error'
                          : 'success'
                      }
                      size="small"
                    />
                  </Box>
                  {expediente.ubicacionFisica && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ubicación Física
                      </Typography>
                      <Typography variant="body1">{expediente.ubicacionFisica}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fechas
                    </Typography>
                    <Typography variant="body2">
                      Apertura: {dayjs(expediente.fechaApertura).format('DD/MM/YYYY')}
                    </Typography>
                    {expediente.fechaCierre && (
                      <Typography variant="body2">
                        Cierre: {dayjs(expediente.fechaCierre).format('DD/MM/YYYY')}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                {expediente.observaciones && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Observaciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {expediente.observaciones}
                    </Typography>
                  </>
                )}
              </Box>
            </Stack>

            {/* Metadatos al final */}
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary" display="block">
                Creado: {dayjs(expediente.createdAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Última actualización: {dayjs(expediente.updatedAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Box>
          </TabPanel>

          {/* Tab 1: Legajos */}
          <TabPanel value={tabValue} index={1}>
            {expediente.legajos && expediente.legajos.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>No. Legajo</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="right">Fojas</TableCell>
                      <TableCell>Observaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expediente.legajos.map((legajo: any) => (
                      <TableRow key={legajo.id}>
                        <TableCell>{legajo.numeroLegajo}</TableCell>
                        <TableCell>{legajo.descripcion || '-'}</TableCell>
                        <TableCell align="right">{legajo.fojas || 0}</TableCell>
                        <TableCell>{legajo.observaciones || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No hay legajos registrados para este expediente</Alert>
            )}
          </TabPanel>

          {/* Tab 2: Préstamos */}
          <TabPanel value={tabValue} index={2}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Funcionalidad de préstamos en desarrollo
            </Alert>
          </TabPanel>

          {/* Tab 3: Bitácora */}
          <TabPanel value={tabValue} index={3}>
            {expediente && <BitacoraTab expedienteId={expediente.id} />}
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}
