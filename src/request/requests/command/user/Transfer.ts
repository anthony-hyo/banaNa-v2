import type IRequest from "../../../../interfaces/request/IRequest";
import type Player from "../../../../player/Player";
import type RequestArg from "../../../RequestArg.ts";
import {RequestType} from "../../../RequestType.ts";
import type Room from "../../../../room/Room.ts";
import logger from "../../../../util/Logger.ts";
import RoomController from "../../../../controller/RoomController.ts";
import type IArea from "../../../../database/interfaces/IArea.ts";
import database from "../../../../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {areas} from "../../../../database/drizzle/schema.ts";
import AreaNotFoundException from "../../../../exceptions/AreaNotFoundException.ts";
import RoomCreationException from "../../../../exceptions/RoomCreationException.ts";

export default class Transfer implements IRequest {

	public readonly name: string = 'tfer';
	public readonly type: RequestType = RequestType.COMMAND_USER;

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const [roomName, roomKeyStr = '1'] = args.getString(2).split("-");

		let roomKey: number = Number(roomKeyStr);

		const area: IArea | undefined = await database.query.areas.findFirst({
			with: {
				cells: true,
				items: {
					with: {
						item: true
					}
				},
				monsters: {
					with: {
						monster: true,
					}
				},
			},
			where: eq(areas.name, roomName)
		});

		if (!area) {
			player.network.writeArray("warning", [`"${roomName}" is not a recognized map name.`]);
			return;
		}

		if (roomKey > 999999 || roomKey < 1 || area.isKeyUnique) {
			roomKey = 1;
		}

		let room: Room | undefined = RoomController.findByName(`${roomName}-${roomKey}`);

		if (!room) {
			room = RoomController.lookOrCreate(area, roomName);
		}

		if (room) {
			await player.join(room);
		}

		try {
		} catch (ex) {
			if (ex instanceof AreaNotFoundException) {
				player.network.writeArray("warning", ["Destination does not exist."]);
			} else if (ex instanceof RoomCreationException) {
				logger.error("Room creation error", ex);
				player.network.writeArray("warning", ["Room creation error."]);
			}

			logger.error("Room creation error", ex);
		}
	}

}
