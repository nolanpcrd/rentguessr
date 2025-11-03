export default class CreateMap {
    private mapContainer: HTMLElement;

    public constructor() {
        this.mapContainer = document.getElementById("map-container") as HTMLElement;
    }

    public createMap(latitude: number, longitude: number): void {
        this.mapContainer.innerHTML = '';
        const mapIframe = document.createElement('iframe');
        mapIframe.width = '100%';
        mapIframe.height = '100%';
        mapIframe.style.border = 'none';
        mapIframe.style.borderRadius = '12px';
        mapIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;
        this.mapContainer.appendChild(mapIframe);
    }
}
