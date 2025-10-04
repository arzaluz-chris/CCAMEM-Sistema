import Joi from 'joi';

// Validación de login
export const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(50).messages({
    'string.empty': 'El nombre de usuario es requerido',
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
    'string.max': 'El nombre de usuario no puede exceder 50 caracteres',
  }),
  password: Joi.string().required().min(6).messages({
    'string.empty': 'La contraseña es requerida',
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
  }),
});

// Validación de registro de usuario
export const createUsuarioSchema = Joi.object({
  username: Joi.string().required().min(3).max(50).messages({
    'string.empty': 'El nombre de usuario es requerido',
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'El email es requerido',
    'string.email': 'El email debe ser válido',
  }),
  password: Joi.string().required().min(6).messages({
    'string.empty': 'La contraseña es requerida',
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
  }),
  nombre: Joi.string().required().max(100).messages({
    'string.empty': 'El nombre es requerido',
  }),
  apellidoPaterno: Joi.string().required().max(100).messages({
    'string.empty': 'El apellido paterno es requerido',
  }),
  apellidoMaterno: Joi.string().allow('', null).max(100),
  rol: Joi.string()
    .valid('ADMIN', 'COORDINADOR_ARCHIVO', 'RESPONSABLE_AREA', 'OPERADOR', 'CONSULTA')
    .required()
    .messages({
      'any.only': 'El rol debe ser uno de: ADMIN, COORDINADOR_ARCHIVO, RESPONSABLE_AREA, OPERADOR, CONSULTA',
    }),
  unidadAdministrativaId: Joi.string().uuid().allow(null).messages({
    'string.guid': 'El ID de unidad administrativa debe ser un UUID válido',
  }),
});

// Validación de actualización de usuario
export const updateUsuarioSchema = Joi.object({
  email: Joi.string().email().messages({
    'string.email': 'El email debe ser válido',
  }),
  nombre: Joi.string().max(100),
  apellidoPaterno: Joi.string().max(100),
  apellidoMaterno: Joi.string().allow('', null).max(100),
  rol: Joi.string().valid('ADMIN', 'COORDINADOR_ARCHIVO', 'RESPONSABLE_AREA', 'OPERADOR', 'CONSULTA'),
  unidadAdministrativaId: Joi.string().uuid().allow(null),
  activo: Joi.boolean(),
});

// Validación de cambio de contraseña
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'La contraseña actual es requerida',
  }),
  newPassword: Joi.string().required().min(6).messages({
    'string.empty': 'La nueva contraseña es requerida',
    'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
  }),
});

// Validación de refresh token
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'El refresh token es requerido',
  }),
});
