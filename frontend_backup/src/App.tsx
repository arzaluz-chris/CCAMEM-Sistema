import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { checkAuth } from './store/slices/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExpedientesList from './pages/Expedientes/ExpedientesList';
import ExpedienteForm from './pages/Expedientes/ExpedienteForm';
import ExpedienteDetail from './pages/Expedientes/ExpedienteDetail';
import Reports from './pages/Reports';
import Users from './pages/Admin/Users';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import Loading from './components/common/Loading';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : (
          <AuthLayout>
            <Login />
          </AuthLayout>
        )
      } />

      {/* Rutas privadas */}
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Expedientes */}
        <Route path="expedientes">
          <Route index element={<ExpedientesList />} />
          <Route path="nuevo" element={<ExpedienteForm />} />
          <Route path=":id/editar" element={<ExpedienteForm />} />
          <Route path=":id" element={<ExpedienteDetail />} />
        </Route>

        {/* Reportes */}
        <Route path="reportes" element={<Reports />} />

        {/* Administración */}
        <Route path="admin">
          <Route path="usuarios" element={<Users />} />
        </Route>

        {/* Usuario */}
        <Route path="perfil" element={<Profile />} />
        <Route path="configuracion" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
