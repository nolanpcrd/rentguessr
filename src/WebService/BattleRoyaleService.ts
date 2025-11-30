import AuthService from "./AuthService.ts";

export default class BattleRoyaleService {
    private static instance: BattleRoyaleService;
    private socket: WebSocket | null = null;
    private url: string = "https://hurt-trista-nolanpcrd-projects-610b0003.koyeb.app/";
    private listeners: Map<string, Function[]> = new Map();

    private constructor() { }

    public static getInstance(): BattleRoyaleService {
        if (!BattleRoyaleService.instance) {
            BattleRoyaleService.instance = new BattleRoyaleService();
        }
        return BattleRoyaleService.instance;
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => {
                resolve();
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.dispatch(data.type, data);
                } catch (e) {
                    console.error("Error parsing WebSocket message:", e);
                }
            };

            this.socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                this.dispatch("br_connection_error", { message: "Erreur de connexion au serveur." });
                reject(error);
            };

            this.socket.onclose = () => {
                this.socket = null;
                this.dispatch("br_connection_error", { message: "La connexion au serveur a été perdue." });
            };
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.listeners.clear();
    }

    public joinLobby(code?: string): void {
        const token = AuthService.getInstance().getToken();
        const message: any = {
            type: "join_br",
            token: token
        };
        if (code) {
            message.code = code;
        }
        this.send(message);
    }

    public createPrivateLobby(roundDuration?: number): void {
        const token = AuthService.getInstance().getToken();
        const payload: any = {
            type: "create_private_br",
            token: token
        };
        if (roundDuration) {
            payload.roundDuration = roundDuration;
        }
        this.send(payload);
    }

    public sendGuess(guess: number): void {
        this.send({
            type: "guess_br",
            guess: guess
        });
    }

    private send(data: any): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error("WebSocket is not connected");
        }
    }

    public on(eventType: string, callback: Function): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)?.push(callback);
    }

    public off(eventType: string, callback: Function): void {
        if (!this.listeners.has(eventType)) return;
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            this.listeners.set(eventType, callbacks.filter(cb => cb !== callback));
        }
    }

    private dispatch(eventType: string, data: any): void {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
}
