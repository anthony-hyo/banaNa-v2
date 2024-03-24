import JSONObject from "../util/json/JSONObject.ts";
import database from "../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {servers} from "../database/drizzle/schema.ts";
import Config from "../config/Config.ts";
import type Player from "../player/Player.ts";
import WarZoneQueue from "../scheduler/tasks/WarZoneQueue.ts";
import Scheduler from "../scheduler/Scheduler.ts";
import {ACGiveaway} from "../scheduler/tasks/ACGiveaway.ts";
import Network from "../network/Network.ts";
import type IServer from "../database/interfaces/IServer.ts";
import logger from "../util/Logger.ts";
import type IDispatchable from "../interfaces/entity/IDispatchable.ts";

export default class GameController implements IDispatchable {

	public static EXP_RATE: number;
	public static GOLD_RATE: number;
	public static REP_RATE: number;
	public static CP_RATE: number;
	public static DROP_RATE: number;

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
		this.settings = (await database.query.settingsLogin.findMany({
			columns: {
				name: true,
				value: true
			}
		}))
			.map(({ name, value }) => `${name}=${value}`)
			.join(',');

		logger.info(`Settings initialized.`);

		await database
			.update(servers)
			.set({
				isOnline: true
			})
			.where(eq(servers.id, Config.SERVER_ID));

		this.server = await database.query.servers
			.findFirst({
				where: eq(servers.id, Config.SERVER_ID)
			});

		logger.info(`Server initialized.`);

		this.network = await new Network()
			.init();

		logger.info(`Network initialized.`);

		Scheduler.repeated(new WarZoneQueue(), 5);
		Scheduler.repeated(new ACGiveaway(), 1800);

		logger.info(`Scheduler initialized.`);
	}

	public serverMessage(message: String): void {
		this.writeObject(new JSONObject()
			.element("cmd", "umsg")
			.element("s", message)
		);
	}

	public writeExcept(ignored: Player, data: string): void {
		logger.info(`writeExcept.`, data);
	}

	public writeObject(data: JSONObject): void {
		logger.info(`writeObject.`, data);
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		logger.info(`writeObjectExcept.`, data);
	}

	public writeArray(...data: any[]): void {
		logger.info(`writeArray.`, data);
	}

	public writeArrayExcept(ignored: Player, ...data: any[]): void {
		logger.info(`writeArrayExcept.`, data);
	}

}