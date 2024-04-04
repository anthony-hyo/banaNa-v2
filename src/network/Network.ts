import type {Socket} from "bun";
import logger from "../util/Logger";
import type INetworkData from "../interfaces/network/INetworkData.ts";
import type Player from "../avatar/player/Player.ts";
import {DecoderType, DELIMITER} from "../util/Const.ts";
import PlayerController from "../controller/PlayerController.ts";
import type IRequest from "../interfaces/request/IRequest.ts";
import RequestFactory from "../request/RequestFactory.ts";
import RequestType from "../request/RequestType.ts";
import RequestArg from "../request/RequestArg.ts";
import UserNotFoundException from "../exceptions/UserNotFoundException.ts";
import {XMLParser} from "fast-xml-parser";
import NetworkEncoder from "./NetworkEncoder.ts";

export default class Network {

	private static count: number = 1;

	private static readonly xmlParser: XMLParser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "_"
	});

	public async init(): Promise<this> {
		Bun.listen<INetworkData>({
			hostname: "localhost",
			port: 5588,
			socket: {
				open: this.onOpen,
				close: this.onClose,
				error: this.onError,
				data: this.onData
			},
		});

		/*const server: Server = net.createServer();

		server.addListener('connection', (socket: Socket): void => {
			socket.setEncoding('utf-8');

			logger.warn(`[Network] new connection from: ${socket.remoteAddress}`);

			Network.count++;

			const playerNetwork: PlayerNetwork = new PlayerNetwork(Network.count, undefined, undefined, socket);

			socket.on('data', (data: any): void => playerNetwork.data(data));

			socket.on('close', (): void => {
				logger.debug(`Disconnected`);
			});
		});

		server.listen({
			port: 5588,
			backlog: 10,
			exclusive: false
		});*/

		return this;
	}

	private onOpen(socket: Socket<any>): void {
		logger.silly(`Connection`, socket.remoteAddress);

		socket.data = {
			player: undefined,
			chunk: '',
		};
	}

	private onClose(socket: Socket<any>): void {
		if (socket.data && socket.data.player) {
			const player: Player = socket.data.player;

			logger.silly(`Player disconnected`, player.username, player.avatarId, socket.remoteAddress);

			player.disconnect();
			return;
		}

		logger.silly(`Disconnection`, socket.remoteAddress);
	}

	private onError(socket: Socket<any>, error: Error): void {
		logger.error(`error`, error);
	}

	public onData(socket: Socket<INetworkData>, data: Buffer): void {
		socket.data.chunk += data.toString();

		let d_index: number = socket.data.chunk.indexOf(DELIMITER);

		while (d_index > -1) {
			try {
				const string: string = socket.data.chunk.substring(0, d_index);

				logger.debug(`[PlayerNetwork] received ${string}`);

				Network.decoder(socket, string);
			} catch (error) {
				logger.error(`[PlayerNetwork] received error`, error);
			}

			socket.data.chunk = socket.data.chunk.substring(d_index + DELIMITER.length);

			d_index = socket.data.chunk.indexOf(DELIMITER);
		}
	}

	private static decoder(socket: Socket<INetworkData>, dataStr: string): void {
		logger.debug(`data`, dataStr);

		const first: string = dataStr.charAt(0);

		switch (first) {
			case DecoderType.XML:
				if (dataStr.includes(`policy`)) {
					NetworkEncoder.write(socket, `<cross-domain-policy><allow-access-from domain='*' to-ports='5588' /></cross-domain-policy>`);
					return;
				}

				const dataXML: any = Network.xmlParser.parse(dataStr);

				logger.debug(dataXML.msg.body._action);

				switch (dataXML.msg.body._action) {
					case 'verChk':
						// noinspection HtmlUnknownAttribute
						NetworkEncoder.write(socket, `<msg t='sys'><body action='${dataXML.msg.body.ver._v >= 157 ? `apiOK` : `apiKO`}' r='0'></body></msg>`);
						break;
					case 'login':
						const username: string = dataXML.msg.body.login.nick.split(`~`)[1];
						const token: string = dataXML.msg.body.login.pword;

						PlayerController.login(socket, username, token);
						break;
					default:
						//TODO: Kick or Ban
						break;
				}
				break;
			case DecoderType.JSON:
				break;
			case DecoderType.XT:
				if (!socket.data || !socket.data.player) {
					logger.silly("Kick or Ban");
					//TODO:
					return;
				}

				const player: Player = socket.data.player;

				const dataBody: number = dataStr.indexOf('%', 1);

				const body: string = dataStr.substring(dataBody + 1);
				const params: string[] = body.split("%");

				const args: string[] = [];

				for (let i: number = 3; i < params.length; i++) {
					args.push(params[i]);
				}

				const request: IRequest | undefined = RequestFactory.request(RequestType.DEFAULT, params[1]);

				if (!request) {
					logger.warn(`${player.username}(${player.databaseId})#${player.avatarId} default request called`, JSON.stringify(dataStr));
					return;
				}

				request
					.handler(player, RequestArg.parse(args))
					.catch((error: Error | UserNotFoundException) => {
						if (error instanceof UserNotFoundException) {
							player!.kick();
							return;
						}

						logger.error(error);
					});
				break;
			default:
			case DecoderType.NONE:
				//TODO: Kick or Ban
				break;
		}
	}

	public static get increaseAndGet(): number {
		Network.count++;
		return Network.count;
	}

}