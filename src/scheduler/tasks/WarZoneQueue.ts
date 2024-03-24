import type ITask from "../../interfaces/scheduler/ITask";
import type Player from "../../player/Player";
import type Room from "../../room/Room";
import logger from "../../util/Logger";
import JSONObject from "../../util/json/JSONObject";
import PlayerConst from "../../player/PlayerConst.ts";
import {RoomController} from "../../controller/RoomController.ts";

export default class WarZoneQueue implements ITask {

	private static readonly MAX_QUEUE: number = 10;

	private queues: Map<string, Player[]> = new Map<string, Player[]>();

	constructor() {
		logger.info("War Zone Queue initialized.");
	}

	public run(): void {
		try {
			if (this.queues.size > 0) {
				for (const [warZone, players] of this.queues.entries()) {
					if (players.length === WarZoneQueue.MAX_QUEUE) {
						RoomController
							.createRoom(`bludrutbrawl-1`)
							.then((room: Room | undefined): void => {
								for (let i: number = 0; i < WarZoneQueue.MAX_QUEUE; i++) {
									const player: Player = players.shift()!;

									player.properties.set(PlayerConst.ROOM_QUEUED, room);

									if (i % 2 === 0) {
										player.properties.set(PlayerConst.PVP_TEAM, 0);
									} else {
										player.properties.set(PlayerConst.PVP_TEAM, 1);
									}

									player.network.writeArray("server", "A new Warzone battle has started!");

									player.network.writeObject(
										new JSONObject()
											.element("cmd", "PVPI")
											.element("warZone", warZone)
									);
								}
							});
					}
				}
			}
		} catch (error: any) {
			logger.error(error);
		}
	}

	public removeUserFromQueues(player: Player): void {
		for (const queue of this.queues.values()) {
			queue.splice(queue.indexOf(player), 1);
		}
	}

	public queuePlayer(warZone: string, player: Player): void {
		this.getWarZoneQueue(warZone)
			.push(player);
	}

	private getWarZoneQueue(warZone: string): Player[] {
		if (this.queues.has(warZone)) {
			return this.queues.get(warZone)!;
		}

		this.queues.set(warZone, []);

		return this.queues.get(warZone)!;
	}

}
