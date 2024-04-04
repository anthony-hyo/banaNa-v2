import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../avatar/player/Player.ts";
import RequestType from "../RequestType.ts";
import RequestRegister from "../RequestRegister.ts";

@RequestRegister({
	name: "sAct",
	type: RequestType.DEFAULT
})
export default class LoadSkills implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		player.combat.loadSkills();
	}

}
