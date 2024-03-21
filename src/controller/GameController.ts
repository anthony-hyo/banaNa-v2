import type IDispatchable from "../interfaces/IDispatchable.ts";
import JSONObject from "../util/json/JSONObject.ts";
import database from "../database/drizzle/database.ts";
import Helper from "../util/Helper.ts";
import {eq} from "drizzle-orm";
import {servers} from "../database/drizzle/schema.ts";
import Config from "../config/Config.ts";
import type Player from "../player/Player.ts";
import Player from "../player/Player.ts";
import WarzoneQueue from "../scheduler/tasks/WarzoneQueue.ts";
import Scheduler from "../scheduler/Scheduler.ts";
import {ACGiveaway} from "../scheduler/tasks/ACGiveaway.ts";
import Network from "../network/Network.ts";
import type IServer from "../database/interfaces/IServer.ts";
import logger from "../util/Logger.ts";

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

	private _server!: IServer;

	public get server(): any {
		return this._server;
	}

	public set server(value: any) {
		this._server = value;
	}

	private _network!: Network;

	public get network(): Network {
		return this._network;
	}

	private set network(value: Network) {
		this._network = value;
	}

	public static instance(): GameController {
		if (!this._instance) {
			this._instance = new GameController();
		}

		return this._instance;
	}

	public async init(): Promise<void> {
		logger.info(`settings initialized.`);

		this.settings = (await database.query.settingsLogin.findMany())
			.map(Helper.columnsToString)
			.join(',');

		logger.info(`server initialized.`);

		this.server = await database.query.servers
			.findFirst({
				where: eq(servers.id, Config.SERVER_ID)
			});

		logger.info(`network initialized.`);
		this.network = new Network();

		logger.info(`scheduler initialized.`);

		Scheduler.repeated(new WarzoneQueue(), 5);
		Scheduler.repeated(new ACGiveaway(), 1800);
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