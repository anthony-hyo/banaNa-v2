import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../player/Player.ts";
import JSONObject from "../../util/json/JSONObject.ts";
import JSONArray from "../../util/json/JSONArray.ts";
import Message from "../../aqw/Message.ts";
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
								enhancement: true,
							}
						}
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
				continue;
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

		const currentDate: Date = new Date();

		const boostCPSeconds: number = differenceInSeconds(currentDate, user.dateClassPointBoostExpire);

		if (boostCPSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "cpboost")
				.element("iSecsLeft", boostCPSeconds)
			);
		}

		const boostRepSeconds: number = differenceInSeconds(currentDate, user.dateReputationBoostExpire);

		if (boostRepSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "repboost")
				.element("iSecsLeft", boostRepSeconds)
			);
		}

		const boostCoinsSeconds: number = differenceInSeconds(currentDate, user.dateCoinsBoostExpire);

		if (boostCoinsSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "cboost")
				.element("iSecsLeft", boostCoinsSeconds)
			);
		}

		const boostGoldSeconds: number = differenceInSeconds(currentDate, user.dateGoldBoostExpire);

		if (boostGoldSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "gboost")
				.element("iSecsLeft", boostGoldSeconds)
			);
		}

		const boostExpSeconds: number = differenceInSeconds(currentDate, user.dateExperienceBoostExpire);

		if (boostExpSeconds > 0) {
			player.network.writeObject(new JSONObject()
				.element("op", "+")
				.element("cmd", "xpboost")
				.element("iSecsLeft", boostExpSeconds)
			);
		}

		player.network.writeArray(Message.create("server", "Character load complete."));

		const friendJSONObject: JSONObject = new JSONObject()
			.element("cmd", "updateFriend")
			.element("friend", new JSONObject()
				.element("iLvl", user.level)
				.element("ID", player.databaseId)
				.element("sName", player.username)
				.element("sServer", GameController.instance().server.name)
			);

		const friendMessage: [string, string] = Message.create("server", `${player.username} has logged in.`);

		const userFriends: IUserFriend[] = await database.query.usersFriends.findMany({
			where: eq(usersFriends.userId, player.databaseId),
			with: {
				friend: true
			}
		});

		for (const userFriend of userFriends) {
			const client: Player | undefined = PlayerController.findByUsername(userFriend.friend!.username.toLowerCase());

			if (client) {
				client.network.writeObject(friendJSONObject);
				client.network.writeArray(friendMessage);
			}
		}
	}

}
