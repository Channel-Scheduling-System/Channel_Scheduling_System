// ============================================================
// * INPUTS
// ============================================================
export interface Pagination {
    page?: number;
    limit?: number;
}

// ============================================================
// * RESPONSES
// ============================================================
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}