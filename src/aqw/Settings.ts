import {Achievement} from "./Achievement";
import type Player from "../player/Player.ts";
import Users from "../world/Users.ts";

export default class Settings {
    
    public static readonly ANIMATION: string = "bWAnim";
    public static readonly CLOAK: string = "bCloak";
    public static readonly DUEL: string = "bDuel";
    public static readonly FBSHARE: string = "bFBShare";
    public static readonly FRIEND: string = "bFriend";
    public static readonly GOTO: string = "bGoto";
    public static readonly GUILD: string = "bGuild";
    public static readonly HELM: string = "bHelm";
    public static readonly MUSIC: string = "bMusicOn";
    public static readonly PARTY: string = "bParty";
    public static readonly PET: string = "bPet";
    public static readonly SOUND: string = "bSoundOn";
    public static readonly TOOLTIPS: string = "bTT";
    public static readonly WHISPER: string = "bWhisper";
    public static readonly DUEL_MESSAGE_OFF: string = "Ignoring duel invites.";
    public static readonly DUEL_MESSAGE_ON: string = "Accepting duel invites.";
    public static readonly FRIEND_MESSAGE_OFF: string = "Ignoring Friend requests.";
    public static readonly FRIEND_MESSAGE_ON: string = "Accepting Friend requests.";
    public static readonly GOTO_MESSAGE_OFF: string = "Blocking goto requests.";
    public static readonly GOTO_MESSAGE_ON: string = "Accepting goto requests.";
    public static readonly GUILD_MESSAGE_OFF: string = "Ignoring guild invites.";
    public static readonly GUILD_MESSAGE_ON: string = "Accepting guild invites.";
    public static readonly PARTY_MESSAGE_OFF: string = "Ignoring party invites.";
    public static readonly PARTY_MESSAGE_ON: string = "Accepting party invites.";
    public static readonly TOOLTIPS_MESSAGE_OFF: string = "Ability ToolTips will not show on mouseover during combat.";
    public static readonly TOOLTIPS_MESSAGE_ON: string = "Ability ToolTips will always show on mouseover.";
    public static readonly WHISPER_MESSAGE_OFF: string = "Ignoring PMs.";
    public static readonly WHISPER_MESSAGE_ON: string = "Accepting PMs.";

    public static isAllowed(pref: string, player: Player, target: Player): boolean {
        return Settings.getPreferences(pref, parseInt(target.properties.get(Users.SETTINGS)));
    }

    public static getPreferences(pref: string, anyValue: any): boolean {
        const setting: number = parseInt(anyValue.toString());

        let value: boolean = false;

        switch (pref) {
            case "bCloak":
                value = Achievement.get(setting, 0) === 0;
                break;
            case "bHelm":
                value = Achievement.get(setting, 1) === 0;
                break;
            case "bPet":
                value = Achievement.get(setting, 2) === 0;
                break;
            case "bWAnim":
                value = Achievement.get(setting, 3) === 0;
                break;
            case "bGoto":
                value = Achievement.get(setting, 4) === 0;
                break;
            case "bSoundOn":
                value = Achievement.get(setting, 5) === 0;
                break;
            case "bMusicOn":
                value = Achievement.get(setting, 6) === 0;
                break;
            case "bFriend":
                value = Achievement.get(setting, 7) === 0;
                break;
            case "bParty":
                value = Achievement.get(setting, 8) === 0;
                break;
            case "bGuild":
                value = Achievement.get(setting, 9) === 0;
                break;
            case "bWhisper":
                value = Achievement.get(setting, 10) === 0;
                break;
            case "bTT":
                value = Achievement.get(setting, 11) === 0;
                break;
            case "bFBShare":
                value = Achievement.get(setting, 12) === 0;
                break;
            case "bDuel":
                value = Achievement.get(setting, 13) === 0;
                break;
            case "bFBShard":
                value = false;
                break;
        }

        return value;
    }

    public static setPreferences(pref: string, anyValue: any, value: boolean): number {
        const intValue: number = parseInt(anyValue.toString());

        const setting: number = value ? 0 : 1;
        let newInt: number = 0;

        switch (pref) {
            case "bCloak":
                newInt = Achievement.update(intValue, 0, setting);
                break;
            case "bHelm":
                newInt = Achievement.update(intValue, 1, setting);
                break;
            case "bPet":
                newInt = Achievement.update(intValue, 2, setting);
                break;
            case "bWAnim":
                newInt = Achievement.update(intValue, 3, setting);
                break;
            case "bGoto":
                newInt = Achievement.update(intValue, 4, setting);
                break;
            case "bSoundOn":
                newInt = Achievement.update(intValue, 5, setting);
                break;
            case "bMusicOn":
                newInt = Achievement.update(intValue, 6, setting);
                break;
            case "bFriend":
                newInt = Achievement.update(intValue, 7, setting);
                break;
            case "bParty":
                newInt = Achievement.update(intValue, 8, setting);
                break;
            case "bGuild":
                newInt = Achievement.update(intValue, 9, setting);
                break;
            case "bWhisper":
                newInt = Achievement.update(intValue, 10, setting);
                break;
            case "bTT":
                newInt = Achievement.update(intValue, 11, setting);
                break;
            case "bFBShare":
                newInt = Achievement.update(intValue, 12, setting);
                break;
            case "bDuel":
                newInt = Achievement.update(intValue, 13, setting);
                break;
            case "bFBShard":
                newInt = 1;
                break;
        }

        return newInt;
    }

}
