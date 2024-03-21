import type IMapMonster from "./IMapMonster.ts";

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

	monsters?: Array<IMapMonster>;
}

