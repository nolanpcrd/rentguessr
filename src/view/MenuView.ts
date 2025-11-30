import Router from "../utils/Router.ts";
import AuthService from "../WebService/AuthService.ts";

export default class MenuView {
    private container: HTMLElement;
    private router: Router;
    private authService: AuthService;
    private isOpen: boolean = false;

    constructor() {
        this.container = document.createElement("div");
        this.container.id = "main-menu-container";
        this.router = Router.getInstance();
        this.authService = AuthService.getInstance();
    }

    public render(parent: HTMLElement): void {
        this.container.innerHTML = `
            <button id="menu-toggle-btn">MENU</button>
            <div id="menu-overlay">
                <div class="menu-content">
                    <button id="menu-close-btn">FERMER</button>
                    <nav class="menu-links">
                        <a href="#" data-route="#game">JOUER</a>
                        <a href="#" data-route="#battle-royale">BATTLE ROYALE</a>
                        <a href="#" data-route="#playlists/me">MES PLAYLISTS</a>
                        <a href="#" data-route="#playlists">PARCOURIR PLAYLISTS</a>
                        <a href="#" data-route="#legal">CGU & MENTIONS LÉGALES</a>
                        <a href="#" data-route="#settings">PARAMÈTRES</a>
                        <a href="#" id="logout-btn">DÉCONNEXION</a>
                        <a href="#" id="login-btn">CONNEXION</a>
                    </nav>
                </div>
                <div class="credits">
                    <p>Jeu par : nolanpcrd</p>
                    <p>Musique & conseils UX par : minhui</p>
                    <a href="https://paypal.me/nolanpcrd" style="color: white">Ptit lien vers le paypal car les serveurs vont couter cheeer :')</a>
                </div>
            </div>
</div>
        `;

        parent.appendChild(this.container);
        this.attachEvents();
    }

    private attachEvents(): void {
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Escape" && this.isOpen) {
                this.isOpen = false;
                const overlay = this.container.querySelector("#menu-overlay") as HTMLElement;
                overlay.classList.remove("open");
            } else if (event.key === "Escape" && !this.isOpen) {
                this.isOpen = true;
                this.updateMenuState();
                const overlay = this.container.querySelector("#menu-overlay") as HTMLElement;
                overlay.classList.add("open");
            }
        })
        const toggleBtn = this.container.querySelector("#menu-toggle-btn") as HTMLButtonElement;
        const closeBtn = this.container.querySelector("#menu-close-btn") as HTMLButtonElement;
        const overlay = this.container.querySelector("#menu-overlay") as HTMLElement;
        const logoutBtn = this.container.querySelector("#logout-btn") as HTMLElement;
        const links = this.container.querySelectorAll(".menu-links a[data-route]");

        const loginBtn = this.container.querySelector("#login-btn") as HTMLElement;

        const toggleMenu = () => {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.updateMenuState();
            }
            overlay.classList.toggle("open", this.isOpen);
        };

        toggleBtn.addEventListener("click", toggleMenu);
        closeBtn.addEventListener("click", toggleMenu);

        links.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const route = (e.target as HTMLElement).getAttribute("data-route");
                if (route) {
                    if (window.location.hash === route) {
                        window.location.hash = "";
                        setTimeout(() => {
                            this.router.navigate(route);
                            toggleMenu();
                        }, 0);
                    } else {
                        this.router.navigate(route);
                        toggleMenu();
                    }
                }
            });
        });

        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await this.authService.logout();
            this.router.navigate("#login");
            toggleMenu();
        });

        loginBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            this.router.navigate("#login");
            toggleMenu();
        });
    }

    private updateMenuState(): void {
        const isAuthenticated = this.authService.isAuthenticated();
        const myPlaylistsLink = this.container.querySelector('a[data-route="#playlists/me"]') as HTMLElement;
        const brLink = this.container.querySelector('a[data-route="#battle-royale"]') as HTMLElement;
        const logoutBtn = this.container.querySelector('#logout-btn') as HTMLElement;
        const loginBtn = this.container.querySelector('#login-btn') as HTMLElement;

        if (myPlaylistsLink) {
            myPlaylistsLink.style.display = isAuthenticated ? "block" : "none";
        }

        if (brLink) {
            brLink.style.display = isAuthenticated ? "block" : "none";
        }

        if (logoutBtn) {
            logoutBtn.style.display = isAuthenticated ? "block" : "none";
        }

        if (loginBtn) {
            loginBtn.style.display = isAuthenticated ? "none" : "block";
        }
    }

    public setVisible(visible: boolean): void {
        this.container.style.display = visible ? "block" : "none";
    }
}
