import BattleRoyaleGame from "../../game/BattleRoyaleGame.ts";
import BattleRoyaleService from "../../WebService/BattleRoyaleService.ts";

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
                <div id="br-player-count">En attente de joueurs...</div>
                <ul id="br-player-list" class="player-list"></ul>
                <div id="br-lobby-timer" style="display: none; font-size: 1.5em; margin-top: 20px;">La partie commence dans <span id="br-lobby-countdown">30</span>s !</div>
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

        this.game.join();
    }

    public destroy(): void {
        BattleRoyaleService.getInstance().disconnect();
    }
}
