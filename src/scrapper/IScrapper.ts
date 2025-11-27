export default interface IScrapper {
    initialize(): Promise<void> | void;
    getRandomRent(): Promise<any>;
    getRentCount(): number | undefined;
}
