import InternalEventObject from "./examples/InternalEventObject";
import Room from "./room/Room";
import logger from "./util/Logger";
import ConfigData from "./config/ConfigData";
import ExtensionHelper from "./examples/ExtensionHelper";
import Player from "./player/Player";
import database from "./database/drizzle/database";
import {servers} from "./database/drizzle/schema";
import {eq} from "drizzle-orm";
import WarzoneQueue from "./scheduler/tasks/WarzoneQueue.ts";
import {ACGiveaway} from "./scheduler/tasks/ACGiveaway.ts";
import Scheduler from "./scheduler/Scheduler.ts";
import JSONObject from './util/json/JSONObject.ts';

export class Main {

    public static SINGLETON: Main;

    private allowedRequestsForBannedUsers: Array<string> = ["mv", "firstJoin", "afk", "isModerator", "retrieveInventory", "moveToCell", "retrieveUserData", "retrieveUserDatas", "emotea"];
    private requests: Map<string, string> = new Map();
    private helper!: ExtensionHelper;

    constructor() {
        this.init()
            .then(() => logger.info(`>>> >>> started! <<< <<<`));

        Main.SINGLETON = this;
    }

    handleInternalEvent(ieo: InternalEventObject): void {
        const event: string = ieo.getEventName();

        logger.silly("System event: " + ieo.getEventName());

        if (event === InternalEventObject.EVENT_SERVER_READY) {
        } else if (event === InternalEventObject.EVENT_LOGIN) {
        } else if (event === InternalEventObject.EVENT_NEW_ROOM) {
        } else if (event === InternalEventObject.EVENT_JOIN) {
            const room: Room = ieo.getObject("room") as Room;
            const user: Player = ieo.getObject("user") as Player;

            const userObj: JSONObject = this.world.users.getProperties(user, room);

            const uJoin: JSONObject = new JSONObject();
            uJoin.put("cmd", "uotls");
            uJoin.put("o", userObj);
            uJoin.put("unm", user.getName());

            this.world.sendToRoomButOne(uJoin, user, room);
        } else if (event === InternalEventObject.EVENT_USER_EXIT) {
            const room: Room = ieo.getObject("room") as Room;
            const user: Player = ieo.getObject("user") as Player;

            this.world.rooms.exit(room, user);

            if (room.getUserCount() <= 0) {
                this.helper.destroyRoom(this.world.zone, room.getId());
            }
        } else if (event === InternalEventObject.EVENT_USER_LOST) {
            const user: Player = ieo.getObject("user") as Player;
            const room: Room = this.world.zone.getRoom(user.room.getId());

            if (room !== null) {
                this.world.rooms.exit(room, user);
                room.removeUser(user);

                if (room.getUserCount() <= 0) {
                    this.helper.destroyRoom(this.world.zone, room.getId());
                }
            }

            this.world.users.lost(user);

            database
                .update(servers)
                .set({
                    count: this.world.zone.getUserCount()
                })
                .where(eq(servers.name, ConfigData.SERVER_NAME));
        }
    }

    private async init(): Promise<void> {
        logger.info(`database initialized.`);

        this.requests = new Map(ConfigData.REQUESTS);
        this.helper = ExtensionHelper.instance();

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
