import type IUser from "./IUser.ts";
import type IItem from "./IItem.ts";
import type IEnhancement from "./IEnhancement.ts";

export default interface IUserInventory {
	id: number;

	userId: number;
	itemId: number;
	enhancementId: number;

	quantity: number;

	isEquipped: boolean;
	isOnBank: boolean;

	dateDeleted: Date | null;
	dateUpdated: Date;
	dateCreated: Date;

	user?: IUser;
	item?: IItem;
	enhancement?: IEnhancement;
}