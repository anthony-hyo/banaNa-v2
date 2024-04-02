import Room from "../room/Room.ts";
import type Player from "../avatar/player/Player.ts";
import type IArea from "../database/interfaces/IArea.ts";
import JSONObject from "../util/json/JSONObject.ts";

export default class RoomController {

	private static count: number = 2;

	private static readonly ROOMS: Map<string, Room> = new Map<string, Room>;

	public static async join(player: Player, newRoom: Room): Promise<void> {
		if (player.room !== undefined) {
			let oldRoom: Room | null = player.room;

			if (oldRoom !== null) {
				// noinspection HtmlUnknownAttribute
				oldRoom.writeExcept(player, "<msg t='sys'><body action='userGone' r='" + oldRoom.id + "'><user id='" + player.network.id + "' /></body></msg>");
				oldRoom.writeArrayExcept(player, "exitArea", [player.network.id, player.network.name]);

				oldRoom.removePlayer(player);

				if (oldRoom.players.size <= 0) {
					RoomController.ROOMS.delete(oldRoom.name);
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

	public static lookOrCreate(area: IArea, name: string): Room {
		let i: number = 1;

		name = name.toLowerCase();

		while (i <= 20) {
			const room: Room | undefined = RoomController.findByName(`${name}-${i}`);

			if (!room) {
				break;
			}

			if (room.isNotFull) {
				return room;
			}

			i++;
		}

		return RoomController.create(area, name, i);
	}

	public static findByName(name: string): Room | undefined {
		return RoomController.ROOMS.get(name.toLowerCase());
	}

	public static findOrCreate(area: IArea, name: string, key: number): Room {
		const room: Room | undefined = RoomController.ROOMS.get(`${name}-${key}`.toLowerCase());
		return room === undefined ? RoomController.create(area, name, key) : room;
	}

	public static create(area: IArea, name: string, key: number): Room {
		RoomController.count++;

		return new Room(area, RoomController.count, `${name}-${key}`);
	}

}
