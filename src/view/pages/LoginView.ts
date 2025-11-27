import AuthService from "../../WebService/AuthService.ts";
import Router from "../../utils/Router.ts";

export default class LoginView {
    private container: HTMLElement;
    private authService: AuthService;
    private router: Router;

    constructor() {
        this.container = document.createElement("div");
        this.container.id = "login-view";
        this.authService = AuthService.getInstance();
        this.router = Router.getInstance();
    }

    public render(parent: HTMLElement): void {
        this.container.innerHTML = `
            <div class="form-container">
                <div class="toggle">
                    <div class="toggle-btn"></div>
                    <div id="signIn">Se connecter</div>
                    <div id="signUp">Créer un compte</div>
                </div>
                <form id="auth-form">
                    <label for="username" id="usernameLabel">Nom d'utilisateur :</label>
                    <input type="text" id="username" name="username" placeholder="Ton pseudo..." required>
                    <label for="email">Email :</label>
                    <input type="email" id="email" name="email" placeholder="tonmail@mail.com" required>
                    <label for="password">Mot de passe :</label>
                    <input type="password" id="password" name="password" placeholder="MotDePasse123" required>
                    <button type="submit" id="submitBtn">Se connecter</button>
                </form>
            </div>
        `;

        parent.appendChild(this.container);
        this.attachEvents();
    }

    private attachEvents(): void {
        const form = this.container.querySelector("#auth-form") as HTMLFormElement;
        const signInBtn = this.container.querySelector("#signIn") as HTMLElement;
        const signUpBtn = this.container.querySelector("#signUp") as HTMLElement;
        const toggleBtn = this.container.querySelector(".toggle-btn") as HTMLElement;
        const submitBtn = this.container.querySelector("#submitBtn") as HTMLButtonElement;
        const formContainer = this.container.querySelector(".form-container") as HTMLElement;
        const usernameInput = this.container.querySelector("#username") as HTMLElement;
        const usernameLabel = this.container.querySelector("#usernameLabel") as HTMLElement;

        let isLoginMode = true;

        usernameInput.style.display = 'none';
        usernameLabel.style.display = 'none';
        (usernameInput as HTMLInputElement).required = false;

        signInBtn.addEventListener('click', () => {
            isLoginMode = true;
            toggleBtn.style.left = '0';
            submitBtn.innerText = "Se connecter";
            signInBtn.style.color = '#fff';
            signUpBtn.style.color = '#000';
            formContainer.style.backgroundColor = '#fff';
            toggleBtn.style.backgroundColor = '#058CD7';
            submitBtn.style.backgroundColor = '#058CD7';

            usernameInput.style.display = 'none';
            usernameLabel.style.display = 'none';
            (usernameInput as HTMLInputElement).required = false;
        });

        signUpBtn.addEventListener('click', () => {
            isLoginMode = false;
            toggleBtn.style.left = '50%';
            submitBtn.innerText = "S'inscrire";
            signUpBtn.style.color = '#fff';
            signInBtn.style.color = '#000';
            formContainer.style.backgroundColor = '#fff';
            toggleBtn.style.backgroundColor = '#FD5A46';
            submitBtn.style.backgroundColor = '#FD5A46';

            usernameInput.style.display = 'block';
            usernameLabel.style.display = 'block';
            (usernameInput as HTMLInputElement).required = true;
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = (this.container.querySelector("#email") as HTMLInputElement).value;
            const password = (this.container.querySelector("#password") as HTMLInputElement).value;

            try {
                if (isLoginMode) {
                    await this.authService.login(email, password);
                } else {
                    const username = (this.container.querySelector("#username") as HTMLInputElement).value;
                    await this.authService.register(username, email, password);
                }
                this.router.navigate("#game");
            } catch (error: any) {
                alert(error.message);
            }
        });
    }
}
