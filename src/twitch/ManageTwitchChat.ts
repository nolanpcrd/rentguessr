import Mean from "./Mean.ts";

export default class ManageTwitchChat {
    private ws: WebSocket | null;
    private channel: string;
    private mean :Mean;

    constructor(channel : string) {
        this.ws = null;
        this.channel = channel;
        this.connect();
        this.mean = new Mean();
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
                this.mean.addNumber(value);
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
