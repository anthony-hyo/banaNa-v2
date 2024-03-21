import type Room from "../room/Room.ts";
import type Player from "../player/Player.ts";
import Helper from "../util/Helper.ts";

export class RoomController {

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

	public static getRoomByName(name: string): Room | null {
		let found: Room | null = null;

		for (let room of RoomController.roomList.values()) {
			if (room.name !== name) {
				continue;
			}

			found = room;
		}

		return found;
	}

	public static joinRoom(player: Player, newRoom: Room): void {
		if (player.room !== undefined) {
			let oldRoom: Room | null = player.room;

			if (oldRoom !== null) {
				// noinspection HtmlUnknownAttribute
				oldRoom.writeExcept(player, "<msg t='sys'><body action='userGone' r='" + oldRoom.id + "'><user id='" + player.network.id + "' /></body></msg>");
				oldRoom.writeArrayExcept(player, "exitArea", player.network.id, player.network.name);

				oldRoom.removePlayer(player);

				if (oldRoom.playersCount <= 0) {
					RoomController.removeRoom(oldRoom.id);
				}
			}
		}

		if (newRoom !== null) {
			newRoom.addPlayer(player);

			player.network.writeObject(
				player.getProperties()
					.element('cmd', 'uotls')
			);

			let response: string = Helper.joinOK(newRoom.id);

			let i: number = 1;

			newRoom.players
				.forEach((target: Player) => {
					// noinspection HtmlUnknownAttribute
					response += `<u i='${target.network.id}' m='0' s='0' p='${i}'><n><![CDATA[${target.username}]]></n><vars></vars></u>`;
					i++;
				});

			response += `</uLs></body></msg>`;

			player.network.write(response);

			// noinspection HtmlUnknownAttribute
			newRoom.writeExcept(player, `<msg t='sys'><body action='uER' r='${newRoom.id}'><u i ='${player.network.id}' m='0'><n><![CDATA[${newRoom.name}]]></n><vars></vars></u></body></msg>`);
		}
	}

	public static getRoomCount(): number {
		return RoomController.roomList.size;
	}

}
