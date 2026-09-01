export interface LoginResponse {
    token: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password?: string;
    plainPassword?: string; // used for creating user
}
