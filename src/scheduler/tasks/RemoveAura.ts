import type {Monster} from "../../monster/Monster.ts";
import JSONArray from "../../util/json/JSONArray";
import JSONObject from "../../util/json/JSONObject";
import PlayerConst from "../../player/PlayerConst.ts";
import type Player from "../../player/Player.ts";
import type ISkillAura from "../../database/interfaces/ISkillAura.ts";
import type ITask from "../../interfaces/scheduler/ITask";
import type ISkillAuraEffect from "../../database/interfaces/ISkillAuraEffect.ts";
import schedule from "node-schedule";
import type AvatarStats from "../../avatar/AvatarStats.ts";

export default class RemoveAura implements ITask {

	//private dot: DamageOverTime;

	private running: schedule.Job | undefined;

	constructor(
		private aura: ISkillAura,
		private player: Player | undefined,
		private monster: Monster | undefined
	) {
	}

	public run(): void {
		const ct: JSONObject = new JSONObject();
		const aura: JSONArray = new JSONArray();
		const auraRemove: JSONObject = new JSONObject();
		const auraInfo: JSONObject = new JSONObject();

		if (this.aura.category.length != 0 && this.aura.category !== "d") {
			auraInfo.element("cat", this.aura.category);

			if (this.aura.category === "stun") {
				auraInfo.element("s", "s");
			}
		}

		auraInfo.element("nam", this.aura.name);

		auraRemove
			.element("cmd", "aura-")
			.element("aura", auraInfo);

		if (this.player !== null) {
			auraRemove.element("tInf", "p:" + this.player!.network.id);
		} else if (this.monster !== null) {
			auraRemove.element("tInf", "m:" + this.monster!.mapId);
		}

		aura.add(auraRemove);

		ct
			.element("cmd", "ct")
			.element("a", aura);

		if (this.player !== null) {
			const auras: Set<RemoveAura> = this.player!.properties.get(PlayerConst.AURAS);

			auras.delete(this);

			if (this.aura.effects.length != 0) {
				const stats: AvatarStats = this.player!.properties.get(PlayerConst.STATS);
				const auraEffects: Set<ISkillAuraEffect> = new Set<ISkillAuraEffect>();

				for (const effect of this.aura.effects) {
					stats.effects.delete(effect);
					auraEffects.add(effect);
				}

				stats.update();
				stats.sendStatChanges(stats, auraEffects);
			}

			this.player!.network.writeObject(ct);
		} else if (this.monster !== null) {
			this.monster!.removeAura(this);
			this.monster!.writeObject(ct);
		}

		// if (this.dot !== null) {
		//     this.dot.cancel();
		// }
	}

	public cancel(): void {
		// if (this.dot !== null) {
		//     this.dot.cancel();
		// }

		if (this.running != null) {
			this.running!.cancel();
		}
	}

	public setRunning(running: schedule.Job): void {
		this.running = running;
	}

	public getAura(): ISkillAura {
		return this.aura;
	}

	// public setDot(dot: DamageOverTime): void {
	//     this.dot = dot;
	// }

}
