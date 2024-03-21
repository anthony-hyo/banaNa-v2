import path from "path";
import Helper from "../util/Helper";
import logger from "../util/Logger";
import type IRequest from "../interfaces/request/IRequest.ts";
import RequestDefault from "./RequestDefault.ts";

export default class Request {

	private static _instance: Request;
	private readonly requests: Map<string, IRequest> = new Map<string, IRequest>();

	public static instance(): Request {
		if (!this._instance) {
			this._instance = new Request();
		}

		return this._instance;
	}

	public request(name: string): IRequest {
		return this.requests.get(name) ?? new RequestDefault();
	}

	private register(): void {
		Helper
			.getAllFilesFromFolder(path.resolve(__dirname, 'requests'))
			.forEach((file: string): void => {
				const request: IRequest = new (require(file).default)();

				logger.warn(`[Request] register ${request.name}`);

				this.requests.set(request.name, request);
			});
	}

}