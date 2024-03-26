import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../player/Player.ts";
import type RequestArg from "../../RequestArg.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import database from "../../../database/drizzle/database.ts";
import {users} from "../../../database/drizzle/schema.ts";
import {eq} from "drizzle-orm";

export default class ChangeColor implements IRequest {

	public readonly name: string = 'changeColor';

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const hairId: number = args.getNumber(3);

		const hair: {
			name: string,
			file: string
		} | undefined = await database.query.hairs.findFirst({
			columns: {
				name: true,
				file: true
			}
		});

		if (!hair) {
			player.kick();
			return;
		}

		const colorSkin: number = args.getNumber(0);
		const colorHair: number = args.getNumber(1);
		const colorEye: number = args.getNumber(2);

		await database
			.update(users)
			.set({
				hairId: hairId,
				colorSkin: (colorSkin & 0xffffff).toString(16),
				colorHair: (colorHair & 0xffffff).toString(16),
				colorEye: (colorEye & 0xffffff).toString(16),
			})
			.where(eq(users.id, player.databaseId));

		player.room!.writeObjectExcept(player, new JSONObject()
			.element("uid", player.network.id)
			.element("cmd", "changeColor")
			.element("HairID", hairId)
			.element("strHairName", hair.name)
			.element("strHairFilename", hair.file)
			.element("intColorSkin", colorSkin)
			.element("intColorHair", colorHair)
			.element("intColorEye", colorEye)
		);
	}

}
