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
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Print,
  SwapHoriz,
  History,
  Info,
  CheckCircle,
  Warning,
  MoveUp,
  Description,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { Expediente } from '../../types';
import expedientesService from '../../services/expedientes.service';
import dayjs from 'dayjs';

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

export default function ExpedienteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [bitacora, setBitacora] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadExpediente();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    switch (estado) {
      case 'activo':
        return 'success';
      case 'cerrado':
        return 'default';
      case 'transferido':
        return 'info';
      case 'dado_de_baja':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'cerrado':
        return 'Cerrado';
      case 'transferido':
        return 'Transferido';
      case 'dado_de_baja':
        return 'Dado de Baja';
      default:
        return estado;
    }
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
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/expedientes')}>
          Volver
        </Button>
        <Box flexGrow={1} />
        <Button startIcon={<Print />} variant="outlined">
          Imprimir
        </Button>
        <Button startIcon={<SwapHoriz />} variant="outlined">
          Préstamo
        </Button>
        <Button
          startIcon={<Edit />}
          variant="contained"
          onClick={() => navigate(`/expedientes/${id}/editar`)}
        >
          Editar
        </Button>
      </Stack>

      {/* Información General */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            {expediente.nombreExpediente}
          </Typography>
          <Chip
            label={getEstadoLabel(expediente.estado)}
            color={getEstadoColor(expediente.estado)}
            size="medium"
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Número de Expediente
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {expediente.numeroExpediente}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Fórmula Clasificadora
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {expediente.formulaClasificadora}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                No. Progresivo
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {expediente.numeroProgresivo || 'N/A'}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Unidad Administrativa
              </Typography>
              <Typography variant="body1">
                {expediente.unidadAdministrativa?.clave} - {expediente.unidadAdministrativa?.nombre}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Sección
              </Typography>
              <Typography variant="body1">
                {expediente.seccion?.clave} - {expediente.seccion?.nombre}
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Serie
              </Typography>
              <Typography variant="body1">
                {expediente.serie?.clave} - {expediente.serie?.nombre}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Subserie
              </Typography>
              <Typography variant="body1">
                {expediente.subserie
                  ? `${expediente.subserie.clave} - ${expediente.subserie.nombre}`
                  : 'N/A'}
              </Typography>
            </Box>
          </Stack>

          {expediente.asunto && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Asunto
                </Typography>
                <Typography variant="body1">{expediente.asunto}</Typography>
              </Box>
            </>
          )}
        </Stack>
      </Paper>

      {/* Fechas y Volumen */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} mb={3}>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Fechas
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Fecha de Apertura
              </Typography>
              <Typography variant="body1">
                {expediente.fechaApertura
                  ? dayjs(expediente.fechaApertura).format('DD/MM/YYYY')
                  : 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Fecha de Cierre
              </Typography>
              <Typography variant="body1">
                {expediente.fechaCierre
                  ? dayjs(expediente.fechaCierre).format('DD/MM/YYYY')
                  : 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Volumen Documental
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Total de Legajos:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {expediente.totalLegajos}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Total de Documentos:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {expediente.totalDocumentos}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Total de Fojas:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {expediente.totalFojas}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      {/* Clasificación y Valores */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} mb={3}>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Clasificación
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Clasificación de Información
              </Typography>
              <Typography variant="body1" textTransform="capitalize">
                {expediente.clasificacionInformacion}
              </Typography>
            </Box>
            {expediente.fundamentoLegal && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fundamento Legal
                </Typography>
                <Typography variant="body1">{expediente.fundamentoLegal}</Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Valor Documental
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {expediente.valorDocumental.map((valor) => (
              <Chip key={valor} label={valor} variant="outlined" />
            ))}
          </Stack>
        </Paper>
      </Stack>

      {/* Ubicación */}
      {expediente.ubicacionFisica && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ubicación Física
          </Typography>
          <Typography variant="body1">{expediente.ubicacionFisica}</Typography>
        </Paper>
      )}

      {/* Legajos */}
      {expediente.legajos && expediente.legajos.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Legajos ({expediente.legajos.length})
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No. Legajo</TableCell>
                  <TableCell align="right">Documentos</TableCell>
                  <TableCell align="right">Fojas</TableCell>
                  <TableCell>Fecha Inicio</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expediente.legajos.map((legajo) => (
                  <TableRow key={legajo.id}>
                    <TableCell>{legajo.numeroLegajo}</TableCell>
                    <TableCell align="right">{legajo.numeroDocumentos}</TableCell>
                    <TableCell align="right">{legajo.numeroFojas}</TableCell>
                    <TableCell>
                      {legajo.fechaInicio
                        ? dayjs(legajo.fechaInicio).format('DD/MM/YYYY')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {legajo.fechaFin ? dayjs(legajo.fechaFin).format('DD/MM/YYYY') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Observaciones */}
      {expediente.observaciones && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Observaciones
          </Typography>
          <Typography variant="body1">{expediente.observaciones}</Typography>
        </Paper>
      )}

      {/* Metadatos */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Metadatos
        </Typography>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Fecha de creación: {dayjs(expediente.createdAt).format('DD/MM/YYYY HH:mm')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Última actualización: {dayjs(expediente.updatedAt).format('DD/MM/YYYY HH:mm')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Creado por: {expediente.createdBy}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
