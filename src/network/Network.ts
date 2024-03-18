import * as net from "net";
import {Server, Socket} from "net";
import logger from "../util/Logger";
import PlayerNetwork from "../player/PlayerNetwork";

export default class Network {

    private static _instance: Network;

    private readonly server: Server;

    private count: number = 0;

    public static instance(): Network {
        if (!this._instance) {
            this._instance = new Network();
        }

        return this._instance;
    }

    constructor() {
        this.server = net.createServer();

        this.server.addListener('connection', (socket: Socket): void => {
            socket.setEncoding('utf-8');

            logger.warn(`[Network] new connection from: ${socket.remoteAddress}`);

            this.count++;

            const playerNetwork: PlayerNetwork = new PlayerNetwork(this.count, socket);

            socket.on('data', (data: any): void => playerNetwork.data(data));

            socket.on('close', (): void => {
                logger.debug(`Disconnected`);
            });
        });

        this.server.listen({
            port: 5588,
            backlog: 10,
            exclusive: false
        }, () => logger.silly(`Server online`));
    }

}