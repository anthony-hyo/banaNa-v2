import type IArea from "./IArea.ts";
import type IMonster from "./IMonster.ts";

export default interface IAreaMonster {
	id: number;

	areaId: number;
	monsterId: number;

	monsterMapId: number;

	frame: string;

	dateUpdated: Date;
	dateCreated: Date;

	area?: IArea;
	monster?: IMonster;
}