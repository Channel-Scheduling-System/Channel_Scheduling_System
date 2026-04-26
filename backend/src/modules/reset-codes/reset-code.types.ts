// ENTITY
export interface ResetCode {
    id: number;
    codeHash: string;
    used: boolean;
    attempts: number;
    expireAt: Date;
    createdAt: Date;
}

// PERSISTENCE
//* -----------------------------
export interface CreateResetCodeData {
    userId: number;
    codeHash: string;
    expireAt: Date;
}

// INPUTS
//* -----------------------------
export interface ResetCodeRequestInput {
    userId: number;
    email: string;
}
