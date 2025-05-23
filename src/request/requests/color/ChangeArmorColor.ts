import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../avatar/player/Player.ts";
import type RequestArg from "../../RequestArg.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import database from "../../../database/drizzle/database.ts";
import {users} from "../../../database/drizzle/schema.ts";
import {eq} from "drizzle-orm";
import RequestType from "../../RequestType.ts";
import RequestRegister from "../../RequestRegister.ts";

@RequestRegister({
	name: "changeArmorColor",
	type: RequestType.DEFAULT
})
export default class ChangeArmorColor implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const colorBase: number = args.getNumber(0);
		const colorTrim: number = args.getNumber(1);
		const colorAccessory: number = args.getNumber(2);

		await database
			.update(users)
			.set({
				colorBase: (colorBase & 0xffffff).toString(16),
				colorTrim: (colorTrim & 0xffffff).toString(16),
				colorAccessory: (colorAccessory & 0xffffff).toString(16),
			})
			.where(eq(users.id, player.databaseId));

		player.room?.writeObjectExcept(
			player,
			new JSONObject()
				.element("uid", player.avatarId)
				.element("cmd", "changeArmorColor")
				.element("intColorBase", colorBase)
				.element("intColorTrim", colorTrim)
				.element("intColorAccessory", colorAccessory)
		);
	}

}
