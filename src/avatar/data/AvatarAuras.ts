import Avatar from "../Avatar.ts";
import RemoveAura from "../../scheduler/tasks/RemoveAura.ts";
import ISkillAura from "../../database/interfaces/ISkillAura.ts";
import Scheduler from "../../scheduler/Scheduler.ts";
import JSONObject from "../../util/json/JSONObject.ts";

export default class AvatarAuras {

	private auras: Set<RemoveAura> = new Set<RemoveAura>();

	constructor(
		private readonly avatar: Avatar
	) {
	}

	public hasAura(auraId: number): boolean {
		for (const removeAura of this.auras) {
			const aura: ISkillAura = removeAura.getAura();

			if (aura.id === auraId) {
				return true;
			}
		}

		return false;
	}

	public removeAura(ra: RemoveAura): void {
		this.auras.delete(ra);
	}

	public applyAura(aura: ISkillAura): RemoveAura {
		const ra: RemoveAura = new RemoveAura(aura, this, undefined);

		ra.setRunning(Scheduler.oneTime(ra, aura.duration));

		this.auras.add(ra);

		return ra;
	}

	public clearAuras(): void {
		for (const removeAura of this.auras) {
			removeAura.cancel();
		}

		this.auras.clear();

		this.avatar.stats.effects.clear();

		this.network.writeObject(new JSONObject()
			.element("cmd", "clearAuras")
		);
	}

}