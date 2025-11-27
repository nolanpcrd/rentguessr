import PlaylistService, { type Playlist } from "../../WebService/PlaylistService.ts";
import Router from "../../utils/Router.ts";

export default class PlaylistListView {
    private container: HTMLElement;
    private playlistService: PlaylistService;
    private router: Router;

    constructor() {
        this.container = document.createElement("div");
        this.container.id = "playlist-list-view";
        this.playlistService = PlaylistService.getInstance();
        this.router = Router.getInstance();
    }

    public async render(parent: HTMLElement): Promise<void> {
        this.container.innerHTML = "Chargement...";
        if (!this.container.parentElement) {
            parent.appendChild(this.container);
        }

        try {
            const playlists = await this.playlistService.getMine();
            this.renderPlaylists(playlists);
        } catch (error) {
            this.container.innerHTML = `<p style="color: red">Erreur lors du chargement des playlists.</p>`;
        }
    }

    private renderPlaylists(playlists: Playlist[]): void {
        this.container.innerHTML = `
            <div class="playlist-list-container">
                <h2>Mes Playlists</h2>
                <button id="create-playlist-btn">Créer une nouvelle playlist</button>
                <div class="playlists-grid">
                    ${playlists.map(p => `
                        <div class="playlist-card" data-id="${p.id}">
                            <img src="${p.thumbnail || 'public/placeholder.png'}" alt="${p.name}" class="playlist-thumb">
                            <div class="playlist-info">
                                <h3>${p.name}</h3>
                                <p>${p.rent_count} appartement(s) - Jouée ${p.played} fois</p>
                                <div class="playlist-actions">
                                    <button class="edit-btn" data-id="${p.id}">Modifier</button>
                                    <button class="delete-btn" data-id="${p.id}">Supprimer</button>
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    private attachEvents(): void {
        const createBtn = this.container.querySelector("#create-playlist-btn") as HTMLButtonElement;
        createBtn.addEventListener("click", () => {
            this.router.navigate("#playlists/create");
        });

        this.container.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = (e.target as HTMLElement).dataset.id;
                this.router.navigate(`#playlists/edit/${id}`);
            });
        });

        this.container.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                if (confirm("Êtes-vous sûr de vouloir supprimer cette playlist ?")) {
                    const id = Number((e.target as HTMLElement).dataset.id);
                    try {
                        await this.playlistService.delete(id);
                        this.container.innerHTML = "";
                        await this.render(this.container.parentElement as HTMLElement);
                    } catch (error) {
                        alert("Erreur lors de la suppression");
                    }
                }
            });
        });
    }
}
