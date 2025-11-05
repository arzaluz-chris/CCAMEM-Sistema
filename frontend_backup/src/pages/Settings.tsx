import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Settings() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Configuración del sistema se mostrará aquí
      </Typography>
    </Box>
  );
}
