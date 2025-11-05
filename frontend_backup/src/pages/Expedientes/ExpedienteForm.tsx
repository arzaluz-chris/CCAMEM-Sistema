import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  Autocomplete,
  RadioGroup,
  Radio,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { ExpedienteFormData, UnidadAdministrativa, Seccion, Serie, Subserie } from '../../types';
import expedientesService from '../../services/expedientes.service';
import catalogosService from '../../services/catalogos.service';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

const schema = yup.object({
  numeroExpediente: yup.string().required('El número de expediente es requerido'),
  unidadAdministrativaId: yup.string().required('La unidad administrativa es requerida'),
  seccionId: yup.string().required('La sección es requerida'),
  serieId: yup.string().required('La serie es requerida'),
  subserieId: yup.string().nullable(),
  nombreExpediente: yup.string().required('El nombre del expediente es requerido'),
  asunto: yup.string(),
  fechaApertura: yup.string().nullable(),
  fechaCierre: yup.string().nullable(),
  totalLegajos: yup.number().min(1, 'Debe ser mayor o igual a 1').required('Requerido'),
  totalDocumentos: yup.number().min(0, 'Debe ser mayor o igual a 0').required('Requerido'),
  totalFojas: yup.number().min(0, 'Debe ser mayor o igual a 0').required('Requerido'),
  valorDocumental: yup.array().of(yup.string()).min(1, 'Seleccione al menos un valor'),
  clasificacionInformacion: yup.string().oneOf(['publica', 'reservada', 'confidencial']).required('Requerido'),
  fundamentoLegal: yup.string(),
  ubicacionFisica: yup.string(),
  observaciones: yup.string(),
}).required();

interface FormData {
  numeroExpediente: string;
  unidadAdministrativaId: string;
  seccionId: string;
  serieId: string;
  subserieId?: string | null;
  nombreExpediente: string;
  asunto?: string;
  fechaApertura?: string | null;
  fechaCierre?: string | null;
  numeroLegajo: string;
  totalLegajos: number;
  totalDocumentos: number;
  totalFojas: number;
  tiempoConservacion: 'tramite' | 'concentracion' | 'historico';
  valorDocumental: string[];
  clasificacionInformacion: 'publica' | 'reservada' | 'confidencial';
  fundamentoLegal?: string;
  ubicacionFisica?: string;
  observaciones?: string;
}

