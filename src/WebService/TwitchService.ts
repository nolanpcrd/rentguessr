import CreateMessagePopup from "../view/CreateMessagePopup.ts";

export default class TwitchService {
    private static instance: TwitchService;
    private ws: WebSocket | null = null;
    private channel: string | null = null;
    private isConnected: boolean = false;
    private createMessagePopup: CreateMessagePopup;
    private meanElement: HTMLElement | null = null;
    private meanValueElement: HTMLElement | null = null;
    private numbers: number[] = [];
    private currentRent: number = 0;

    private constructor() {
        this.createMessagePopup = new CreateMessagePopup();
        this.channel = localStorage.getItem("twitch_channel");
        const shouldConnect = localStorage.getItem("twitch_enabled") === "true";

        if (shouldConnect && this.channel) {
            this.connect(this.channel);
        }

        document.addEventListener("newRent", (event: any) => {
            this.currentRent = event.detail.rent;
            this.resetMean();
        });

        document.addEventListener("newRound", () => {
            this.resetMean();
        });

        setInterval(() => this.findDomElements(), 1000);
    }

    public static getInstance(): TwitchService {
        if (!TwitchService.instance) {
            TwitchService.instance = new TwitchService();
        }
        return TwitchService.instance;
    }

    public connect(channel: string): void {
        if (this.ws) {
            this.ws.close();
        }

        this.channel = channel;
        localStorage.setItem("twitch_channel", channel);
        localStorage.setItem("twitch_enabled", "true");
        this.isConnected = true;

        this.ws = new WebSocket(`https://hurt-trista-nolanpcrd-projects-610b0003.koyeb.app/`);

        this.ws.onopen = () => {
            console.log(`Connected to Twitch chat: ${channel}`);
            this.sendMessage({
                type: "join",
                channel: this.channel
            });
        };

        this.ws.onmessage = (event: MessageEvent) => {
            const msg = JSON.parse(event.data);

            if (msg.type === "number") {
                const value = parseFloat(msg.number);
                this.handleNumber(value);
            } else if (msg.type === "admin_message") {
                this.createMessagePopup.showMessage(msg.message);
            }
        };

        this.ws.onclose = () => {
            console.log("Twitch connection closed");
            if (this.isConnected) {
                setTimeout(() => this.connect(channel), 5000);
            }
        };
    }

    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
        }
        this.isConnected = false;
        localStorage.setItem("twitch_enabled", "false");
        this.ws = null;
    }

    public isEnabled(): boolean {
        return this.isConnected;
    }

    public getChannel(): string {
        return this.channel || "";
    }

    private sendMessage(msg: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        }
    }

    private handleNumber(value: number): void {
        if (isNaN(value)) return;

        if (this.currentRent > 0) {
            const lowerBound = this.currentRent * 0.5;
            const upperBound = this.currentRent * 1.5;
            if (value < lowerBound || value > upperBound) {
                return;
            }
        }

        this.numbers.push(value);
        this.updateMeanDisplay();
    }

    private resetMean(): void {
        this.numbers = [];
        this.updateMeanDisplay();
    }

    private updateMeanDisplay(): void {
        if (!this.meanValueElement) return;

        if (this.numbers.length === 0) {
            this.meanValueElement.textContent = "0";
            return;
        }

        const sum = this.numbers.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / this.numbers.length);
        this.meanValueElement.textContent = avg.toString();
    }

    private findDomElements(): void {
        const meanEl = document.getElementById("chat-mean");
        const meanValEl = document.getElementById("chat-mean-value");

        if (meanEl && meanValEl) {
            this.meanElement = meanEl;
            this.meanValueElement = meanValEl;
            if (this.isConnected) {
                this.meanElement.style.display = "block";
            } else {
                this.meanElement.style.display = "none";
            }
        } else {
            this.meanElement = null;
            this.meanValueElement = null;
        }
    }
}
