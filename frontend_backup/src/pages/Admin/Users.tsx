import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Users() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Usuarios
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Lista de usuarios se mostrará aquí
      </Typography>
    </Box>
  );
}