export default function ExpedienteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);

  // Catálogos
  const [unidades, setUnidades] = useState<UnidadAdministrativa[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [subseries, setSubseries] = useState<Subserie[]>([]);
  const [formulaClasificadora, setFormulaClasificadora] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    // resolver: yupResolver(schema), // Temporarily disabled due to type conflicts
    defaultValues: {
      numeroExpediente: '',
      unidadAdministrativaId: '',
      seccionId: '',
      serieId: '',
      subserieId: '',
      nombreExpediente: '',
      asunto: '',
      fechaApertura: '',
      fechaCierre: '',
      numeroLegajo: '1 de 1',
      totalLegajos: 1,
      totalDocumentos: 0,
      totalFojas: 0,
      tiempoConservacion: 'tramite',
      valorDocumental: [],
      clasificacionInformacion: 'publica',
      fundamentoLegal: '',
      ubicacionFisica: '',
      observaciones: '',
    },
  });

  const watchUnidad = watch('unidadAdministrativaId');
  const watchSeccion = watch('seccionId');
  const watchSerie = watch('serieId');
  const watchSubserie = watch('subserieId');
  const watchNumero = watch('numeroExpediente');
  const watchTotalFojas = watch('totalFojas');

  // Calcular total de legajos automáticamente basado en fojas
  useEffect(() => {
    if (watchTotalFojas > 0) {
      const legajosCalculados = Math.ceil(watchTotalFojas / 180);
      setValue('totalLegajos', legajosCalculados);
      setValue('numeroLegajo', `1 de ${legajosCalculados}`);
    } else {
      setValue('totalLegajos', 1);
      setValue('numeroLegajo', '1 de 1');
    }
  }, [watchTotalFojas, setValue]);

  // Cargar catálogos
  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const [unidadesData, seccionesData] = await Promise.all([
          catalogosService.getUnidades(),
          catalogosService.getSecciones(),
        ]);
        setUnidades(unidadesData);
        setSecciones(seccionesData);
      } catch (error) {
        enqueueSnackbar('Error al cargar catálogos', { variant: 'error' });
      }
    };
    loadCatalogos();
  }, [enqueueSnackbar]);

  // Cargar series cuando cambia sección
  useEffect(() => {
    if (watchSeccion) {
      catalogosService.getSeries(watchSeccion).then((data) => {
        setSeries(data);
        setValue('serieId', '');
        setValue('subserieId', '');
      });
    } else {
      setSeries([]);
      setValue('serieId', '');
      setValue('subserieId', '');
    }
  }, [watchSeccion, setValue]);

  // Cargar subseries cuando cambia serie
  useEffect(() => {
    if (watchSerie) {
      catalogosService.getSubseries(watchSerie).then((data) => {
        setSubseries(data);
        setValue('subserieId', '');
      });
    } else {
      setSubseries([]);
      setValue('subserieId', '');
    }
  }, [watchSerie, setValue]);

  // Generar fórmula clasificadora
  useEffect(() => {
    if (watchUnidad && watchSeccion && watchSerie && watchNumero) {
      const unidad = unidades.find((u) => u.id === watchUnidad);
      const seccion = secciones.find((s) => s.id === watchSeccion);
      const serie = series.find((s) => s.id === watchSerie);
      const subserie = watchSubserie ? subseries.find((s) => s.id === watchSubserie) : null;

      if (unidad && seccion && serie) {
        const formula = catalogosService.generateFormulaClasificadora(
          unidad,
          seccion,
          serie,
          subserie || null,
          watchNumero
        );
        setFormulaClasificadora(formula);
        // Actualizar el nombre del expediente con la fórmula si está vacío
        const currentNombre = watch('nombreExpediente');
        if (!currentNombre || currentNombre.startsWith('CCAMEM/')) {
          setValue('nombreExpediente', formula);
        }
      }
    } else {
      setFormulaClasificadora('');
    }
  }, [watchUnidad, watchSeccion, watchSerie, watchSubserie, watchNumero, unidades, secciones, series, subseries]);

  // Cargar expediente si es edición
  useEffect(() => {
    if (id) {
      const loadExpediente = async () => {
        try {
          setLoadingData(true);
          const expediente = await expedientesService.getById(id);

          setValue('numeroExpediente', expediente.numeroExpediente);
          setValue('unidadAdministrativaId', expediente.unidadAdministrativaId);
          setValue('seccionId', expediente.seccionId);
          setValue('serieId', expediente.serieId);
          setValue('subserieId', expediente.subserieId || '');
          setValue('nombreExpediente', expediente.nombreExpediente);
          setValue('asunto', expediente.asunto || '');
          setValue('fechaApertura', expediente.fechaApertura || '');
          setValue('fechaCierre', expediente.fechaCierre || '');
          setValue('totalLegajos', expediente.totalLegajos);
          setValue('totalDocumentos', expediente.totalDocumentos);
          setValue('totalFojas', expediente.totalFojas);
          setValue('valorDocumental', expediente.valorDocumental);
          setValue('clasificacionInformacion', expediente.clasificacionInformacion);
          setValue('fundamentoLegal', expediente.fundamentoLegal || '');
          setValue('ubicacionFisica', expediente.ubicacionFisica || '');
          setValue('observaciones', expediente.observaciones || '');
        } catch (error) {
          enqueueSnackbar('Error al cargar expediente', { variant: 'error' });
          navigate('/expedientes');
        } finally {
          setLoadingData(false);
        }
      };
      loadExpediente();
    }
  }, [id, navigate, setValue, enqueueSnackbar]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Transform valorDocumental array to boolean fields and clasificacionInformacion to clasificacionInfo
      const { valorDocumental, clasificacionInformacion, numeroLegajo, tiempoConservacion, ...restData } = data;
      const transformedData = {
        ...restData,
        valorAdministrativo: valorDocumental.includes('administrativo'),
        valorLegal: valorDocumental.includes('legal'),
        valorFiscal: valorDocumental.includes('fiscal'),
        valorContable: valorDocumental.includes('contable'),
        clasificacionInfo: clasificacionInformacion.toUpperCase(), // Transform to uppercase as backend expects
      };

      if (id) {
        await expedientesService.update(id, transformedData as any);
        enqueueSnackbar('Expediente actualizado correctamente', { variant: 'success' });
      } else {
        await expedientesService.create(transformedData as any);
        enqueueSnackbar('Expediente creado correctamente', { variant: 'success' });
      }
      navigate('/expedientes');
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Error al guardar expediente', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const valoresDocumentales = [
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'legal', label: 'Legal' },
    { value: 'fiscal', label: 'Fiscal' },
    { value: 'contable', label: 'Contable' },
    { value: 'historico', label: 'Histórico' },
  ];

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {id ? 'Editar Expediente' : 'Nuevo Expediente'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Fórmula Clasificadora */}
            {formulaClasificadora && (
              <Alert severity="info">
                <strong>Fórmula Clasificadora:</strong> {formulaClasificadora}
              </Alert>
            )}

            {/* 1. Nombre del Expediente */}
            <Controller
              name="nombreExpediente"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="1. Nombre del Expediente (Fórmula Clasificadora)"
                  error={!!errors.nombreExpediente}
                  helperText={errors.nombreExpediente?.message || "Se generará automáticamente al completar los datos"}
                  fullWidth
                  required
                  placeholder="Ej: CCAMEM/TOL/A/1003/2025"
                />
              )}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* 2. Número de legajo */}
              <Controller
                name="numeroLegajo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="2. Número de Legajo"
                    helperText="Se actualiza automáticamente según total de fojas"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                )}
              />

              {/* 3. Total de legajos */}
              <Controller
                name="totalLegajos"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="3. Total de Legajos"
                    helperText="Se calcula automáticamente (180 fojas por legajo)"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                )}
              />
            </Stack>

            {/* 4. Asunto */}
            <Controller
              name="asunto"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="4. Asunto"
                  placeholder="Ej: Asesoría, Gestión Inmediata, etc."
                  helperText="Descripción breve del contenido del expediente"
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
            />

            <Divider />

            {/* Fechas */}
            <Typography variant="h6" color="primary">Fechas de Documentos</Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* 5. Fecha de apertura */}
              <Controller
                name="fechaApertura"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="5. Fecha de Apertura (Primer Documento)"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date: Dayjs | null) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.fechaApertura,
                        helperText: errors.fechaApertura?.message || "Fecha del documento más antiguo",
                      },
                    }}
                  />
                )}
              />

              {/* 6. Fecha de cierre */}
              <Controller
                name="fechaCierre"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="6. Fecha de Cierre (Último Documento)"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date: Dayjs | null) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.fechaCierre,
                        helperText: errors.fechaCierre?.message || "Fecha del documento más reciente",
                      },
                    }}
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* Volumen Documental */}
            <Typography variant="h6" color="primary">Volumen Documental</Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* 7. Total de documentos */}
              <Controller
                name="totalDocumentos"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="7. Total de Documentos"
                    error={!!errors.totalDocumentos}
                    helperText={errors.totalDocumentos?.message || "Cantidad de documentos en el expediente"}
                    fullWidth
                    required
                  />
                )}
              />

              <Controller
                name="totalFojas"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Total de Fojas (Hojas)"
                    error={!!errors.totalFojas}
                    helperText={errors.totalFojas?.message || "Determina el cálculo automático de legajos"}
                    fullWidth
                    required
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* Clasificación Archivística */}
            <Typography variant="h6" color="primary">Clasificación Archivística</Typography>

            {/* 8. Fondo documental (Unidad Administrativa) */}
            <Controller
              name="unidadAdministrativaId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="8. Fondo Documental (Unidad Administrativa)"
                  error={!!errors.unidadAdministrativaId}
                  helperText={errors.unidadAdministrativaId?.message || "Seleccione la unidad productora del expediente"}
                  fullWidth
                  required
                >
                  {unidades.map((unidad) => (
                    <MenuItem key={unidad.id} value={unidad.id}>
                      {unidad.clave} - {unidad.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* 9. Sección */}
              <Controller
                name="seccionId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="9. Sección Documental"
                    error={!!errors.seccionId}
                    helperText={errors.seccionId?.message || "Seleccione primero la sección"}
                    fullWidth
                    required
                  >
                    <MenuItem disabled>
                      <em>Secciones Sustantivas</em>
                    </MenuItem>
                    {secciones.filter(s => s.tipo === 'SUSTANTIVA').map((seccion) => (
                      <MenuItem key={seccion.id} value={seccion.id}>
                        <strong>{seccion.clave}</strong> - {seccion.nombre}
                      </MenuItem>
                    ))}
                    <MenuItem disabled>
                      <em>Secciones Comunes</em>
                    </MenuItem>
                    {secciones.filter(s => s.tipo === 'COMUN').map((seccion) => (
                      <MenuItem key={seccion.id} value={seccion.id}>
                        <strong>{seccion.clave}</strong> - {seccion.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              {/* 10. Serie */}
              <Controller
                name="serieId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="10. Serie Documental"
                    error={!!errors.serieId}
                    helperText={
                      errors.serieId?.message ||
                      (!watchSeccion ? "Seleccione primero una sección" :
                       series.length === 0 ? "Cargando series..." :
                       `${series.length} series disponibles`)
                    }
                    fullWidth
                    required
                    disabled={!watchSeccion}
                  >
                    {series.map((serie) => (
                      <MenuItem key={serie.id} value={serie.id}>
                        <strong>{serie.clave}</strong> - {serie.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>

            {/* 11. Subserie */}
            <Controller
              name="subserieId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="11. Subserie Documental (Opcional)"
                  error={!!errors.subserieId}
                  helperText={
                    !watchSerie ? "Seleccione primero una serie" :
                    subseries.length === 0 ? "Esta serie no tiene subseries" :
                    `${subseries.length} subseries disponibles`
                  }
                  fullWidth
                  disabled={!watchSerie || subseries.length === 0}
                >
                  <MenuItem value="">Ninguna</MenuItem>
                  {subseries.map((subserie) => (
                    <MenuItem key={subserie.id} value={subserie.id}>
                      <strong>{subserie.clave}</strong> - {subserie.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Número de Expediente */}
            <Controller
              name="numeroExpediente"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Número de Expediente"
                  error={!!errors.numeroExpediente}
                  helperText={errors.numeroExpediente?.message || "Número consecutivo del expediente (Ej: 0001, 0002)"}
                  fullWidth
                  required
                  placeholder="0001"
                />
              )}
            />

            <Divider />

            {/* 12. Tiempo de Conservación */}
            <FormControl component="fieldset">
              <FormLabel component="legend">12. Tiempo de Conservación</FormLabel>
              <Controller
                name="tiempoConservacion"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    <FormControlLabel
                      value="tramite"
                      control={<Radio />}
                      label="Archivo de Trámite"
                    />
                    <FormControlLabel
                      value="concentracion"
                      control={<Radio />}
                      label="Archivo de Concentración"
                    />
                    <FormControlLabel
                      value="historico"
                      control={<Radio />}
                      label="Archivo Histórico"
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>

            <Divider />

            {/* Valor Documental */}
            <FormControl component="fieldset" error={!!errors.valorDocumental}>
              <FormLabel component="legend">Valor Documental</FormLabel>
              <Controller
                name="valorDocumental"
                control={control}
                render={({ field }) => (
                  <FormGroup row>
                    {valoresDocumentales.map((valor) => (
                      <FormControlLabel
                        key={valor.value}
                        control={
                          <Checkbox
                            checked={field.value?.includes(valor.value) || false}
                            onChange={(e) => {
                              const newValue = e.target.checked
                                ? [...(field.value || []), valor.value]
                                : field.value?.filter((v) => v !== valor.value) || [];
                              field.onChange(newValue);
                            }}
                          />
                        }
                        label={valor.label}
                      />
                    ))}
                  </FormGroup>
                )}
              />
              {errors.valorDocumental && (
                <Typography variant="caption" color="error">
                  {errors.valorDocumental.message}
                </Typography>
              )}
            </FormControl>

            <Divider />

            {/* Clasificación de Información */}
            <Typography variant="h6" color="primary">Clasificación de Información</Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Controller
                name="clasificacionInformacion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Clasificación"
                    error={!!errors.clasificacionInformacion}
                    helperText={errors.clasificacionInformacion?.message}
                    fullWidth
                    required
                  >
                    <MenuItem value="publica">Pública</MenuItem>
                    <MenuItem value="reservada">Reservada</MenuItem>
                    <MenuItem value="confidencial">Confidencial</MenuItem>
                  </TextField>
                )}
              />

              <Controller
                name="fundamentoLegal"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Fundamento Legal"
                    error={!!errors.fundamentoLegal}
                    helperText={errors.fundamentoLegal?.message || "Solo si aplica clasificación reservada/confidencial"}
                    fullWidth
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* Ubicación Física */}
            <Typography variant="h6" color="primary">Ubicación Física</Typography>

            <Controller
              name="ubicacionFisica"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ubicación Física"
                  error={!!errors.ubicacionFisica}
                  helperText={errors.ubicacionFisica?.message || "Ubicación del archivo de trámite"}
                  placeholder="Ej: Estante 1, Nivel 2, Caja 5"
                  fullWidth
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
                  error={!!errors.observaciones}
                  helperText={errors.observaciones?.message}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="NINGUNA"
                />
              )}
            />

            {/* Botones */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/expedientes')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
