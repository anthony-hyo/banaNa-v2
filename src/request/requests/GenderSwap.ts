import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../avatar/player/Player.ts";
import JSONObject from "../../util/json/JSONObject.ts";
import database from "../../database/drizzle/database.ts";
import {hairs, users} from "../../database/drizzle/schema.ts";
import {eq, sql} from "drizzle-orm";
import RequestType from "../RequestType.ts";
import RequestRegister from "../RequestRegister.ts";

@RequestRegister({
	name: "genderSwap",
	type: RequestType.DEFAULT
})
export default class GenderSwap implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const { coins, hair } = (await database.query.users.findFirst({
			columns: {
				coins: true,
			},
			with: {
				hair: {
					columns: {
						gender: true
					}
				}
			},
			where: eq(users.id, player.databaseId)
		}) || {});

		if (!coins || !hair) {
			player.kick('[GenderSwap] coins and hair are undefined');
			return;
		}

		const cost: number = 1000;
		const deltaCoins: number = coins - cost;

		if (deltaCoins < 0) {
			player.writeArray('warning', ["You don't have enough ACs!"]);
			return;
		}

		const newGender: "M" | "F" = hair.gender == "M" ? "F" : "M";

		const newHair: {
			id: number,
			name: string,
			file: string
		} | undefined = await database.query.hairs.findFirst({
			columns: {
				id: true,
				name: true,
				file: true
			},
			where: eq(hairs.gender, newGender)
		});

		if (!newHair) {
			player.kick('[GenderSwap] hair is undefined');
			return;
		}

		await database
			.update(users)
			.set({
				coins: sql`${users.coins} - ${cost}`,
				hairId: newHair.id
			})
			.where(eq(users.id, player.databaseId));

		player.writeObject(new JSONObject()
			.element("cmd", "genderSwap")
			.element("uid", player.avatarId)
			.element("strHairFilename", newHair.file)
			.element("bitSuccess", 1)
			.element("HairID", newHair.id)
			.element("strHairName", newHair.name)
			.element("gender", newGender)
			.element("intCoins", cost)
		);
	}

}
