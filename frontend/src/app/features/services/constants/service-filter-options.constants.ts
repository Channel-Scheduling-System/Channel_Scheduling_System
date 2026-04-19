export interface StateOption {
    value:  boolean | undefined;
    label:  string;
    icon:   string;
}

export const STATE_OPTIONS: StateOption[] = [
    { label: 'Todos los estados', value: undefined, icon: 'layers' },
    { label: 'Activos', value: true, icon: 'check_circle' },
    { label: 'Inactivos', value: false, icon: 'cancel' },
]