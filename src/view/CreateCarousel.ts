export default class CreateCarousel {
    private container: HTMLElement;
    private currentIndex: number = 0;
    private images: string[] = [];

    public constructor() {
        this.container = document.getElementById("carousel-container") as HTMLElement;
    }

    public createCarousel(images: string[]): void {
        this.images = images;
        this.currentIndex = 0;
        this.renderCarousel();
        this.attachEventListeners();
    }

    private renderCarousel(): void {
        this.container.innerHTML = '';
        this.container.classList.add('carousel-wrapper');

        const carouselDiv = document.createElement('div');
        carouselDiv.classList.add('carousel');

        const imagesContainer = document.createElement('div');
        imagesContainer.classList.add('carousel-images');

        this.images.forEach((image, index) => {
            const imageElement = document.createElement('div');
            imageElement.classList.add('carousel-item');
            if (index === this.currentIndex) {
                imageElement.classList.add('active');
            }
            imageElement.style.backgroundImage = `url('${image}')`;
            imagesContainer.appendChild(imageElement);
        });

        carouselDiv.appendChild(imagesContainer);

        const navButtons = document.createElement('div');
        navButtons.classList.add('carousel-nav');

        const prevButton = document.createElement('button');
        prevButton.classList.add('carousel-btn', 'carousel-btn-prev');
        prevButton.innerHTML = '&#10094;';
        prevButton.setAttribute('aria-label', 'Image précédente');

        const nextButton = document.createElement('button');
        nextButton.classList.add('carousel-btn', 'carousel-btn-next');
        nextButton.innerHTML = '&#10095;';
        nextButton.setAttribute('aria-label', 'Image suivante');

        navButtons.appendChild(prevButton);
        navButtons.appendChild(nextButton);
        carouselDiv.appendChild(navButtons);

        const indicators = document.createElement('div');
        indicators.classList.add('carousel-indicators');

        this.images.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('carousel-dot');
            if (index === this.currentIndex) {
                dot.classList.add('active');
            }
            dot.setAttribute('data-index', index.toString());
            indicators.appendChild(dot);
        });

        carouselDiv.appendChild(indicators);
        this.container.appendChild(carouselDiv);
    }

    private attachEventListeners(): void {
        const prevButton = this.container.querySelector('.carousel-btn-prev') as HTMLElement;
        const nextButton = this.container.querySelector('.carousel-btn-next') as HTMLElement;
        const dots = this.container.querySelectorAll('.carousel-dot') as NodeListOf<HTMLElement>;

        prevButton?.addEventListener('click', () => this.previousSlide());
        nextButton?.addEventListener('click', () => this.nextSlide());

        dots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
                this.goToSlide(index);
            });
        });
    }

    public nextSlide(): void {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateCarousel();
    }

    public previousSlide(): void {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateCarousel();
    }

    public goToSlide(index: number): void {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.updateCarousel();
        }
    }

    private updateCarousel(): void {
        const items = this.container.querySelectorAll('.carousel-item') as NodeListOf<HTMLElement>;
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentIndex);
        });

        const dots = this.container.querySelectorAll('.carousel-dot') as NodeListOf<HTMLElement>;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    public destroy(): void {
        this.container.innerHTML = '';
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public getTotalImages(): number {
        return this.images.length;
    }
}
