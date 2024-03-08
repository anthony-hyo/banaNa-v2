import type IDispatchable from "../interfaces/IDispatchable.ts";
import JSONObject from "../util/json/JSONObject.ts";

export default class GameController implements IDispatchable {

    private static _instance: GameController | null = null;

    public static instance(): GameController {
        if (!this._instance) {
            this._instance = new GameController();
        }

        return this._instance;
    }

    public writeObject(data: JSONObject): void {
        //TODO: dispatch to all players
    }

    public writeString(...data: any[]): void {
        //TODO: dispatch to all players
    }

    public serverMessage(message: String): void {
        this.writeObject(new JSONObject()
            .element("cmd", "umsg")
            .element("s", message)
        );
    }


}