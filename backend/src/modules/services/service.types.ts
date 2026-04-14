export type SystemRole = 'ADMIN' | 'CLIENT' | 'WORKER';

// ENTITY
export interface Service {
    id: number;
    workerId: number;
    name: string;
    description: string | null;
    colorHex: string;
    defaultDurationMin: number; // en minutos
    defaultPrice: number; // en COP
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// PERSISTENCE
//* -----------------------------
export interface CreateServiceData {
    workerId: number;
    name: string;
    description: string;
    colorHex: string;
    defaultDurationMin: number; // en minutos
    defaultPrice: number; // en COP
}

export interface UpdateServiceData {
    name?: string;
    description?: string;
    colorHex?: string;
    defaultDurationMin?: number; // en minutos
    defaultPrice?: number; // en COP
}

// SERVICE INPUTS
//* -----------------------------
export interface CreateServiceInput {
    workerId: number;
    name: string;
    description: string;
    color: string;
    price: number; // en COP
    duration: number; // en minutos
}

export interface UpdateServiceInput {
    id: number;
    name?: string;
    description?: string;
    color?: string;
    price?: number; // en COP
    duration?: number; // en minutos
}

// SERVICE RESPONSE
//* -----------------------------
export interface ServiceResponse {
    id: number;
    name: string;
    description: string;
    color: string;
    price: number;
    duration: number;
    isActive: boolean;
}

export interface ServiceFilters {
    workerId?: number;
    isActive?: boolean;
}
