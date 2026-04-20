export interface RoleOption {
  value:  string | undefined;
  label:  string;
}

export interface StateOption {
  value:  boolean | undefined;
  label:  string;
  icon:   string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  { value: undefined,   label: 'Todos los roles' },
  { value: 'CLIENT',  label: 'Clientes'        },
  { value: 'WORKER',    label: 'Trabajadores'    },
];

export const STATE_OPTIONS: StateOption[] = [
  { value: undefined, label: 'Todos los estados', icon: 'group'        },
  { value: true,      label: 'Activos',            icon: 'check_circle' },
  { value: false,     label: 'Inactivos',          icon: 'cancel'       },
];