import Room from "../room/Room.ts";
import type Player from "../player/Player.ts";
import JSONObject from "../util/json/JSONObject.ts";
import Helper from "../util/Helper.ts";

export default class RoomController {

	private static _instance: RoomController | null = null;
	private readonly rooms: Map<number, Room> = new Map<number, Room>();

	public static instance(): RoomController {
		if (!this._instance) {
			this._instance = new RoomController();
		}

		return this._instance;
	}

	public static find(name: string): Room {
		return new Room(99, 88);
	}

	public join(player: Player, room: Room) {
		if (player.room) {
			// noinspection HtmlUnknownAttribute
			player.room.writeExcept(player, `<msg t='sys'><body action='userGone' r='${room.id}'><user id='${player.network.id}' /></body></msg>`);
			player.room.writeArrayExcept(player, "exitArea", player.network.id, player.network);
			player.room.removePlayer(player);
			//TODO: remove room if room count <= 0
		}

		room.addPlayer(player);

		room.writeObjectExcept(
			player,
			new JSONObject()
				.element('cmd', 'uotls')
				.element('o', player.properties)
				.element('unm', player.username)
		);

		let response: string = Helper.joinOK(room.id);

		let i: number = 1;

		room.players.forEach((target: Player) => {
			// noinspection HtmlUnknownAttribute
			response += `<u i='${target.network.id}' m='0' s='0' p='${i}'><n><![CDATA[${target.username}]]></n><vars></vars></u>`;
			i++;
		});

		response += `</uLs></body></msg>`;

		player.network.write(response);

		//TODO: send to room except player -> `<msg t='sys'><body action='uER' r='${room.id}'><u i ='${player.network.id}' m='0'><n><![CDATA[${room.name}]]></n><vars></vars></u></body></msg>`
	}

}