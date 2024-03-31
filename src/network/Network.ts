import * as net from "net";
import {Server, Socket} from "net";
import logger from "../util/Logger";
import PlayerNetwork from "../avatar/player/PlayerNetwork";

export default class Network {

	private count: number = 0;

	public async init(): Promise<this> {
		const server: Server = net.createServer();

		server.addListener('connection', (socket: Socket): void => {
			socket.setEncoding('utf-8');

			logger.warn(`[Network] new connection from: ${socket.remoteAddress}`);

			this.count++;

			const playerNetwork: PlayerNetwork = new PlayerNetwork(this.count, undefined, undefined, socket);

			socket.on('data', (data: any): void => playerNetwork.data(data));

			socket.on('close', (): void => {
				logger.debug(`Disconnected`);
			});
		});

		server.listen({
			port: 5588,
			backlog: 10,
			exclusive: false
		});

		return this;
	}

}