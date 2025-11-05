import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import expedientesService from '../../services/expedientes.service';

interface FormData {
  motivo: string;
  fechaDevolucion: string;
  observaciones?: string;
}

interface PrestamoDialogProps {
  open: boolean;
  onClose: () => void;
  expedienteId: string;
  expedienteNombre: string;
  onSuccess?: () => void;
}

export default function PrestamoDialog({
  open,
  onClose,
  expedienteId,
  expedienteNombre,
  onSuccess,
}: PrestamoDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      motivo: '',
      fechaDevolucion: dayjs().add(15, 'day').format('YYYY-MM-DD'),
      observaciones: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await expedientesService.prestar(
        expedienteId,
        data.motivo,
        data.fechaDevolucion
      );
      enqueueSnackbar('Préstamo solicitado correctamente', { variant: 'success' });
      reset();
      onClose();
      if (onSuccess) onSuccess();
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
    if (!loading) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Solicitar Préstamo</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Expediente"
              value={expedienteNombre}
              disabled
              fullWidth
            />

            <Controller
              name="motivo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Motivo del Préstamo"
                  multiline
                  rows={3}
                  error={!!errors.motivo}
                  helperText={errors.motivo?.message}
                  fullWidth
                  required
                  disabled={loading}
                />
              )}
            />

            <Controller
              name="fechaDevolucion"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Fecha de Devolución"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date: Dayjs | null) =>
                    field.onChange(date ? date.format('YYYY-MM-DD') : '')
                  }
                  minDate={dayjs().add(1, 'day')}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.fechaDevolucion,
                      helperText: errors.fechaDevolucion?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="observaciones"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Observaciones"
                  multiline
                  rows={2}
                  error={!!errors.observaciones}
                  helperText={errors.observaciones?.message}
                  fullWidth
                  disabled={loading}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Solicitando...' : 'Solicitar Préstamo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
