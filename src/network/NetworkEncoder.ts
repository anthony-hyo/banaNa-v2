import logger from "../util/Logger";
import type {Socket} from "bun";
import {DELIMITER} from "../util/Const";
import JSONObject from "../util/json/JSONObject.ts";
import type INetworkData from "../interfaces/network/INetworkData.ts";

export default class NetworkEncoder {

	public static writeObject(socket: Socket<INetworkData>, data: JSONObject): void {
		this.write(socket, JSON.stringify({
			t: `xt`,
			b: {
				r: -1,
				o: data.toJSON()
			},
		}));
	}

	public static writeArray(socket: Socket<INetworkData>, command: string, data: Array<string | number>): void {
		this.write(socket, `%xt%${command}%-1%${data.join('%')}%`);
	}


	public static write(socket: Socket<INetworkData>, data: string): void {
		logger.debug(`[NetworkEncoder] write '${data}'`);
		socket.write(data + DELIMITER);
		socket.flush();
	}

}