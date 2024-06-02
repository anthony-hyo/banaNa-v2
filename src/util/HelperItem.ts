import JSONObject from "./json/JSONObject.ts";
import type IUserInventory from "../database/interfaces/IUserInventory.ts";
import {differenceInHours} from "date-fns";
import type IItem from "../database/interfaces/IItem.ts";
import type ITypeItem from "../database/interfaces/ITypeItem.ts";
import type ITypeElement from "../database/interfaces/ITypeElement.ts";
import type IEnhancement from "../database/interfaces/IEnhancement.ts";

export default class HelperItem {

	public static inventory(inventory: IUserInventory): JSONObject {
		const item: IItem = inventory.item!;

		const typeElement: ITypeElement = item.typeElement!;
		const typeItem: ITypeItem = item.typeItem!;

		const enhancement: IEnhancement = inventory.enhancement!;

		return new JSONObject()
			.element("bEquip", inventory.isEquipped)
			.element("bStaff", item.isStaffOnly)
			.element("metaValues", item.meta || new JSONObject())
			.element("sReqQuests", "")
			.element("iRty", item.typeRarityId)
			.element("iCost", item.cost)
			.element("iRng", item.range)
			.element("sElmt", typeElement.name)
			.element("iDPS", enhancement.damagePerSecond)
			.element("EnhID", item.enhancementId)
			//.element("bQuest", 1)
			.element("iQty", item.quantity)
			.element("sType", typeItem.name)
			.element("sLink", item.linkage)
			.element("iQSIndex", item.questStringIndex)
			.element("ItemID", item.id)
			.element("bCoins", item.isCoins)
			.element("bTemp", item.isTemporary)
			.element("bHouse", typeItem.equipment == "hi" || typeItem.equipment == "ho")
			.element("bPTR", 0)
			.element("sIcon", item.icon)
			.element("bUpg", item.isUpgradeOnly)
			.element("CharItemID", item.requiredClassItemId ?? 0)
			.element("bBank", inventory.isOnBank)
			.element("sName", item.name)
			.element("iQSValue", item.questStringValue)
			.element("sDesc", item.description)
			.element("sES", typeItem.equipment)
			.element("iLvl", item.level)
			.element("iStk", item.stack)
			.element("iHrs", differenceInHours(new Date(), inventory.dateCreated));
	}

}