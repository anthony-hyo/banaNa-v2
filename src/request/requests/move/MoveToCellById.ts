import type IRequest from "../../../interfaces/request/IRequest.ts";
import type Player from "../../../player/Player.ts";
import type RequestArg from "../../RequestArg.ts";
import type IAreaCell from "../../../database/interfaces/IAreaCell.ts";
import PlayerConst from "../../../player/PlayerConst.ts";
import {RequestType} from "../../RequestType.ts";

export default class MoveToCellById implements IRequest {

	public readonly name: string = 'mtcid';
	public readonly type: RequestType = RequestType.DEFAULT;

	public async handler(player: Player, args: RequestArg): Promise<void> {
		const cellId: number = args.getNumber(0);

		const areaCell: IAreaCell | undefined = player.room!.data.cells?.find(areasCells => areasCells.cellId == 1);

		if (!areaCell || areaCell.frame == "Enter0" && player.properties.get(PlayerConst.PVP_TEAM) !== 0 || areaCell.frame == "Enter1" && player.properties.get(PlayerConst.PVP_TEAM) !== 1) {
			return;
		}

		player.status.endCombat();

		player.moveToCell(areaCell.frame, areaCell.pad, true);

		player.network.writeArray("mtcid", [cellId]);
	}

}
