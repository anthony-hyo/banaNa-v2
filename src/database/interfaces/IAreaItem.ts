import type IArea from "./IArea.ts";
import type IItem from "./IItem.ts";

export default interface IAreaItem {
	id: number;

	areaId: number;
	itemId: number;

	dateUpdated: Date;
	dateCreated: Date;

	area?: IArea;
	item?: IItem;
}
