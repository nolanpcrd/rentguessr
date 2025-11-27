import ScrapperAPI from "../scrapper/ScrapperAPI.ts";
import CreateCarousel from "../view/CreateCarousel.ts";
import CreateMap from "../view/CreateMap.ts";
import { shareResult, shareOnTwitter } from "../utils/share.ts";
import ScrapperPlaylist from "../scrapper/ScrapperPlaylist.ts";
import type IScrapper from "../scrapper/IScrapper.ts";

export default class Game {
    private scrapper: IScrapper;
    private carousel: CreateCarousel;
    private map: CreateMap;
    private score: number;
    private currentRent: any;
    private currentRentIndex: number;
    private maxRounds: number = 5;
    private guessInput: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private resultScreenContainer: HTMLElement;
    private scoreDisplay: HTMLElement;
    private progressBar: HTMLElement;
    private progressNumber: HTMLElement;
    private surfaceBadge: HTMLElement;
    private roomsBadge: HTMLElement;
    private gameContainer: HTMLElement;
    private formContainer: HTMLElement;
    private previousPriceSettings: { minPrice?: number, maxPrice?: number } = {};
    private isPlaylistMode: boolean = false;

    constructor(playlistId: string = "") {
        if (playlistId === "") {
            this.scrapper = new ScrapperAPI();
            this.isPlaylistMode = false;
        } else {
            this.scrapper = new ScrapperPlaylist(playlistId);
            this.isPlaylistMode = true;
        }
        this.carousel = new CreateCarousel();
        this.map = new CreateMap();
        this.score = 0;
        this.currentRent = null;
        this.currentRentIndex = 0;
        this.guessInput = document.getElementById("guess-input") as HTMLInputElement;
        this.submitButton = document.getElementById("submit-guess") as HTMLButtonElement;
        this.resultScreenContainer = document.getElementById("guess-result-screen") as HTMLElement;
        this.scoreDisplay = document.getElementById("score-display") as HTMLElement;
        this.progressBar = document.getElementById("progress-bar") as HTMLElement;
        this.progressNumber = document.getElementById("progress-number") as HTMLElement;
        this.surfaceBadge = document.getElementById("surface-badge") as HTMLElement;
        this.roomsBadge = document.getElementById("rooms-badge") as HTMLElement;
        this.gameContainer = document.querySelector(".game-container") as HTMLElement;
        this.formContainer = document.getElementById("form-container") as HTMLElement;

        this.listenToSettings();
    }

    private listenToSettings(): void {
        document.addEventListener('settingsChanged', ((event: CustomEvent) => {
            const { settings } = event.detail;

            const priceChanged =
                this.previousPriceSettings.minPrice !== settings.minPrice ||
                this.previousPriceSettings.maxPrice !== settings.maxPrice;

            if (priceChanged && this.currentRent) {
                this.reloadCurrentRound();
            }

            this.previousPriceSettings = {
                minPrice: settings.minPrice,
                maxPrice: settings.maxPrice
            };

            if (settings.numberOfRounds !== undefined && this.scrapper.getRentCount() === undefined) {
                this.maxRounds = settings.numberOfRounds;
                this.updateProgressBar();
            }
        }) as EventListener);
    }

    private async reloadCurrentRound() {
        this.guessInput.value = "";
        this.guessInput.disabled = false;
        this.submitButton.disabled = false;

        try {
            this.currentRent = await this.scrapper.getRandomRent();

            if (this.currentRent.error) {
                console.error(this.currentRent.error);
                await this.reloadCurrentRound();
                return;
            }

            this.throwNewRent(this.currentRent?.rent);

            this.carousel.createCarousel(this.currentRent.photos);
            this.map.createMap(this.currentRent.latitude, this.currentRent.longitude);
            this.updateUI();
        } catch (err) {
            console.error("Erreur:", err);
            await this.reloadCurrentRound();
        }
    }

    private updateProgressBar(): void {
        const progressPercent = ((this.currentRentIndex + 1) / this.maxRounds) * 100;
        this.progressBar.style.width = `${progressPercent}%`;
        this.progressNumber.textContent = `${this.currentRentIndex + 1}`;
        if (progressPercent === 100) {
            this.progressNumber.style.left = `auto`;
            this.progressNumber.style.right = `-25px`;
        } else {
            this.progressNumber.style.left = `calc(${progressPercent}% - 20px)`;
        }
    }

