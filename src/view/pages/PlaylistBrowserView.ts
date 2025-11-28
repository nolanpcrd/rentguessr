import PlaylistService, { type Playlist } from "../../WebService/PlaylistService.ts";
import Router from "../../utils/Router.ts";

export default class PlaylistBrowserView {
    private container: HTMLElement;
    private playlistService: PlaylistService;
    private currentPage: number = 0;
    private limit: number = 6;
    private currentSearch: string = "";
    private sortBy: string = "date";
    private order: string = "desc";
    private total: number = 0;
    private router: Router;

    constructor() {
        this.container = document.createElement("div");
        this.container.id = "playlist-browser-view";
        this.playlistService = PlaylistService.getInstance();
        this.router = Router.getInstance();
    }

    public async render(parent: HTMLElement): Promise<void> {
        this.container.innerHTML = "Chargement...";
        parent.appendChild(this.container);
        await this.loadPlaylists();
    }

    private async loadPlaylists(): Promise<void> {
        try {
            const response = await this.playlistService.getAll(
                this.currentSearch,
                this.limit,
                this.currentPage * this.limit,
                this.sortBy,
                this.order
            );
            this.total = response.total;
            this.renderUI(response.playlists);
        } catch (error) {
            this.container.innerHTML = `<p style="color: red">Erreur lors du chargement des playlists.</p>`;
        }
    }

    private renderUI(playlists: Playlist[]): void {
        const totalPages = Math.ceil(this.total / this.limit);

        this.container.innerHTML = `
            <div class="playlist-browser-container">
                <h2>Parcourir les playlists</h2>
                
                <div class="search-bar">
                    <input type="text" id="search-input" placeholder="Rechercher une playlist..." value="${this.currentSearch}">
                    <button id="search-btn">Rechercher</button>
                </div>

                <div class="filters-bar" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;">
                    <select id="sort-by">
                        <option value="date" ${this.sortBy === 'date' ? 'selected' : ''}>Date</option>
                        <option value="played" ${this.sortBy === 'played' ? 'selected' : ''}>Popularité</option>
                        <option value="count" ${this.sortBy === 'count' ? 'selected' : ''}>Nombre d'apparts</option>
                        <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Nom</option>
                    </select>
                    <select id="order-by">
                        <option value="desc" ${this.order === 'desc' ? 'selected' : ''}>Décroissant</option>
                        <option value="asc" ${this.order === 'asc' ? 'selected' : ''}>Croissant</option>
                    </select>
                </div>

                <div class="playlists-grid">
                    ${playlists.length ? playlists.map(p => `
                        <div class="playlist-card" data-id="${p.id}">
                            <img src="${p.thumbnail || 'public/placeholder.png'}" alt="${this.removeHtml(p.name)}" class="playlist-thumb">
                            <div class="playlist-info">
                                <h3>${this.removeHtml(p.name)}</h3>
                                <p>Par ${this.removeHtml(p.creator)}</p>
                                <p>${p.rent_count} appartement(s) - Jouée ${p.played} fois</p>
                                 <div class="playlist-actions">
                                    <button class="play-btn" data-id="${p.id}">Jouer</button>
                                </div>
                            </div>
                        </div>
                    `).join("") : '<p>Aucune playlist trouvée.</p>'}
                </div>

                <div class="pagination-controls">
                    <button id="prev-page" ${this.currentPage === 0 ? 'disabled' : ''}>Précédent</button>
                    <span>Page ${this.currentPage + 1} sur ${totalPages || 1}</span>
                    <button id="next-page" ${(this.currentPage + 1) * this.limit >= this.total ? 'disabled' : ''}>Suivant</button>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    private removeHtml(str: string): string {
        return str.replace(/<[^>]*>/g, '');
    }

    private attachEvents(): void {
        const searchInput = this.container.querySelector("#search-input") as HTMLInputElement;
        const searchBtn = this.container.querySelector("#search-btn") as HTMLButtonElement;
        const prevBtn = this.container.querySelector("#prev-page") as HTMLButtonElement;
        const nextBtn = this.container.querySelector("#next-page") as HTMLButtonElement;
        const sortBySelect = this.container.querySelector("#sort-by") as HTMLSelectElement;
        const orderBySelect = this.container.querySelector("#order-by") as HTMLSelectElement;

        this.container.querySelectorAll(".play-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = (e.target as HTMLElement).dataset.id;
                this.router.navigate(`#game/playlist/${id}`);
            });
        });

        const handleSearch = () => {
            this.currentSearch = searchInput.value;
            this.currentPage = 0;
            this.loadPlaylists();
        };

        const handleSort = () => {
            this.sortBy = sortBySelect.value;
            this.order = orderBySelect.value;
            this.currentPage = 0;
            this.loadPlaylists();
        };

        searchBtn.addEventListener("click", handleSearch);
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleSearch();
        });

        sortBySelect.addEventListener("change", handleSort);
        orderBySelect.addEventListener("change", handleSort);

        prevBtn.addEventListener("click", () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadPlaylists();
            }
        });

        nextBtn.addEventListener("click", () => {
            if ((this.currentPage + 1) * this.limit < this.total) {
                this.currentPage++;
                this.loadPlaylists();
            }
        });
    }
}
