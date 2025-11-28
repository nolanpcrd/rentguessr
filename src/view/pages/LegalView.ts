import Router from "../../utils/Router.ts";

export default class LegalView {
    private container: HTMLElement;
    private router: Router;

    constructor() {
        this.container = document.createElement("div");
        this.container.id = "legal-view";
        this.router = Router.getInstance();
    }

    public render(parent: HTMLElement): void {
        this.container.innerHTML = `
            <div class="legal-page-container">
                <h2>CGU & Mentions Légales</h2>
                
                <div class="legal-section">
                    <h3>Conditions Générales d'Utilisation</h3>
                    <div class="legal-content">
                        <h4>1. Présentation du service</h4>
                        <p>Rentguessr est un jeu en ligne qui permet aux utilisateurs de deviner le prix de biens immobiliers. Le service est fourni gratuitement.</p>
                        
                        <h4>2. Utilisation du service</h4>
                        <p>En utilisant ce service, vous acceptez de respecter les présentes conditions d'utilisation. Vous vous engagez à ne pas utiliser le service de manière abusive ou contraire à la loi.</p>
                        
                        <h4>3. Propriété intellectuelle</h4>
                        <p>Tous les contenus présents sur le site (textes, images, graphismes, logo, etc.) sont la propriété de Rentguessr. Cependant, les photos et informations concernant les appartements appartiennent à leurs propriétaires respectifs et sont utilisées ici uniquement à des fins ludiques.</p>
                        
                        <h4>4. Données personnelles</h4>
                        <p>Les données personnelles collectées sont utilisées uniquement dans le cadre du bon fonctionnement du service. Elles ne sont pas vendues ni partagées avec des tiers. Nous stockons les informations de compte suivantes : adresse email, mot de passe (haché) et nom d'utilisateur.</p>
                        
                        <h4>5. Limitation de responsabilité</h4>
                        <p>Rentguessr ne peut être tenu responsable des erreurs, interruptions ou dysfonctionnements du service. Le service est fourni "tel quel".</p>
                    </div>
                </div>

                <div class="legal-section">
                    <h3>Mentions Légales</h3>
                    <div class="legal-content">
                        <h4>Éditeur du site</h4>
                        <p>Site web : rentguessr.fun</p>
                        
                        <h4>Hébergement</h4>
                        <p>Ce site est hébergé par Vercel Inc.<br>
                        340 S Lemon Ave #4133<br>
                        Walnut, CA 91789, USA</p>
                        
                        <h4>Contact</h4>
                        <p>Pour toute question concernant le site ou ces mentions légales, vous pouvez nous contacter via nolan.picard39@gmail.com.</p>
                    </div>
                </div>
            </div>
        `;

        parent.appendChild(this.container);
        this.attachEvents();
    }

    private attachEvents(): void {
        const backBtn = this.container.querySelector("#back-btn") as HTMLButtonElement;

        backBtn.addEventListener("click", () => {
            this.router.navigate("#game");
        });
    }
}
