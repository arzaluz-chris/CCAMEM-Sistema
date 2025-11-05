import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Tooltip,
  IconButton,
  Collapse,
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
  Create as CreateIcon,
  Update as UpdateIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LocalShipping as PrestarIcon,
  AssignmentReturn as DevolverIcon,
  SwapHoriz as TransferirIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import bitacoraService, { BitacoraRegistro } from '../../services/bitacora.service';

dayjs.extend(relativeTime);
dayjs.locale('es');

interface BitacoraTabProps {
  expedienteId: string;
}

const BitacoraTab: React.FC<BitacoraTabProps> = ({ expedienteId }) => {
  const [bitacoras, setBitacoras] = useState<BitacoraRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const limit = 10;

  useEffect(() => {
    cargarBitacora();
  }, [expedienteId, page]);

  const cargarBitacora = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bitacoraService.obtenerPorExpediente(expedienteId, page, limit);
      setBitacoras(response.data.bitacoras);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la bitácora');
      console.error('Error al cargar bitácora:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getAccionIcon = (accion: string): React.ReactElement => {
    const iconMap: { [key: string]: React.ReactElement } = {
      CREAR: <CreateIcon />,
      ACTUALIZAR: <UpdateIcon />,
      ELIMINAR: <DeleteIcon />,
      CONSULTAR: <VisibilityIcon />,
      PRESTAR: <PrestarIcon />,
      DEVOLVER: <DevolverIcon />,
      TRANSFERIR: <TransferirIcon />,
      LOGIN: <LoginIcon />,
      LOGOUT: <LogoutIcon />,
    };
    return iconMap[accion] || <UpdateIcon />;
  };

  const getAccionColor = (accion: string): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' => {
    const colorMap: { [key: string]: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' } = {
      CREAR: 'success',
      ACTUALIZAR: 'primary',
      ELIMINAR: 'error',
      CONSULTAR: 'info',
      PRESTAR: 'warning',
      DEVOLVER: 'success',
      TRANSFERIR: 'secondary',
      LOGIN: 'info',
      LOGOUT: 'secondary',
    };
    return colorMap[accion] || 'primary';
  };

  const formatFecha = (fecha: string) => {
    try {
      return dayjs(fecha).format('DD [de] MMMM [de] YYYY, HH:mm:ss');
    } catch {
      return fecha;
    }
  };

  const formatFechaRelativa = (fecha: string) => {
    try {
      return dayjs(fecha).fromNow();
    } catch {
      return fecha;
    }
  };

  if (loading && bitacoras.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (bitacoras.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">No hay registros en la bitácora para este expediente</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Historial de Actividad
      </Typography>

      <Timeline position="right">
        {bitacoras.map((bitacora, index) => {
          const isExpanded = expandedItems.has(bitacora.id);
          const hasDetalles = bitacora.datosPrevios || bitacora.datosNuevos;

          return (
            <TimelineItem key={bitacora.id}>
              <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                <Tooltip title={formatFecha(bitacora.createdAt)}>
                  <Typography variant="body2">{formatFechaRelativa(bitacora.createdAt)}</Typography>
                </Tooltip>
                {bitacora.usuario && (
                  <Typography variant="caption" display="block">
                    {bitacora.usuario.nombre} {bitacora.usuario.apellidos}
                  </Typography>
                )}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={getAccionColor(bitacora.accion)}>
                  {getAccionIcon(bitacora.accion)}
                </TimelineDot>
                {index < bitacoras.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent sx={{ flex: 1 }}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box flex={1}>
                      <Box display="flex" gap={1} mb={1} alignItems="center">
                        <Chip
                          label={bitacora.accion}
                          color={getAccionColor(bitacora.accion)}
                          size="small"
                        />
                        <Chip
                          label={bitacora.entidad}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Typography variant="body1" gutterBottom>
                        {bitacora.descripcion}
                      </Typography>
                      {bitacora.ipAddress && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          IP: {bitacora.ipAddress}
                        </Typography>
                      )}
                    </Box>
                    {hasDetalles && (
                      <IconButton
                        size="small"
                        onClick={() => toggleExpand(bitacora.id)}
                        sx={{ ml: 1 }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}
                  </Box>

                  {hasDetalles && (
                    <Collapse in={isExpanded}>
                      <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                        {bitacora.datosPrevios && (
                          <Box mb={2}>
                            <Typography variant="subtitle2" color="error.main" gutterBottom>
                              Datos Anteriores:
                            </Typography>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1,
                                bgcolor: 'grey.50',
                                maxHeight: 200,
                                overflow: 'auto',
                              }}
                            >
                              <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                                {JSON.stringify(bitacora.datosPrevios, null, 2)}
                              </pre>
                            </Paper>
                          </Box>
                        )}
                        {bitacora.datosNuevos && (
                          <Box>
                            <Typography variant="subtitle2" color="success.main" gutterBottom>
                              Datos Nuevos:
                            </Typography>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1,
                                bgcolor: 'grey.50',
                                maxHeight: 200,
                                overflow: 'auto',
                              }}
                            >
                              <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                                {JSON.stringify(bitacora.datosNuevos, null, 2)}
                              </pre>
                            </Paper>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default BitacoraTab;
