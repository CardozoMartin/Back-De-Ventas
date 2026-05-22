//interfaz base para todas las respuestas
export interface IBaseApiResponse {
    success: boolean;
    message?: string;
    timestamp?: Date;
}

// Respuesta de éxito genérica
export interface ISuccessResponse<T> extends IBaseApiResponse {
    data: T;
    success: true;
}
// Respuesta de error genérica
export interface IErrorResponse extends IBaseApiResponse {
    success: false;
    error: string;
    errorCode?: string;
}

// Respuesta paginada
export interface IPaginatedResponse<T> extends ISuccessResponse<T> {
    pagination: {
        totalRecords: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    }
}