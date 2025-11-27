import Router from "./utils/Router.ts";
import AuthService from "./WebService/AuthService.ts";
import LoginView from "./view/pages/LoginView.ts";
import GameView from "./view/pages/GameView.ts";

import PlaylistListView from "./view/pages/PlaylistListView.ts";
import PlaylistEditView from "./view/pages/PlaylistEditView.ts";
import PlaylistBrowserView from "./view/pages/PlaylistBrowserView.ts";
import SettingsView from "./view/pages/SettingsView.ts";
import TwitchService from "./WebService/TwitchService.ts";
import MenuView from "./view/MenuView.ts";

const router = Router.getInstance();
const authService = AuthService.getInstance();
TwitchService.getInstance();
const appContainer = document.getElementById("app") as HTMLElement;

appContainer.innerHTML = `
    <div id="nav-container"></div>
    <div id="main-content"></div>
`;
const navContainer = document.getElementById("nav-container") as HTMLElement;
const contentContainer = document.getElementById("main-content") as HTMLElement;

const menuView = new MenuView();
menuView.render(navContainer);

const loginView = new LoginView();
const gameView = new GameView();
const playlistListView = new PlaylistListView();
const playlistEditView = new PlaylistEditView();
const playlistBrowserView = new PlaylistBrowserView();
const settingsView = new SettingsView();

router.addRoute("/", () => {
    router.navigate("#game");
});

router.addRoute("#login", () => {
    contentContainer.innerHTML = "";
    menuView.setVisible(false);
    loginView.render(contentContainer);
    menuView.setVisible(true);
});

router.addRoute("#game", () => {
    contentContainer.innerHTML = "";
    menuView.setVisible(true);
    gameView.render(contentContainer);
});

router.addRoute("#game/playlist/:id", (id: string) => {
    contentContainer.innerHTML = "";
    menuView.setVisible(true);
    gameView.render(contentContainer, id);
});

router.addRoute("#playlists/me", () => {
    if (!authService.isAuthenticated()) {
        router.navigate("#login");
        return;
    }
    contentContainer.innerHTML = "";
    menuView.setVisible(true);
    playlistListView.render(contentContainer);
});

router.addRoute("#playlists/create", () => {
    if (!authService.isAuthenticated()) {
        router.navigate("#login");
        return;
    }
    contentContainer.innerHTML = "";
    menuView.setVisible(true);
    playlistEditView.render(contentContainer);
});

router.addRoute("#playlists/edit/:id", (id: string) => {
    if (!authService.isAuthenticated()) {
        router.navigate("#login");
        return;
    }
    contentContainer.innerHTML = "";
    menuView.setVisible(true);
    playlistEditView.render(contentContainer, parseInt(id));
});

router.addRoute("#playlists", () => {
    contentContainer.innerHTML = "";
    menuView.setVisible(true);
    playlistBrowserView.render(contentContainer);
});

router.addRoute("#settings", () => {
    contentContainer.innerHTML = "";
    menuView.setVisible(true);
    settingsView.render(contentContainer);
});


if (document.readyState === "complete" || document.readyState === "interactive") {
    if (!window.location.hash) {
        router.navigate("#/");
    } else {
        router.navigate(window.location.hash);
    }
}
