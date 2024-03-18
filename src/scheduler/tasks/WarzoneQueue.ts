import type ITask from "../../interfaces/ITask";
import type Player from "../../player/Player";
import type Room from "../../room/Room";
import logger from "../../util/Logger";
import JSONObject from "../../util/json/JSONObject";
import PlayerConst from "../../player/PlayerConst.ts";

export default class WarzoneQueue implements ITask {

    private static readonly MAX_QUEUE: number = 10;

    private warzoneQueues: Map<string, Player[]> = new Map();

    constructor() {
        logger.info("WarzoneQueue initialized.");
    }

    public run(): void {
        try {
            for (const [warzone, queue] of this.warzoneQueues.entries()) {
                if (queue.length === WarzoneQueue.MAX_QUEUE) {
                    const PVPI: JSONObject = new JSONObject()
                        .element("cmd", "PVPI")
                        .element("warzone", warzone);

                    const warzoneRoom: Room = this.world.rooms.createRoom(`bludrutbrawl-1`);

                    for (let i: number = 0; i < WarzoneQueue.MAX_QUEUE; i++) {
                        const player: Player = queue.shift()!;

                        player.properties.set(PlayerConst.ROOM_QUEUED, warzoneRoom);

                        if (i % 2 === 0) {
                            player.properties.set(PlayerConst.PVP_TEAM, 0);
                        } else {
                            player.properties.set(PlayerConst.PVP_TEAM, 1);
                        }


                        player.network.writeArray("server", "A new Warzone battle has started!");
                        player.network.writeObject(PVPI);
                    }
                }
            }
        } catch (error: any) {
            logger.warn(error);
        }
    }

    public removeUserFromQueues(user: Player): void {
        for (const queue of this.warzoneQueues.values()) {
            queue.splice(queue.indexOf(user), 1);
        }
    }

    public queueUser(warzone: string, user: Player): void {
        this.getWarzoneQueue(warzone)
            .push(user);
    }

    private getWarzoneQueue(warzone: string): Player[] {
        if (this.warzoneQueues.has(warzone)) {
            return this.warzoneQueues.get(warzone)!;
        }

        this.warzoneQueues.set(warzone, []);

        return this.warzoneQueues.get(warzone)!;
    }
}
