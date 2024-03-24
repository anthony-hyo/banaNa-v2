import type IMonsterDrop from "./IMonsterDrop.ts";
import type ISettingLevel from "./ISettingLevel.ts";
import type ITypeElement from "./ITypeElement.ts";
import type ITypeRace from "./ITypeRace.ts";

export default interface IMonster {
	id: number;

	name: string;

	file: string;
	linkage: string;

	typeElementId: number;
	typeRaceId: number;

	coins: number;
	gold: number;
	experience: number;
	classPoints: number;

	level: number;

	health: number;
	mana: number;

	damagePerSecond: number;
	range: number;

	category: unknown;

	wisdom: number;
	strength: number;
	luck: number;
	dexterity: number;
	endurance: number;
	intelligence: number;

	teamId: number;

	dateUpdated: Date;
	dateCreated: Date;

	typeElement?: ITypeElement;
	typeRace?: ITypeRace;

	settingLevel?: ISettingLevel;

	drops?: Array<IMonsterDrop>;
}