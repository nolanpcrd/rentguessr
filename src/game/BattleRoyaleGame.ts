import BattleRoyaleService from "../WebService/BattleRoyaleService.ts";
import CreateCarousel from "../view/CreateCarousel.ts";
import CreateMap from "../view/CreateMap.ts";
import AudioManager from "../utils/AudioManager.ts";

export default class BattleRoyaleGame {
    private service: BattleRoyaleService;
    private carousel: CreateCarousel;
    private map: CreateMap;
    private gameContainer: HTMLElement;
    private lobbyContainer: HTMLElement;
    private resultContainer: HTMLElement;
    private timerElement: HTMLElement;
    private guessInput: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private timerInterval: number | null = null;
    private playerId: string = "";
    private isEliminated: boolean = false;
    private lobbyCode: string | null = null;
    private codeMasked: boolean = true;

    constructor() {
        this.service = BattleRoyaleService.getInstance();
        this.carousel = new CreateCarousel();
        this.map = new CreateMap();

        this.gameContainer = document.getElementById("br-game-container") as HTMLElement;
        this.lobbyContainer = document.getElementById("br-lobby-container") as HTMLElement;
        this.resultContainer = document.getElementById("guess-result-screen") as HTMLElement;
        this.timerElement = document.getElementById("br-timer") as HTMLElement;
        this.guessInput = document.getElementById("br-guess-input") as HTMLInputElement;
        this.submitButton = document.getElementById("br-submit-guess") as HTMLButtonElement;

        this.initializeListeners();
    }

    private initializeListeners() {
        this.service.on("br_joined", (data: any) => {
            console.log("Joined BR with ID:", data.id);
            this.playerId = data.id;
            this.lobbyCode = data.lobbyCode || null;
            this.showLobby();
        });

        this.service.on("br_lobby_update", (data: any) => {
            if (data.lobbyCode) {
                this.lobbyCode = data.lobbyCode;
            }
            this.updateLobbyUI(data);
        });

        this.service.on("br_game_start", () => {
            console.log("Game Started!");
            this.showGame();
        });

        this.service.on("br_new_round", (data: any) => {
            this.startRound(data);
        });

        this.service.on("br_round_result", (data: any) => {
            this.showRoundResult(data);
        });

        this.service.on("br_game_over", (data: any) => {
            this.showGameOver(data);
        });

        this.service.on("br_timer_start", (data: any) => {
            this.startLobbyTimer(data.duration);
        });

        this.service.on("br_timer_cancel", () => {
            this.cancelLobbyTimer();
        });
    }

    public async join() {
        await this.service.connect();
        this.service.joinLobby();
    }

    public async createPrivate() {
        await this.service.connect();
        this.service.createPrivateLobby();
    }

    public async joinWithCode(code: string) {
        await this.service.connect();
        this.service.joinLobby(code);
    }

    private showLobby() {
        this.lobbyContainer.style.display = "block";
        this.gameContainer.style.display = "none";
        const gameHeader = document.getElementById("br-game-header") as HTMLElement;
        if (gameHeader) gameHeader.style.display = "none";
        const formContainer = document.getElementById("form-container") as HTMLElement;
        if (formContainer) formContainer.style.display = "none";
        this.resultContainer.style.display = "none";

        if (this.lobbyCode) {
            this.displayLobbyCode();
        }
    }

    private displayLobbyCode() {
        const lobbyContent = document.getElementById("br-lobby-content");
        if (!lobbyContent) return;

        const existingCode = document.getElementById("lobby-code-container");
        if (existingCode) existingCode.remove();

        const codeContainer = document.createElement("div");
        codeContainer.id = "lobby-code-container";
        codeContainer.className = "lobby-code-container";
        codeContainer.innerHTML = `
            <div class="lobby-code-label">Code du lobby privé :</div>
            <div class="lobby-code-display">
                <span class="lobby-code-text" id="lobby-code-text">${this.codeMasked ? '****' : this.lobbyCode}</span>
                <button class="lobby-code-btn" id="toggle-code-btn">${this.codeMasked ? 'Afficher' : 'Masquer'}</button>
                <button class="lobby-code-btn" id="copy-code-btn">Copier</button>
            </div>
        `;
        lobbyContent.appendChild(codeContainer);

        document.getElementById("toggle-code-btn")?.addEventListener("click", () => {
            this.codeMasked = !this.codeMasked;
            this.displayLobbyCode();
        });

        document.getElementById("copy-code-btn")?.addEventListener("click", () => {
            navigator.clipboard.writeText(this.lobbyCode || "");
            const btn = document.getElementById("copy-code-btn");
            if (btn) {
                btn.classList.add("copied");
                setTimeout(() => {
                    btn.classList.remove("copied");
                }, 5000);
            }
        });
    }

