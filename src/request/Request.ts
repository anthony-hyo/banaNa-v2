import path from "path";
import Helper from "../util/Helper";
import logger from "../util/Logger";
import type IRequest from "../dispatcher/IRequest.ts";
import RequestDefault from "./RequestDefault.ts";

export default class Request {

    private static _instance: Request;

    public static instance(): Request {
        if (!this._instance) {
            this._instance = new Request();
        }

        return this._instance;
    }

    private readonly requests: Map<string, IRequest> = new Map<string, IRequest>()

    public request(name: string): IRequest {
        const request: IRequest | undefined = this.requests.get(name)
        return request ? request : new RequestDefault()
    }

    private register(): void {
        Helper
            .getAllFilesFromFolder( path.resolve(__dirname, 'requests'))
            .forEach(file => {
                const request: IRequest = new (require(file).default)()

                logger.warn(`[Request] register ${request.name}`)

                this.requests.set(request.name, request)
            })
    }

}