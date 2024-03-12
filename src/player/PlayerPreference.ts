import Player from "./Player.ts";
import Settings from "../aqw/Settings.ts";
import Users from "../world/Users.ts";
import JSONObject from "../util/json/JSONObject.ts";

export default class PlayerPreference {

    constructor(
        private readonly player: Player
    ) {
    }

    public sendPreferences(preference: string): void {
        const value: boolean = Settings.getPreferences(preference, this.player.properties.get(Users.SETTINGS));
        const messageType: string = value ? "server" : "warning";

        switch (preference) {
            case Settings.PARTY:
                this.player.network.writeString([messageType, value ? Settings.PARTY_MESSAGE_ON : Settings.PARTY_MESSAGE_OFF]);
                break;
            case Settings.GOTO:
                this.player.network.writeString([messageType, value ? Settings.GOTO_MESSAGE_ON : Settings.GOTO_MESSAGE_OFF]);
                break;
            case Settings.FRIEND:
                this.player.network.writeString([messageType, value ? Settings.FRIEND_MESSAGE_ON : Settings.FRIEND_MESSAGE_OFF]);
                break;
            case Settings.WHISPER:
                this.player.network.writeString([messageType, value ? Settings.WHISPER_MESSAGE_ON : Settings.WHISPER_MESSAGE_OFF]);
                break;
            case Settings.TOOLTIPS:
                this.player.network.writeString([messageType, value ? Settings.TOOLTIPS_MESSAGE_ON : Settings.TOOLTIPS_MESSAGE_OFF]);
                break;
            case Settings.DUEL:
                this.player.network.writeString([messageType, value ? Settings.DUEL_MESSAGE_ON : Settings.DUEL_MESSAGE_OFF]);
                break;
            case Settings.GUILD:
                this.player.network.writeString([messageType, value ? Settings.GUILD_MESSAGE_ON : Settings.GUILD_MESSAGE_OFF]);
                break;
            default:
                break;
        }
    }

    public changePreferences(user: Player, pref: string, value: boolean): void {
        let ia1: number = user.properties.get(Users.SETTINGS) as number;
        ia1 = Settings.setPreferences(pref, ia1, value);
        user.properties.set(Users.SETTINGS, ia1);

        const uotls: JSONObject = new JSONObject();
        uotls.put("cmd", "uotls");
        uotls.put("unm", user.username());

        if (pref === Settings.HELM) {
            uotls.put("o", new JSONObject().put("showHelm", Settings.getPreferences(Settings.HELM, ia1)));
            this.player.room.writeObjectExcept(this.player, uotls)
        }

        if (pref === Settings.CLOAK) {
            uotls.put("o", new JSONObject().put("showCloak", Settings.getPreferences(Settings.CLOAK, ia1)));
            this.player.room.writeObjectExcept(this.player, uotls)
        }

        this.sendPreferences(user, pref);

        this.world.db.jdbc.run("UPDATE users SET Settings = ? WHERE id = ?", ia1, user.properties.get(Users.DATABASE_ID));
    }

}