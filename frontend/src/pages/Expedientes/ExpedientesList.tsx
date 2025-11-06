import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Visibility,
  FileDownload,
  SwapHoriz,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Expediente, ExpedienteFilters, UnidadAdministrativa } from '../../types';
import expedientesService from '../../services/expedientes.service';
import catalogosService from '../../services/catalogos.service';

export default function ExpedientesList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [unidadFilter, setUnidadFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [unidades, setUnidades] = useState<UnidadAdministrativa[]>([]);

  useEffect(() => {
    catalogosService.getUnidades().then(setUnidades).catch(console.error);
  }, []);

  useEffect(() => {
    loadExpedientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, unidadFilter, estadoFilter]);

  const loadExpedientes = async () => {
    try {
      setLoading(true);
      const filters: ExpedienteFilters = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        unidadAdministrativaId: unidadFilter || undefined,
        estado: estadoFilter || undefined,
      };

      const response = await expedientesService.getAll(filters);
      setExpedientes(response.data);
      setTotal(response.total);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Error al cargar expedientes', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadExpedientes();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = async () => {
    try {
      await expedientesService.exportar('excel', {
        unidadAdministrativaId: unidadFilter || undefined,
        estado: estadoFilter || undefined,
      });
      enqueueSnackbar('Exportación completada', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al exportar', { variant: 'error' });
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Expedientes</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExport}>
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/expedientes/nuevo')}
          >
            Nuevo Expediente
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Buscar"
              placeholder="Número, nombre, asunto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Unidad Administrativa"
              value={unidadFilter}
              onChange={(e) => setUnidadFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {unidades.map((unidad) => (
                <MenuItem key={unidad.id} value={unidad.id}>
                  {unidad.clave}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Estado"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="cerrado">Cerrado</MenuItem>
              <MenuItem value="transferido">Transferido</MenuItem>
              <MenuItem value="dado_de_baja">Dado de Baja</MenuItem>
            </TextField>
            <Button variant="contained" onClick={handleSearch} sx={{ minWidth: 100 }}>
              Buscar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No. Expediente</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Sección/Serie</TableCell>
                  <TableCell>Legajos</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expedientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" py={4}>
                        No se encontraron expedientes
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  expedientes.map((expediente) => (
                    <TableRow key={expediente.id} hover>
                      <TableCell>{expediente.numeroExpediente}</TableCell>
                      <TableCell>{expediente.nombreExpediente}</TableCell>
                      <TableCell>
                        {expediente.unidadAdministrativa?.clave || '-'}
                      </TableCell>
                      <TableCell>
                        {expediente.seccion?.clave}/{expediente.serie?.clave}
                      </TableCell>
                      <TableCell>{expediente.totalLegajos}</TableCell>
                      <TableCell>
                        <Chip
                          label={getEstadoLabel(expediente.estado)}
                          color={getEstadoColor(expediente.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver detalle">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/expedientes/${expediente.id}`)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/expedientes/${expediente.id}/editar`)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Préstamo">
                          <IconButton size="small">
                            <SwapHoriz fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </>
        )}
      </TableContainer>
    </Box>
  );
}
