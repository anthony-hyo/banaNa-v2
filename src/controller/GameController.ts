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
import Request from "../request/Request.ts";
import type IEnhancementPattern from "../database/interfaces/IEnhancementPattern.ts";

export default class GameController implements IDispatchable {

	public static EXP_RATE: number;
	public static GOLD_RATE: number;
	public static REP_RATE: number;
	public static CP_RATE: number;
	public static DROP_RATE: number;

	private static _instance: GameController;

	private _settings: string = ``;
	private _enhancementPatterns: JSONObject = new JSONObject();
	private _server!: IServer;
	private _network!: Network;

	public static instance(): GameController {
		if (!this._instance) {
			this._instance = new GameController();
		}

		return this._instance;
	}

	public get settings(): string {
		return this._settings;
	}

	private set settings(value: string) {
		this._settings = value;
	}

	public get enhancementPatterns(): JSONObject {
		return this._enhancementPatterns;
	}

	private set enhancementPatterns(value: JSONObject) {
		this._enhancementPatterns = value;
	}

	public get server(): IServer {
		return this._server;
	}

	public set server(value: IServer) {
		this._server = value;
	}

	public get network(): Network {
		return this._network;
	}

	private set network(value: Network) {
		this._network = value;
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

		const enhancementPatterns: Array<IEnhancementPattern> = (await database.query.enhancementsPatterns.findMany());

		const enhancementPatternsJSONObject: JSONObject = new JSONObject();

		for (const enhancementPattern of enhancementPatterns) {
			enhancementPatternsJSONObject.element(
				enhancementPattern.id.toString(),
				new JSONObject()
					.element("ID", String(enhancementPattern.id))
					.element("sName", enhancementPattern.name)
					.element("sDesc", enhancementPattern.category)
					.element("iWIS", String(enhancementPattern.wisdom))
					.element("iEND", String(enhancementPattern.endurance))
					.element("iLCK", String(enhancementPattern.luck))
					.element("iSTR", String(enhancementPattern.strength))
					.element("iDEX", String(enhancementPattern.dexterity))
					.element("iINT", String(enhancementPattern.intelligence))
			);
		}

		this.enhancementPatterns = enhancementPatternsJSONObject;

		logger.info(`Enhancement Pattern initialized.`);

		await database
			.update(servers)
			.set({
				isOnline: true
			})
			.where(eq(servers.id, Config.SERVER_ID));

		const server: IServer | undefined = await database.query.servers
			.findFirst({
				where: eq(servers.id, Config.SERVER_ID)
			});

		if (!server) {
			throw new Error(`Server not found in the database for the environment variable 'SERVER_ID' (${Config.SERVER_ID}). Please ensure the server is properly configured.`);
		}

		this.server = server;

		logger.info(`Server initialized.`);

		Request.register();

		logger.info(`Request initialized.`);

		this.network = await new Network()
			.init();

		logger.info(`Network initialized.`);

		Scheduler.repeated(new WarZoneQueue(), 5);
		Scheduler.repeated(new ACGiveaway(), 1800);

		logger.info(`Scheduler initialized.`);
	}

	public serverMessage(message: string): void {
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