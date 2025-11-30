import BattleRoyaleGame from "../../game/BattleRoyaleGame.ts";
import BattleRoyaleService from "../../WebService/BattleRoyaleService.ts";
import AudioManager from "../../utils/AudioManager.ts";

export default class BattleRoyaleView {
    private container: HTMLElement;
    private game: BattleRoyaleGame | null = null;

    constructor() {
        this.container = document.createElement("div");
        this.container.id = "battle-royale-view";
    }

    public render(parent: HTMLElement): void {
        this.container.innerHTML = `
            <div id="br-lobby-container" class="lobby-container">
                <h1>Battle Royale</h1>
                <div id="br-join-container" class="br-join-buttons">
                    <button id="br-join-public-btn" class="br-btn br-btn-green">Rejoindre une partie</button>
                    <button id="br-create-private-btn" class="br-btn br-btn-red">Créer un lobby privé</button>
                    <button id="br-join-private-btn" class="br-btn br-btn-blue">Rejoindre un lobby privé</button>
                </div>
                <div id="br-lobby-content" style="display: none;">
                    <div id="br-player-count">En attente de joueurs...</div>
                    <ul id="br-player-list" class="player-list"></ul>
                    <div id="br-lobby-timer" style="display: none; font-size: 1.5em; margin-top: 20px;">La partie commence dans <span id="br-lobby-countdown">30</span>s !</div>
                </div>
            </div>

            <div class="join-private-modal" id="join-private-modal">
                <div class="join-private-content">
                    <h2>Rejoindre un Lobby Privé</h2>
                    <input type="text" id="private-code-input" placeholder="Entrez le code" maxlength="6" />
                    <div class="join-private-buttons">
                        <button class="br-btn br-btn-green" id="join-private-confirm">Rejoindre</button>
                        <button class="br-btn br-btn-red" id="join-private-cancel">Annuler</button>
                    </div>
                </div>
            </div>

            <div class="game-header" id="br-game-header" style="display: none;">
                <div class="score-badge" id="br-timer">30</div>
              <div class="chat-mean" id="chat-mean" style="display: none;">Moy. chat : <span id="chat-mean-value">0</span></div>
            </div>

            <div class="game-container" id="br-game-container" style="display: none;">
                <div class="left-section">
                    <div id="carousel-container"></div>
                </div>

                <div class="right-section">
                    <div class="map-container" id="map-container"></div>
                    <div class="rent-info-badges">
                        <div class="info-badge" id="br-surface-badge">-</div>
                        <div class="info-badge" id="br-rooms-badge">-</div>
                    </div>
                </div>
            </div>

            <div id="form-container" style="display: none;">
                <div class="input-wrapper">
                    <input type="number" id="br-guess-input" placeholder="Votre estimation" />
                    <div class="euro-symbol">€</div>
                </div>
                <button id="br-submit-guess">Valider</button>
            </div>

            <div id="guess-result-screen" class="br-result-screen">
            </div>
        `;

        parent.appendChild(this.container);

        this.game = new BattleRoyaleGame();

        const submitBtn = document.getElementById("br-submit-guess");
        if (submitBtn) {
            submitBtn.addEventListener("click", () => {
                this.game?.handleGuess();
            });
        }

        const joinPublicBtn = document.getElementById("br-join-public-btn");
        if (joinPublicBtn) {
            joinPublicBtn.addEventListener("click", () => {
                AudioManager.getInstance().enableAudio();
                this.game?.join();
                const joinContainer = document.getElementById("br-join-container");
                const lobbyContent = document.getElementById("br-lobby-content");
                if (joinContainer) joinContainer.style.display = "none";
                if (lobbyContent) lobbyContent.style.display = "block";
            });
        }

        const createPrivateBtn = document.getElementById("br-create-private-btn");
        if (createPrivateBtn) {
            createPrivateBtn.addEventListener("click", () => {
                AudioManager.getInstance().enableAudio();
                this.game?.createPrivate();
                const joinContainer = document.getElementById("br-join-container");
                const lobbyContent = document.getElementById("br-lobby-content");
                if (joinContainer) joinContainer.style.display = "none";
                if (lobbyContent) lobbyContent.style.display = "block";
            });
        }

        const joinPrivateBtn = document.getElementById("br-join-private-btn");
        const modal = document.getElementById("join-private-modal");
        const privateCodeInput = document.getElementById("private-code-input") as HTMLInputElement;

        if (joinPrivateBtn && modal) {
            joinPrivateBtn.addEventListener("click", () => {
                modal.classList.add("show");
                privateCodeInput.value = "";
                privateCodeInput.focus();
            });
        }

        const joinPrivateConfirm = document.getElementById("join-private-confirm");
        if (joinPrivateConfirm && modal) {
            joinPrivateConfirm.addEventListener("click", () => {
                const code = privateCodeInput.value.trim().toUpperCase();
                if (code) {
                    AudioManager.getInstance().enableAudio();
                    this.game?.joinWithCode(code);
                    modal.classList.remove("show");
                    const joinContainer = document.getElementById("br-join-container");
                    const lobbyContent = document.getElementById("br-lobby-content");
                    if (joinContainer) joinContainer.style.display = "none";
                    if (lobbyContent) lobbyContent.style.display = "block";
                }
            });
        }

        const joinPrivateCancel = document.getElementById("join-private-cancel");
        if (joinPrivateCancel && modal) {
            joinPrivateCancel.addEventListener("click", () => {
                modal.classList.remove("show");
            });
        }
    }

    public destroy(): void {
        BattleRoyaleService.getInstance().disconnect();
        AudioManager.getInstance().stopBackgroundMusic();
    }
}
