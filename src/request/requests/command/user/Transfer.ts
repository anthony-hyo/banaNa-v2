import type IRequest from "../../../../interfaces/request/IRequest";
import type Player from "../../../../avatar/player/Player";
import type RequestArg from "../../../RequestArg.ts";
import RequestType from "../../../RequestType.ts";
import type Room from "../../../../room/Room.ts";
import RoomController from "../../../../controller/RoomController.ts";
import type IArea from "../../../../database/interfaces/IArea.ts";
import database from "../../../../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {areas} from "../../../../database/drizzle/schema.ts";
import RequestRegister from "../../../RequestRegister.ts";

@RequestRegister({
	name: "tfer",
	type: RequestType.COMMAND_USER
})
export default class Transfer implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const [roomName, roomKeyStr = '1'] = args.getString(2).split("-");

		let roomKey: number = Number(roomKeyStr);

		const area: IArea | undefined = await database.query.areas.findFirst({
			with: {
				cells: true,
				items: {
					with: {
						item: {
							with: {
								typeItem: true,
								//typeRarity: true,
								//typeElement: true,

								//class: true,

								//enhancement: true,

								//requiredFaction: true,
								//requiredClassItem: true,
								//requirements: true,
							}
						}
					}
				},
				monsters: {
					with: {
						monster: {
							with: {
								typeElement: true,
								typeRace: true,
								settingLevel: true,
								drops: {
									with: {
										item: {
											with: {
												typeItem: true,
												//typeRarity: true,
												//typeElement: true,

												//class: true,

												//enhancement: true,

												//requiredFaction: true,
												//requiredClassItem: true,
												//requirements: true,
											}
										}
									}
								},
							}
						},
					}
				},
			},
			where: eq(areas.name, roomName)
		});

		if (!area) {
			player.writeArray("warning", [`"${roomName}" is not a recognized map name.`]);
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
	}

}
