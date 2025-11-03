export default class Scrapper {
    private baseUrlPart1: string;
    private baseUrlPart2: string;
    private maxPages: number;

    constructor() {
        this.baseUrlPart1 = "https://www.bienici.com/realEstateAds.json?filters=%7B%22size%22%3A24%2C%22from%22%3A2256%2C%22showAllModels%22%3Afalse%2C%22filterType%22%3A%22rent%22%2C%22propertyType%22%3A%5B%22flat%22%5D%2C%22page%22%3A";
        this.baseUrlPart2 = "%2C%22sortBy%22%3A%22relevance%22%2C%22sortOrder%22%3A%22desc%22%2C%22onTheMarket%22%3A%5Btrue%5D%7D&extensionType=extendedIfNoResult&enableGoogleStructuredDataAggregates=true&leadingCount=1&access_token=wtNjWy5T0OB3ncDPixPSOvxmOJ5%2FTtNEY6%2FTpJRHfgE%3D%3A6907801121949100b4dea7b0&id=6907801121949100b4dea7b0";
        this.maxPages = 1200;
    }

    async getRandomRent() {
        const randomPage = Math.floor(Math.random() * this.maxPages) + 1;
        const url = `${this.baseUrlPart1}${randomPage}${this.baseUrlPart2}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            const ads = data.realEstateAds;
            if (!ads || ads.length === 0) {
                return { error: "Erreur pas d'annonce" };
            }

            const ad = ads[Math.floor(Math.random() * ads.length)];

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
