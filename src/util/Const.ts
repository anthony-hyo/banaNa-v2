export const DELIMITER: string = '\0';
export const STR_DELIMITER: string = '\0';

export enum DecoderType {
	XML = `<`,
	JSON = `{`,
	XT = `%`,
	NONE = ``
}

export enum Gender {
	MALE = `M`,
	FEMALE = `F`
}

export enum Reputation {
	_1 = 0,
	_2 = 900,
	_3 = 3600,
	_4 = 10000,
	_5 = 22500,
	_6 = 44100,
	_7 = 78400,
	_8 = 129600,
	_9 = 202500,
	_10 = 302500
}

export const EQUIPMENT_CLASS = "ar";
export const EQUIPMENT_ARMOR = "co";
export const EQUIPMENT_PET = "pe";
export const EQUIPMENT_HELM = "he";
export const EQUIPMENT_CAPE = "ba";
export const EQUIPMENT_WEAPON = "Weapon";
export const EQUIPMENT_AMULET = "am";
export const EQUIPMENT_HOUSE = "ho";
export const EQUIPMENT_HOUSE_ITEM = "hi";