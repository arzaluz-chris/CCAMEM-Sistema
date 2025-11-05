import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../hooks/redux';
import authService from '../services/auth.service';

export default function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validación de contraseña
  const validatePassword = (): string | null => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'Todos los campos son obligatorios';
    }
    if (newPassword.length < 6) {
      return 'La nueva contraseña debe tener al menos 6 caracteres';
    }
    if (newPassword !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    if (currentPassword === newPassword) {
      return 'La nueva contraseña debe ser diferente a la actual';
    }
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validar
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setSuccess('Contraseña actualizada exitosamente');
      // Limpiar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const getRolLabel = (rol: string): string => {
    const roles: Record<string, string> = {
      ADMIN: 'Administrador',
      COORDINADOR_ARCHIVO: 'Coordinador de Archivo',
      RESPONSABLE_AREA: 'Responsable de Área',
      OPERADOR: 'Operador',
      CONSULTA: 'Consulta',
    };
    return roles[rol] || rol;
  };

  if (!user) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Mi Perfil
        </Typography>
        <Alert severity="warning">No se pudo cargar la información del usuario</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Mi Perfil
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Información de Usuario */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Información de Usuario</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre Completo"
                value={`${user.nombre} ${user.apellidoPaterno}${
                  user.apellidoMaterno ? ' ' + user.apellidoMaterno : ''
                }`}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />

              <TextField
                label="Nombre de Usuario"
                value={user.username}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />

              <TextField
                label="Correo Electrónico"
                value={user.email}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />

              <TextField
                label="Rol"
                value={getRolLabel(user.rol)}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />

              {user.unidadAdministrativa && (
                <TextField
                  label="Unidad Administrativa"
                  value={`${user.unidadAdministrativa.clave} - ${user.unidadAdministrativa.nombre}`}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Cambiar Contraseña */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Cambiar Contraseña</Typography>
            </Box>

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

            <Box
              component="form"
              onSubmit={handleChangePassword}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                label="Contraseña Actual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                variant="outlined"
                fullWidth
                required
                disabled={loading}
              />

              <Divider sx={{ my: 1 }} />

              <TextField
                label="Nueva Contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="outlined"
                fullWidth
                required
                disabled={loading}
                helperText="Mínimo 6 caracteres"
              />

              <TextField
                label="Confirmar Nueva Contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                fullWidth
                required
                disabled={loading}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{ mt: 2 }}
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
