import Mean from "./Mean.ts";
import  CreateMessagePopup from "../view/CreateMessagePopup.ts";

export default class ManageTwitchChat {
    private ws: WebSocket | null;
    private channel: string;
    private mean :Mean;
    private currentRent : number;
    private createMessagePopup: CreateMessagePopup;

    constructor(channel : string) {
        this.ws = null;
        this.channel = channel;
        this.connect();
        this.mean = new Mean();
        this.currentRent = 0;
        document.addEventListener("newRound", (event: any) => {
            const detail = event.detail;
            if (detail && detail.rent) {
                this.currentRent = detail.rent;
            }
        });
        this.createMessagePopup = new CreateMessagePopup();
    }
    public connect(): void {
        this.ws = new WebSocket(`https://hurt-trista-nolanpcrd-projects-610b0003.koyeb.app/`);
        this.ws.onopen = () => {
            this.sendMessage({
                type: "join",
                channel: this.channel
            });
        }
        this.ws.onmessage = (event: MessageEvent) => {
            const msg = JSON.parse(event.data);

            if(msg.type === "number") {
                const value = parseFloat(msg.number);
                if (isNaN(value)) {
                    return;
                }
                if (this.currentRent > 0) {
                    const lowerBound = this.currentRent * 0.5;
                    const upperBound = this.currentRent * 1.5;
                    if (value < lowerBound || value > upperBound) {
                        return;
                    }
                }
                this.mean.addNumber(value);
            } else if (msg.type === "admin_message") {
                this.createMessagePopup.showMessage(msg.message);
            }
        }
    }

    private sendMessage(msg : any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            msg = JSON.stringify(msg);
            this.ws.send(msg);
        }
    }
}
