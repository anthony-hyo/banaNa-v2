import logger from "./util/Logger";
import ConfigData from "./config/ConfigData";
import database from "./database/drizzle/database";
import {servers} from "./database/drizzle/schema";
import {eq} from "drizzle-orm";
import WarzoneQueue from "./scheduler/tasks/WarzoneQueue.ts";
import {ACGiveaway} from "./scheduler/tasks/ACGiveaway.ts";
import Scheduler from "./scheduler/Scheduler.ts";
import GameController from "./controller/GameController.ts";

export class Main {

    public static SINGLETON: Main;

    constructor() {
        this.init()
            .then(() => logger.info(`>>> >>> started! <<< <<<`));

        Main.SINGLETON = this;
    }

    private async init(): Promise<void> {
        logger.info(`database initialized.`);

        await GameController.instance().init();

        //TODO: Network init

        logger.info(`network initialized.`);

        const warzoneQueue: WarzoneQueue = new WarzoneQueue(this); //TODO: Move to game contrller

        Scheduler.repeated(warzoneQueue, 5);
        Scheduler.repeated(new ACGiveaway(), 1800);

        database
            .update(servers)
            .set({
                online: true
            })
            .where(eq(servers.name, ConfigData.SERVER_NAME));
    }

}
