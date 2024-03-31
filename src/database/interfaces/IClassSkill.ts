import type IClass from "./IClass.ts";
import type ISkill from "./ISkill.ts";

export default interface IClassSkill {
	id: number;

	classId: number;
	skillId: number;

	dateUpdated: Date;
	dateCreated: Date;

	class?: IClass;
	skill?: ISkill;
}