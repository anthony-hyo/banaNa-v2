import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../player/Player.ts";
import type RequestArg from "../../RequestArg.ts";

export default class Move implements IRequest {

	public readonly name: string = 'mv';

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const xAxis: number = args.getNumber(0);
		const yAxis: number = args.getNumber(1);
		const speed: number = args.getNumber(2);

		player.position.xAxis = xAxis;
		player.position.yAxis = yAxis;

		player.room?.writeArray(player, "uotls", player.network.name, `tx:${xAxis},ty:${yAxis},sp:${speed},strFrame:${player.position.frame}`);
	}

}
