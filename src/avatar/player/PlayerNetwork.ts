import type {Socket} from "net";
import Decoder from "../../network/Decoder";
import {DELIMITER} from "../../util/Const";
import logger from "../../util/Logger";
import type JSONObject from "../../util/json/JSONObject";
import type Player from "./Player.ts";

export default class PlayerNetwork {

	public readonly decoder: Decoder = new Decoder(this);

	private chunk: string = "";

	constructor(
		private readonly _id: number,
		private _name: string | undefined,
		private _player: Player | undefined,
		public readonly socket: Socket
	) {
	}

	public get id(): number {
		return this._id;
	}

	public get name(): string {
		return this._name!;
	}

	public get player(): Player | undefined {
		return this._player;
	}

	public set player(player: Player) {
		this._player = player;
		this._name = player.username.toLowerCase();
	}

	public data(data: any): void {
		this.chunk += data.toString();

		let d_index = this.chunk.indexOf(DELIMITER);

		while (d_index > -1) {
			try {
				const string: string = this.chunk.substring(0, d_index);

				logger.debug(`[PlayerNetwork] received ${string}`);

				this.decoder.decode(string);
			} catch (error) {
				logger.error(`[PlayerNetwork] received error`, error);
			}

			this.chunk = this.chunk.substring(d_index + DELIMITER.length);

			d_index = this.chunk.indexOf(DELIMITER);
		}
	}

	public write(data: string): void {
		logger.debug(`[PlayerNetwork] sending ${data}`);
		this.socket.write(data + DELIMITER);
	}

	public writeObject(data: JSONObject): void {
		this.write(JSON.stringify({
			t: `xt`,
			b: {
				r: -1,
				o: data.toJSON()
			},
		}));
	}

	public writeArray(command: string, data: Array<string | number>): void {
		this.write(`%xt%${command}%-1%${data.join('%')}%`);
	}

	public writeExcept(ignored: Player, data: string): void {
		if (ignored.avatarId == this.id) {
			return;
		}

		this.write(data);
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		if (ignored.avatarId == this.id) {
			return;
		}

		this.writeObject(data);
	}

	public writeArrayExcept(ignored: Player, command: string, data: Array<string | number>): void {
		if (ignored.avatarId == this.id) {
			return;
		}

		this.writeArray(command, data);
	}

}

