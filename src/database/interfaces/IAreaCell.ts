import type IArea from "./IArea.ts";

export default interface IAreaCell {
	id: number;

	areaId: number;

	cellId: number;

	frame: string;
	pad: string;

	dateUpdated: Date;
	dateCreated: Date;

	area?: IArea;
}