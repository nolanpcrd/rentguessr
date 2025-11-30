export type RouteHandler = (...args: any[]) => void;

export default class Router {
    private static instance: Router;
    private routes: Map<RegExp, RouteHandler> = new Map();

    private constructor() {
        window.addEventListener("hashchange", () => this.handleRoute());
        window.addEventListener("load", () => this.handleRoute());
    }

    public static getInstance(): Router {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return Router.instance;
    }

    public addRoute(pattern: string, handler: RouteHandler): void {
        const regexPattern = new RegExp("^" + pattern.replace(/:[^\s/]+/g, "([^/]+)") + "$");
        this.routes.set(regexPattern, handler);
    }

    public navigate(hash: string): void {
        window.location.hash = hash;
    }

    private handleRoute(): void {
        const newHash = window.location.hash || "#/";

        for (const [regex, handler] of this.routes) {
            const match = newHash.match(regex);
            if (match) {
                const params = match.slice(1);
                (handler as any)(...params);
                return;
            }
        }

        if (newHash !== "#/") {
            this.navigate("#/");
        } else {
            this.navigate("#game");
        }
    }
}
