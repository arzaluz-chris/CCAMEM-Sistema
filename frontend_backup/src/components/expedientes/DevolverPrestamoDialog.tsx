import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import axios from 'axios';

interface DevolverPrestamoDialogProps {
  open: boolean;
  onClose: () => void;
  prestamo: {
    id: string;
    expediente: {
      numeroExpediente: string;
      nombreExpediente: string;
    };
    fechaPrestamo: string;
    fechaDevolucionEsperada: string;
    motivoPrestamo: string;
    usuario?: {
      nombre: string;
      apellidoPaterno: string;
    };
  };
  onSuccess?: () => void;
}

export default function DevolverPrestamoDialog({
  open,
  onClose,
  prestamo,
  onSuccess,
}: DevolverPrestamoDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  const fechaActual = dayjs();
  const fechaDevolucionEsperada = dayjs(prestamo.fechaDevolucionEsperada);
  const estaVencido = fechaActual.isAfter(fechaDevolucionEsperada);
  const diasRetraso = estaVencido
    ? fechaActual.diff(fechaDevolucionEsperada, 'day')
    : 0;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(
        `${process.env.REACT_APP_API_URL}/prestamos/${prestamo.id}/devolver`,
        {
          observaciones: observaciones || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      enqueueSnackbar(
        estaVencido
          ? 'Préstamo devuelto con retraso'
          : 'Préstamo devuelto exitosamente',
        { variant: estaVencido ? 'warning' : 'success' }
      );
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al devolver préstamo',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setObservaciones('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Devolver Expediente</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Información del expediente */}
          <Alert severity="info">
            <strong>{prestamo.expediente.numeroExpediente}</strong>
            <br />
            {prestamo.expediente.nombreExpediente}
          </Alert>

          {/* Información del préstamo */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Información del Préstamo
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Fecha de préstamo:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {dayjs(prestamo.fechaPrestamo).format('DD/MM/YYYY')}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Fecha esperada devolución:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {fechaDevolucionEsperada.format('DD/MM/YYYY')}
                </Typography>
              </Stack>
              {prestamo.usuario && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Prestado a:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {prestamo.usuario.nombre} {prestamo.usuario.apellidoPaterno}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Alerta de estado */}
          {estaVencido ? (
            <Alert severity="warning" icon={<Warning />}>
              <Typography variant="body2" fontWeight={500}>
                Préstamo Vencido
              </Typography>
              <Typography variant="caption">
                El expediente tiene {diasRetraso} día{diasRetraso > 1 ? 's' : ''} de
                retraso en su devolución.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="success" icon={<CheckCircle />}>
              <Typography variant="body2">
                Devolución en tiempo
              </Typography>
            </Alert>
          )}

          {/* Observaciones */}
          <TextField
            label="Observaciones de Devolución"
            multiline
            rows={3}
            fullWidth
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Condiciones del expediente, daños, faltantes, etc. (opcional)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={estaVencido ? 'warning' : 'primary'}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Confirmar Devolución
        </Button>
      </DialogActions>
    </Dialog>
  );
}
