import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../avatar/player/Player.ts";
import type RequestArg from "../../RequestArg.ts";
import type IAreaCell from "../../../database/interfaces/IAreaCell.ts";
import RequestType from "../../RequestType.ts";
import RequestRegister from "../../RequestRegister.ts";

@RequestRegister({
	name: "mtcid",
	type: RequestType.DEFAULT
})
export default class MoveToCellById implements IRequest {

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const cellId: number = args.getNumber(0);

		const areaCell: IAreaCell | undefined = player.room!.data.cells?.find(areasCells => areasCells.cellId == 1);

		if (!areaCell || areaCell.frame == "Enter0" && player.data.pvpTeam !== 0 || areaCell.frame == "Enter1" && player.data.pvpTeam !== 1) {
			return;
		}

		player.status.endCombat();

		player.moveToCell(areaCell.frame, areaCell.pad, true);

		player.network.writeArray("mtcid", [cellId]);
	}

}
