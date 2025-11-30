import Game from "../../game/Game.ts";
import SettingsManager from "../SettingsManager.ts";
import AudioManager from "../../utils/AudioManager.ts";

export default class GameView {
  private container: HTMLElement;
  private game: Game | null = null;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "game-view";
  }

  public render(parent: HTMLElement, playlistId: string = ""): void {
    AudioManager.getInstance().playBackgroundMusic("music");
    this.container.innerHTML = `
            <div class="game-header">
              <div class="score-badge" id="score-display">0 Pts</div>
              <div class="progress-bar-container">
                <div class="progress-bar" id="progress-bar"></div>
                <div class="progress-number" id="progress-number">1</div>
              </div>
              <div class="chat-mean" id="chat-mean" style="display: none;">Moy. chat : <span id="chat-mean-value">0</span></div>
            </div>
        
            <div class="game-container">
              <div class="left-section">
                <div id="carousel-container"></div>
              </div>
        
              <div class="right-section">
                <div class="map-container" id="map-container"></div>
                <div class="rent-info-badges">
                  <div class="info-badge" id="surface-badge">-</div>
                  <div class="info-badge" id="rooms-badge">-</div>
                </div>
              </div>
            </div>
        
            <div id="form-container">
              <div class="input-wrapper">
                <input type="number" id="guess-input" placeholder="Votre estimation" />
                <div class="euro-symbol">€</div>
              </div>
              <button id="submit-guess">Valider</button>
            </div>
        
            <div id="settings-overlay">
              <div id="settings-container">
                <div id="settings-header">
                    <h2>Filtres</h2>
                    <button id="close-settings">X</button>
                </div>
                <label for="price-range">Plage de prix (€) :</label>
                <input type="text" id="price-range" placeholder="ex : 500-2000" />
                <label for="number-of-rounds">Nombre de manches :</label>
                <input type="number" id="number-of-rounds" min="1" max="20" value="5" />
                <div class="settings-buttons">
                    <button id="validate-settings" class="validate-button">Valider</button>
                    <button id="reset-settings" class="reset-button">Réinitialiser les paramètres</button>
                </div>
              </div>
            </div>
        
            <button id="settings-button"><img src="/filter.png" alt="filtres"/>️</button>
        
            <div id="guess-result-screen"></div>
        `;

    parent.appendChild(this.container);
    parent.appendChild(this.container);

    if (playlistId !== "") {
      this.game = new Game(playlistId);
    } else {
      const settingsManager = new SettingsManager();
      this.game = new Game();
      settingsManager.initializeSettings();
    }

    this.game.start();
  }

  public destroy(): void {
    AudioManager.getInstance().stopBackgroundMusic();
  }
}
