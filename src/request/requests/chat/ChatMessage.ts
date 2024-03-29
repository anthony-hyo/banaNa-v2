import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../player/Player.ts";
import type RequestArg from "../../RequestArg.ts";
import {ChatChannel} from "../../../util/ChatChannel.ts";
import {RequestType} from "../../RequestType.ts";

export default class ChatMessage implements IRequest {

	public readonly name: string = 'message';
	public readonly type: RequestType = RequestType.DEFAULT;

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const message: string = args.getString(0);
		const channel: string = args.getString(1);

		let chatMessage: string = message.replace(/#038:|&|"|<|>/g, ChatMessage.filterMessage);

		let chatChannel: ChatChannel;

		switch (channel) {
			case ChatChannel.PARTY:
				chatChannel = ChatChannel.PARTY;
				break;
			case ChatChannel.GUILD:
				chatChannel = ChatChannel.GUILD;
				break;
			default:
				chatChannel = ChatChannel.ZONE;
				break;
		}

		player.room!.writeArray("chatm", [`${chatChannel}~${chatMessage}`, player.network.name, player.room!.id]);
	}

	private static filterMessage(match: string): string {
		switch (match) {
			case "#038:":
				return "&";
			case "&":
				return "&amp;";
			case "\"":
				return "&quot;";
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			default:
				return match;
		}
	}

}
