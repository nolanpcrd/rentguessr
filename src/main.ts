import Game from "./game/Game.ts";
import SettingsManager from "./view/SettingsManager.ts";

const settingsManager = new SettingsManager();

const game = new Game();

settingsManager.initializeSettings();

game.start();
