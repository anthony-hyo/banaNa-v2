import {DecoderType} from "../util/Const";
import {XMLParser} from "fast-xml-parser";
import type PlayerNetwork from "../avatar/player/PlayerNetwork.ts";
import PlayerController from "../controller/PlayerController.ts";
import RequestFactory from "../request/RequestFactory.ts";
import RequestArg from "../request/RequestArg.ts";
import logger from "../util/Logger.ts";
import type IRequest from "../interfaces/request/IRequest.ts";
import RequestType from "../request/RequestType.ts";
import UserNotFoundException from "../exceptions/UserNotFoundException.ts";

export default class Decoder {

	private readonly xmlParser: XMLParser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "_"
	});

	constructor(
		private readonly playerNetwork: PlayerNetwork
	) {
	}

	public decode(data: string): void {
		const first: string = data.charAt(0);

		switch (first) {
			case DecoderType.XML:
				if (data.includes(`policy`)) {
					this.playerNetwork.write(`<cross-domain-policy><allow-access-from domain='*' to-ports='5588' /></cross-domain-policy>`);
					return;
				}

				const dataXML: any = this.xmlParser.parse(data);

				switch (dataXML.msg.body._action) {
					case 'verChk':
						// noinspection HtmlUnknownAttribute
						this.playerNetwork.write(`<msg t='sys'><body action='${dataXML.msg.body.ver._v >= 157 ? `apiOK` : `apiKO`}' r='0'></body></msg>`);
						break;
					case 'login':
						const username: string = dataXML.msg.body.login.nick.split(`~`)[1];
						const token: string = dataXML.msg.body.login.pword;

						PlayerController.login(this.playerNetwork, username, token);
						break;
					default:
						//TODO: Kick or Ban
						break;
				}
				break;
			case DecoderType.JSON:
				break;
			case DecoderType.XT:
				if (!this.playerNetwork.player) {
					logger.silly("Kick or Ban");
					//TODO:
					return;
				}

				const dataBody: number = data.indexOf('%', 1);

				const body: string = data.substring(dataBody + 1);
				const params: string[] = body.split("%");

				const args: string[] = [];

				for (let i: number = 3; i < params.length; i++) {
					args.push(params[i]);
				}

				const request: IRequest | undefined = RequestFactory.request(RequestType.DEFAULT, params[1]);

				if (!request) {
					logger.warn(`${this.playerNetwork.player.username}(${this.playerNetwork.player.databaseId})#${this.playerNetwork.id} default request called`, JSON.stringify(data));
					return;
				}

				request
					.handler(this.playerNetwork.player, RequestArg.parse(args))
					.catch((error: Error | UserNotFoundException) => {
						if (error instanceof UserNotFoundException) {
							this.playerNetwork.player!.kick();
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

}