export default class CreateMessagePopup {
    private popupContainer: HTMLDivElement | null = null;

    constructor() {
        this.createPopupStructure();
    }

    private createPopupStructure(): void {
        this.popupContainer = document.createElement('div');
        this.popupContainer.className = 'message-popup-container';
        this.popupContainer.style.display = 'none';
        document.body.appendChild(this.popupContainer);
    }

    public showMessage(message: string): void {
        if (!this.popupContainer) return;
        message = message.replace("_", " ");

        this.popupContainer.innerHTML = `
            <div class="message-popup">
                <div class="message-popup-content">
                    Nolan : ${message}
                </div>
            </div>
        `;

        this.popupContainer.style.display = 'flex';

        setTimeout(() => {
            this.hideMessage();
        }, 5000);
    }

    private hideMessage(): void {
        if (this.popupContainer) {
            this.popupContainer.style.display = 'none';
        }
    }
}
