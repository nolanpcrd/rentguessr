import TwitchService from "../../WebService/TwitchService.ts";
import Router from "../../utils/Router.ts";

export default class SettingsView {
    private container: HTMLElement;
    private twitchService: TwitchService;
    private router: Router;

    constructor() {
        this.container = document.createElement("div");
        this.container.id = "settings-view";
        this.twitchService = TwitchService.getInstance();
        this.router = Router.getInstance();
    }

    public render(parent: HTMLElement): void {
        this.container.innerHTML = `
            <div class="settings-page-container">
                <h2>Paramètres</h2>
                
                <div class="setting-group">
                    <h3>Intégration Twitch</h3>
                    <div class="form-group">
                        <label for="twitch-enabled">Activer la connexion Twitch</label>
                        <input type="checkbox" id="twitch-enabled" ${this.twitchService.isEnabled() ? "checked" : ""}>
                    </div>
                    <div class="form-group" id="twitch-channel-group" style="display: ${this.twitchService.isEnabled() ? "block" : "none"}">
                        <label for="twitch-channel">Nom de la chaîne :</label>
                        <input type="text" id="twitch-channel" value="${this.twitchService.getChannel()}" placeholder="Nom de la chaîne">
                    </div>
                </div>

                <div class="form-actions">
                    <button id="save-settings-btn">Enregistrer</button>
                    <button id="back-btn">Retour</button>
                </div>
            </div>
        `;

        parent.appendChild(this.container);
        this.attachEvents();
    }

    private attachEvents(): void {
        const enabledCheckbox = this.container.querySelector("#twitch-enabled") as HTMLInputElement;
        const channelGroup = this.container.querySelector("#twitch-channel-group") as HTMLElement;
        const channelInput = this.container.querySelector("#twitch-channel") as HTMLInputElement;
        const saveBtn = this.container.querySelector("#save-settings-btn") as HTMLButtonElement;
        const backBtn = this.container.querySelector("#back-btn") as HTMLButtonElement;

        enabledCheckbox.addEventListener("change", () => {
            channelGroup.style.display = enabledCheckbox.checked ? "block" : "none";
        });

        saveBtn.addEventListener("click", () => {
            const enabled = enabledCheckbox.checked;
            const channel = channelInput.value.trim();

            if (enabled) {
                if (!channel) {
                    alert("Veuillez entrer un nom de chaîne.");
                    return;
                }
                this.twitchService.connect(channel);
            } else {
                this.twitchService.disconnect();
            }

            alert("Paramètres enregistrés !");
        });

        backBtn.addEventListener("click", () => {
            this.router.navigate("#game");
        });
    }
}
