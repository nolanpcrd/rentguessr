export default class CreateCarousel {
    private container: HTMLElement;
    private currentIndex: number = 0;
    private images: string[] = [];

    private zoomLevel: number = 1;
    private panX: number = 0;
    private panY: number = 0;
    private isPanning: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private minZoom: number = 1;
    private maxZoom: number = 4;
    private zoomStep: number = 0.1;

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

        const imagesContainer = this.container.querySelector('.carousel-images') as HTMLElement;
        if (imagesContainer) {
            imagesContainer.addEventListener('wheel', (e) => this.handleWheel(e));

            imagesContainer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            imagesContainer.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            imagesContainer.addEventListener('mouseup', () => this.handleMouseUp());
            imagesContainer.addEventListener('mouseleave', () => this.handleMouseUp());
        }
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

        this.resetZoom();
    }

    private handleWheel(e: WheelEvent): void {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));

        if (newZoom !== this.zoomLevel) {
            this.zoomLevel = newZoom;

            if (this.zoomLevel === this.minZoom) {
                this.panX = 0;
                this.panY = 0;
            }

            this.applyZoom();
        }
    }

    private handleMouseDown(e: MouseEvent): void {
        if (this.zoomLevel > 1) {
            this.isPanning = true;
            this.startX = e.clientX - this.panX;
            this.startY = e.clientY - this.panY;

            const imagesContainer = this.container.querySelector('.carousel-images') as HTMLElement;
            if (imagesContainer) {
                imagesContainer.style.cursor = 'grabbing';
            }
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        if (this.isPanning) {
            e.preventDefault();
            this.panX = e.clientX - this.startX;
            this.panY = e.clientY - this.startY;
            this.applyZoom();
        } else if (this.zoomLevel > 1) {
            const imagesContainer = this.container.querySelector('.carousel-images') as HTMLElement;
            if (imagesContainer) {
                imagesContainer.style.cursor = 'grab';
            }
        }
    }

    private handleMouseUp(): void {
        this.isPanning = false;

        const imagesContainer = this.container.querySelector('.carousel-images') as HTMLElement;
        if (imagesContainer && this.zoomLevel > 1) {
            imagesContainer.style.cursor = 'grab';
        } else if (imagesContainer) {
            imagesContainer.style.cursor = 'default';
        }
    }

    private applyZoom(): void {
        const activeItem = this.container.querySelector('.carousel-item.active') as HTMLElement;
        if (activeItem) {
            activeItem.style.transform = `scale(${this.zoomLevel}) translate(${this.panX / this.zoomLevel}px, ${this.panY / this.zoomLevel}px)`;
            activeItem.style.transition = this.isPanning ? 'none' : 'transform 0.2s ease-out';
        }

        const imagesContainer = this.container.querySelector('.carousel-images') as HTMLElement;
        if (imagesContainer) {
            imagesContainer.style.overflow = this.zoomLevel > 1 ? 'hidden' : 'hidden';
        }
    }

    private resetZoom(): void {
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.isPanning = false;
        this.applyZoom();
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
