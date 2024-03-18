import type IDispatchable from "../interfaces/IDispatchable.ts";
import JSONObject from "../util/json/JSONObject.ts";
import database from "../database/drizzle/database.ts";
import Helper from "../util/Helper.ts";
import {eq} from "drizzle-orm";
import {servers} from "../database/drizzle/schema.ts";
import Config from "../config/Config.ts";
import type Player from "../player/Player.ts";

export default class GameController implements IDispatchable {

    public static EXP_RATE: number;
    public static GOLD_RATE: number;
    public static REP_RATE: number;
    public static CP_RATE: number;
    private static _instance: GameController;

    private _settings: string = ``;

    public get settings(): string {
        return this._settings;
    }

    private set settings(value: string) {
        this._settings = value;
    }

    private _server: any;

    public get server(): any {
        return this._server;
    }

    public set server(value: any) {
        this._server = value;
    }

    public static instance(): GameController {
        if (!this._instance) {
            this._instance = new GameController();
        }

        return this._instance;
    }

    public async init(): Promise<void> {
        this.settings = (await database.query.settingsLogin.findMany())
            .map(Helper.columnsToString)
            .join(',');

        this.server = await database.query.servers
            .findFirst({
                where: eq(servers.id, Config.SERVER_ID)
            });
    }

    public serverMessage(message: String): void {
        this.writeObject(new JSONObject()
            .element("cmd", "umsg")
            .element("s", message)
        );
    }

    public writeExcept(ignored: Player, data: string): void {
    }

    public writeObject(data: JSONObject): void {
    }

    public writeObjectExcept(ignored: Player, data: JSONObject): void {
    }

    public writeArray(...data: any[]): void {
    }

    public writeArrayExcept(ignored: Player, ...data: any[]): void {
    }

}