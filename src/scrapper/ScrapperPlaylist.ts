import type IScrapper from "./IScrapper.ts";
import PlaylistService from "../WebService/PlaylistService.ts";

export default class ScrapperPlaylist implements IScrapper {
    private playlistId: string;
    private playlistService: PlaylistService;
    private rents: any[] = [];
    private currentIndex: number = 0;

    constructor(playlistId: string) {
        this.playlistId = playlistId;
        this.playlistService = PlaylistService.getInstance();
    }

    public async initialize(): Promise<void> {
        try {
            const playlist = await this.playlistService.getByIdToPlay(parseInt(this.playlistId));
            if (playlist && playlist.rents) {
                this.rents = playlist.rents;
            }
        } catch (error) {
            console.error("Failed to initialize playlist scrapper", error);
        }
    }

    public async getRandomRent(): Promise<any> {
        console.log("Getting random rent");
        if (this.rents.length === 0) {
            return { error: "Playlist vide ou non trouvée" };
        }

        const rent = this.rents[this.currentIndex];
        this.currentIndex = this.currentIndex + 1;

        return {
            rent: rent.price,
            photos: rent.photos,
            rooms: rent.rooms,
            surface: rent.surface,
            latitude: parseFloat(rent.latitude),
            longitude: parseFloat(rent.longitude)
        };
    }
    public getRentCount(): number | undefined {
        return this.rents.length;
    }
}
