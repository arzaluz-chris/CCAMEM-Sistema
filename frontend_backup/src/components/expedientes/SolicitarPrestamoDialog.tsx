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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface SolicitarPrestamoDialogProps {
  open: boolean;
  onClose: () => void;
  expediente: {
    id: string;
    numeroExpediente: string;
    nombreExpediente: string;
    estado: string;
  };
  onSuccess?: () => void;
}

export default function SolicitarPrestamoDialog({
  open,
  onClose,
  expediente,
  onSuccess,
}: SolicitarPrestamoDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [fechaDevolucion, setFechaDevolucion] = useState<Dayjs | null>(
    dayjs().add(7, 'day')
  );
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const handleSubmit = async () => {
    if (!fechaDevolucion) {
      enqueueSnackbar('Debe seleccionar una fecha de devolución', { variant: 'warning' });
      return;
    }

    if (!motivo.trim()) {
      enqueueSnackbar('Debe especificar el motivo del préstamo', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(
        `${process.env.REACT_APP_API_URL}/prestamos/solicitar`,
        {
          expedienteId: expediente.id,
          fechaDevolucionEsperada: fechaDevolucion.toISOString(),
          motivoPrestamo: motivo,
          observaciones: observaciones || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      enqueueSnackbar('Solicitud de préstamo enviada exitosamente', { variant: 'success' });
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al solicitar préstamo',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMotivo('');
    setObservaciones('');
    setFechaDevolucion(dayjs().add(7, 'day'));
    onClose();
  };

  const isPrestado = expediente.estado === 'PRESTADO';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Solicitar Préstamo de Expediente</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Alert severity="info">
            <strong>{expediente.numeroExpediente}</strong>
            <br />
            {expediente.nombreExpediente}
          </Alert>

          {isPrestado && (
            <Alert severity="warning">
              Este expediente actualmente está prestado. Su solicitud quedará pendiente de
              autorización una vez que sea devuelto.
            </Alert>
          )}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Fecha de Devolución Esperada"
              value={fechaDevolucion}
              onChange={(newValue) => setFechaDevolucion(newValue)}
              minDate={dayjs().add(1, 'day')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  helperText: 'Seleccione la fecha estimada de devolución',
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            label="Motivo del Préstamo"
            multiline
            rows={3}
            fullWidth
            required
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Especifique el motivo por el cual solicita el expediente"
          />

          <TextField
            label="Observaciones"
            multiline
            rows={2}
            fullWidth
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Información adicional (opcional)"
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
          disabled={loading || !motivo.trim() || !fechaDevolucion}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Solicitar Préstamo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
