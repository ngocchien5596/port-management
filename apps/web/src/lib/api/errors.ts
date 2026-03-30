export class APIError extends Error {
    constructor(
        public code: string,
        public message: string,
        public status: number
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Network error occurred') {
        super(message);
        this.name = 'NetworkError';
    }
}

export class UnauthorizedError extends APIError {
    constructor(message: string = 'Unauthorized') {
        super('UNAUTHORIZED', message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ValidationError extends APIError {
    constructor(
        message: string,
        public errors?: Record<string, string[]>
    ) {
        super('VALIDATION_ERROR', message, 400);
        this.name = 'ValidationError';
    }
}
