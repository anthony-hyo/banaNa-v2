import type IRequest from "../../../interfaces/request/IRequest.ts";
import type RequestArg from "../../RequestArg.ts";
import type Player from "../../../avatar/player/Player.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import CoreValues from "../../../aqw/CoreValues.ts";
import RoomController from "../../../controller/RoomController.ts";
import type Room from "../../../room/Room.ts";
import RequestType from "../../RequestType.ts";
import type IArea from "../../../database/interfaces/IArea.ts";
import database from "../../../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {areas} from "../../../database/drizzle/schema.ts";
import RequestRegister from "../../RequestRegister.ts";

@RequestRegister({
	name: "firstJoin",
	type: RequestType.DEFAULT
})
export default class RequestDefault implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		player.writeObject(
			new JSONObject()
				.element("cmd", "cvu")
				.element("o", CoreValues.getData())
		);

		const roomName: string = "classhall";
		const roomFrame: string = "r4";
		const roomPad: string = "Right";

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

		const room: Room | undefined = RoomController.lookOrCreate(area!, roomName);

		if (!room) {
			//TODO: Disconnect
			return;
		}


		await player.join(room, roomFrame, roomPad);
	}

}