export interface User {
    id: number;
    username: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export default class AuthService {
    private static instance: AuthService;
    private baseUrl: string = "https://hurt-trista-nolanpcrd-projects-610b0003.koyeb.app/auth";
    private currentUser: User | null = null;
    private token: string | null = null;

    private constructor() {
        this.token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                this.logout();
            }
        }
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public isAuthenticated(): boolean {
        return !!this.token;
    }

    public getUser(): User | null {
        return this.currentUser;
    }

    public getToken(): string | null {
        return this.token;
    }

    public async register(username: string, email: string, password: string): Promise<User> {
        const response = await fetch(`${this.baseUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Registration failed");
        }

        const data: AuthResponse = await response.json();
        this.setSession(data);
        return data.user;
    }

    public async login(email: string, password: string): Promise<User> {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Login failed");
        }

        const data: AuthResponse = await response.json();
        this.setSession(data);
        return data.user;
    }

    public async logout(): Promise<void> {
        if (this.token) {
            try {
                await fetch(`${this.baseUrl}/logout`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${this.token}` }
                });
            } catch (e) {
                console.warn("Logout request failed", e);
            }
        }
        this.clearSession();
    }

    private setSession(data: AuthResponse): void {
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.currentUser));
    }

    private clearSession(): void {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
}
