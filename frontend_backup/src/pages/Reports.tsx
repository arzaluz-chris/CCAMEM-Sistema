import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../hooks/redux';
import catalogosService from '../services/catalogos.service';
import apiService from '../services/api.service';
import { UnidadAdministrativa } from '../types';

export default function Reports() {
  const { user } = useAppSelector((state) => state.auth);
  const [unidades, setUnidades] = useState<UnidadAdministrativa[]>([]);
  const [selectedUnidad, setSelectedUnidad] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar unidades administrativas
  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const data = await catalogosService.getUnidades();
        setUnidades(data);
      } catch (err) {
        console.error('Error al cargar unidades:', err);
      }
    };
    fetchUnidades();
  }, []);

  const handleDownload = async (endpoint: string, filename: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiService.download(endpoint, filename);
      setSuccess('Reporte descargado exitosamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleInventarioGeneral = () => {
    const filename = `inventario-general-${new Date().toISOString().split('T')[0]}.xlsx`;
    handleDownload('/reportes/inventario/general', filename);
  };

  const handleInventarioPorUnidad = () => {
    if (!selectedUnidad) {
      setError('Por favor selecciona una unidad administrativa');
      return;
    }
    const unidadNombre = unidades.find((u) => u.id === selectedUnidad)?.clave || 'unidad';
    const filename = `inventario-${unidadNombre}-${new Date().toISOString().split('T')[0]}.xlsx`;
    handleDownload(`/reportes/inventario/unidad/${selectedUnidad}`, filename);
  };

  const handleEstadisticas = () => {
    const filename = `estadisticas-${new Date().toISOString().split('T')[0]}.xlsx`;
    handleDownload('/reportes/estadisticas', filename);
  };

  const handleBitacora = () => {
    const filename = `bitacora-${new Date().toISOString().split('T')[0]}.xlsx`;
    handleDownload('/reportes/bitacora', filename);
  };

  const handleUnidadChange = (event: SelectChangeEvent<string>) => {
    setSelectedUnidad(event.target.value);
    setError(null);
  };

  // Verificar si el usuario tiene permisos de admin o coordinador
  const canViewAuditoria = user?.rol === 'ADMIN' || user?.rol === 'COORDINADOR_ARCHIVO';

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Generación de Reportes
      </Typography>

      {/* Mensajes de estado */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Reportes de Inventario */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Reportes de Inventario</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Genera inventarios completos de expedientes en formato Excel
              </Typography>

              {/* Inventario General */}
              <Button
                fullWidth
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                onClick={handleInventarioGeneral}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Descargar Inventario General
              </Button>

              {/* Inventario por Unidad */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="unidad-select-label">Unidad Administrativa</InputLabel>
                <Select
                  labelId="unidad-select-label"
                  id="unidad-select"
                  value={selectedUnidad}
                  label="Unidad Administrativa"
                  onChange={handleUnidadChange}
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>Seleccionar unidad...</em>
                  </MenuItem>
                  {unidades.map((unidad) => (
                    <MenuItem key={unidad.id} value={unidad.id}>
                      {unidad.clave} - {unidad.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="outlined"
                startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                onClick={handleInventarioPorUnidad}
                disabled={loading || !selectedUnidad}
              >
                Descargar por Unidad
              </Button>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Reportes Estadísticos</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Genera reportes con estadísticas y métricas del sistema
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                onClick={handleEstadisticas}
                disabled={loading}
              >
                Descargar Estadísticas
              </Button>
            </CardContent>
          </Card>
        </Stack>

        {/* Auditoría - Solo para Admin y Coordinador */}
        {canViewAuditoria && (
          <Card sx={{ maxWidth: { xs: '100%', md: '50%' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Auditoría del Sistema</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Descarga la bitácora de actividades del sistema (solo administradores y coordinadores)
              </Typography>

              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                onClick={handleBitacora}
                disabled={loading}
              >
                Descargar Bitácora
              </Button>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
