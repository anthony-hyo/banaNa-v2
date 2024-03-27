import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../player/Player.ts";
import JSONObject from "../../util/json/JSONObject.ts";
import JSONArray from "../../util/json/JSONArray.ts";
import type IUserFriend from "../../database/interfaces/IUserFriend.ts";
import database from "../../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {usersFriends} from "../../database/drizzle/schema.ts";
import PlayerController from "../../controller/PlayerController.ts";
import GameController from "../../controller/GameController.ts";
import type IUser from "../../database/interfaces/IUser.ts";
import HelperItem from "../../util/HelperItem.ts";
import type IUserFaction from "../../database/interfaces/IUserFaction.ts";
import {differenceInSeconds} from "date-fns";

export default class RetrieveInventory implements IRequest {

	public readonly name: string = 'retrieveInventory';

	private readonly inventory_items: JSONArray = new JSONArray();
	private readonly house_items: JSONArray = new JSONArray();

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const user: IUser | undefined = await database.query.users.findFirst({
			with: {
				factions: {
					with: {
						faction: true
					}
				},
				inventory: {
					with: {
						item: {
							with: {
								typeItem: true,
								typeElement: true,
								enhancement: true,
							}
						},
						enhancement: true,
					}
				}
			}
		});

		if (!user) {
			player.kick();
			return;
		}

		for (const inventoryItem of user.inventory!) {
			if (inventoryItem.is_equipped) {
				player.inventory.equip(inventoryItem, false);
			}

			const equipment: string = inventoryItem.item!.typeItem!.equipment;

			if (equipment == "hi" || equipment == "ho") {
				this.house_items.add(HelperItem.inventory(inventoryItem));
				continue;
			}

			this.inventory_items.add(HelperItem.inventory(inventoryItem));
		}

		player.network.writeObject(GameController.instance().enhancementPatterns);

		//player.stats.update(false);

		player.network.writeObject(new JSONObject()
			.element("cmd", "loadInventoryBig")
			.element("bankCount", await player.getBankCount())
			.element("items", this.inventory_items)
			.element("hitems", this.house_items)
			.element("factions", new JSONArray(
				user.factions!
					.map((userFaction: IUserFaction) => new JSONObject()
						.element("FactionID", userFaction.faction!.id)
						.element("CharFactionID", userFaction.id)
						.element("sName", userFaction.faction!.name)
						.element("iRep", userFaction.reputation)
					)
			))
		);

		const dateNow: Date = new Date();

		const boostCPSeconds: number = differenceInSeconds(user.dateClassPointBoostExpire, dateNow);

		if (boostCPSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "cpboost")
				.element("iSecsLeft", boostCPSeconds)
			);
		}

		const boostRepSeconds: number = differenceInSeconds(user.dateReputationBoostExpire, dateNow);

		if (boostRepSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "repboost")
				.element("iSecsLeft", boostRepSeconds)
			);
		}

		const boostCoinsSeconds: number = differenceInSeconds(user.dateCoinsBoostExpire, dateNow);

		if (boostCoinsSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "cboost")
				.element("iSecsLeft", boostCoinsSeconds)
			);
		}

		const boostGoldSeconds: number = differenceInSeconds(user.dateGoldBoostExpire, dateNow);

		if (boostGoldSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "gboost")
				.element("iSecsLeft", boostGoldSeconds)
			);
		}

		const boostExpSeconds: number = differenceInSeconds(user.dateExperienceBoostExpire, dateNow);

		if (boostExpSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "xpboost")
				.element("iSecsLeft", boostExpSeconds)
			);
		}

		player.network.writeArray("server", ["Character load complete."]);

		const friendJSONObject: JSONObject = new JSONObject()
			.element("cmd", "updateFriend")
			.element("friend", new JSONObject()
				.element("iLvl", user.level)
				.element("ID", player.databaseId)
				.element("sName", player.username)
				.element("sServer", GameController.instance().server.name)
			);

		const friendMessage: [string, string] = [
			"server",
			`${player.username} has logged in.`
		];

		const userFriends: IUserFriend[] = await database.query.usersFriends.findMany({
			where: eq(usersFriends.userId, player.databaseId),
			with: {
				friend: true
			}
		});

		for (const userFriend of userFriends) {
			const client: Player | undefined = PlayerController.findByUsername(userFriend.friend!.username);

			if (client) {
				client.network.writeObject(friendJSONObject);
				client.network.writeArray(friendMessage[0], [friendMessage[1]]);
			}
		}
	}

}
