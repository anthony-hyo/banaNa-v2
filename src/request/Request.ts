import path from "path";
import {IRequest} from "../dispatcher/IRequest";
import PlayerNetwork from "../player/PlayerNetwork";
import Helper from "../util/Helper";
import logger from "../util/Logger";

export default class Request {

    private readonly requests_locations: string = path.resolve(__dirname, 'requests')

    private readonly requests: Map<string, IRequest> = new Map<string, IRequest>()

    private playerNetwork: PlayerNetwork;

    constructor(playerNetwork: PlayerNetwork) {
        this.playerNetwork = playerNetwork
        this.register()
    }

    public getRequest(name: string): IRequest {
        const request: IRequest | undefined = this.requests.get(name)
        return request ? request : new DefaultRequest()
    }

    private register(): void {
        Helper
            .getAllFilesFromFolder(this.requests_locations)
            .forEach(file => {
                const request: IRequest = new (require(file).default)()

                logger.warn(`[Request] register ${request.name}`)

                this.requests.set(request.name, request)
            })
    }

}