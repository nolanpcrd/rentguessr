import ManageTwitchChat from "./ManageTwitchChat.ts";

document.getElementById("load-twitch")?.addEventListener('click', async (event) => {
    event.preventDefault();
    const inputElement = document.getElementById("twitch-name") as HTMLInputElement;
    const name: string = inputElement?.value ?? "";
    new ManageTwitchChat(name);

    (document.getElementsByClassName("twitch-selector")[0] as HTMLElement).style.display = "none";
    (document.getElementsByClassName("twitch-selector-overlay")[0] as HTMLElement).style.display = "none";
});
