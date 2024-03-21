export default interface IUserInventory {
	id: number;

	userId: number;
	itemId: number;
	enhancementId: number;

	quantity: number;

	is_equipped: boolean;
	is_on_bank: boolean;

	dateDeleted: Date | null;
	dateUpdated: Date;
	dateCreated: Date;
}