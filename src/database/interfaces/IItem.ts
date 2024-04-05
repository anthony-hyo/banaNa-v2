import type IItemRequirement from "./IItemRequirement.ts";
import type ITypeElement from "./ITypeElement.ts";
import type ITypeItem from "./ITypeItem.ts";
import type ITypeRarity from "./ITypeRarity.ts";
import type IFaction from "./IFaction.ts";
import type IEnhancement from "./IEnhancement.ts";
import type IClass from "./IClass.ts";

export default interface IItem {
	id: number;

	name: string;
	description: string;

	file: string;
	linkage: string;

	icon: string;

	typeItemId: number;
	typeRarityId: number;
	typeElementId: number;

	level: number;
	range: number;

	cost: number;
	quantity: number;
	stack: number;

	isCoins: boolean;
	isTemporary: boolean;
	isUpgradeOnly: boolean;
	isStaffOnly: boolean;

	enhancementId: number;

	requiredFactionId: number | null;
	requiredFactionReputation: number;

	requiredClassItemId: number | null;
	requiredClassPoints: number;

	questStringIndex: number;
	questStringValue: number;

	meta: string | null;

	dateUpdated: Date;
	dateCreated: Date;

	typeItem?: ITypeItem;
	typeRarity?: ITypeRarity;
	typeElement?: ITypeElement;

	class?: IClass | null;

	enhancement?: IEnhancement;

	requiredFaction?: IFaction | null;

	requiredClassItem?: IItem | null;

	requirements?: IItemRequirement[];
}


