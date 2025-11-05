import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box, AppBar, Toolbar, Typography } from '@mui/material';
import ExpedienteForm from './pages/Expedientes/ExpedienteForm';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CCAMEM - Sistema de Gestión Archivística
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/expedientes/nuevo" />} />
          <Route path="/expedientes/nuevo" element={<ExpedienteForm />} />
          <Route path="/expedientes/:id/editar" element={<ExpedienteForm />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
