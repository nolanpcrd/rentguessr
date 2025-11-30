import PlaylistService, { type Playlist } from "../../WebService/PlaylistService.ts";
import Router from "../../utils/Router.ts";

export default class PlaylistEditView {
    private container: HTMLElement;
    private playlistService: PlaylistService;
    private router: Router;
    private playlistId: number | null = null;
    private currentPlaylist: Playlist | null = null;

    constructor() {
        this.container = document.createElement("div");
        this.container.id = "playlist-edit-view";
        this.playlistService = PlaylistService.getInstance();
        this.router = Router.getInstance();
    }

    public async render(parent: HTMLElement, playlistId?: number): Promise<void> {
        this.playlistId = playlistId || null;
        this.container.innerHTML = "Chargement...";
        parent.appendChild(this.container);

        if (this.playlistId) {
            try {
                this.currentPlaylist = await this.playlistService.getById(this.playlistId);
                this.renderForm();
            } catch (error) {
                this.container.innerHTML = `<p style="color: red">Erreur lors du chargement de la playlist.</p>`;
            }
        } else {
            this.currentPlaylist = { id: 0, name: "", creator: "", rent_count: 0, thumbnail: null, rents: [], played: 0 };
            this.renderForm();
        }
    }

    private renderForm(): void {
        const isEdit = !!this.playlistId;
        const rents = this.currentPlaylist?.rents || [];

        this.container.innerHTML = `
            <div class="playlist-edit-container">
                <h2>${isEdit ? "Modifier la playlist" : "Créer une playlist"}</h2>
                
                <div class="form-group">
                    <label for="playlist-name">Nom de la playlist:</label>
                    <input type="text" id="playlist-name" value="${this.currentPlaylist?.name || ''}" required>
                </div>

                ${isEdit ? `
                    <div class="rents-section">
                        <h3>Appartements</h3>
                        
                        <div class="info-popup">
                            <p>Trouvez des appartements sur <a href="https://www.bienici.com/recherche/location" target="_blank">Bienici.com</a></p>
                        </div>

                        <div class="add-rent-form">
                            <input type="text" id="rent-url" placeholder="Collez l'URL Bienici ici">
                            <button id="add-rent-btn">Ajouter</button>
                        </div>

                        <div class="rents-list">
                            ${rents.map(rent => `
                                <div class="rent-item" data-id="${rent.id}">
                                    <img src="${rent.photos[0] || 'public/placeholder.png'}" alt="Appartement" class="rent-thumb">
                                    <div class="rent-details">
                                        <span>${rent.price}€ - ${rent.surface}m² - ${rent.rooms}p</span>
                                        <div class="rent-actions">
                                            <button class="delete-rent-btn" data-id="${rent.id}">Supprimer</button>
                                        </div>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : '<p>Vous pourrez ajouter des appartements une fois la playlist créée.</p>'}

                <div class="form-actions">
                    <button id="save-playlist-btn">${isEdit ? "Enregistrer le nom" : "Créer"}</button>
                    <button id="cancel-btn">Retour</button>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    private attachEvents(): void {
        const nameInput = this.container.querySelector("#playlist-name") as HTMLInputElement;
        const saveBtn = this.container.querySelector("#save-playlist-btn") as HTMLButtonElement;
        const cancelBtn = this.container.querySelector("#cancel-btn") as HTMLButtonElement;

        saveBtn.addEventListener("click", async () => {
            const name = nameInput.value;
            if (!name) return alert("Le nom est obligatoire");

            try {
                if (this.playlistId) {
                    await this.playlistService.update(this.playlistId, name);
                    alert("Playlist mise à jour !");
                } else {
                    const newPlaylist = await this.playlistService.create(name);
                    this.router.navigate(`#playlists/edit/${newPlaylist.id}`);
                }
            } catch (error) {
                alert("Erreur lors de la sauvegarde");
            }
        });

        cancelBtn.addEventListener("click", () => {
            this.router.navigate("#playlists/me");
        });

        if (this.playlistId) {
            const addRentBtn = this.container.querySelector("#add-rent-btn") as HTMLButtonElement;
            const rentUrlInput = this.container.querySelector("#rent-url") as HTMLInputElement;

            addRentBtn?.addEventListener("click", async () => {
                const url = rentUrlInput.value;
                if (!url) return;

                try {
                    await this.playlistService.addRent(this.playlistId!, url);
                    rentUrlInput.value = "";
                    this.render(this.container.parentElement as HTMLElement, this.playlistId!);
                } catch (error: any) {
                    alert("Erreur: " + error.message);
                }
            });

            this.container.querySelectorAll(".delete-rent-btn").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    if (confirm("Supprimer cet appartement ?")) {
                        const rentId = Number((e.target as HTMLElement).dataset.id);
                        try {
                            await this.playlistService.deleteRent(this.playlistId!, rentId);
                            this.render(this.container.parentElement as HTMLElement, this.playlistId!);
                        } catch (error) {
                            alert("Erreur lors de la suppression");
                        }
                    }
                });
            });
        }
    }
}
