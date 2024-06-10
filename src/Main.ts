import logger from "./util/Logger";
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
		await GameController.instance()
			.init();
	}

}

new Main();