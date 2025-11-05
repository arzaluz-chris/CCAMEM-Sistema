import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs, { Dayjs } from 'dayjs';

import { expedientesService, catalogosService } from '../../services/expedientes.service';
import {
  UnidadAdministrativa,
  Seccion,
  Serie,
  Subserie,
  ExpedienteFormData,
  TiempoConservacion,
} from '../../types/expediente.types';

const DOCUMENTOS_POR_LEGAJO = 180; // Cada 180 documentos se crea un nuevo legajo

export default function ExpedienteForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Estados para catálogos
  const [unidades, setUnidades] = useState<UnidadAdministrativa[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [subseries, setSubseries] = useState<Subserie[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Valores por defecto del formulario
  const defaultValues: ExpedienteFormData = {
    nombreExpediente: '',
    numeroLegajo: 1,
    totalLegajos: 1,
    asunto: '',
    fechaApertura: null,
    fechaCierre: null,
    totalDocumentos: 0,
    fondoDocumental: 'CCAMEM',
    seccionId: '',
    serieId: '',
    subserieId: '',
    tiempoConservacion: 'TRAMITE',
    numeroExpediente: '',
    unidadAdministrativaId: '',
    totalFojas: 0,
    ubicacionFisica: '',
    observaciones: '',
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpedienteFormData>({
    defaultValues,
  });

  // Observar cambios en campos específicos
  const totalDocumentos = watch('totalDocumentos');
  const seccionId = watch('seccionId');
  const serieId = watch('serieId');
  const totalLegajos = watch('totalLegajos');
  const numeroLegajo = watch('numeroLegajo');

  // Cargar catálogos al montar el componente
  useEffect(() => {
    loadCatalogos();
  }, []);

  // Cargar datos del expediente si estamos en modo edición
  useEffect(() => {
    if (id) {
      loadExpediente(id);
    }
  }, [id]);

  // LÓGICA AUTOMÁTICA: Calcular total de legajos basado en total de documentos
  useEffect(() => {
    if (totalDocumentos > 0) {
      const legajosCalculados = Math.ceil(totalDocumentos / DOCUMENTOS_POR_LEGAJO);
      setValue('totalLegajos', legajosCalculados);
    } else {
      setValue('totalLegajos', 1);
    }
  }, [totalDocumentos, setValue]);

  // Cargar series cuando cambia la sección
  useEffect(() => {
    if (seccionId) {
      loadSeries(seccionId);
    } else {
      setSeries([]);
      setSubseries([]);
      setValue('serieId', '');
      setValue('subserieId', '');
    }
  }, [seccionId, setValue]);

  // Cargar subseries cuando cambia la serie
  useEffect(() => {
    if (serieId) {
      loadSubseries(serieId);
    } else {
      setSubseries([]);
      setValue('subserieId', '');
    }
  }, [serieId, setValue]);

  const loadCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      const [unidadesData, seccionesData] = await Promise.all([
        catalogosService.getUnidades(),
        catalogosService.getSecciones(),
      ]);
      setUnidades(unidadesData);
      setSecciones(seccionesData);
    } catch (error) {
      enqueueSnackbar('Error al cargar catálogos', { variant: 'error' });
      console.error('Error loading catalogos:', error);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const loadSeries = async (seccionId: string) => {
    try {
      const seriesData = await catalogosService.getSeriesBySeccion(seccionId);
      setSeries(seriesData);
    } catch (error) {
      enqueueSnackbar('Error al cargar series', { variant: 'error' });
      console.error('Error loading series:', error);
    }
  };

  const loadSubseries = async (serieId: string) => {
    try {
      const subseriesData = await catalogosService.getSubseriesBySerie(serieId);
      setSubseries(subseriesData);
    } catch (error) {
      enqueueSnackbar('Error al cargar subseries', { variant: 'error' });
      console.error('Error loading subseries:', error);
    }
  };

  const loadExpediente = async (expedienteId: string) => {
    try {
      setLoading(true);
      const expediente = await expedientesService.getById(expedienteId);

      // Mapear datos del expediente al formulario
      setValue('nombreExpediente', expediente.nombreExpediente);
      setValue('numeroLegajo', 1); // Este campo puede necesitar ajuste
      setValue('totalLegajos', expediente.totalLegajos);
      setValue('asunto', expediente.asunto || '');
      setValue('fechaApertura', expediente.fechaApertura ? dayjs(expediente.fechaApertura).toDate() : null);
      setValue('fechaCierre', expediente.fechaCierre ? dayjs(expediente.fechaCierre).toDate() : null);
      setValue('totalDocumentos', expediente.totalDocumentos);
      setValue('fondoDocumental', 'CCAMEM');
      setValue('seccionId', expediente.seccionId);
      setValue('serieId', expediente.serieId);
      setValue('subserieId', expediente.subserieId || '');
      setValue('numeroExpediente', expediente.numeroExpediente);
      setValue('unidadAdministrativaId', expediente.unidadAdministrativaId);
      setValue('totalFojas', expediente.totalFojas);
      setValue('ubicacionFisica', expediente.ubicacionFisica || '');
      setValue('observaciones', expediente.observaciones || '');
    } catch (error) {
      enqueueSnackbar('Error al cargar expediente', { variant: 'error' });
      console.error('Error loading expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ExpedienteFormData) => {
    try {
      setLoading(true);

      const expedienteData = {
        numeroExpediente: data.numeroExpediente,
        unidadAdministrativaId: data.unidadAdministrativaId,
        seccionId: data.seccionId,
        serieId: data.serieId,
        subserieId: data.subserieId || undefined,
        nombreExpediente: data.nombreExpediente,
        asunto: data.asunto,
        totalLegajos: data.totalLegajos,
        totalDocumentos: data.totalDocumentos,
        totalFojas: data.totalFojas,
        fechaApertura: data.fechaApertura ? dayjs(data.fechaApertura).toISOString() : new Date().toISOString(),
        fechaCierre: data.fechaCierre ? dayjs(data.fechaCierre).toISOString() : undefined,
        ubicacionFisica: data.ubicacionFisica,
        observaciones: data.observaciones,
        fondoDocumental: data.fondoDocumental,
        tiempoConservacion: data.tiempoConservacion,
      };

      if (id) {
        await expedientesService.update(id, expedienteData);
        enqueueSnackbar('Expediente actualizado exitosamente', { variant: 'success' });
      } else {
        await expedientesService.create(expedienteData);
        enqueueSnackbar('Expediente creado exitosamente', { variant: 'success' });
      }

      navigate('/expedientes');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar expediente';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      console.error('Error saving expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/expedientes');
  };

  if (loadingCatalogos) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          {id ? 'Editar Expediente' : 'Nuevo Expediente'}
        </Typography>

        {/* Información sobre cálculo automático de legajos */}
        <Alert severity="info" sx={{ mb: 3 }}>
          El sistema calcula automáticamente el total de legajos: 1 legajo cada {DOCUMENTOS_POR_LEGAJO} documentos.
          {totalDocumentos > 0 && (
            <> Actualmente: <strong>{totalDocumentos} documentos = {totalLegajos} legajo(s)</strong></>
          )}
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* 1. Nombre del Expediente (Fórmula) */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ bgcolor: 'primary.50' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    1. Nombre del Expediente (Fórmula Clasificadora)
                  </Typography>
                  <Controller
                    name="nombreExpediente"
                    control={control}
                    rules={{ required: 'El nombre del expediente es requerido' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Ejemplo: CCAMEM/TOL/A/1003/2025"
                        error={!!errors.nombreExpediente}
                        helperText={errors.nombreExpediente?.message || 'Generalmente se coloca la fórmula clasificadora completa'}
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* 2. Número de legajo y 3. Total de legajos */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                2. Número de Legajo
              </Typography>
              <Controller
                name="numeroLegajo"
                control={control}
                rules={{
                  required: 'El número de legajo es requerido',
                  min: { value: 1, message: 'Debe ser al menos 1' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    error={!!errors.numeroLegajo}
                    helperText={errors.numeroLegajo?.message || `Ejemplo: 1 de ${totalLegajos}`}
                    InputProps={{
                      endAdornment: <Chip label={`de ${totalLegajos}`} size="small" color="primary" />,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                3. Total de Legajos (Calculado Automáticamente)
              </Typography>
              <TextField
                value={totalLegajos}
                fullWidth
                disabled
                helperText={`Calculado automáticamente: ${Math.ceil(totalDocumentos / DOCUMENTOS_POR_LEGAJO)} legajo(s) para ${totalDocumentos} documentos`}
                InputProps={{
                  startAdornment: <Chip label="Auto" size="small" color="success" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            {/* 4. Asunto */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                4. Asunto
              </Typography>
              <Controller
                name="asunto"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder='Ejemplo: Asesoría, Gestión Inmediata, etc.'
                    helperText="Describe el asunto principal del expediente"
                  />
                )}
              />
            </Grid>

            {/* 5. Fecha de apertura y 6. Fecha de cierre */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                5. Fecha de Apertura de Documentos
              </Typography>
              <Controller
                name="fechaApertura"
                control={control}
                rules={{ required: 'La fecha de apertura es requerida' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Fecha de Apertura"
                    format="DD/MM/YYYY"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date: Dayjs | null) => {
                      field.onChange(date ? date.toDate() : null);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.fechaApertura,
                        helperText: errors.fechaApertura?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                6. Fecha de Cierre de Documentos
              </Typography>
              <Controller
                name="fechaCierre"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Fecha de Cierre"
                    format="DD/MM/YYYY"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date: Dayjs | null) => {
                      field.onChange(date ? date.toDate() : null);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: 'Opcional - Dejar en blanco si aún está abierto',
                      },
                    }}
                  />
                )}
              />
            </Grid>

            {/* 7. Total de documentos */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                7. Total de Documentos
              </Typography>
              <Controller
                name="totalDocumentos"
                control={control}
                rules={{
                  required: 'El total de documentos es requerido',
                  min: { value: 0, message: 'Debe ser un número positivo' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    error={!!errors.totalDocumentos}
                    helperText={
                      errors.totalDocumentos?.message ||
                      (totalDocumentos > 0
                        ? `Esto generará ${Math.ceil(totalDocumentos / DOCUMENTOS_POR_LEGAJO)} legajo(s)`
                        : 'Ingrese el número total de documentos')
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Total de Fojas
              </Typography>
              <Controller
                name="totalFojas"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    helperText="Número total de fojas en el expediente"
                  />
                )}
              />
            </Grid>

            {/* 8. Fondo documental */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                8. Fondo Documental
              </Typography>
              <Controller
                name="fondoDocumental"
                control={control}
                rules={{ required: 'El fondo documental es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.fondoDocumental}
                    helperText={errors.fondoDocumental?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Unidad Administrativa
              </Typography>
              <Controller
                name="unidadAdministrativaId"
                control={control}
                rules={{ required: 'La unidad administrativa es requerida' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.unidadAdministrativaId}>
                    <Select {...field} displayEmpty>
                      <MenuItem value="">
                        <em>Seleccione una unidad</em>
                      </MenuItem>
                      {unidades.map((unidad) => (
                        <MenuItem key={unidad.id} value={unidad.id}>
                          {unidad.clave} - {unidad.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* 9. Sección */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                9. Sección Documental
              </Typography>
              <Controller
                name="seccionId"
                control={control}
                rules={{ required: 'La sección es requerida' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.seccionId}>
                    <Select {...field} displayEmpty>
                      <MenuItem value="">
                        <em>Seleccione una sección</em>
                      </MenuItem>
                      {secciones.map((seccion) => (
                        <MenuItem key={seccion.id} value={seccion.id}>
                          {seccion.clave} - {seccion.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* 10. Serie Documental */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                10. Serie Documental
              </Typography>
              <Controller
                name="serieId"
                control={control}
                rules={{ required: 'La serie es requerida' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.serieId} disabled={!seccionId}>
                    <Select {...field} displayEmpty>
                      <MenuItem value="">
                        <em>Seleccione una serie</em>
                      </MenuItem>
                      {series.map((serie) => (
                        <MenuItem key={serie.id} value={serie.id}>
                          {serie.clave} - {serie.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* 11. Subserie documental */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                11. Subserie Documental
              </Typography>
              <Controller
                name="subserieId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={!serieId || subseries.length === 0}>
                    <Select {...field} displayEmpty>
                      <MenuItem value="">
                        <em>Opcional - Seleccione subserie</em>
                      </MenuItem>
                      {subseries.map((subserie) => (
                        <MenuItem key={subserie.id} value={subserie.id}>
                          {subserie.clave} - {subserie.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* 12. Tiempo de conservación */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                12. Tiempo de Conservación
              </Typography>
              <Controller
                name="tiempoConservacion"
                control={control}
                rules={{ required: 'El tiempo de conservación es requerido' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tiempoConservacion}>
                    <Select {...field}>
                      <MenuItem value="TRAMITE">Archivo de Trámite</MenuItem>
                      <MenuItem value="CONCENTRACION">Archivo de Concentración</MenuItem>
                      <MenuItem value="HISTORICO">Archivo Histórico</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Número de Expediente
              </Typography>
              <Controller
                name="numeroExpediente"
                control={control}
                rules={{ required: 'El número de expediente es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Ejemplo: 0001, 0002, etc."
                    error={!!errors.numeroExpediente}
                    helperText={errors.numeroExpediente?.message}
                  />
                )}
              />
            </Grid>

            {/* Campos adicionales */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Ubicación Física
              </Typography>
              <Controller
                name="ubicacionFisica"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Ejemplo: SRSQ, UAA, etc."
                    helperText="Ubicación física del expediente"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Observaciones
              </Typography>
              <Controller
                name="observaciones"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : id ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
