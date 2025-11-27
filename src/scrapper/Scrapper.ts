export default class Scrapper {
    private baseUrlTemplate: string;
    private maxRents: number;
    private maxRentsFilter: number;
    private filters: any;

    constructor() {
        this.maxRents = 2200;
        this.maxRentsFilter = 2200;
        this.baseUrlTemplate =
            "https://www.bienici.com/realEstateAds.json?filters={{FILTERS}}&extensionType=extendedIfNoResult&enableGoogleStructuredDataAggregates=true&leadingCount=1";

        this.filters = {
            size: 1,
            showAllModels: false,
            filterType: "rent",
            propertyType: ["flat"],
            sortBy: "relevance",
            sortOrder: "desc",
            onTheMarket: [true],
        };

        this.listenToSettings();
    }

    public async initialize(): Promise<void> {
        await this.updateMaxRentsFilter();
    }

    private listenToSettings(): void {
        document.addEventListener('settingsChanged', ((event: CustomEvent) => {
            const { settings } = event.detail;
            void this.updateFiltersFromSettings(settings);
        }) as EventListener);
    }

    private async updateFiltersFromSettings(settings: any): Promise<void> {
        if (settings.minPrice !== undefined && settings.maxPrice !== undefined) {
            this.filters.minPrice = settings.minPrice;
            this.filters.maxPrice = settings.maxPrice;
        } else {
            delete this.filters.minPrice;
            delete this.filters.maxPrice;
        }

        await this.updateMaxRentsFilter();
    }

    private async updateMaxRentsFilter(): Promise<void> {
        const url = this.getUrl(0);

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.total !== undefined) {
                this.maxRentsFilter = Math.min(data.total, this.maxRents);
            } else {
                this.maxRentsFilter = this.maxRents;
            }
        } catch (err) {
            console.error("Erreur lors de la récupération du total:", err);
            this.maxRentsFilter = this.maxRents;
        }
    }

    private buildFilters(from: number): string {
        const filtersWithFrom: any = {
            ...this.filters,
            from,
        };
        return encodeURIComponent(JSON.stringify(filtersWithFrom));
    }

    public getUrl(from: number): string {
        const encoded = this.buildFilters(from);
        return this.baseUrlTemplate.replace("{{FILTERS}}", encoded);
    }

    private throwNewRoundEvent() {
        const event = new CustomEvent("newRound");
        document.dispatchEvent(event);
    }

    async getRandomRent() {
        this.throwNewRoundEvent();
        const from = Math.floor(Math.random() * this.maxRentsFilter);
        const url = this.getUrl(from);

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
