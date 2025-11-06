import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  Lock,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

export default function PasswordTab() {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNuevo: '',
    confirmarPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nuevo: false,
    confirmar: false,
  });
  const [loading, setLoading] = useState(false);

  const validaciones = {
    longitud: formData.passwordNuevo.length >= 6,
    coincide: formData.passwordNuevo === formData.confirmarPassword && formData.passwordNuevo !== '',
    diferente: formData.passwordNuevo !== formData.passwordActual && formData.passwordNuevo !== '',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validaciones.longitud) {
      enqueueSnackbar('La contraseña debe tener al menos 6 caracteres', { variant: 'error' });
      return;
    }

    if (!validaciones.coincide) {
      enqueueSnackbar('Las contraseñas nuevas no coinciden', { variant: 'error' });
      return;
    }

    if (!validaciones.diferente) {
      enqueueSnackbar('La nueva contraseña debe ser diferente a la actual', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');

      await axios.post(
        `${process.env.REACT_APP_API_URL}/usuarios/${user.id}/cambiar-password`,
        {
          passwordActual: formData.passwordActual,
          passwordNuevo: formData.passwordNuevo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      enqueueSnackbar('Contraseña actualizada exitosamente', { variant: 'success' });
      setFormData({
        passwordActual: '',
        passwordNuevo: '',
        confirmarPassword: '',
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al cambiar contraseña',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = (field: 'actual' | 'nuevo' | 'confirmar') => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Cambia tu contraseña de acceso al sistema. Se recomienda usar una contraseña segura
        y cambiarla periódicamente.
      </Alert>

      <Paper sx={{ p: 3, maxWidth: 600 }} variant="outlined">
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h6">Cambiar Contraseña</Typography>
            <Typography variant="body2" color="text.secondary">
              Usuario: {user.username}
            </Typography>
          </Box>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Contraseña Actual"
              type={showPasswords.actual ? 'text' : 'password'}
              value={formData.passwordActual}
              onChange={(e) =>
                setFormData({ ...formData, passwordActual: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleShowPassword('actual')}
                      edge="end"
                    >
                      {showPasswords.actual ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Nueva Contraseña"
              type={showPasswords.nuevo ? 'text' : 'password'}
              value={formData.passwordNuevo}
              onChange={(e) =>
                setFormData({ ...formData, passwordNuevo: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleShowPassword('nuevo')}
                      edge="end"
                    >
                      {showPasswords.nuevo ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirmar Nueva Contraseña"
              type={showPasswords.confirmar ? 'text' : 'password'}
              value={formData.confirmarPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmarPassword: e.target.value })
              }
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleShowPassword('confirmar')}
                      edge="end"
                    >
                      {showPasswords.confirmar ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {formData.passwordNuevo && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Requisitos de la contraseña:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      {validaciones.longitud ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary="Al menos 6 caracteres"
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: validaciones.longitud ? 'success.main' : 'error.main',
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {validaciones.coincide ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary="Las contraseñas coinciden"
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: validaciones.coincide ? 'success.main' : 'error.main',
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {validaciones.diferente ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="error" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary="Diferente de la contraseña actual"
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: validaciones.diferente ? 'success.main' : 'error.main',
                      }}
                    />
                  </ListItem>
                </List>
              </Paper>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !validaciones.longitud || !validaciones.coincide || !validaciones.diferente}
              fullWidth
            >
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper sx={{ p: 3, mt: 3, maxWidth: 600 }} variant="outlined">
        <Typography variant="subtitle2" gutterBottom>
          Recomendaciones de seguridad:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Usa una contraseña única"
              secondary="No utilices la misma contraseña que usas en otros sitios"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Combina caracteres"
              secondary="Usa mayúsculas, minúsculas, números y símbolos especiales"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Cámbiala periódicamente"
              secondary="Se recomienda cambiar la contraseña cada 90 días"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="No la compartas"
              secondary="Tu contraseña es personal e intransferible"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}
