import logger from "./util/Logger";
import ConfigData from "./config/ConfigData";
import database from "./database/drizzle/database";
import {servers} from "./database/drizzle/schema";
import {eq} from "drizzle-orm";
import GameController from "./controller/GameController.ts";

export class Main {

	public static SINGLETON: Main;

	constructor() {
		logger.info(`starting..`);

		this.init()
			.then(() => logger.info(`>>> >>> started! <<< <<<`));

		Main.SINGLETON = this;
	}

	private async init(): Promise<void> {
		await GameController.instance().init();

		logger.info(`server is now online.`);

		database
			.update(servers)
			.set({
				online: true
			})
			.where(eq(servers.name, ConfigData.SERVER_NAME));
	}

}
