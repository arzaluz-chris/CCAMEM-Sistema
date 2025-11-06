import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Paper, CircularProgress, Card, CardContent, Divider } from '@mui/material';
import {
  FolderOpen,
  CheckCircle,
  SwapHoriz,
  MoveUp,
  TrendingUp,
  People,
  Warning,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useSnackbar } from 'notistack';
import { DashboardStats } from '../types';
import reportesService from '../services/reportes.service';

const COLORS = ['#8B1538', '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
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
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600}>
              {value.toLocaleString()}
            </Typography>
            {trend !== undefined && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TrendingUp
                  sx={{
                    fontSize: 16,
                    color: trend >= 0 ? '#4CAF50' : '#F44336',
                  }}
                />
                <Typography
                  variant="caption"
                  color={trend >= 0 ? 'success.main' : 'error.main'}
                >
                  {trend >= 0 ? '+' : ''}
                  {trend}% vs mes anterior
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DashboardEnhanced() {
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
      // Datos de ejemplo para demostración
      setStats({
        totalExpedientes: 1247,
        expedientesActivos: 856,
        expedientesCerrados: 345,
        expedientesTransferidos: 46,
        prestamosPendientes: 12,
        prestamosActivos: 23,
        expedientesPorUnidad: [
          { unidad: 'OC', total: 234 },
          { unidad: 'UAA', total: 189 },
          { unidad: 'UCSM', total: 312 },
          { unidad: 'UP', total: 156 },
          { unidad: 'OIC', total: 98 },
          { unidad: 'SRSQ', total: 145 },
          { unidad: 'DN', total: 113 },
        ],
        expedientesPorEstado: [
          { estado: 'ACTIVO', total: 856 },
          { estado: 'CERRADO', total: 345 },
          { estado: 'PRESTADO', total: 23 },
          { estado: 'TRANSFERIDO', total: 23 },
        ],
        expedientesPorMes: [
          { mes: 'Ene', total: 45 },
          { mes: 'Feb', total: 52 },
          { mes: 'Mar', total: 48 },
          { mes: 'Abr', total: 61 },
          { mes: 'May', total: 55 },
          { mes: 'Jun', total: 67 },
          { mes: 'Jul', total: 58 },
          { mes: 'Ago', total: 72 },
          { mes: 'Sep', total: 64 },
          { mes: 'Oct', total: 78 },
        ],
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

  // Datos para radar chart de valores documentales
  const valoresData = [
    { subject: 'Administrativo', A: 120, fullMark: 150 },
    { subject: 'Legal', A: 98, fullMark: 150 },
    { subject: 'Fiscal', A: 86, fullMark: 150 },
    { subject: 'Contable', A: 99, fullMark: 150 },
    { subject: 'Histórico', A: 65, fullMark: 150 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Ejecutivo
      </Typography>

      {/* Estadísticas principales */}
      <Stack spacing={3} mb={4}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <StatCard
              title="Total Expedientes"
              value={stats.totalExpedientes}
              icon={<FolderOpen fontSize="large" />}
              color="#8B1538"
              trend={8.5}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard
              title="Expedientes Activos"
              value={stats.expedientesActivos}
              icon={<CheckCircle fontSize="large" />}
              color="#4CAF50"
              trend={12.3}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard
              title="Préstamos Activos"
              value={stats.prestamosActivos}
              icon={<SwapHoriz fontSize="large" />}
              color="#2196F3"
              trend={-5.2}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard
              title="Transferidos"
              value={stats.expedientesTransferidos}
              icon={<MoveUp fontSize="large" />}
              color="#FF9800"
              trend={3.1}
            />
          </Box>
        </Stack>
      </Stack>

      {/* Gráficas principales */}
      <Stack spacing={3} mb={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Expedientes por Estado */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Distribución por Estado
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
          </Box>

          {/* Expedientes por Unidad */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
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
                    <Bar dataKey="total" fill="#8B1538" name="Expedientes" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <Typography color="text.secondary">No hay datos disponibles</Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Stack>
      </Stack>

      {/* Gráficas secundarias */}
      <Stack spacing={3} mb={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Tendencia mensual */}
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tendencia Mensual de Creación
              </Typography>
              {stats.expedientesPorMes.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.expedientesPorMes}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B1538" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B1538" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#8B1538"
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      name="Expedientes Creados"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <Typography color="text.secondary">No hay datos disponibles</Typography>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Valores documentales */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Valores Documentales
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={valoresData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Expedientes"
                    dataKey="A"
                    stroke="#8B1538"
                    fill="#8B1538"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Stack>
      </Stack>

      {/* Alertas y notificaciones */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Warning color="warning" />
              <Typography variant="h6">Alertas Pendientes</Typography>
            </Stack>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Préstamos Vencidos
                </Typography>
                <Typography variant="h5" color="warning.main">
                  {stats.prestamosPendientes || 0}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Transferencias Pendientes
                </Typography>
                <Typography variant="h5" color="info.main">
                  {stats.expedientesTransferidos || 0}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <People color="primary" />
              <Typography variant="h6">Actividad Reciente</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                • Juan Pérez solicitó préstamo de EXP-2025-001
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • María García devolvió EXP-2025-045
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Carlos López creó nuevo expediente EXP-2025-156
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Ana Martínez actualizó EXP-2025-089
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
