import type IItem from "./IItem.ts";
import type IMonster from "./IMonster.ts";

export default interface IMonsterDrop {
	monsterId: number;
	itemId: number;
	chance: string;
	quantity: number;

	monster?: IMonster;
	item?: IItem;
}