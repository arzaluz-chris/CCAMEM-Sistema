import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  LockReset,
  PersonOff,
  PersonAdd,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface Usuario {
  id: string;
  username: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  rol: string;
  activo: boolean;
  unidadAdministrativa?: {
    id: string;
    nombre: string;
    clave: string;
  };
}

export default function UsuariosPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rol: 'OPERADOR',
    unidadAdministrativaId: '',
  });

  useEffect(() => {
    loadUsuarios();
  }, [page, rowsPerPage, search]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/usuarios`,
        {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            search: search || undefined,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsuarios(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al cargar usuarios',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: Usuario) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = (user?: Usuario) => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        nombre: user.nombre,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno || '',
        rol: user.rol,
        unidadAdministrativaId: user.unidadAdministrativa?.id || '',
      });
      setSelectedUser(user);
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        rol: 'OPERADOR',
        unidadAdministrativaId: '',
      });
      setSelectedUser(null);
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedUser
        ? `${process.env.REACT_APP_API_URL}/usuarios/${selectedUser.id}`
        : `${process.env.REACT_APP_API_URL}/usuarios`;

      const method = selectedUser ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      enqueueSnackbar(
        selectedUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
        { variant: 'success' }
      );
      handleCloseDialog();
      loadUsuarios();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al guardar usuario',
        { variant: 'error' }
      );
    }
  };

  const handleToggleActivo = async (user: Usuario) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/usuarios/${user.id}/toggle-activo`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      enqueueSnackbar(
        `Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`,
        { variant: 'success' }
      );
      loadUsuarios();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al cambiar estado del usuario',
        { variant: 'error' }
      );
    }
    handleMenuClose();
  };

  const getRolColor = (rol: string) => {
    const roles: Record<string, any> = {
      ADMIN: 'error',
      COORDINADOR_ARCHIVO: 'primary',
      RESPONSABLE_AREA: 'secondary',
      OPERADOR: 'info',
      CONSULTA: 'default',
    };
    return roles[rol] || 'default';
  };

  const getRolLabel = (rol: string) => {
    const roles: Record<string, string> = {
      ADMIN: 'Administrador',
      COORDINADOR_ARCHIVO: 'Coordinador Archivo',
      RESPONSABLE_AREA: 'Responsable Área',
      OPERADOR: 'Operador',
      CONSULTA: 'Consulta',
    };
    return roles[rol] || rol;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Usuario
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} mb={3}>
          <TextField
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Nombre Completo</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Unidad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>{usuario.username}</TableCell>
                      <TableCell>
                        {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRolLabel(usuario.rol)}
                          color={getRolColor(usuario.rol)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {usuario.unidadAdministrativa?.clave || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.activo ? 'Activo' : 'Inactivo'}
                          color={usuario.activo ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, usuario)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Filas por página:"
            />
          </>
        )}
      </Paper>

      {/* Menu de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenDialog(selectedUser!)}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => selectedUser && handleToggleActivo(selectedUser)}>
          {selectedUser?.activo ? (
            <>
              <PersonOff fontSize="small" sx={{ mr: 1 }} />
              Desactivar
            </>
          ) : (
            <>
              <PersonAdd fontSize="small" sx={{ mr: 1 }} />
              Activar
            </>
          )}
        </MenuItem>
        <MenuItem>
          <LockReset fontSize="small" sx={{ mr: 1 }} />
          Restablecer Contraseña
        </MenuItem>
      </Menu>

      {/* Diálogo de crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Nombre de Usuario"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            {!selectedUser && (
              <TextField
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                required
              />
            )}
            <TextField
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Apellido Paterno"
              value={formData.apellidoPaterno}
              onChange={(e) =>
                setFormData({ ...formData, apellidoPaterno: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Apellido Materno"
              value={formData.apellidoMaterno}
              onChange={(e) =>
                setFormData({ ...formData, apellidoMaterno: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.rol}
                label="Rol"
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              >
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="COORDINADOR_ARCHIVO">Coordinador Archivo</MenuItem>
                <MenuItem value="RESPONSABLE_AREA">Responsable Área</MenuItem>
                <MenuItem value="OPERADOR">Operador</MenuItem>
                <MenuItem value="CONSULTA">Consulta</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
