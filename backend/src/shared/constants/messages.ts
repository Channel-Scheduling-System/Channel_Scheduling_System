export const AUTH_ERRORS = {
    ACCESS_TOKEN_MISSING: 'Access Token no proporcionado',
    ACCESS_TOKEN_INVALID: 'Access Token inválido',
    ACCESS_TOKEN_EXPIRED: 'Access Token expirado',
    REFRESH_TOKEN_INVALID: 'Refresh Token inválido',
    REFRESH_TOKEN_EXPIRED: 'Refresh Token expirado',
    RESETPASS_TOKEN_INVALID: 'Token de restablecimiento inválido',
    RESETPASS_TOKEN_EXPIRED: 'Token de restablecimiento expirado',
    EMAIL_REGISTERED: 'El email ya está registrado',
    TOKEN_REUSE_DETECTED:
        'Sesión comprometida. Por favor inicie sesión nuevamente.',
    TOKEN_DECODE_FAILED: 'Decodificación de token fallida',
    LOGOUT_INVALID_TOKEN: 'Token de sesión inválido o expirado',
    LOGOUT_UNAUTHORIZED: 'No autorizado para cerrar esta sesión',
} as const;

export const USER_ERRORS = {
    ROLE_CANNOT_CREATE: 'No tienes permisos para crear este tipo de usuario',
    ROLE_CANNOT_VIEW: 'No tienes permisos para ver este tipo de usuario',
    ROLE_CANNOT_UPDATE:
        'No tienes permisos para actualizar este tipo de usuario',
    ROLE_CANNOT_UPDATE_PASSWORD:
        'No tienes permisos para actualizar la contraseña de este usuario',
    ROLE_CANNOT_UPDATE_STATE:
        'No tienes permisos para actualizar el estado de este usuario',
    ROLE_CANNOT_DELETE: 'No tienes permisos para eliminar este tipo de usuario',
    FIRST_ADMIN_CODE_INVALID: 'Código secreto para primer admin inválido',
    ADMIN_EXISTS: 'Ya existe un administrador en el sistema',
    EMAIL_REGISTERED: 'El email ya está registrado',
    ALIAS_REGISTERED: 'El alias ya está registrado',
    PHONE_REGISTERED: 'El teléfono ya está registrado',
    NOT_FOUND: 'Usuario no encontrado',
    USER_DEACTIVATED: 'Usuario desactivado. Contacta al administrador.',
} as const;

export const RESET_CODE_ERRORS = {
    NOT_FOUND: 'Código de restablecimiento no encontrado',
    EXPIRED: 'Código de restablecimiento expirado',
    INVALID_CODE: 'Código de restablecimiento inválido',
    MAX_ATTEMPTS: 'Demasiados intentos. Solicita un nuevo código.',
} as const;

export const SERVICE_ERRORS = {
    UPDATE_STATE_FORBIDDEN:
        'No tienes permisos para modificar el estado del servicio',
    WORKER_NOT_FOUND: 'El trabajador asociado al servicio no existe',
    NAME_CONFLICT: 'El usuario ya tiene un servicio con ese nombre',
    ID_NOTFOUND: 'El servicio con el id solicitado no existe',
    SERVICE_DEACTIVATED: 'Servicio desactivado. Contacta al trabajador.',
} as const;

export const AVAILABILITY_ERRORS = {
    NOT_FOUND: 'Bloque de tiempo no encontrado',
    WORKER_NOT_FOUND: 'El trabajador asociado no existe',
    OWNER_MISMATCH: 'No tienes permisos para modificar este bloque de tiempo',
    CANNOT_VIEW:
        'No tienes permisos para ver la disponibilidad detallada de este trabajador',
    INVALID_TIME_INTERVAL: 'El intervalo de tiempo es inválido',
    DUPLICATE_DAYOFWEEK:
        'No puede haber más de un horario por día de la semana',
    OVERLAPPING_DAY_OFF:
        'Ya existe un bloque de tiempo que solapa con esta fecha',
    DAY_OFF_IN_PAST: 'No se puede crear un bloqueo en una fecha pasada',
} as const;

export const APPOINTMENT_ERRORS = {
    WORKER_NOT_FOUND: 'El trabajador asociado a la cita no existe',
    CLIENT_NOT_FOUND: 'El cliente asociado a la cita no existe',
    SERVICE_NOT_FOUND(serviceId: number) {
        return `El servicio con id ${serviceId} no existe`;
    },
    APPOINTMENT_IN_PAST: 'No se puede crear una cita en una fecha pasada',
    OUT_OF_WORKING_HOURS:
        'La cita no está dentro de los horarios laborales del trabajador',
    CANT_BE_REQUESTED: 'No se puede solicitar la cita. Este horario no esta disponible',
    MAX_OVERLAPS_ALLOWED: `No se puede crear la cita. Ya se alcanzó el máximo de citas permitidas en este horario`,
    NOT_FOUND: 'Cita no encontrada',
    OWNER_CREATION_MISMATCH: 'No tienes permisos para crear esta cita',
    OWNER_MISMATCH: 'No tienes permisos para modificar esta cita',
} as const;

export const APPOINTMENT_MESSAGES = {
    CAN_BE_CREATED: 'Horario disponible. La cita puede ser creada.',
    CONFIRMATION_NEEDED: (count: number) =>
        `Hay ${count} cita(s) en este horario. Confirme si desea agregar una cita adicional (máximo permitido: 2).`,
} as const;
