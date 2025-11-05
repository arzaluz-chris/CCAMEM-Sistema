import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Paper, CircularProgress } from '@mui/material';
import {
  FolderOpen,
  CheckCircle,
  SwapHoriz,
  MoveUp,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSnackbar } from 'notistack';
import { DashboardStats } from '../types';
import reportesService from '../services/reportes.service';

const COLORS = ['#8B1538', '#2196F3', '#4CAF50', '#FF9800', '#F44336'];

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Paper sx={{ p: 3, minWidth: 200, flex: '1 1 200px' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {value.toLocaleString()}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function Dashboard() {
  const { enqueueSnackbar } = useSnackbar();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await reportesService.getStats();
      setStats(data);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Error al cargar estadísticas', {
        variant: 'error',
      });
      // Datos de ejemplo si falla
      setStats({
        totalExpedientes: 0,
        expedientesActivos: 0,
        expedientesCerrados: 0,
        expedientesTransferidos: 0,
        prestamosPendientes: 0,
        prestamosActivos: 0,
        expedientesPorUnidad: [],
        expedientesPorEstado: [],
        expedientesPorMes: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Estadísticas principales */}
      <Stack direction="row" spacing={3} flexWrap="wrap" mb={4}>
        <StatCard
          title="Total Expedientes"
          value={stats.totalExpedientes}
          icon={<FolderOpen fontSize="large" />}
          color="#8B1538"
        />
        <StatCard
          title="Expedientes Activos"
          value={stats.expedientesActivos}
          icon={<CheckCircle fontSize="large" />}
          color="#4CAF50"
        />
        <StatCard
          title="Préstamos Activos"
          value={stats.prestamosActivos}
          icon={<SwapHoriz fontSize="large" />}
          color="#2196F3"
        />
        <StatCard
          title="Transferidos"
          value={stats.expedientesTransferidos}
          icon={<MoveUp fontSize="large" />}
          color="#FF9800"
        />
      </Stack>

      {/* Gráficas */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} mb={3}>
        {/* Expedientes por Estado */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Expedientes por Estado
          </Typography>
          {stats.expedientesPorEstado.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.expedientesPorEstado}
                  dataKey="total"
                  nameKey="estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.estado}: ${entry.total}`}
                >
                  {stats.expedientesPorEstado.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <Typography color="text.secondary">No hay datos disponibles</Typography>
            </Box>
          )}
        </Paper>

        {/* Expedientes por Unidad */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Expedientes por Unidad Administrativa
          </Typography>
          {stats.expedientesPorUnidad.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.expedientesPorUnidad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="unidad" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8B1538" name="Expedientes" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <Typography color="text.secondary">No hay datos disponibles</Typography>
            </Box>
          )}
        </Paper>
      </Stack>

      {/* Tendencia mensual */}
      {stats.expedientesPorMes.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tendencia Mensual de Expedientes
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.expedientesPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#2196F3" name="Expedientes Creados" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
}