    public async start() {
        this.score = 0;
        this.currentRentIndex = 0;

        const newSubmitButton = this.submitButton.cloneNode(true) as HTMLButtonElement;
        this.submitButton.parentNode?.replaceChild(newSubmitButton, this.submitButton);
        this.submitButton = newSubmitButton;

        const newGuessInput = this.guessInput.cloneNode(true) as HTMLInputElement;
        this.guessInput.parentNode?.replaceChild(newGuessInput, this.guessInput);
        this.guessInput = newGuessInput;

        this.submitButton.addEventListener("click", () => this.handleGuess());
        this.guessInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.handleGuess();
        });

        await this.scrapper.initialize();

        const rentCount = this.scrapper.getRentCount();
        if (rentCount !== undefined) {
            this.maxRounds = rentCount;
            this.updateProgressBar();
        }

        await this.loadNextRound();
    }

    private throwNewRent(rent?: number) {
        const event = new CustomEvent("newRent", { detail: { rent } });
        document.dispatchEvent(event);
    }

    private async loadNextRound() {
        this.resultScreenContainer.innerHTML = "";
        this.resultScreenContainer.classList.remove("show");
        this.guessInput.value = "";
        this.guessInput.disabled = false;
        this.submitButton.disabled = false;
        this.gameContainer.style.display = "flex";
        this.formContainer.style.display = "flex";

        const gameHeader = document.querySelector(".game-header") as HTMLElement;
        if (gameHeader) gameHeader.style.display = "grid";

        if (this.currentRentIndex >= this.maxRounds) {
            this.displayGameOver();
            return;
        }

        try {
            this.currentRent = await this.scrapper.getRandomRent();

            if (this.currentRent.error) {
                console.error(this.currentRent.error);
                await this.loadNextRound();
                return;
            }

            this.throwNewRent(this.currentRent?.rent);

            this.carousel.createCarousel(this.currentRent.photos);
            this.map.createMap(this.currentRent.latitude, this.currentRent.longitude);
            this.updateUI();
        } catch (err) {
            console.error("Erreur:", err);
            await this.loadNextRound();
        }
    }

    private updateUI() {
        this.scoreDisplay.textContent = `${this.score} Pts`;
        this.updateProgressBar();
        this.surfaceBadge.textContent = `${this.currentRent.surface || "?"}m²`;
        this.roomsBadge.textContent = `${this.currentRent.rooms || "?"} pièces`;
    }

    private handleGuess() {
        const guess = parseFloat(this.guessInput.value);

        if (isNaN(guess) || guess < 0) {
            alert("Veuillez entrer un nombre valide");
            return;
        }

        const realRent = this.currentRent.rent;
        const difference = Math.abs(guess - realRent);
        const percentageDifference = (difference / realRent) * 100;

        let roundScore = Math.max(0, 10000 - percentageDifference * 100);
        roundScore = Math.round(roundScore);

        this.score += roundScore;

        this.displayResult(guess, realRent, roundScore, percentageDifference);

        this.guessInput.disabled = true;
        this.submitButton.disabled = true;
    }

    private displayResult(
        guess: number,
        realRent: number,
        roundScore: number,
        percentageDifference: number
    ) {
        const resultClass = percentageDifference < 10 ? "excellent" : percentageDifference < 30 ? "good" : "bad";

        let resultTitle = "Bof :(";
        if (percentageDifference < 10) {
            resultTitle = "Super !";
        } else if (percentageDifference < 30) {
            resultTitle = "Pas mal...";
        }

        this.gameContainer.style.display = "none";
        this.formContainer.style.display = "none";
        const gameHeader = document.querySelector(".game-header") as HTMLElement;
        if (gameHeader) gameHeader.style.display = "none";

        this.resultScreenContainer.innerHTML = `
            <div class="fullscreen-result ${resultClass}">
                <h1 class="result-title">${resultTitle}</h1>
                <div class="result-cards">
                    <div class="result-card">
                        <div class="result-card-label">Ton guess</div>
                        <div class="result-card-value">${guess}€</div>
                    </div>
                    <div class="result-card">
                        <div class="result-card-label">Différence</div>
                        <div class="result-card-value">${Math.round(percentageDifference)}%</div>
                    </div>
                    <div class="result-card">
                        <div class="result-card-label">Vrai prix</div>
                        <div class="result-card-value">${realRent}€</div>
                    </div>
                </div>
                <div class="result-points">+ ${roundScore} pts</div>
                <button id="next-round-btn" class="next-btn">Continuer</button>
            </div>
        `;

        this.resultScreenContainer.classList.add("show");

        const nextBtn = document.getElementById("next-round-btn") as HTMLButtonElement;
        nextBtn.addEventListener("click", () => {
            this.currentRentIndex++;
            this.loadNextRound();
        });
    }

    private displayGameOver() {
        this.gameContainer.style.display = "none";
        this.formContainer.style.display = "none";

        const gameHeader = document.querySelector(".game-header") as HTMLElement;
        if (gameHeader) gameHeader.style.display = "none";

        const maxPossiblePoints = this.maxRounds * 10000;

        this.resultScreenContainer.innerHTML = `
            <div class="fullscreen-result game-over">
                <h1 class="result-title">Partie terminée !</h1>
                <div class="final-stats">
                    <p class="final-score">${this.score}</p>
                    <p class="stats-label">Points au total (sur ${maxPossiblePoints})</p>
                </div>
                <div class="share-buttons">
                    <button id="share-twitter-btn" class="share-btn twitter">Partager sur Twitter</button>
                    <button id="share-image-btn" class="share-btn instagram">Image de résultat</button>
                </div>
                <button id="restart-btn" class="next-btn">${this.isPlaylistMode ? 'Retour aux playlists' : 'Rejouer'}</button>
            </div>
        `;

        this.resultScreenContainer.classList.add("show");

        const shareTwitterBtn = document.getElementById("share-twitter-btn") as HTMLButtonElement;
        shareTwitterBtn.addEventListener("click", () => {
            shareOnTwitter(this.score, maxPossiblePoints);
        });

        const shareImageBtn = document.getElementById("share-image-btn") as HTMLButtonElement;
        shareImageBtn.addEventListener("click", () => {
            shareResult(this.score, maxPossiblePoints);
        });

        const restartBtn = document.getElementById("restart-btn") as HTMLButtonElement;
        restartBtn.addEventListener("click", () => {
            if (this.isPlaylistMode) {
                window.location.hash = "#playlists";
            } else {
                this.start();
            }
        });
    }
}