    private showGame() {
        this.lobbyContainer.style.display = "none";
        this.gameContainer.style.display = "flex";
        const gameHeader = document.getElementById("br-game-header") as HTMLElement;
        if (gameHeader) gameHeader.style.display = "grid";
        const formContainer = document.getElementById("form-container") as HTMLElement;
        if (formContainer) formContainer.style.display = "flex";
        this.resultContainer.style.display = "none";
        AudioManager.getInstance().playBackgroundMusic('br-music');
    }

    private removeHtml(str: string): string {
        console.log(str);
        let result = str.replace(/<[^>]*>/g, '');
        result = result.replace(/font-family:[^;"]*;?/g, '');
        return result.normalize("NFKD").replace(/[\u{1D400}-\u{1D7FF}]/gu, c => {
            const base = c.normalize("NFKD").replace(/[^\w\s.-]/g, "");
            return base || c;
        });
    }

    private updateLobbyUI(data: any) {
        const playerList = document.getElementById("br-player-list");
        if (playerList) {
            playerList.innerHTML = data.players.map((p: any) =>
                `<li>${this.removeHtml(p.name)}</li>`
            ).join("");
        }

        const playerCount = document.getElementById("br-player-count");
        if (playerCount) {
            playerCount.textContent = `${data.count} / ${data.maxPlayers} joueurs !`;
        }

        if (this.lobbyCode) {
            this.displayLobbyCode();
        }
    }

    private startRound(data: any) {
        if (this.isEliminated) return;

        document.dispatchEvent(new CustomEvent("newRound"));

        this.resultContainer.style.display = "none";
        this.resultContainer.classList.remove("show");
        this.gameContainer.style.display = "flex";

        const gameHeader = document.getElementById("br-game-header") as HTMLElement;
        if (gameHeader) gameHeader.style.display = "grid";
        const formContainer = document.getElementById("form-container") as HTMLElement;
        if (formContainer) formContainer.style.display = "flex";

        this.guessInput.value = "";
        this.guessInput.disabled = false;
        this.submitButton.disabled = false;

        this.carousel.createCarousel(data.apartment.photos);
        this.map.createMap(data.apartment.latitude, data.apartment.longitude);

        const surfaceBadge = document.getElementById("br-surface-badge");
        if (surfaceBadge) surfaceBadge.textContent = `${data.apartment.surface}m²`;

        const roomsBadge = document.getElementById("br-rooms-badge");
        if (roomsBadge) roomsBadge.textContent = `${data.apartment.rooms} pièces`;

        this.startTimer(data.duration);
    }

    private startTimer(durationMs: number) {
        if (this.timerInterval) clearInterval(this.timerInterval);

        let timeLeft = durationMs / 1000;
        this.timerElement.textContent = timeLeft.toFixed(0);

        this.timerInterval = setInterval(() => {
            timeLeft--;
            this.timerElement.textContent = timeLeft.toFixed(0);
            if (timeLeft <= 10) {
                this.timerElement.style.backgroundColor = "#FD5A46"
            }
            if (timeLeft <= 0) {
                this.timerElement.style.backgroundColor = "#00995E"
                if (this.timerInterval) clearInterval(this.timerInterval);
            }
        }, 1000);
    }

    public handleGuess() {
        const guess = parseInt(this.guessInput.value);
        if (!isNaN(guess)) {
            this.service.sendGuess(guess);
            this.guessInput.disabled = true;
            this.submitButton.disabled = true;
        }
    }

    private showRoundResult(data: any) {
        this.lobbyContainer.style.display = "none";
        this.gameContainer.style.display = "none";
        const gameHeader = document.getElementById("br-game-header") as HTMLElement;
        if (gameHeader) gameHeader.style.display = "none";
        const formContainer = document.getElementById("form-container") as HTMLElement;
        if (formContainer) formContainer.style.display = "none";

        const currentPlayerResult = data.results.find((r: any) => r.id === this.playerId);
        const justEliminated = currentPlayerResult && !currentPlayerResult.alive && !this.isEliminated;

        if (justEliminated) {
            this.isEliminated = true;
        } else if (this.isEliminated) {
            return;
        }

        let html = `
            <div class="fullscreen-result">
                <h1 class="result-title">Résultats du Round</h1>
                <div class="result-cards">
                    <div class="result-card">
                        <div class="result-card-label">Vrai prix</div>
                        <div class="result-card-value">${data.actualRent}€</div>
                    </div>
                </div>`;

        if (data.eliminated.length > 0) {
            html += `<div class="result-points" style="color: #FD5A46;">Éliminé: ${this.removeHtml(data.eliminated.join(", "))}</div>`;
        }

        html += `
                <div class="br-standings-container">
                    <h3 class="br-standings-title">Classement</h3>
                    <div class="br-standings-scroll">
                        <ul class="br-standings-list">`;

        data.results.forEach((res: any, index: number) => {
            const bgColor = res.alive ? '#00995E' : '#FD5A46';
            const status = res.alive ? 'EN VIE' : 'ÉLIMINÉ';
            html += `
                <li class="br-standing-item" style="background-color: ${bgColor}; border: 2px solid #000; color: white;">
                    <div class="br-standing-rank" style="color: white;">${index + 1}</div>
                    <div class="br-standing-info">
                        <div class="br-standing-name" style="color: white;">${this.removeHtml(res.name)}</div>
                        <div class="br-standing-details" style="color: white;">
                            Guess: <strong>${res.guess === null ? "-" : res.guess}€</strong> | Distance: ${res.distance === null ? "-" : res.distance}€ | ${status}
                        </div>
                    </div>
                </li>`;
        });

        html += `
                        </ul>
                    </div>
                </div>
            </div>`;

        this.resultContainer.innerHTML = html;
        this.resultContainer.classList.add("show");
        this.resultContainer.style.display = "flex";

        if (justEliminated) {
            setTimeout(() => {
                this.showEliminatedGameOver(data);
            }, 5000);
        }
    }

    private showGameOver(data: any) {
        this.lobbyContainer.style.display = "none";
        this.gameContainer.style.display = "none";
        const gameHeader = document.getElementById("br-game-header") as HTMLElement;
        if (gameHeader) gameHeader.style.display = "none";
        const formContainer = document.getElementById("form-container") as HTMLElement;
        if (formContainer) formContainer.style.display = "none";

        const isWinner = data.winner === this.playerId;
        const bgClass = isWinner ? "game-over" : "bad";
        const title = isWinner ? "Victoire !" : "Game Over";

        this.resultContainer.innerHTML = `
            <div class="fullscreen-result ${bgClass}">
                <h1 class="result-title">${title}</h1>
                <div class="final-stats">
                    <p class="stats-label">${isWinner ? 'Félicitations ! Vous avez gagné !' : 'Vainqueur: ' + this.removeHtml(data.winnerName)}</p>
                </div>
                <button id="br-back-lobby" class="next-btn">Retour au Lobby</button>
            </div>
        `;
        this.resultContainer.classList.add("show");

        AudioManager.getInstance().stopBackgroundMusic();
        if (isWinner) {
            AudioManager.getInstance().playSoundEffect('win');
        } else {
            AudioManager.getInstance().playSoundEffect('loose');
        }

        document.getElementById("br-back-lobby")?.addEventListener("click", () => {
            window.location.reload();
        });
    }

    private showEliminatedGameOver(data: any) {
        this.lobbyContainer.style.display = "none";
        this.gameContainer.style.display = "none";
        const gameHeader = document.getElementById("br-game-header") as HTMLElement;
        if (gameHeader) gameHeader.style.display = "none";
        const formContainer = document.getElementById("form-container") as HTMLElement;
        if (formContainer) formContainer.style.display = "none";

        const rank = data.results.findIndex((r: any) => r.id === this.playerId) + 1;

        this.resultContainer.innerHTML = `
            <div class="fullscreen-result bad">
                <h1 class="result-title">Éliminé !</h1>
                <div class="final-stats">
                    <p class="stats-label">Vous avez terminé ${rank}${rank === 1 ? 'er' : 'ème'}</p>
                </div>
                <button id="br-back-lobby" class="next-btn">Retour au Lobby</button>
            </div>
        `;
        this.resultContainer.classList.add("show");

        AudioManager.getInstance().stopBackgroundMusic();
        AudioManager.getInstance().playSoundEffect('loose');

        document.getElementById("br-back-lobby")?.addEventListener("click", () => {
            window.location.reload();
        });
    }

    private startLobbyTimer(durationMs: number) {
        const timerContainer = document.getElementById("br-lobby-timer");
        const countdownSpan = document.getElementById("br-lobby-countdown");

        if (timerContainer && countdownSpan) {
            timerContainer.style.display = "block";
            let timeLeft = durationMs / 1000;
            countdownSpan.textContent = timeLeft.toFixed(0);

            if (this.timerInterval) clearInterval(this.timerInterval);

            this.timerInterval = setInterval(() => {
                timeLeft--;
                countdownSpan.textContent = timeLeft.toFixed(0);
                if (timeLeft <= 0) {
                    if (this.timerInterval) clearInterval(this.timerInterval);
                }
            }, 1000);
        }
    }

    private cancelLobbyTimer() {
        const timerContainer = document.getElementById("br-lobby-timer");
        if (timerContainer) {
            timerContainer.style.display = "none";
        }
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
}
