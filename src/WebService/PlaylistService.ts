import AuthService from "./AuthService.ts";

export interface Rent {
    id: number;
    url: string;
    price: number;
    surface: number;
    rooms: number;
    photos: string[];
    latitude: number;
    longitude: number;
}

export interface Playlist {
    id: number;
    name: string;
    creator: string;
    rent_count: number;
    played: number;
    thumbnail: string | null;
    rents?: Rent[];
}

export default class PlaylistService {
    private static instance: PlaylistService;
    private baseUrl: string = "https://hurt-trista-nolanpcrd-projects-610b0003.koyeb.app/playlists";
    private authService: AuthService;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    public static getInstance(): PlaylistService {
        if (!PlaylistService.instance) {
            PlaylistService.instance = new PlaylistService();
        }
        return PlaylistService.instance;
    }

    private getHeaders(): HeadersInit {
        const token = this.authService.getToken();
        return {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        };
    }

    public async getAll(q: string = "", limit: number = 5, offset: number = 0, sortBy: string = "date", order: string = "desc"): Promise<{ playlists: Playlist[], total: number }> {
        const params = new URLSearchParams({
            q,
            limit: limit.toString(),
            offset: offset.toString(),
            sortBy,
            order
        });
        const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error("Failed to fetch playlists");
        return await response.json();
    }

    public async getMine(): Promise<Playlist[]> {
        const response = await fetch(`${this.baseUrl}/me`, {
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error("Failed to fetch my playlists");
        return await response.json();
    }

    public async getById(id: number): Promise<Playlist> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error("Failed to fetch playlist");
        return await response.json();
    }

    public async getByIdToPlay(id: number): Promise<Playlist> {
        const response = await fetch(`${this.baseUrl}/${id}/play`, {
            headers: this.getHeaders(),
            method: "POST"
        });
        if (!response.ok) throw new Error("Failed to fetch playlist for playing");
        return await response.json();
    }

    public async create(name: string): Promise<Playlist> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error("Failed to create playlist");
        return await response.json();
    }

    public async update(id: number, name: string): Promise<Playlist> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "PUT",
            headers: this.getHeaders(),
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error("Failed to update playlist");
        return await response.json();
    }

    public async delete(id: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error("Failed to delete playlist");
    }

    public async addRent(playlistId: number, url: string): Promise<{ message: string, rentId: number }> {
        const response = await fetch(`${this.baseUrl}/${playlistId}/rents`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ url })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to add rent");
        }
        return await response.json();
    }

    public async updateRent(playlistId: number, rentId: number, url: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${playlistId}/rents/${rentId}`, {
            method: "PUT",
            headers: this.getHeaders(),
            body: JSON.stringify({ url })
        });
        if (!response.ok) throw new Error("Failed to update rent");
    }

    public async deleteRent(playlistId: number, rentId: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${playlistId}/rents/${rentId}`, {
            method: "DELETE",
            headers: this.getHeaders()
        });
        if (!response.ok) throw new Error("Failed to delete rent");
    }
}
