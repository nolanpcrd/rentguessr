export default class Mean {
    private numbersList : number[];
    public constructor() {
        this.numbersList = [];
        document.addEventListener("newRound", () => {
            this.reset();
        });
    }

    private updateMeanView(): void {
        const meanValue = this.getMean();
        const meanElement = document.getElementById("chat-mean-value");
        if (meanElement) {
            meanElement.textContent = meanValue.toFixed(2);
        }
    }

    public reset(): void {
        this.numbersList = [];
        this.updateMeanView();
    }

    public addNumber(num: number): void {
        this.numbersList.push(num);
        this.updateMeanView();
    }

    public getMean(): number {
        if (this.numbersList.length === 0) {
            return 0;
        }
        const sum = this.numbersList.reduce((acc, val) => acc + val, 0);
        return sum / this.numbersList.length;
    }
}
