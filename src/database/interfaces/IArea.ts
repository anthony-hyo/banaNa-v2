import type IAreaMonster from "./IAreaMonster.ts";
import type IAreaCell from "./IAreaCell.ts";
import type IAreaItem from "./IAreaItem.ts";

export default interface IArea {
	id: number;

	name: string;

	file: string;

	max_players: number;
	required_level: number;

	is_upgrade_only: boolean;
	is_staff_only: boolean;
	is_pvp: boolean;

	dateUpdated: Date;
	dateCreated: Date;

	cells?: Array<IAreaCell>;
	items?: Array<IAreaItem>;
	monsters?: Array<IAreaMonster>;
}

