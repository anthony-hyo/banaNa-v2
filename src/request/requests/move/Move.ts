import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../avatar/player/Player.ts";
import type RequestArg from "../../RequestArg.ts";
import RequestType from "../../RequestType.ts";
import RequestRegister from "../../RequestRegister.ts";

@RequestRegister({
	name: "mv",
	type: RequestType.DEFAULT
})
export default class Move implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const x: number = args.getNumber(0);
		const y: number = args.getNumber(1);
		const speed: number = args.getNumber(2);

		player.position.move(x, y);

		player.room?.writeArrayExcept(player, "uotls", [player.avatarName, `tx:${x},ty:${y},sp:${speed},strFrame:${player.frame}`]);
	}

}
