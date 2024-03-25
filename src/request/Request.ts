import path from "path";
import Helper from "../util/Helper";
import logger from "../util/Logger";
import type IRequest from "../interfaces/request/IRequest.ts";

export default class Request {

	private static readonly requests: Map<string, IRequest> = new Map<string, IRequest>();

	public static request(name: string): IRequest | undefined {
		return Request.requests.get(name);
	}

	public static register(): void {
		Helper
			.getAllFilesFromFolder(path.resolve(__dirname, 'requests'))
			.forEach((file: string): void => {
				const request: IRequest = new (require(file).default)();

				logger.warn(`[Request] register ${request.name}`);

				Request.requests.set(request.name, request);
			});
	}

}