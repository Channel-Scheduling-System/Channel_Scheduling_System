export const AUTH_ERRORS = {
    ACCESS_TOKEN_MISSING: 'Access Token no proporcionado',
    ACCESS_TOKEN_INVALID: 'Access Token inválido',
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

export const SERVICE_ERRORS = {
    UPDATE_STATE_FORBIDDEN:
        'No tienes permisos para modificar el estado del servicio',
    WORKER_NOT_FOUND: 'El trabajador asociado al servicio no existe',
    NAME_CONFLICT: 'El usuario ya tiene un servicio con ese nombre',
    ID_NOTFOUND: 'El servicio con el id solicitado no existe',
    SERVICE_DEACTIVATED: 'Servicio desactivado. Contacta al trabajador.',
} as const;
