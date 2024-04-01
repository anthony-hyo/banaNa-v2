import path from "path";
import Helper from "../util/Helper";
import logger from "../util/Logger";
import type IRequest from "../interfaces/request/IRequest.ts";
import RequestType from "./RequestType.ts";

export default class RequestFactory {

	private static readonly defaultRequests: Map<string, IRequest> = new Map<string, any>();

	private static readonly usersCommandsRequests: Map<string, IRequest> = new Map<string, any>();
	private static readonly guildCommandsRequests: Map<string, IRequest> = new Map<string, any>();
	private static readonly partyCommandsRequests: Map<string, IRequest> = new Map<string, any>();

	public static request(type: RequestType, name: string): IRequest | undefined {
		let request: any;

		switch (type) {
			case RequestType.DEFAULT:
				request = RequestFactory.defaultRequests.get(name);
				break;
			case RequestType.COMMAND_USER:
				request = RequestFactory.usersCommandsRequests.get(name);
				break;
			case RequestType.COMMAND_GUILD:
				request = RequestFactory.guildCommandsRequests.get(name);
				break;
			case RequestType.COMMAND_PARTY:
				request = RequestFactory.partyCommandsRequests.get(name);
				break;
		}

		return request ? new (request)() : undefined;
	}

	public static async register(): Promise<void> {
		const files: Array<string> = Helper.getAllFilesFromDirectory(path.resolve(__dirname, 'requests'));

		for (let file of files) {
			try {
				import(file);
			} catch (e) {
				logger.error(`[Request] register error`, e);
			}
		}
	}

	public static add(type: RequestType, name: string, request: IRequest) {
		switch (type) {
			case RequestType.DEFAULT:
				logger.silly(`[Request] register DEFAULT ${name}`);

				RequestFactory.defaultRequests.set(name, request);
				break;
			case RequestType.COMMAND_USER:
				logger.silly(`[Request] register USER ${name}`);

				RequestFactory.usersCommandsRequests.set(name, request);
				break;
			case RequestType.COMMAND_GUILD:
				logger.silly(`[Request] register GUILD ${name}`);

				RequestFactory.guildCommandsRequests.set(name, request);
				break;
			case RequestType.COMMAND_PARTY:
				logger.silly(`[Request] register PARTY ${name}`);

				RequestFactory.partyCommandsRequests.set(name, request);
				break;
		}
	}

}