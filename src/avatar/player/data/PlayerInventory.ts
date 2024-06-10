import type Player from "../Player.ts";
import type IUserInventory from "../../../database/interfaces/IUserInventory.ts";
import Equipment from "../../../util/Equipment.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import database from "../../../database/drizzle/database.ts";
import {and, eq, sql} from "drizzle-orm";
import {usersInventory} from "../../../database/drizzle/schema.ts";
import type IItem from "../../../database/interfaces/IItem.ts";
import CoreValues from "../../../aqw/CoreValues.ts";
import TypeStatPrimary from "../../helper/combat/skill/TypeStatPrimary.ts";

export default class PlayerInventory {

	private readonly equipped: Map<Equipment, IUserInventory> = new Map<Equipment, IUserInventory>();

	private readonly temporary: Map<number, number> = new Map<number, number>();

	public static hasStats(equipment: Equipment): boolean {
		return equipment === Equipment.WEAPON || equipment === Equipment.CLASS || equipment === Equipment.CAPE || equipment === Equipment.HELM;
	}

	constructor(
		private readonly player: Player
	) {
	}

	private readonly _statsItems: Map<Equipment, Map<TypeStatPrimary, number>> = new Map<Equipment, Map<TypeStatPrimary, number>>();

	public get statsItems(): Map<Equipment, Map<TypeStatPrimary, number>> {
		return this._statsItems;
	}

	public stat(stat: TypeStatPrimary): number {
		let value: number = 0;

		for (const stats of this._statsItems.values()) {
			value += stats.get(stat) || 0;
		}

		return value;
	}

	public get equippedClass(): IUserInventory | undefined {
		return this.equipped.get(Equipment.CLASS);
	}

	public get equippedArmor(): IUserInventory | undefined {
		return this.equipped.get(Equipment.ARMOR);
	}

	public get equippedPet(): IUserInventory | undefined {
		return this.equipped.get(Equipment.PET);
	}

	public get equippedHelm(): IUserInventory | undefined {
		return this.equipped.get(Equipment.HELM);
	}

	public get equippedCape(): IUserInventory | undefined {
		return this.equipped.get(Equipment.CAPE);
	}

	public get equippedWeapon(): IUserInventory | undefined {
		return this.equipped.get(Equipment.WEAPON);
	}

	public get equippedAmulet(): IUserInventory | undefined {
		return this.equipped.get(Equipment.AMULET);
	}

	public get equippedHouse(): IUserInventory | undefined {
		return this.equipped.get(Equipment.HOUSE);
	}

	public get equippedHouseItem(): IUserInventory | undefined {
		return this.equipped.get(Equipment.HOUSE_ITEM);
	}

	public async equip(userInventory: IUserInventory, updateStats: boolean = true): Promise<void> {
		const item: IItem = userInventory.item!;

		const equipment: Equipment = <Equipment>item.typeItem!.equipment;

		this.equipped.set(equipment, userInventory);

		const ei: JSONObject = new JSONObject()
			.element("ItemID", item.id)
			.element("cmd", "equipItem")
			.element("sFile", item.file)
			.element("sLink", item.linkage)
			.element("strES", item.typeItem!.equipment)
			.element("uid", this.player.avatarId);


		switch (item.typeItem!.equipment) {
			case Equipment.WEAPON:
				ei
					.element("sType", item.typeItem!.name);
				break;
			case Equipment.CLASS:
				this.player.combat.updateClass(userInventory);
				break;
		}

		this.player.room?.writeObject(ei);

		database
			.update(usersInventory)
			.set({
				isEquipped: true
			})
			.where(eq(usersInventory.id, userInventory.id));

		if (PlayerInventory.hasStats(equipment)) {
			this._statsItems.set(equipment, CoreValues.getItemStats(userInventory.enhancement!, equipment));
			if (updateStats) {
				this.player.stats.update();
			}
		}
	}

	public async bankCount(): Promise<number> {
		const usersItemBankCount: {
			count: number
		}[] = await database
			.select({
				count: sql`COUNT(*)`.mapWith(Number)
			})
			.from(usersInventory)
			.where(
				and(
					eq(usersInventory.userId, this.player.databaseId),
					eq(usersInventory.isOnBank, true)
				)
			);

		return usersItemBankCount[0].count;
	}

	public dropItem(itemId: number, quantity: number): void {
		//TODO: ..
	}

	public turnInItems(items: Map<number, number>): boolean {
		//TODO: ..
		return false;
	}

	public hasItems(items: Map<number, number>): boolean {
		//TODO: ..
		return false;
	}

	public addTemporaryItem(itemId: number, quantity: number): void {
		const temporaryQuantity: number | undefined = this.temporary.get(itemId);

		if (temporaryQuantity) {
			this.temporary.set(itemId, temporaryQuantity + quantity);
			return;
		}

		this.temporary.set(itemId, quantity);
	}

}