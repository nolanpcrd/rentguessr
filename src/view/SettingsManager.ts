interface Settings {
    minPrice?: number;
    maxPrice?: number;
    numberOfRounds: number;
}

export default class SettingsManager {
    private static readonly STORAGE_KEY = 'rentguessr_settings';
    private static readonly DEFAULT_SETTINGS: Settings = {
        numberOfRounds: 5,
        minPrice: undefined,
        maxPrice: undefined
    };

    private settings: Settings;
    private priceRangeInput: HTMLInputElement;
    private numberOfRoundsInput: HTMLInputElement;
    private resetButton: HTMLButtonElement;

    constructor() {
        this.priceRangeInput = document.getElementById('price-range') as HTMLInputElement;
        this.numberOfRoundsInput = document.getElementById('number-of-rounds') as HTMLInputElement;
        this.resetButton = document.getElementById('reset-settings') as HTMLButtonElement;

        this.settings = this.loadSettings();
        this.applySettingsToUI();
        this.addEvents();
    }

    public initializeSettings(): void {
        this.dispatchSettingsChangeEvent();
    }

    private loadSettings(): Settings {
        const stored = localStorage.getItem(SettingsManager.STORAGE_KEY);
        if (stored) {
            try {
                return { ...SettingsManager.DEFAULT_SETTINGS, ...JSON.parse(stored) };
            } catch (e) {
                return { ...SettingsManager.DEFAULT_SETTINGS };
            }
        }
        return { ...SettingsManager.DEFAULT_SETTINGS };
    }

    private saveSettings(): void {
        localStorage.setItem(SettingsManager.STORAGE_KEY, JSON.stringify(this.settings));
        this.dispatchSettingsChangeEvent();
    }

    private applySettingsToUI(): void {
        if (this.settings.minPrice !== undefined && this.settings.maxPrice !== undefined) {
            this.priceRangeInput.value = `${this.settings.minPrice}-${this.settings.maxPrice}`;
        } else {
            this.priceRangeInput.value = '';
        }
        this.numberOfRoundsInput.value = this.settings.numberOfRounds.toString();
    }

    private dispatchSettingsChangeEvent(): void {
        const event = new CustomEvent('settingsChanged', {
            detail: { settings: this.settings }
        });
        document.dispatchEvent(event);
    }

    private parsePriceRange(value: string): { minPrice?: number, maxPrice?: number } {
        const trimmed = value.trim();
        if (!trimmed) {
            return { minPrice: undefined, maxPrice: undefined };
        }

        const parts = trimmed.split('-');
        if (parts.length === 2) {
            const min = parseInt(parts[0].trim());
            const max = parseInt(parts[1].trim());
            if (!isNaN(min) && !isNaN(max)) {
                return { minPrice: min, maxPrice: max };
            }
        }
        return { minPrice: undefined, maxPrice: undefined };
    }

    private handlePriceRangeChange(): void {
        const { minPrice, maxPrice } = this.parsePriceRange(this.priceRangeInput.value);
        this.settings.minPrice = minPrice;
        this.settings.maxPrice = maxPrice;
        this.saveSettings();
    }

    private handleNumberOfRoundsChange(): void {
        const value = parseInt(this.numberOfRoundsInput.value);
        if (!isNaN(value) && value > 0) {
            this.settings.numberOfRounds = value;
            this.saveSettings();
        }
    }

    private resetSettings(): void {
        this.settings = { ...SettingsManager.DEFAULT_SETTINGS };
        this.saveSettings();
        this.applySettingsToUI();
    }

    private addEvents(): void {
        document.getElementById('close-settings')?.addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('settings-button')?.addEventListener('click', () => {
            this.openSettings();
        });

        this.priceRangeInput.addEventListener('blur', () => {
            this.handlePriceRangeChange();
        });

        this.priceRangeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handlePriceRangeChange();
            }
        });

        this.numberOfRoundsInput.addEventListener('change', () => {
            this.handleNumberOfRoundsChange();
        });

        this.resetButton.addEventListener('click', () => {
            this.resetSettings();
        });
    }

    public openSettings(): void {
        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.style.display = 'block';
        }
    }

    public closeSettings(): void {
        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.style.display = 'none';
        }
    }

    public getSettings(): Settings {
        return { ...this.settings };
    }
}
