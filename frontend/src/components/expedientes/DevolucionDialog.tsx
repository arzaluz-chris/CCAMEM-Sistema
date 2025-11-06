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
import { useSnackbar } from 'notistack';
import expedientesService from '../../services/expedientes.service';

interface FormData {
  observaciones?: string;
}

interface DevolucionDialogProps {
  open: boolean;
  onClose: () => void;
  expedienteId: string;
  expedienteNombre: string;
  onSuccess?: () => void;
}

export default function DevolucionDialog({
  open,
  onClose,
  expedienteId,
  expedienteNombre,
  onSuccess,
}: DevolucionDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      observaciones: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await expedientesService.devolver(expedienteId, data.observaciones);
      enqueueSnackbar('Expediente devuelto correctamente', { variant: 'success' });
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Error al devolver expediente',
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
      <DialogTitle>Devolver Expediente</DialogTitle>
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
              name="observaciones"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Observaciones de Devolución"
                  multiline
                  rows={4}
                  error={!!errors.observaciones}
                  helperText={errors.observaciones?.message || 'Opcional: Estado del expediente, notas adicionales'}
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
            {loading ? 'Devolviendo...' : 'Confirmar Devolución'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
