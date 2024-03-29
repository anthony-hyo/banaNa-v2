import type IAreaMonster from "./IAreaMonster.ts";
import type IAreaCell from "./IAreaCell.ts";
import type IAreaItem from "./IAreaItem.ts";

export default interface IArea {
	id: number;

	name: string;

	file: string;

	maxPlayers: number;
	levelRequired: number;

	isUpgradeOnly: boolean;
	isStaffOnly: boolean;
	isPvP: boolean;
	isKeyUnique: boolean;

	dateUpdated: Date;
	dateCreated: Date;

	cells?: Array<IAreaCell>;
	items?: Array<IAreaItem>;
	monsters?: Array<IAreaMonster>;
}

