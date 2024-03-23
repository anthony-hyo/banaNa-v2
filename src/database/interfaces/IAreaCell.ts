import type IArea from "./IArea.ts";

export default interface IAreaCell {
	id: number;

	areaId: number;

	frame: string;
	pad: string;

	dateUpdated: Date;
	dateCreated: Date;

	area?: IArea;
}