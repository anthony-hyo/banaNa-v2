import Room from "../room/Room.ts";
import type Player from "../player/Player.ts";
import type IArea from "../database/interfaces/IArea.ts";
import database from "../database/drizzle/database.ts";
import {eq} from "drizzle-orm";
import {areas} from "../database/drizzle/schema.ts";
import JSONArray from "../util/json/JSONArray.ts";
import JSONObject from "../util/json/JSONObject.ts";

export class RoomController {

	private static count: number = 0;

	private static roomList: Map<number, Room> = new Map<number, Room>;

	public static addRoom(rm: Room): void {
		if (RoomController.roomList.has(rm.id)) {
			return;
		}

		RoomController.roomList.set(rm.id, rm);
	}

	public static removeRoom(id: number): void {
		RoomController.roomList.delete(id);
	}

	public static getRoom(roomId: number): Room | null {
		const room: Room | undefined = RoomController.roomList.get(roomId);
		return room !== undefined ? room : null;
	}

	public static getList(): Map<number, Room> {
		return RoomController.roomList;
	}

	public static getRoomByName(name: string): Room | undefined {
		let found: Room | undefined = undefined;

		for (let room of RoomController.roomList.values()) {
			if (room.name !== name) {
				continue;
			}

			found = room;
		}

		return found;
	}

	public static async joinRoom(player: Player, newRoom: Room): Promise<void> {
		if (player.room !== undefined) {
			let oldRoom: Room | null = player.room;

			if (oldRoom !== null) {
				// noinspection HtmlUnknownAttribute
				oldRoom.writeExcept(player, "<msg t='sys'><body action='userGone' r='" + oldRoom.id + "'><user id='" + player.network.id + "' /></body></msg>");
				oldRoom.writeArrayExcept(player, "exitArea", [player.network.id, player.network.name]);

				oldRoom.removePlayer(player);

				if (oldRoom.players.size <= 0) {
					RoomController.removeRoom(oldRoom.id);
				}
			}
		}

		if (newRoom !== null) {
			newRoom.addPlayer(player);

			player.network.writeObjectExcept(
				player,
				new JSONObject()
					.element("cmd", "uotls")
					.element("o", (await player.jsonPartial(true, false))
						.element('cmd', 'uotls')
					)
					.element("unm", player.network.name)
			);

			// noinspection HtmlUnknownAttribute
			let response: string = `<msg t='sys'><body action='joinOK' r='${newRoom.id}'><pid id='0'/><vars /><uLs r='${newRoom.id}'>`;

			let i: number = 1;

			for (let [networkId, target] of newRoom.players) {
				// noinspection HtmlUnknownAttribute
				response += `<u i='${networkId}' m='0' s='0' p='${i}'><n><![CDATA[${target.network.name}]]></n><vars></vars></u>`;
				i++;
			}

			response += `</uLs></body></msg>`;

			player.network.write(response);

			// noinspection HtmlUnknownAttribute
			newRoom.writeExcept(player, `<msg t='sys'><body action='uER' r='${newRoom.id}'><u i ='${player.network.id}' m='0'><n><![CDATA[${newRoom.name}]]></n><vars></vars></u></body></msg>`);
		}
	}

	public static getRoomCount(): number {
		return RoomController.roomList.size;
	}

	public static async look(name: string): Promise<Room | undefined> {
		for (let i: number = 0; i < 20; i++) {
			const room: Room | undefined = RoomController.getRoomByName(`${name}-${i}`);

			if (!room) {
				break;
			}

			if (room.isNotFull) {
				return room;
			}
		}

		return RoomController.createRoom(name);
	}

	public static async createRoom(name: string): Promise<Room | undefined> {
		const mapName: string = name.split("-")[0] == "house" ? name : name.split("-")[0];

		const data: IArea | undefined = await database.query.areas.findFirst({
			where: eq(areas.name, mapName),
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
			}
		});

		if (!data) {
			///player.network.writeArray("warning", "\"" + mapName + "\" is not a recognized map name.");
			return undefined;
		}

		const room: Room = new Room(data, RoomController.count++, "");

		if (room.data.is_pvp) {
			room.isPvPDone = false;

			room.blueTeamScore = 0;
			room.redTeamScore = 0;

			room.blueTeamName = "Team Blue";
			room.redTeamName = "Team Red";

			const PVPFactions: JSONArray = new JSONArray();

			PVPFactions.add(
				new JSONObject()
					.element("id", 8)
					.element("sName", "Blue")
			);

			PVPFactions.add(
				new JSONObject()
					.element("id", 7)
					.element("sName", "Red")
			);

			room.pvpFactions = PVPFactions;
		}

		return room;
	}

}
