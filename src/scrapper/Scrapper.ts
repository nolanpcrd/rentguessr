export default class Scrapper {
    private baseUrlTemplate: string;
    private maxRents: number;

    constructor() {
        this.maxRents = 2200;
        this.baseUrlTemplate = "https://www.bienici.com/realEstateAds.json?filters=%7B%22size%22%3A1%2C%22from%22%3A{{FROM}}%2C%22showAllModels%22%3Afalse%2C%22filterType%22%3A%22rent%22%2C%22propertyType%22%3A%5B%22flat%22%5D%2C%22sortBy%22%3A%22relevance%22%2C%22sortOrder%22%3A%22desc%22%2C%22onTheMarket%22%3A%5Btrue%5D%7D&extensionType=extendedIfNoResult&enableGoogleStructuredDataAggregates=true&leadingCount=1&access_token=wtNjWy5T0OB3ncDPixPSOvxmOJ5%2FTtNEY6%2FTpJRHfgE%3D%3A6907801121949100b4dea7b0&id=6907801121949100b4dea7b0";
    }

    private throwNewRoundEvent() {
        const event = new CustomEvent("newRound");
        document.dispatchEvent(event);
    }

    async getRandomRent() {
        this.throwNewRoundEvent();
        const from = Math.floor(Math.random() * this.maxRents);
        const url = this.baseUrlTemplate.replace("{{FROM}}", from.toString());

        try {
            const res = await fetch(url);
            const data = await res.json();

            const ads = data.realEstateAds;
            if (!ads || ads.length === 0) {
                return { error: "Erreur pas d'annonce" };
            }

            const ad = ads[0];

            return {
                rent: ad.price,
                photos: ad.photos.map((p: any) => p.url),
                rooms: ad.roomsQuantity,
                surface: ad.surfaceArea,
                latitude: ad.blurInfo.position.lat,
                longitude: ad.blurInfo.position.lon
            };
        } catch (err) {
            return { error: "Erreur récup annonces", details: err };
        }
    }
}
